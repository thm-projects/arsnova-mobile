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
	
	config: {
		title: 'QuestionDetailsPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	cancelButton: null,
	editButton	: null,

	questionObj : null,
	
	freetextAnswerStore: Ext.create('Ext.data.JsonStore', {
		model		: 'FreetextAnswer',
		sorters		: 'timestamp',
		groupField	: 'groupDate'
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
		
		if( this.questionObj.questionType == "yesno" 	|| 
			this.questionObj.questionType == "mc" 		||
			( this.questionObj.questionType == "abcd" && !this.questionObj.noCorrect ) ) {
			this.hasOneCorrectAnswer = true;			
		}
		
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
			}
		});
		
		this.editButton = Ext.create('Ext.Button', {
			text	: Messages.EDIT,
			hidden	: true,
			handler	: function(){
				var panel = this.up('panel');
				
				if(this.getText() == Messages.EDIT){
					panel.cancelButton.show();
					panel.backButton.hide();
					
					this.setText(Messages.SAVE);
					this.addCls('x-button-action');

					this.enableFields();
				} else {
					panel.cancelButton.hide();
					panel.backButton.show();
					
					var values = this.up('panel').down('#contentForm').getValues();
					var question = Ext.create('ARSnova.model.Question', panel.questionObj);

					question.set("subject", values.subject);
					question.set("text", values.questionText);
					question.raw.subject = values.subject;
					question.raw.text = values.questionText;
					
					question.saveSkillQuestion({
						success: function(response){
							panel.questionObj = question.data;
						}
					});
					
					this.setText(Messages.EDIT);
					this.removeCls('x-button-action');
					
					this.disableFields();
				}
			},
			
			enableFields: function(){
				var fields = this.up('panel').down('#contentFieldset').items.items;
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
			
			disableFields: function(){
				var fields = this.up('panel').down('#contentFieldset').items.items;
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
			cls: this.hasOneCorrectAnswer? 'threeButtons left' : 'twoButtons left',
			
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
			}]
		});

		this.releaseStatisticButton = Ext.create('Ext.Panel', {
			cls: this.hasOneCorrectAnswer? 'threeButtons left' : 'twoButtons left',
			
			items: [{
				xtype	: 'togglefield',
				label	: false,
				cls		: 'questionDetailsToggle',
				scope	: this,
				value 	: this.questionObj.showStatistic? this.questionObj.showStatistic : 0,
				listeners: {
					change: function(toggleEl, something, something2, value){
						if (value == 0 && me.questionObj.showStatistic == undefined || value == me.questionObj.showStatistic) return;
						ARSnova.app.showLoadMask(Messages.LOAD_MASK_ACTIVATION);
						var question = Ext.create('ARSnova.model.Question', me.questionObj);

						switch (value) {
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
							success: function(response){
								me.questionObj = question.data;
							},
							failure: function(){ 
								console.log('could not save showStatistic flag'); 
							}
						});
						ARSnova.app.hideLoadMask();
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
					change: function(toggle, slider, thumb, value) {
						var panel = this;
						
						if (value == 0 && typeof this.questionObj.showAnswer === "undefined" || value == this.questionObj.showAnswer) {
							return;
						}
						
						ARSnova.app.showLoadMask(Messages.LOAD_MASK_ACTIVATION);
						var question = Ext.create('ARSnova.model.Question', this.questionObj);
						switch (value) {
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
							success: function(response){
								panel.questionObj = question.data;
							},
							failure: function(){
								console.log('could not save showAnswer flag');
							}
						});
						ARSnova.app.hideLoadMask();
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
									panel.abstentions.hide();
									if (panel.questionObj.questionType === "freetext") {
										panel.noFreetextAnswers.show();
										panel.freetextAnswerList.hide();
										panel.freetextAnswerStore.removeAll();
									} else {
										panel.answerFormFieldset.items.each(function(button){
											if(button.xtype == 'button')
												button.setBadge([{ badgeText: "0" }]);
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
					html: '\u201e' + this.questionObj.text + '\u201f'
				},
				this.firstRow,
				this.secondRow
			]
		});
		/* END ACTIONS PANEL */
		
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
							ARSnova.app.showLoadMask(Messages.CHANGE_RELEASE);
							var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
							
							var question = Ext.ModelManager.getModel('ARSnova.model.Session').load(
									panel.questionObj._id, 
							{
								success: function(records, operation) {
									var question = Ext.create('ARSnova.model.Question',  
											Ext.decode(operation.getResponse().responseText));
									
									// button was already pressed 
									if(question.get('releasedFor') == button.getItemId()){
										ARSnova.app.hideLoadMask();
										return;
									}
									
									question.set('releasedFor', button.getItemId());

									question.save({
										success: function(response){
											panel.questionObj = question.getData();
											ARSnova.app.hideLoadMask();
										},
										failure: function(){ console.log('could not save releasedFor flag'); }
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
			items: [{
				xtype: 'textfield',
				label: Messages.CATEGORY,
				name: 'subject',
				value: this.questionObj.subject,
				disabled: true
			}, this.textarea, {
				xtype: 'textfield',
				label: Messages.TYPE,
				value: this.getType(),
				disabled: true
			}]
		});
		
		this.contentForm = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			itemId 	 : 'contentForm',
			style: { marginTop: '15px', marginLeft: '12px', marginRight: '12px' },
			items: [this.releasePart, this.contentFieldset]
		});
		
		this.answerFormFieldset = Ext.create('Ext.form.FieldSet', {
			cls: 'standardFieldset',
			title: Messages.ANSWERS
		});
		
		this.freetextAnswerList = Ext.create('Ext.List', {
			activeCls: 'search-item-active',
			store: this.freetextAnswerStore, 
			
			itemCls: 'forwardListButton',
			itemTpl: [
				'<div class="search-item noOverflow">',
				'<span style="color:gray">{formattedTime}</span><span style="padding-left:30px">{answerSubject}</span>',
				'</div>'
			],
			grouped: true,
			scrollable: { disabled: true },
			
			listeners: {
				itemtap: function (list, index, element) {
					var answer = list.getStore().getAt(index).data;
					ARSnova.app.getController('Questions').freetextDetailAnswer({
						answer		: Ext.apply(answer, {
							deselectItem: function() { list.deselect(index); },
							removeItem: function() { list.getStore().remove(list.getStore().getAt(index)); }
						})
					});
				},
		        initialize: function (list, eOpts){
		            var me = this;
		            if (typeof me.getItemMap == 'function'){
		                me.getScrollable().getScroller().on('refresh',function(scroller,eOpts){
		                	var itemsHeight = me.getItemHeight() * me.itemsCount;
		                	if(me.getGrouped()) {
		                		var groupHeight = typeof me.headerHeight !== 'undefined' ? me.headerHeight : 26;
		                		itemsHeight += me.groups.length * groupHeight;
		                	}
		                	me.setHeight(itemsHeight);
		                });
		            }
		        }
			}
		});
		
		this.noFreetextAnswers = Ext.create('Ext.Panel', {
			cls: 'centerText',
			html: Messages.NO_ANSWERS
		});
		
		this.abstentions = Ext.create('ARSnova.view.MultiBadgeButton', {
			hidden		: true,
			ui			: 'normal',
			text		: Messages.ABSTENTION,
			disabled	: true,
			cls			: 'answerListButton',
			badgeCls	: 'badgeicon'
		});
		
		if (this.questionObj.questionType === "freetext") {
			this.answerFormFieldset.add(this.noFreetextAnswers);
			this.answerFormFieldset.add(this.freetextAnswerList);
		}
		this.answerFormFieldset.add(this.abstentions);
		
		this.answerForm = Ext.create('Ext.form.FormPanel', {
			itemId 	 	: 'answerForm',
			style: { marginLeft: '12px', marginRight: '12px', backgroundColor: 'transparent' },
			scroll	: false,
			scrollable: null,
			items	: [this.answerFormFieldset]
		}),
		/* END QUESTION DETAILS */
		
		this.add([
		  this.toolbar,
          this.actionsPanel,
          this.contentForm,
          this.answerForm
        ]);
		
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
		/* show a loading screen to hide the showCorrectAnswerButton-Animation*/
		ARSnova.app.showLoadMask(Messages.LOAD_MASK);
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
		this.getPossibleAnswers();
		
		if(this.hasOneCorrectAnswer){
			this.firstRow.add(this.showCorrectAnswerButton);
		}
		setTimeout("ARSnova.app.hideLoadMask()", 1000);
		
		if(!this.questionObj.active)
			this.editButton.show();
		else
			taskManager.start(this.renewAnswerDataTask);
		
		ARSnova.app.mainTabPanel.on('cardswitch', this.cardSwitchHandler, this);
		this.on('beforedestroy', function () {
			ARSnova.app.mainTabPanel.removeListener('cardswitch', this.cardSwitchHandler, this);
		}, this);
		ARSnova.app.hideLoadMask(Messages.LOAD_MASK);
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.actionsPanel.getId()]);
	},
	
	onDeactivate: function() {
	},
	
	getPossibleAnswers: function(){
		for ( var i = 0; i < this.questionObj.possibleAnswers.length; i++){
			var pA = this.questionObj.possibleAnswers[i];
			var element = Ext.create('ARSnova.view.MultiBadgeButton', {
				ui			: 'normal',
				text		: pA.text,
				disabled	: true,
				cls			: 'answerListButton',
				badgeCls	: 'badgeicon'
			});
			pA.elementId = element.getId();
			this.answerFormFieldset.add(element);
			
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, element.dom]);
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
						// Have the first answers arrived? Then remove the "no answers" message. 
						if (!self.noFreetextAnswers.isHidden() && listItems.length > 0) {
							self.noFreetextAnswers.hide();
							self.freetextAnswerList.show();
						} else if (self.noFreetextAnswers.isHidden() && listItems.length === 0) {
							// The last remaining answer has been deleted. Display message again.
							self.noFreetextAnswers.show();
							self.freetextAnswerList.hide();
						}
						
						self.freetextAnswerStore.removeAll();
						self.freetextAnswerStore.add(answers);
						self.abstentions.setBadge([{ badgeText: abstentions.length }]);
						self.abstentions.setVisible(abstentions.length > 0);
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
						var answerTextToElementId = {};
						
						for (var i = 0; i < panel.questionObj.possibleAnswers.length; i++) {
							var el = panel.questionObj.possibleAnswers[i];
							answerTextToElementId[el.text] = el.elementId;
							panel.down('#' + el.elementId).setBadge([{ badgeText: '0' }]);
						}
						
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
							if (abstentionCount) {
								panel.abstentions.setBadge([{badgeText: abstentionCount}]);
								panel.abstentions.show();
							}
							panel.answerFormFieldset.query('button').filter(function(button) {
								return button !== panel.abstentions;
							}).forEach(function(button, index) {
								button.setBadge([{ badgeText: mcAnswerCount[index] ? mcAnswerCount[index]+'' : '0'}]);
							});
						} else {
							for (var i = 0, el; el = answers[i]; i++) {
								var elementId = '#' + answerTextToElementId[el.answerText];
								panel.answerFormFieldset.down(elementId).setBadge([{ badgeText: el.answerCount}]);
							}
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
		var fieldsLength = fields.length;
		
		for ( var i = 0; i < fieldsLength; i++){
			var field = fields[i];
			switch (field.label){
				case Messages.CATEGORY:
					field.setValue(this.questionObj.subject);
					break;
				case Messages.QUESTION:
					field.setValue(this.questionObj.text);
					break;
				case Messages.DURATION:
					field.setValue(this.getDuration());
					break;
				default:
					break;
			}
			field.setDisabled(true);
		}
	}
});
