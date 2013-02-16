/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/questionl.js
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
ARSnova.views.Question = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	questionObj: null,
	
	viewOnly: false,
	
	constructor: function(questionObj, viewOnly) {
		var self = this; // for use inside callbacks
		
		var answerStore = new Ext.data.Store({model: 'Answer'});
		this.questionObj = questionObj;
		this.viewOnly = typeof viewOnly === "undefined" ? false : viewOnly;
		
		answerStore.add(questionObj.possibleAnswers);
		
		var questionListener = viewOnly ? {} : {
			'itemtap': function(list, index, element, e) {
				var answerObj 	= questionObj.possibleAnswers[index];
				
				/* for use in Ext.Msg.confirm */
				answerObj.selModel = list.selModel;
				answerObj.target = e.target;
				var theAnswer = answerObj.data.id || answerObj.data.text;
				
				Ext.Msg.confirm(
					Messages.ANSWER + ' "' + theAnswer + '"', 
					Messages.ARE_YOU_SURE, 
					function(button) {
						if(button == 'yes') {
							self.decrementQuestionBadges();
							
							if (answerObj.target.className == "x-list-item-body") {
								answerObj.target = answerObj.target.parentElement;
							}
							
							if (questionObj.showAnswer) {
								if (answerObj.data.correct === 1 || answerObj.data.correct === true) {
									answerObj.target.className = "x-list-item x-list-item-correct";
								} else {
									for (var i = 0; i < questionObj.possibleAnswers.length; i++) {
										var answer = questionObj.possibleAnswers[i].data;
										if (answer.correct === 1 || answer.correct === true) {
											list.el.dom.childNodes[i].className = "x-list-item x-list-item-correct";
										}
									}
								}
							}
							
							var saveAnswer = function(answer) {
								answer.saveAnswer({
									success: function() {
										var questionsArr = Ext.decode(localStorage.getItem('questionIds'));
										if (questionsArr.indexOf(questionObj._id) == -1) {
											questionsArr.push(questionObj._id);
										}
										localStorage.setItem('questionIds', Ext.encode(questionsArr));
										
										list.up("panel").disable();
										new Ext.Panel({
											cls: 'notificationBox',
											name: 'notificationBox',
											showAnimation: 'pop',
											floating: true,
											modal: true,
											centered: true,
											width: 300,
											styleHtmlContent: true,
											html: Messages.ANSWER_SAVED,
											listeners: {
												hide: function(){
													this.destroy();
												},
												show: function(){
													delayedFn = function(){
														var cmp = Ext.ComponentQuery.query('panel[name=notificationBox]');
														if(cmp.length > 0)
															cmp[0].hide();
														ARSnova.mainTabPanel.tabPanel.userQuestionsPanel.showNextUnanswered();
													};
													setTimeout("delayedFn()", 2000);
												}
											}
										}).show();
									},
									failure: function(response, opts) {
										console.log('server-side error');
										Ext.Msg.alert(Messages.NOTIFICATION, Messages.ANSWER_CREATION_ERROR);
										Ext.Msg.doComponentLayout();
									}
								});
							};
							
							ARSnova.answerModel.getUserAnswer(questionObj._id, {
								empty: function() {
									var answer = Ext.ModelMgr.create({
										type	 	: "skill_question_answer",
										sessionId	: localStorage.getItem("sessionId"),
										questionId	: questionObj._id,
										answerText	: answerObj.data.text,
										user		: localStorage.getItem("login")
									}, 'Answer');
									
									saveAnswer(answer);
								},
								success: function(response){
									var theAnswer = Ext.decode(response.responseText);
									
									//update
									var answer = Ext.ModelMgr.create(theAnswer, "Answer");
									answer.set('answerText', answerObj.data.text);
									
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
				Ext.Msg.doComponentLayout();
			}
		};
		
		this.questionTitle = new Ext.Component({
			cls: 'roundedBox',
			html: 
				'<p class="title">' + questionObj.subject + '<p/>' +
				'<p>' + questionObj.text + '</p>'
		});
		this.answerList = new Ext.List({
			store	: answerStore,
			
			cls: 'roundedBox',
			scroll: false,
			
			itemTpl	: '{text}',
			listeners: questionListener
		});
		
		this.items = [this.questionTitle, this.answerList];
		
		ARSnova.views.Question.superclass.constructor.call(this);
	},
	
	listeners: {
		preparestatisticsbutton: function(button) {
			button.scope = this;
			button.handler = function() {
				var questionStatisticChart = new ARSnova.views.QuestionStatisticChart(this.questionObj, this);
				ARSnova.mainTabPanel.setActiveItem(questionStatisticChart, 'slide');
			};
		}
	},
	
	initComponent: function(){
		this.on('activate', function(){
			/*
			 * Bugfix, because panel is normally disabled (isDisabled == true),
			 * but is not rendered as 'disabled'
			 */
			if(this.isDisabled()) this.disable();
		});
		
		ARSnova.views.Question.superclass.initComponent.call(this);
	},
	
	decrementQuestionBadges: function() {
		// Update badge inside the tab panel at the bottom of the screen
		var tab = ARSnova.mainTabPanel.tabPanel.userQuestionsPanel.tab;
		tab.setBadge(tab.badgeText - 1);
		// Update badge on the user's home view
		var button = ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.questionButton;
		button.setBadge(button.badgeText - 1);
	},
	
	doTypeset: function(parent) {
		if (typeof this.questionTitle.getEl() !== "undefined") {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.questionTitle.id]);
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.answerList.id]);
			MathJax.Hub.Queue(Ext.createDelegate(function() {
				this.questionTitle.doComponentLayout();
			}, this));
		} else {
			// If the element has not been drawn yet, we need to retry later
			Ext.defer(Ext.createDelegate(this.doTypeset, this), 100);
		}
	}
});
