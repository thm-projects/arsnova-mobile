/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/Question.js
 - Beschreibung: Template für einzelne Fragen.
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
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
Ext.define('ARSnova.view.Question', {
	extend: 'Ext.Panel',
	
	config: {
		scroll: 'vertical',
		scrollable: true
	},
	
	questionObj: null,
	viewOnly: false,
	
	constructor: function() {
		this.callParent(arguments);
		
		var self = this; // for use inside callbacks
		
		var answerStore = Ext.create('Ext.data.Store', {model: 'ARSnova.model.Answer'});
		for (var i = 0; i < this.questionObj.possibleAnswers.length; i++) {
			this.questionObj.possibleAnswers[i].wasAnswered = false;
		}
		answerStore.add(this.questionObj.possibleAnswers);
		
		this.on('preparestatisticsbutton', function(button) {
			button.scope = this;
			button.setHandler(function() {
				var questionStatisticChart = Ext.create('ARSnova.view.speaker.QuestionStatisticChart', {
					question	: self.questionObj,
					lastPanel	: self
				});
				ARSnova.app.mainTabPanel.animateActiveItem(questionStatisticChart, 'slide');
			});
		});
		
		var saveAnswer = function(answer) {
			answer.saveAnswer({
				success: function() {
					var questionsArr = Ext.decode(localStorage.getItem('questionIds'));
					if (questionsArr.indexOf(self.questionObj._id) == -1) {
						questionsArr.push(self.questionObj._id);
					}
					localStorage.setItem('questionIds', Ext.encode(questionsArr));
					
					self.disable();
					ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.showNextUnanswered();
				},
				failure: function(response, opts) {
					console.log('server-side error');
					Ext.Msg.alert(Messages.NOTIFICATION, Messages.ANSWER_CREATION_ERROR);
					Ext.Msg.doComponentLayout();
				}
			});
		};
		
		this.saveMcQuestionHandler = function() {
			Ext.Msg.confirm('', Messages.ARE_YOU_SURE, function(button) {
				if (button !== 'yes') {
					return;
				}
				
				var selectedIndexes = [];
				this.answerList.getSelection().forEach(function(node) {
					selectedIndexes.push(this.answerList.indexOf(node));
				}, this);
				
				if (this.questionObj.showAnswer) {
					this.answerList.getInnerItems().forEach(function(node) {
						var record = this.answerList.getRecord(node);
						if (record.get("correct")) {
							new Ext.Element(node).addCls("x-list-item-correct");
						}
					}, this);
				}
				
				var answerValues = [];
				for (var i=0; i < this.answerList.getInnerItems().length; i++) {
					answerValues.push(selectedIndexes.indexOf(i) !== -1 ? "1" : "0");
				}
				
				ARSnova.app.answerModel.getUserAnswer(this.questionObj._id, {
					empty: function() {
						var answer = Ext.create('ARSnova.model.Answer', {
							type	 	: "skill_question_answer",
							sessionId	: localStorage.getItem("sessionId"),
							questionId	: self.questionObj._id,
							 // convert to string: the server requires this data type
							answerText	: answerValues.join(","),
							user		: localStorage.getItem("login")
						});
						
						saveAnswer(answer);
					},
					success: function(response){
						var theAnswer = Ext.decode(response.responseText);
						
						//update
						var answer = Ext.ModelMgr.create(theAnswer, "Answer");
						answer.set('answerText', answerValues.join(","));
						
						saveAnswer(answer);
					},
					failure: function(){
						console.log('server-side error');
					}
				});
			}, this);
		};
		
		var questionListener = this.viewOnly || this.questionObj.questionType === "mc" ? {} : {
			'itemtap': function(list, index, target) {
				var answerObj = self.questionObj.possibleAnswers[index];
				
				/* for use in Ext.Msg.confirm */
				answerObj.selModel = list;
				answerObj.target = target;

				var theAnswer = answerObj.id || answerObj.text;
				
				Ext.Msg.confirm(
					Messages.ANSWER + ' "' + theAnswer + '"', 
					Messages.ARE_YOU_SURE, 
					function(button) {
						if(button == 'yes') {
							self.decrementQuestionBadges();
							
							if (answerObj.target.className == "x-list-item-body") {
								answerObj.target = answerObj.target.parentElement;
							}
							
							if (self.questionObj.showAnswer) {
								if (answerObj.correct === 1 || answerObj.correct === true) {
									answerObj.target.className = "x-list-item x-list-item-correct";
								} else {
									for (var i = 0; i < self.questionObj.possibleAnswers.length; i++) {
										var answer = self.questionObj.possibleAnswers[i];
										if (answer.correct === 1 || answer.correct === true) {
											list.element.dom.childNodes[i].className = "x-list-item x-list-item-correct";
										}
									}
								}
							}
							
							ARSnova.app.answerModel.getUserAnswer(self.questionObj._id, {
								empty: function() {
									var answer = Ext.create('ARSnova.model.Answer', {
										type	 	: "skill_question_answer",
										sessionId	: localStorage.getItem("sessionId"),
										questionId	: self.questionObj._id,
										answerText	: answerObj.text,
										user		: localStorage.getItem("login")
									});
									
									saveAnswer(answer);
								},
								success: function(response){
									var theAnswer = Ext.decode(response.responseText);
									
									//update
									var answer = Ext.create('ARSnova.model.Answer', theAnswer);		
									answer.set('answerText', answerObj.text);
									saveAnswer(answer);
								},
								failure: function(){
									console.log('server-side error');
								}
							});
						} else {
							answerObj.selModel.deselect(answerObj.selModel.selected.items[0]);
						}
					}
				);
			}
		};
		
		this.questionTitle = Ext.create('Ext.Panel', {
			cls: 'roundedBox',
			html: 
				'<p class="title">' + this.questionObj.subject + '<p/>' +
				'<p>' + this.questionObj.text + '</p>'
		});
		
		this.answerList = Ext.create('Ext.List', {
			store	: answerStore,

			cls: 'roundedBox',
			
			scrollable: { disabled: true },
			
			itemTpl	: new Ext.XTemplate(
					'<tpl if="correct == 1 && wasAnswered == true">',
					'{text} <span class="x-list-item-correct">&#10003;</span>', // UTF-8 check mark
					'</tpl>',
					'<tpl if="correct != 1">',
					'{text}',
					'</tpl>'
			),
			listeners: {
		        initialize: function (list, eOpts){
		            var me = this;
		            if (typeof me.getItemMap == 'function'){
		                me.getScrollable().getScroller().on('refresh',function(scroller,eOpts){
		                	var itemsHeight = me.getItemHeight() * me.itemsCount;
		                	if(me.getGrouped()) {
		                		var groupHeight = typeof me.headerHeight !== 'undefined' ? me.headerHeight : 26;
		                		itemsHeight += me.groups.length * groupHeight;
		                	}
		                	me.setHeight(itemsHeight + 20);
		                });
		            }
		        }
			},
			mode: this.questionObj.questionType === "mc" ? 'MULTI' : 'SINGLE'
		});
		
		this.add([this.questionTitle, this.answerList].concat(
			this.questionObj.questionType === "mc" ? {
				xtype: 'button',
				ui: 'confirm',
				cls: 'login-button noMargin',
				text: Messages.SAVE,
				handler: !this.viewOnly ? this.saveMcQuestionHandler : function() {},
				scope: this,
				style: { margin: "10px" }
			} : {}));
		
		this.on('activate', function(){
			this.answerList.addListener('itemtap', questionListener.itemtap);
			/*
			 * Bugfix, because panel is normally disabled (isDisabled == true),
			 * but is not rendered as 'disabled'
			 */
			if(this.isDisabled()) this.disableQuestion();
		});
	},
	
	disableQuestion: function() {		
		this.setDisabled(true);
		this.mask(new ARSnova.view.CustomMask);
	},
	
	decrementQuestionBadges: function() {
		// Update badge inside the tab panel at the bottom of the screen
		var tab = ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.tab;
		tab.setBadgeText(tab.badgeText - 1);
		// Update badge on the user's home view
		var button = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.questionButton;
		button.setBadgeText(button.badgeText - 1);
	},
	
	doTypeset: function(parent) {
		if (typeof this.questionTitle.element !== "undefined") {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.questionTitle.id]);
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.answerList.id]);
			MathJax.Hub.Queue(Ext.bind(function() {
			}, this));
		} else {
			// If the element has not been drawn yet, we need to retry later
			Ext.defer(Ext.bind(this.doTypeset, this), 100);
		}
	}
});
