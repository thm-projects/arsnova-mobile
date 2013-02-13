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
Ext.regModel('FreetextAnswer', {
	fields: ['subject', 'timestamp', 'formattedTime', 'groupDate']
});

ARSnova.views.speaker.QuestionDetailsPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	cancelButton: null,
	editButton	: null,
	
	questionObj : null,

	freetextAnswerStore: new Ext.data.JsonStore({
		model		: 'FreetextAnswer',
		sorters		: 'timestamp',
		groupField	: 'groupDate'
	}),
	
	renewAnswerDataTask: {
		name: 'renew the answer table data at question details panel',
		run: function(){
			
			ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.getQuestionAnswers();
		},
		interval: 20000 //20 seconds
	},
	
	constructor: function(question){
		this.questionObj = question;
		
		if( this.questionObj.questionType == "yesno" 	|| 
			this.questionObj.questionType == "mc" 		||
			( this.questionObj.questionType == "abcd" && !this.questionObj.noCorrect ) ) {
			this.hasOneCorrectAnswer = true;			
		}
		
		/* BEGIN TOOLBAR OBJECTS */
		
		this.backButton = new Ext.Button({
			text	: Messages.QUESTION,
			ui		: 'back',
			scope	: this,
			handler	: function(){
				taskManager.stop(this.renewAnswerDataTask);
				
				var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.on('cardswitch', function(){
					this.destroy();
				}, this, {single: true});
				sTP.setActiveItem(sTP.audienceQuestionPanel, {
					type		: 'slide',
					direction	: 'right'
				});
			}
		});
		
		this.cancelButton = new Ext.Button({
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
		
		this.editButton = new Ext.Button({
			text	: Messages.EDIT,
			hidden	: true,
			handler	: function(){
				var panel = this.up('panel');
				
				if(this.text == Messages.EDIT){
					panel.cancelButton.show();
					panel.backButton.hide();
					
					this.setText(Messages.SAVE);
					this.addCls('x-button-action');
					
					this.enableFields();
				} else {
					panel.cancelButton.hide();
					panel.backButton.show();
					
					var values = this.up('panel').down('#contentForm').getValues();
					var question = Ext.ModelMgr.create(panel.questionObj, "Question");
					question.set("subject", values.subject);
					question.set("text", values.questionText);
					question.saveSkillQuestion({
						success: function(response){
							//nothing to do
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
					switch (field.label){
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
					switch (field.label){
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
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.QUESTION,
			items: [
		        this.backButton,
		        this.cancelButton,
		        {xtype:'spacer'},
		        this.editButton
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		/* END TOOLBAR OBJECTS */
		
		/* BEGIN ACTIONS PANEL */
		
		this.statisticButton = new Ext.Panel({
			cls: this.hasOneCorrectAnswer? 'threeButtons left' : 'twoButtons left',
			
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'statisticIcon',
				scope	: this,
				handler	: function(){
					taskManager.stop(this.renewAnswerDataTask);
					var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
					sTP.questionStatisticChart = new ARSnova.views.QuestionStatisticChart(this.questionObj, this);
					ARSnova.mainTabPanel.setActiveItem(sTP.questionStatisticChart, 'slide');
				}
			}, {
				html: Messages.STATISTIC,
				cls	: 'centerTextSmall'
			}]
		});

		this.releaseStatisticButton = new Ext.Panel({
			cls: this.hasOneCorrectAnswer? 'threeButtons left' : 'twoButtons left',
			
			items: [{
				xtype	: 'togglefield',
				label	: false,
				cls		: 'questionDetailsToggle',
				scope	: this,
				value 	: this.questionObj.showStatistic? this.questionObj.showStatistic : 0,
				listeners: {
					change: function(toggleEl, something, value){
						var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
						if (value == 0 && panel.questionObj.showStatistic == undefined || value == panel.questionObj.showStatistic) return;
						ARSnova.showLoadMask(Messages.LOAD_MASK_ACTIVATION);
						var question = Ext.ModelMgr.create(panel.questionObj, "Question");
						switch (value) {
							case 0:
								delete question.data.showStatistic;
								break;
							case 1:
								question.set('showStatistic', 1);
								break;
						};
						question.publishSkillQuestionStatistics({
							success: function(response){
								panel.questionObj = question.data;
								ARSnova.hideLoadMask();
							},
							failure: function(){ console.log('could not save showStatistic flag'); }
						});
					}
				}
			}, {
				html: Messages.RELEASE_STATISTIC,
				cls	: 'centerTextSmall'
			}]
		});
		
		this.showCorrectAnswerButton = new Ext.Panel({
			cls: 'threeButtons left',
			
			items: [{
				xtype	: 'togglefield',
				label	: false,
				cls		: 'questionDetailsToggle',
				scope	: this,
				value 	: this.questionObj.showAnswer? this.questionObj.showAnswer : 0,
				listeners: {
					change: function(toggleEl, something, value){
						var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
						if (value == 0 && panel.questionObj.showAnswer == undefined || value == panel.questionObj.showAnswer) return;
						ARSnova.showLoadMask(Messages.LOAD_MASK_ACTIVATION);
						var question = Ext.ModelMgr.create(panel.questionObj, "Question");
						switch (value) {
							case 0:
								delete question.data.showAnswer;
								break;
							case 1:
								question.set('showAnswer', 1);
								break;
						};
						question.publishCorrectSkillQuestionAnswer({
							success: function(response){
								panel.questionObj = question.data;
								ARSnova.hideLoadMask();
							},
							failure: function(){ console.log('could not save showAnswer flag'); }
						});
					}
				}
			}, {
				html: Messages.MARK_CORRECT_ANSWER,
				cls	: 'centerTextSmall'
			}]
		});
		
		this.questionStatusButton = new ARSnova.views.QuestionStatusButton(this.questionObj);
		
		this.deleteAnswersButton = new Ext.Panel({
			cls: 'threeButtons left',
			
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'recycleIcon',
				scope	: this,
				handler	: function(){
					Ext.Msg.confirm(Messages.DELETE_ANSWERS_REQUEST, Messages.QUESTION_REMAINS, function(answer){
						if (answer == 'yes') {
							var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
							ARSnova.questionModel.deleteAnswers(panel.questionObj._id, {
								success: function() {
									if (panel.questionObj.questionType === "freetext") {
										panel.noFreetextAnswers.show();
										panel.freetextAnswerStore.removeAll();
									} else {
										panel.answerFormFieldset.items.each(function(button){
											button.setBadge("0");
										});
									}
								},
								failure: function(response){
									console.log('server-side error delete question');
								}
							});
						}
					});
					Ext.Msg.doComponentLayout();
				}
			}, {
				html: Messages.DELETE_ANSWERS,
				cls	: 'centerTextSmall'
			}]
		});
		
		this.deleteQuestionButton = new Ext.Panel({
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
							var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
							ARSnova.questionModel.destroy(sTP.questionDetailsPanel.questionObj, {
								failure: function(response){
									console.log('server-side error delete question');
								}
							});
							me = sTP.questionDetailsPanel;
							sTP.setActiveItem(sTP.audienceQuestionPanel, {
								type		: 'slide',
								direction	: 'right',
								duration	: 700,
								before: function(){
									taskManager.stop(me.renewAnswerDataTask);
								},
								after: function(){
									me.destroy();
								}
							});
						}
					});
					Ext.Msg.doComponentLayout();
				}
			}, {
				html: Messages.DELETE_QUESTION,
				cls	: 'centerTextSmall'
			}]
		});
		
		this.firstRow = new Ext.form.FormPanel({
			cls	 : 'actionsForm',
			style: {
				marginTop: '15px'
			},
				
			items: [].concat(
				this.questionObj.questionType !== "freetext" ? [this.statisticButton, this.releaseStatisticButton] : [this.releaseStatisticButton]
			)
		});
		
		this.secondRow = new Ext.form.FormPanel({
			cls	 : 'actionsForm',
				
			items: [
			    this.questionStatusButton,
			    this.deleteAnswersButton,
			    this.deleteQuestionButton
			]
		});
		
		this.actionsPanel = new Ext.Panel({
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
		
		this.textarea = new Ext.plugins.ResizableTextArea({
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
                 { text	: Messages.ALL_SHORT, 	  id: 'all', pressed: allPressed}, 
                 { text	: Messages.ONLY_THM_SHORT, id: 'thm', pressed: thmPressed}
             ];
		} else {
			this.releaseItems = [
                 { text	: Messages.ALL_LONG, 	 id: 'all', pressed: allPressed }, 
                 { text	: Messages.ONLY_THM_LONG, id: 'thm', pressed: thmPressed }
             ];
		}
		
		this.releasePart = new Ext.form.FormPanel({
			items: [{
				xtype: 'fieldset',
				title: Messages.RELEASE_FOR,
	            items: [{
	            	xtype: 'segmentedbutton',
	        		cls: 'releaseOptions',
	        		allowDepress: false,
	        		allowMultiple: false,
	        		items: this.releaseItems,
	        		listeners: {
	    		    	toggle: function(container, button, pressed){
    		    			if(pressed){
    		    				ARSnova.showLoadMask(Messages.CHANGE_RELEASE);
	    		    			var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
	    		    			var question = Ext.ModelMgr.create(panel.questionObj, "Question");
	    		    			
	    		    			/* button was already pressed */
	    		    			if(question.get('releasedFor') == button.id){
	    		    				ARSnova.hideLoadMask();
	    		    				return;
	    		    			}
								question.set('releasedFor', button.id);
	    						question.save({
	    							success: function(response){
	    								panel.questionObj = question.data;
	    								ARSnova.hideLoadMask();
	    							},
	    							failure: function(){ console.log('could not save releasedFor flag'); }
	    						});
	    		    		}
	    		    	}
	        		}
	        	}]
			}]
    	});
		
		/* BEGIN QUESTION DETAILS */
		this.contentFieldset = new Ext.form.FieldSet({
			cls	 : 'standardFieldset',
			id	 : 'contentFieldset',
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
			}, {
				xtype: 'textfield',
				label: Messages.STATUS,
				value: this.questionObj.active == "1" ? Messages.RELEASED : Messages.NOT_RELEASED,
				disabled: true
			}]
		});
		
		this.contentForm = new Ext.form.FormPanel({
			id 	 : 'contentForm',
			style: { marginTop: '15px' },
			items: [this.contentFieldset, this.releasePart]
		});
		
		this.answerFormFieldset = new Ext.form.FieldSet({
			title: Messages.ANSWERS,
			cls	 : 'standardFieldset'
		});
		
		this.freetextAnswerList = ARSnova.views.FreetextAnswerList(this.freetextAnswerStore, true);
		
		this.noFreetextAnswers = new Ext.Panel({
			cls: 'centerText',
			html: Messages.NO_ANSWERS
		});
		
		if (this.questionObj.questionType === "freetext") {
			this.answerFormFieldset.add(this.noFreetextAnswers);
			this.answerFormFieldset.add(this.freetextAnswerList);
		}
		
		this.answerForm = new Ext.form.FormPanel({
			id 	 	: 'answerForm',
			scroll	: false,
			items	: [this.answerFormFieldset]
		}),
		/* END QUESTION DETAILS */
		
		this.items = [
          this.actionsPanel,
          this.contentForm,
          this.answerForm
        ];
		
		ARSnova.views.speaker.QuestionDetailsPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', this.onActivate);
		/* show a loading screen to hide the showCorrectAnswerButton-Animation*/
		ARSnova.showLoadMask(Messages.LOAD_MASK);
		
		ARSnova.views.speaker.QuestionDetailsPanel.superclass.initComponent.call(this);
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
			this.doLayout();
		}
		setTimeout("ARSnova.hideLoadMask()", 1000);
		
		if(!this.questionObj.active)
			this.editButton.show();
		else
			taskManager.start(this.renewAnswerDataTask);
		
		ARSnova.mainTabPanel.on('cardswitch', this.cardSwitchHandler, this);
		this.on('beforedestroy', function () {
			ARSnova.mainTabPanel.removeListener('cardswitch', this.cardSwitchHandler, this);
		}, this);
	},
	
	getPossibleAnswers: function(){
		for ( var i = 0; i < this.questionObj.possibleAnswers.length; i++){
			var pA = this.questionObj.possibleAnswers[i];
			this.answerFormFieldset.add({
				xtype		: 'button',
				ui			: 'normal',
				text		: pA.text,
				disabled	: true,
				cls			: 'answerListButton',
				badgeText	: '0',
				badgeCls	: 'badgeicon'
			});
		}
		
		// Prevent the view from scrolling to the top after returning from a free text answer detail view
		if (this.questionObj.questionType !== "freetext") {
			this.doComponentLayout();
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
				
				ARSnova.questionModel.getAnsweredFreetextQuestions(localStorage.getItem("keyword"), this.questionObj._id, {
					success: function(response) {
						var responseObj = Ext.decode(response.responseText);
						var listItems = responseObj.map(function (item) {
							var v = item;
							return Ext.apply(item, {
								formattedTime	: new Date(v.timestamp).format("H:i"),
								groupDate		: new Date(v.timestamp).format("d.m.y")
							});
						});
						
						// Have the first answers arrived? Then remove the "no answers" message. 
						if (self.noFreetextAnswers.isVisible() && listItems.length > 0) {
							self.noFreetextAnswers.hide();
						} else if (!self.noFreetextAnswers.isVisible() && listItems.length === 0) {
							// The last remaining answer has been deleted. Display message again.
							self.noFreetextAnswers.show();
						}
						
						self.freetextAnswerStore.removeAll();
						self.freetextAnswerStore.add(listItems);
					},
					failure: function() {
						console.log('server-side error');
					}
				});
			} else {
				ARSnova.questionModel.countAnswers(localStorage.getItem('keyword'), this.questionObj._id, {
					success: function(response){
						var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
						var answers = Ext.decode(response.responseText);
						console.log(answers);
						var tmp_possibleAnswers = [];
						
						for (var i = 0; i < panel.questionObj.possibleAnswers.length; i++) {
							var el = panel.questionObj.possibleAnswers[i];
							tmp_possibleAnswers.push(el.text);
						}
						
						for (var i = 0, el; el = answers[i]; i++) {
							var field = "button[text=" + el.key[1] + "]";
							panel.answerFormFieldset.down(field).setBadge(el.value);
							
							var idx = tmp_possibleAnswers.indexOf(el.key[1]); // Find the index
							if(idx!=-1) tmp_possibleAnswers.splice(idx, 1); // Remove it if really found!
						}
						
						for ( var i = 0; i < tmp_possibleAnswers.length; i++){
							var el = tmp_possibleAnswers[i];
							
							var field = "button[text=" + el + "]";
							panel.answerFormFieldset.down(field).setBadge(0);
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