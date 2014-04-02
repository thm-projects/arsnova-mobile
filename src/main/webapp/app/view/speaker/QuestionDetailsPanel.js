/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/speaker/questionDetailsPanel.js
 - Beschreibung: Panel zum Anzeigen der Details einer erstellten Publikumsfragen.
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
                 Christoph Thelen <christoph.thelen@mni.thm.de>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
Ext.define('FreetextAnswer', {
    extend: 'Ext.data.Model',
    
    require: ['ARSnova.view.speaker.form.ExpandingAnswerForm', 'ARSnova.view.speaker.form.IndexedExpandingAnswerForm',
              'ARSnova.view.speaker.form.NullQuestion', 'ARSnova.view.speaker.form.SchoolQuestion',
              'ARSnova.view.speaker.form.VoteQuestion', 'ARSnova.view.speaker.form.YesNoQuestion',
              'ARSnova.view.speaker.form.FlashcardQuestion', 'ARSnova.view.speaker.form.GridStatistic'],
 
    config: {
    	idProperty: "_id",
    	
    	fields: [ 'answerSubject', 
    	          'timestamp', 
    	          'formattedTime', 
    	          'groupDate', 
    	          'questionId',
    	          'abstention',
    	          'answerText',
    	          'piRound',
    	          'sessionId',
    	          'type',
    	          '_rev'
    	        ]
    }
});

Ext.define('ARSnova.view.speaker.QuestionDetailsPanel', {
	extend: 'Ext.Panel',
	
    requires: ['ARSnova.view.speaker.form.AbstentionForm', 'ARSnova.view.speaker.form.ExpandingAnswerForm',
              'ARSnova.view.speaker.form.IndexedExpandingAnswerForm', 'ARSnova.view.MultiBadgeButton',
              'ARSnova.view.speaker.form.NullQuestion', 'ARSnova.view.speaker.form.SchoolQuestion',
              'ARSnova.view.speaker.form.VoteQuestion', 'ARSnova.view.speaker.form.YesNoQuestion',
              'ARSnova.view.speaker.form.FlashcardQuestion', 'ARSnova.view.speaker.QuestionStatisticChart'
    ],
	
	config: {
		title: 'QuestionDetailsPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},
	
	/* toolbar items */
	toolbar			: null,
	backButton		: null,
	cancelButton	: null,
	editButton		: null,
	gridStatistic	: null,

	questionObj 	: null,
	
	freetextAnswerStore: Ext.create('Ext.data.JsonStore', {
		model		: 'FreetextAnswer',
		sorters		: [{property: 'timestamp', direction: 'DESC'}],
		groupField	: 'groupDate',
		grouper		: {property: 'timestamp', direction: 'DESC'}
	}),
	
	renewAnswerDataTask: {
		name: 'renew the answer table data at question details panel',
		run: function(){
			
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.getQuestionAnswers();
		},
		interval: 20000 //20 seconds
	},
	
	constructor: function(args){
		this.callParent(args);
		
		var me = this;
		this.questionObj = args.question;
		
		this.hasCorrectAnswers = true;
		if (['vote', 'school', 'freetext'].indexOf(this.questionObj.questionType) !== -1) {
			this.hasCorrectAnswers = false;
		}
		
		// check if grid question
		this.isGridQuestion = (['grid'].indexOf(this.questionObj.questionType) !== -1);
		
		/* BEGIN TOOLBAR OBJECTS */
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.QUESTIONS,
			ui		: 'back',
			scope	: this,
			handler	: function(){
				taskManager.stop(this.renewAnswerDataTask);
				
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.on('cardswitch', function(){
					this.destroy();
				}, this, {single: true});
				sTP.animateActiveItem(sTP.audienceQuestionPanel, {
					type		: 'slide',
					direction	: 'right'
				});
			}
		});
		
		this.cancelButton = Ext.create('Ext.Button', {
			text	: Messages.CANCEL,
			ui		: 'decline',
			hidden	: true,
			handler	: function(){
				var panel = this.up('panel');
				var eb = panel.editButton;
				eb.setText(Messages.EDIT);
				eb.removeCls('x-button-action');
				
				this.hide();
				panel.backButton.show();
				panel.resetFields();
				panel.editButton.config.setEnableAnswerEdit(panel, false);
			}
		});
		
		this.editButton = Ext.create('Ext.Button', {
			text	: Messages.EDIT,
			handler	: function(){
				var panel = this.up('panel');
				var answersChanged = function(prevAnswers, newAnswers) {
					if (prevAnswers.length !== newAnswers.length) {
						return true;
					}
					var changed = false;
					prevAnswers.forEach(function(answer, i) {
						if (answer.text !== newAnswers[i].text) {
							changed = true;
						}
					});
					return changed;
				};
				var saveQuestion = function(question) {
					var questionValues = panel.answerEditForm.getQuestionValues();

					if (questionValues.gridSize != undefined) question.set("gridSize", questionValues.gridSize);
					if (questionValues.image != undefined) 	  question.set("image", questionValues.image);
					if (questionValues.offsetX != undefined)  question.set("offsetX", questionValues.offsetX);
					if (questionValues.offsetY != undefined)  question.set("offsetY", questionValues.offsetY);
					if (questionValues.zoomLvl != undefined)  question.set("zoomLvl", questionValues.zoomLvl);

					question.set("possibleAnswers", questionValues.possibleAnswers);
					question.set("noCorrect", !!questionValues.noCorrect);
					Ext.apply(question.raw, questionValues);
					question.saveSkillQuestion({
						success: function(response) {
							var newAbstentions = Ext.create('ARSnova.view.MultiBadgeButton',
								Ext.apply(panel.abstentions.config, {
									hidden: question.get('abstention') === false
								})
							);
							panel.questionObj = question.data;
							panel.answerFormFieldset.removeAll();
							panel.answerFormFieldset.add(newAbstentions);
							panel.abstentions = newAbstentions;
							panel.getPossibleAnswers();
						}
					});
				};
				var finishEdit = Ext.bind(function() {
					this.setText(Messages.EDIT);
					this.removeCls('x-button-action');
					this.config.disableFields(panel);
					this.config.setEnableAnswerEdit(panel, false);
				}, this);
				var hasEmptyAnswers = function(possibleAnswers) {
					var empty = false;
					possibleAnswers.forEach(function(answer) {
						if (answer.text === "") {
							empty = true;
						}
					});
					return empty;
				};
				if(this.getText() == Messages.EDIT){
					panel.cancelButton.show();
					panel.backButton.hide();
					
					this.setText(Messages.SAVE);
					this.addCls('x-button-action');

					this.config.enableFields(panel);
					this.config.setEnableAnswerEdit(panel, true);
				} else {
					panel.cancelButton.hide();
					panel.backButton.show();
					
					var values = this.up('panel').down('#contentForm').getValues();
					var question = Ext.create('ARSnova.model.Question', panel.questionObj);

					question.set("subject", values.subject);
					question.set("text", values.questionText);
					question.set("abstention", panel.abstentionPart.getAbstention());
					question.raw.subject = values.subject;
					question.raw.text = values.questionText;
					question.raw.abstention = panel.abstentionPart.getAbstention();
					
					panel.subject.resetOriginalValue();
					panel.textarea.resetOriginalValue();
					
					var needsConfirmation = false;
					var empty = false;
					if (!panel.answerEditForm.isHidden()) {
						var questionValues = panel.answerEditForm.getQuestionValues();
						if (hasEmptyAnswers(questionValues.possibleAnswers)) {
							empty = true;
						}
						if (answersChanged(question.get("possibleAnswers"), questionValues.possibleAnswers)) {
							needsConfirmation = true;
						}
					}
					if (empty) {
						panel.answerEditForm.markEmptyFields();
						return;
					}
					if (needsConfirmation) {
						Ext.Msg.confirm(Messages.ARE_YOU_SURE, Messages.CONFIRM_ANSWERS_CHANGED, function(answer) {
							if (answer === "yes") {
								saveQuestion(question);
								finishEdit();
							}
						}, this);
					} else {
						saveQuestion(question);
						finishEdit();
					}
				}
			},
			
			enableFields: function(panel){
				var fields = panel.contentFieldset.getItems().items;
				var fieldsLength = fields.length;

				for(var i = 0; i < fieldsLength; i++){
					var field = fields[i];
					
					switch (field.config.label){
						case Messages.CATEGORY:
							field.setDisabled(false);
							break;
						case Messages.QUESTION:
							field.setDisabled(false);
							break;
						case Messages.DURATION:
							field.setDisabled(false);
							break;
						default:
							break;
					}
				}
			},
			
			disableFields: function(panel){
				var fields = panel.contentFieldset.getItems().items;
				var fieldsLength = fields.length;
				
				for ( var i = 0; i < fieldsLength; i++){
					var field = fields[i];
					switch (field.config.label){
						case Messages.CATEGORY:
							field.setDisabled(true);
							break;
						case Messages.QUESTION:
							field.setDisabled(true);
							break;
						case Messages.DURATION:
							field.setDisabled(true);
							break;
						default:
							break;
					}
				}
			},
			
			setEnableAnswerEdit: function(panel, enable) {
				if (enable) {
					panel.answerForm.hide(true);
				} else {
					panel.answerForm.show(true);
				}
				panel.answerEditForm.setHidden(!enable);
				panel.abstentionPart.setHidden(!enable);
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTION,
			docked: 'top',
			ui: 'light',
			items: [
		        this.backButton,
		        this.cancelButton,
		        {xtype:'spacer'},
		        this.editButton
			]
		});
		
		/* END TOOLBAR OBJECTS */
		
		/* BEGIN ACTIONS PANEL */
		
		this.statisticButton = Ext.create('Ext.Panel', {
			cls: this.hasCorrectAnswers? 'threeButtons left' : 'twoButtons left',
			
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'statisticIcon',
				scope	: this,
				handler	: function(){
					taskManager.stop(this.renewAnswerDataTask);
					var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
					sTP.questionStatisticChart = Ext.create('ARSnova.view.speaker.QuestionStatisticChart', {
						question: this.questionObj,
						lastPanel: this
					});
					ARSnova.app.mainTabPanel.animateActiveItem(sTP.questionStatisticChart, 'slide');
				}
			}, {
				html: Messages.STATISTIC,
				cls	: 'centerTextSmall'
			}],
			//hidden: this.isGridQuestion
		});

		this.releaseStatisticButton = Ext.create('Ext.Panel', {
			cls: this.hasCorrectAnswers? 'threeButtons left' : 'twoButtons left',
			
			items: [{
				xtype	: 'togglefield',
				label	: false,
				cls		: 'questionDetailsToggle',
				scope	: this,
				value 	: this.questionObj.showStatistic? this.questionObj.showStatistic : 0,
				listeners: {
					change: function(toggle, newValue, oldValue, eOpts ){
						if (newValue == 0 && me.questionObj.showStatistic == undefined || newValue == me.questionObj.showStatistic) return;
						var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_ACTIVATION);
						var question = Ext.create('ARSnova.model.Question', me.questionObj);

						switch (newValue) {
							case 0:
								delete question.data.showStatistic;
								delete question.raw.showStatistic;
								break;
							case 1:
								question.set('showStatistic', true);
								question.raw.showStatistic = true;
								break;
						};
						question.publishSkillQuestionStatistics({
							success: function(response) {
								hideLoadMask();
								me.questionObj = question.data;
							},
							failure: function() {
								hideLoadMask();
								console.log('could not save showStatistic flag'); 
							}
						});
					}
				}
			}, {
				html: Messages.RELEASE_STATISTIC,
				cls	: 'centerTextSmall'
			}]
		});
		
		this.showCorrectAnswerButton = Ext.create('Ext.Panel', {
			cls: 'threeButtons left',
			
			items: [{
				xtype	: 'togglefield',
				label	: false,
				cls		: 'questionDetailsToggle',
				scope	: this,
				value 	: this.questionObj.showAnswer? this.questionObj.showAnswer : 0,
				listeners: {
					scope: this,
					change: function(toggle, newValue, oldValue, eOpts) {
						var panel = this;
						
						if (newValue == 0 && typeof this.questionObj.showAnswer === "undefined" || newValue == this.questionObj.showAnswer) {
							return;
						}
						
						var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_ACTIVATION);
						var question = Ext.create('ARSnova.model.Question', this.questionObj);

						switch (newValue) {
							case 0:
								delete question.data.showAnswer;
								delete question.raw.showAnswer;
								break;
							case 1:
								question.set('showAnswer', 1);
								question.raw.showAnswer = 1;
								break;
						};
						question.publishCorrectSkillQuestionAnswer({
							success: function(response) {
								hideLoadMask();
								panel.questionObj = question.data;
							},
							failure: function() {
								hideLoadMask();
								console.log('could not save showAnswer flag');
							}
						});
					}
				}
			}, {
				html: Messages.MARK_CORRECT_ANSWER,
				cls	: 'centerTextSmall'
			}]
		});
		
		this.questionStatusButton = Ext.create('ARSnova.view.QuestionStatusButton' , { 
			questionObj: this.questionObj 
		});
		
		this.deleteAnswersButton = Ext.create('Ext.Panel', {
			cls: 'threeButtons left',
			
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'recycleIcon',
				scope	: this,
				handler	: function(){
					Ext.Msg.confirm(Messages.DELETE_ANSWERS_REQUEST, Messages.QUESTION_REMAINS, function(answer){
						if (answer == 'yes') {
							var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
							ARSnova.app.questionModel.deleteAnswers(panel.questionObj._id, {
								success: function() {
									if (panel.questionObj.questionType === "freetext") {
										panel.freetextAnswerStore.removeAll();
									} else {
										panel.answerFormFieldset.items.each(function(element) {
											if (element.isXType('button')) {
												element.setBadge([{ badgeText: "0" }]);
											}
										});
									}
								},
								failure: function(response){
									console.log('server-side error delete question');
								}
							});
						}
					});
				}
			}, {
				html: Messages.DELETE_ANSWERS,
				cls	: 'centerTextSmall'
			}]
		});
		
		this.deleteQuestionButton = Ext.create('Ext.Panel', {
			cls: 'threeButtons left',
			
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'deleteIcon',
				scope	: this,
				handler	: function(){
					var msg = Messages.ARE_YOU_SURE;
					if (this.questionObj.active && this.questionObj.active == 1)
						msg += "<br>" + Messages.DELETE_ALL_ANSWERS_INFO;
					Ext.Msg.confirm(Messages.DELETE_QUESTION, msg, function(answer){
						if (answer == 'yes') {
							var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
							ARSnova.app.questionModel.destroy(sTP.questionDetailsPanel.questionObj, {
								success: function() {
									me = sTP.questionDetailsPanel;
									
									sTP.animateActiveItem(sTP.audienceQuestionPanel, {
										type		: 'slide',
										direction	: 'right',
										duration	: 700,
									    listeners: {
									        animationend: function() {
									        	taskManager.stop(me.renewAnswerDataTask);
									        	me.destroy();
									        }
									    }
									});
								},
								failure: function(response){
									console.log('server-side error delete question');
								}
							});

						}
					});
				}
			}, {
				html: Messages.DELETE_QUESTION,
				cls	: 'centerTextSmall'
			}]
		});
		
		this.firstRow = Ext.create('Ext.form.FormPanel', {
			cls	 : 'actionsForm',
			scrollable: null,
			
			style: {
				marginTop: '15px'
			},
				
			items: [].concat(
				this.questionObj.questionType !== "freetext" ? [this.statisticButton, this.releaseStatisticButton] : [this.releaseStatisticButton]
			)
		});
		
		this.secondRow = Ext.create('Ext.form.FormPanel', {
			cls	 : 'actionsForm',
			scrollable: null,
			
			items: [
			    this.questionStatusButton,
			    this.deleteAnswersButton,
			    this.deleteQuestionButton
			]
		});
		
		this.actionsPanel = Ext.create('Ext.Panel', {
			items: [
				{
					cls: 'gravure',
					html: '\u201e' + Ext.util.Format.htmlEncode(this.questionObj.text) + '\u201f'
				},
				this.firstRow,
				this.secondRow
			]
		});
		/* END ACTIONS PANEL */
		
		this.subject = Ext.create('Ext.field.Text', {
			label: Messages.CATEGORY,
			name: 'subject',
			value: this.questionObj.subject,
			disabled: true
		});
		
		this.textarea = Ext.create('Ext.plugins.ResizableTextArea', {
			label: Messages.QUESTION,
			name: 'questionText',
			value: this.questionObj.text,
			disabled: true
		});
		
		var allPressed = false;
		var thmPressed = false;
		
		if(this.questionObj.releasedFor) {
			if(this.questionObj.releasedFor == "all")
				allPressed = true;
			else
				thmPressed = true;
		} else {
			allPressed = true;
		}
		
		if(window.innerWidth < 600) {
			this.releaseItems = [
                 { text	: Messages.ALL_SHORT, 	  itemId: 'all', pressed: allPressed}, 
                 { text	: Messages.ONLY_THM_SHORT, itemId: 'thm', pressed: thmPressed}
             ];
		} else {
			this.releaseItems = [
                 { text	: Messages.ALL_LONG, 	 itemId: 'all', pressed: allPressed }, 
                 { text	: Messages.ONLY_THM_LONG, itemId: 'thm', pressed: thmPressed }
             ];
		}
		
		if (
		  localStorage.getItem('courseId') != null
		  && localStorage.getItem('courseId').length > 0
		) {
			this.releasePart = Ext.create('Ext.Panel', {
				items: [
					{
						cls: 'gravure icon',
						style: { margin: '20px' },
						html: '<span class="coursemembersonlymessage">'+Messages.MEMBERS_ONLY+'</span>'
					}
				]
			});
		} else {
			this.releasePart = Ext.create('Ext.form.FormPanel', {
				scrollable: null,
				
				items: [{
					xtype: 'fieldset',
					cls: 'newQuestionOptions',
					title: Messages.RELEASE_FOR,
			    items: [{
				xtype: 'segmentedbutton',
					allowDepress: false,
					allowMultiple: false,
					items: this.releaseItems,
					listeners: {
					toggle: function(container, button, pressed){
						if(pressed){
							var hideLoadMask = ARSnova.app.showLoadMask(Messages.CHANGE_RELEASE);
							var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
							
							var question = Ext.ModelManager.getModel('ARSnova.model.Session').load(
									panel.questionObj._id, 
							{
								success: function(records, operation) {
									var question = Ext.create('ARSnova.model.Question',  
											Ext.decode(operation.getResponse().responseText));
									
									// button was already pressed 
									if(question.get('releasedFor') == button.getItemId()){
										hideLoadMask();
										return;
									}
									
									question.set('releasedFor', button.getItemId());

									question.save({
										success: function(response){
											panel.questionObj = question.getData();
											hideLoadMask();
										},
										failure: function() {
											hideLoadMask();
											console.log('could not save releasedFor flag');
										}
									});
								},
								failure: function(records, operation){
					    	  		Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
								}
							});
						}
					}
					}
				}]
				}]
			});
		}
		
		/* BEGIN QUESTION DETAILS */
		this.contentFieldset = Ext.create('Ext.form.FieldSet', {
			cls	 : 'standardFieldset',
			itemId	 : 'contentFieldset',
			items: [this.subject, this.textarea, {
				xtype: 'textfield',
				label: Messages.TYPE,
				value: this.getType(),
				disabled: true
			}]
		});
		
		this.abstentionPart = Ext.create('ARSnova.view.speaker.form.AbstentionForm', {
			abstention: this.questionObj.abstention,
			hidden: true
		});
		
		this.contentForm = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			itemId 	 : 'contentForm',
			style: { marginTop: '15px', marginLeft: '12px', marginRight: '12px' },
			items: [this.releasePart, this.contentFieldset]
		});
		
		this.answerFormFieldset = Ext.create('Ext.form.FieldSet', {
			cls: 'standardFieldset',
			title: this.questionObj.questionType !== "flashcard" ? Messages.ANSWERS : Messages.ANSWER
		});
		
		this.freetextAnswerList = Ext.create('Ext.List', {
			hidden: this.isGridQuestion, // TODO Do not even instantiate when grid question (+ performance)
			activeCls: 'search-item-active',
			store: this.freetextAnswerStore, 
			
			itemCls: 'forwardListButton',
			itemTpl: [
				'<div class="search-item noOverflow">',
				'<span style="color:gray">{formattedTime}</span><span style="padding-left:30px">{answerSubject:htmlEncode}</span>',
				'</div>'
			],
			deferEmptyText: false,
			emptyText: ['<div style="background-color: white; border-left: 1px solid lightgray; border-right: 1px solid lightgray;">',
			            Messages.NO_ANSWERS,
			            '</div>'].join(''),
			
			grouped: true,
			scrollable: { disabled: true },
			
			listeners: {
				scope: this,
				itemtap: function (list, index, element) {
					var answer = list.getStore().getAt(index).data;
					ARSnova.app.getController('Questions').freetextDetailAnswer({
						answer		: Ext.apply(answer, {
							deselectItem: function() { list.deselect(index); },
							removeItem: function() { list.getStore().remove(list.getStore().getAt(index)); }
						})
					});
				},
				/**
				 * The following events are used to get the computed height of all list items and 
				 * finally to set this value to the list DataView. In order to ensure correct rendering
				 * it is also necessary to get the properties "padding-top" and "padding-bottom" and 
				 * add them to the height of the list DataView.
				 */
		        painted: function (list, eOpts) {
		        	this.freetextAnswerList.fireEvent("resizeList", list);
		        },
		        resizeList: function(list) {
		        	var listItemsDom = list.select(".x-list .x-inner .x-inner").elements[0];
		        	
		        	this.freetextAnswerList.setHeight(
		        		parseInt(window.getComputedStyle(listItemsDom, "").getPropertyValue("height"))	+ 
		        		parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-top"))	+
		        		parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-bottom"))
		        	);
		        }
			},
			
		});
		
		this.abstentions = Ext.create('ARSnova.view.MultiBadgeButton', {
			hidden		: this.questionObj.abstention === false || this.isGridQuestion,
			ui			: 'normal',
			text		: Messages.ABSTENTION,
			disabled	: true,
			cls			: 'answerListButton',
			badgeCls	: 'badgeicon'
		});
		
		this.answerFormFieldset.add(this.abstentions);
		if (this.questionObj.questionType === "freetext") {
			this.answerFormFieldset.add(this.freetextAnswerList);
		}
		
		this.answerForm = Ext.create('Ext.form.FormPanel', {
			itemId 	 	: 'answerForm',
			style: { marginLeft: '12px', marginRight: '12px', backgroundColor: 'transparent' },
			scroll	: false,
			scrollable: null,
			items	: [this.answerFormFieldset]
		});
		
		var answerEditFormClass = 'ARSnova.view.speaker.form.NullQuestion';
		if (this.questionObj.questionType === 'mc') {
			answerEditFormClass = 'ARSnova.view.speaker.form.ExpandingAnswerForm';
		} else if (this.questionObj.questionType === 'abcd') {
			answerEditFormClass = 'ARSnova.view.speaker.form.IndexedExpandingAnswerForm';
		} else if (this.questionObj.questionType === 'yesno') {
			answerEditFormClass = 'ARSnova.view.speaker.form.YesNoQuestion';
		} else if (this.questionObj.questionType === 'school') {
			answerEditFormClass = 'ARSnova.view.speaker.form.SchoolQuestion';
		} else if (this.questionObj.questionType === 'vote') {
			answerEditFormClass = 'ARSnova.view.speaker.form.VoteQuestion';
		} else if (this.questionObj.questionType === 'flashcard') {
			answerEditFormClass = 'ARSnova.view.speaker.form.FlashcardQuestion';
		} else if (this.questionObj.questionType == 'grid') {
			answerEditFormClass = 'ARSnova.view.speaker.form.GridQuestion';
		}
		
		
		this.answerEditForm = Ext.create(answerEditFormClass, {
			hidden: true
		});
		
		if (this.questionObj.questionType === 'grid') {
			
			
	 	
			// set image data (base64 --> grid)
			this.answerEditForm.updateCanvas(this.questionObj.image, false);
			
			this.answerEditForm.grid.update(this.questionObj.gridSize, this.questionObj.offsetX, 
					this.questionObj.offsetY, this.questionObj.zoomLvl, this.questionObj.possibleAnswers, true);

			// do not reset possible answers in grid questions
			this.possibleAnswers = this.questionObj.possibleAnswers;
		} else {
			this.possibleAnswers = {};
		}
		
		this.answerEditForm.initWithQuestion(Ext.clone(this.questionObj));

		/* END QUESTION DETAILS */
		
		this.add([
		  this.toolbar,
          this.actionsPanel,
          this.contentForm,
          this.abstentionPart,
          this.answerForm,
          this.answerEditForm
        ]);
		
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
	},
	
	prevNewCard: null,
	prevOldCard: null,
	cardSwitchHandler: function(panel, newCard, oldCard, index, animated) {
		if (this.prevNewCard === oldCard) {
			taskManager.start(this.renewAnswerDataTask);
			return;
		}
		this.prevNewCard = newCard;
		this.prevOldCard = oldCard;
	},
	
	onActivate: function(){
		var panel = this;
		this.getPossibleAnswers();
		
		if(this.hasCorrectAnswers){
			this.firstRow.add(this.showCorrectAnswerButton);
		}
		if (this.questionObj.active) {
			taskManager.start(this.renewAnswerDataTask);
		}
		
		ARSnova.app.mainTabPanel.on('cardswitch', this.cardSwitchHandler, this);
		this.on('beforedestroy', function () {
			ARSnova.app.mainTabPanel.removeListener('cardswitch', this.cardSwitchHandler, this);
		}, this);
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.actionsPanel.getId()]);
		MathJax.Hub.Queue(
			["Delay", MathJax.Callback, 700], function() {
				panel.freetextAnswerList.fireEvent("resizeList", panel.freetextAnswerList.element);
			}
		);
	},
	
	onDeactivate: function() {
	},
	
	getPossibleAnswers: function() {
		var me = this;
		var isGridQuestion = (['grid'].indexOf(this.questionObj.questionType) !== -1);
		for ( var i = 0; i < this.questionObj.possibleAnswers.length; i++){
			var pA = this.questionObj.possibleAnswers[i];
			var element = Ext.create('ARSnova.view.MultiBadgeButton', {
				hidden		: isGridQuestion, // added but hidden to due abstention count (smarter solutions welcome)
				ui			: 'normal',
				disabled	: true,
				cls			: 'answerListButton',
				badgeCls	: 'badgeicon',
				badgeText	: [{badgeText: '0'}],
				html		: new Ext.XTemplate(
								'{text:htmlEncode}',
								'<tpl if="correct === true && this.isFlashcard() === false">',
									'&nbsp;<span style="padding: 0 0.2em 0 0.2em" class="x-list-item-correct">&#10003; </span>',
								'</tpl>', {
									isFlashcard: function() {
										return me.questionObj.questionType === 'flashcard';
									}
								}).apply(pA)
			});
			this.possibleAnswers[pA.text] = element.getId();
			this.answerFormFieldset.add(element);
			
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, element.dom]);
		}

		if ( isGridQuestion ) {

			// add statistic
			this.gridStatistic = Ext.create('ARSnova.view.components.GridStatistic', {
				questionObj : this.questionObj
			});
			this.answerFormFieldset.add(this.gridStatistic);
			this.getQuestionAnswers();
		}
		
	},
	
	getType: function(){
		if(this.questionObj.questionType){
			switch (this.questionObj.questionType) {
				case "vote":
					return Messages.EVALUATION;
				case "school":
					return Messages.SCHOOL;
				case "mc":
					return Messages.MC;
				case "abcd":
					return Messages.ABCD;
				case "yesno":
					return Messages.YESNO;
				case "freetext":
					return Messages.FREETEXT;
				case "flashcard":
					return Messages.FLASHCARD;
				case "grid":
					return Messages.GRID;
				default:
					return this.questionObj.questionType;
			}
		} else {
			/**
			 * only for older questions:
			 * try to define the question type
			 */
			console.log(this.questionObj);
			if(this.questionObj.possibleAnswers.length == 2)
				return Messages.YESNO;
			else if(this.questionObj.possibleAnswers[0].correct)
				return Messages.MC;
			else if(this.questionObj.possibleAnswers.length == 5)
				return Messages.EVALUATION;
			else
				return Messages.SCHOOL;
		}
	},
	
	getDuration: function(){
		switch (this.questionObj.duration){
			case 0:
				return Messages.INFINITE;	
			case 1:
				return this.questionObj.duration + " " + Messages.MINUTE;
			case "unbegrenzt":
				return Messages.INFINITE;
			case undefined:
				return Messages.INFINITE;
			default:
				return this.questionObj.duration + " " + Messages.MINUTES;
			
		}
	},

	getQuestionAnswers: function(){
		if (this.questionObj.active == "1" && this.questionObj.possibleAnswers) {
			if (this.questionObj.questionType === "freetext") {
				var self = this;
				
				ARSnova.app.questionModel.getAnsweredFreetextQuestions(localStorage.getItem("keyword"), this.questionObj._id, {
					success: function(response) {
						var responseObj = Ext.decode(response.responseText);
						var listItems = responseObj.map(function (item) {
							var v = item;
							var date = new Date(v.timestamp);
							return Ext.apply(item, {
								formattedTime	: Ext.Date.format(date, "H:i"),
								groupDate		: Ext.Date.format(date, "d.m.y")
							});
						});
						
						var abstentions = listItems.filter(function(item) {
							return item.abstention;
						});
						var answers = listItems.filter(function(item) {
							return !item.abstention;
						});
						
						self.freetextAnswerStore.removeAll();
						if (answers.length > 0) {
							self.freetextAnswerStore.add(answers);
							self.freetextAnswerStore.sort([{
								property : 'timestamp',
								direction: 'DESC'
							}]);
						}
						self.abstentions.setBadge([{badgeText: abstentions.length}]);
						
						MathJax.Hub.Queue(["Typeset", MathJax.Hub, self.freetextAnswerList.dom]);
					},
					failure: function() {
						console.log('server-side error');
					}
				});
			} else {
				ARSnova.app.questionModel.countAnswers(localStorage.getItem('keyword'), this.questionObj._id, {
					success: function(response){
						var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
						var answers = Ext.decode(response.responseText);
						
						for (var i = 0; i < panel.questionObj.possibleAnswers.length; i++) {
							var el = panel.questionObj.possibleAnswers[i];
							panel.down('#' + panel.possibleAnswers[el.text]).setBadge([{ badgeText: '0' }]);
						}
						panel.abstentions.setBadge([{badgeText: '0'}]);
						
						if (panel.questionObj.questionType === "mc") {
							var mcAnswerCount = [];
							var abstentionCount = 0;
							for (var i = 0, el; el = answers[i]; i++) {
								if (!el.answerText) {
									abstentionCount = el.abstentionCount;
									continue;
								}
								var values = el.answerText.split(",").map(function(answered) {
									return parseInt(answered, 10);
								});
								if (values.length !== panel.questionObj.possibleAnswers.length) {
									return;
								}
								for (var j=0; j < el.answerCount; j++) {
									values.forEach(function(selected, index) {
										if (typeof mcAnswerCount[index] === "undefined") {
											mcAnswerCount[index] = 0;
										}
										if (selected === 1) {
											mcAnswerCount[index] += 1;
										}
									});
								}
							}
							panel.abstentions.setBadge([{badgeText: abstentionCount+''}]);
							
							panel.answerFormFieldset.query('button').filter(function(button) {
								return button !== panel.abstentions;
							}).forEach(function(button, index) {
								button.setBadge([{ badgeText: mcAnswerCount[index] ? mcAnswerCount[index]+'' : '0'}]);
							});
						} else if (panel.questionObj.questionType === "grid") {
							panel.gridStatistic.answers 		= answers;
							panel.gridStatistic.setQuestionObj  = panel.questionObj;
							panel.gridStatistic.updateGrid();
						} else {
							var abstentionCount = 0;
							for (var i = 0, el; el = answers[i]; i++) {
								if (!el.answerText) {
									abstentionCount = el.abstentionCount;
									continue;
								}
								var elementId = '#' + panel.possibleAnswers[el.answerText];
								var theElement = panel.answerFormFieldset.down(elementId);
								if (theElement) {
									theElement.setBadge([{ badgeText: el.answerCount}]);
								}
							}
							panel.abstentions.setBadge([{badgeText: abstentionCount+''}]);
						}
					},
					failure: function(){
						console.log('server-side error');
					}
				});
			}
		}
	},
	
	resetFields: function(){
		var fields = this.down('#contentFieldset').items.items;
		fields.forEach(function(field) {
			field.reset();
			field.setDisabled(true);
		});
	}
});
