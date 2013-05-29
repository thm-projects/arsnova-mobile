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
		scrollable: true,
	},
	
	questionObj: null,
	viewOnly: false,
	
	constructor: function(arguments) {
		this.callParent(arguments);
		
		var self = this; // for use inside callbacks
		
		var answerStore = Ext.create('Ext.data.Store', {model: 'ARSnova.model.Answer'});
		this.questionObj = arguments.questionObj;
		this.viewOnly = typeof arguments.viewOnly === "undefined" ? false : arguments.viewOnly;
		
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
		
		answerStore.add(this.questionObj.possibleAnswers);

		var questionListener = this.viewOnly ? {} : {
			itemtap: function(list, index, element, record, e) {
				var me = self;
				var answerObj = me.questionObj.possibleAnswers[index];
				
				/* for use in Ext.Msg.confirm */
				answerObj.selModel = list;
				answerObj.target = e.target;

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
							
							if (me.questionObj.showAnswer) {
								if (answerObj.correct === 1 || answerObj.correct === true) {
									answerObj.target.className = "x-list-item x-list-item-correct";
								} else {
									for (var i = 0; i < me.questionObj.possibleAnswers.length; i++) {
										var answer = me.questionObj.possibleAnswers[i];
										if (answer.correct === 1 || answer.correct === true) {
											list.element.dom.childNodes[i].className = "x-list-item x-list-item-correct";
										}
									}
								}
							}

							var saveAnswer = function(answer) {
								answer.saveAnswer({
									success: function() {
										var questionsArr = Ext.decode(localStorage.getItem('questionIds'));
										if (questionsArr.indexOf(me.questionObj._id) == -1) {
											questionsArr.push(me.questionObj._id);
										}
										localStorage.setItem('questionIds', Ext.encode(questionsArr));
										
										list.up("panel").disableQuestion();
										
										var pnl = Ext.create('Ext.Panel', {
											cls: 'notificationBox',
											name: 'notificationBox',
											showAnimation: 'pop',
											modal: true,
											centered: true,
											width: 300,
											styleHtmlContent: true,
											styleHtmlCls: 'notificationBoxText',
											html: Messages.ANSWER_SAVED,
											listeners: {
												hide: function(){
													this.destroy();
												},
												show: function(){
													Ext.defer(function(){
														pnl.hide();
														var tP = ARSnova.app.mainTabPanel.tabPanel;
														tP.userQuestionsPanel.showNextUnanswered();
													}, 2000);
												}
											}
										});
										Ext.Viewport.add(pnl);
										pnl.show();
									},
									failure: function(response, opts) {
										console.log('server-side error');
										Ext.Msg.alert(Messages.NOTIFICATION, Messages.ANSWER_CREATION_ERROR);
									}
								});
							};
							
							ARSnova.app.answerModel.getUserAnswer(me.questionObj._id, {
								empty: function() {		
									var answer = Ext.create('ARSnova.model.Answer', {
										type	 	: "skill_question_answer",
										sessionId	: localStorage.getItem("sessionId"),
										questionId	: me.questionObj._id,
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
			
			itemTpl	: '{text}',
		    listeners: {
		    	initialize: function (list, eOpts){
		            var me = this;
		            if (typeof me.getItemMap == 'function'){
		                me.getScrollable().getScroller().on('refresh',function(scroller,eOpts){
		                    me.setHeight(me.getItemMap().getTotalHeight()+20);
		                });
		            }
		    	}
		    }
		});
		
		this.add([this.questionTitle, this.answerList]);
		
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
