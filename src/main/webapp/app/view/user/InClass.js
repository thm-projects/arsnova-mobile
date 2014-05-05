/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/user/inClass.js
 - Beschreibung: Startseite für Session-Teilnehmer.
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
Ext.define('ARSnova.view.user.InClass', {
	extend: 'Ext.Panel',
	
	requires: ['ARSnova.view.MultiBadgeButton'],
	
	config: {
		title: 'InClass',
		fullscreen: true,
		scrollable: true
	},
	
	inClass			: null,
	feedbackButton	: null,
	questionsButton	: null,
	quizButton		: null,
	
	/**
	 * If user logged in a session, check for new skill questions
	 */
	checkNewSkillQuestionsTask: {
		name: 'check for new skill questions',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.checkNewSkillQuestions();
		},
		interval: 30000
	},
	
	/**
	 * if users feedback vote was removed, notify the user
	 */
	checkFeedbackRemovedTask: {
		name: 'check if my feedback was deleted',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.checkFeedbackRemoved();
		},
		interval: 30000
	},
	
	/**
	 * count all actually logged-in users for this session
	 */
	countActiveUsersTask: {
		name: 'count the actually logged in users',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.countActiveUsers();
		},
		interval: 15000
	},
	
	/**
	 * check if speaker has closed the session
	 */
	checkSessionStatusTask: {
		name: 'check if this session was closed',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.checkSessionStatus();
		},
		interval: 20000
	},
	
	initialize: function() {
		this.callParent(arguments);
		
		var comingSoon = function(component) {
			var comingSoonPanel = Ext.create('Ext.Panel', {
				html: "<div style='padding: 0.5em'>"+Messages.FEATURE_COMING_SOON+"</div>"
			});
			comingSoonPanel.showBy(component, 'tc-bc');
			Ext.defer(function() {
				comingSoonPanel.destroy();
			}, 2000);
		};
		
		var loggedInCls = '';
		if (ARSnova.app.loginMode == ARSnova.app.LOGIN_THM) {
			loggedInCls = 'thm';
		}
		
		this.sessionLogoutButton = Ext.create('Ext.Button', {
			text	: Messages.SESSIONS,
			ui		: 'back',
			cls		: loggedInCls,
			handler	: function() {
				ARSnova.app.getController('Sessions').logout();
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Ext.util.Format.htmlEncode(localStorage.getItem("shortName")),
			docked: 'top',
			ui: 'light',
			items: [
		        this.sessionLogoutButton
			]
		});
		
		this.feedbackButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui			: 'normal',
			text		: Messages.GIVE_FEEDBACK,
			cls			: 'forwardListButton',
			badgeCls	: 'badgeicon feedbackARSnova',
			controller	: 'Feedback',
			action		: 'showVotePanel',
			handler		: this.buttonClicked
		});
		
		this.lectureQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui			: 'normal',
			text		: Messages.LECTURE_QUESTIONS,
			cls			: 'forwardListButton',
			badgeCls	: 'badgeicon',
			controller	: 'Questions',
			action		: 'lectureIndex',
			handler		: this.buttonClicked
		});
		
		this.preparationQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui			: 'normal',
			text		: Messages.PREPARATION_QUESTIONS,
			cls			: 'forwardListButton',
			badgeCls	: 'badgeicon',
			controller	: 'Questions',
			action		: 'preparationIndex',
			handler		: this.buttonClicked
		});
		
		this.myQuestionsButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui			: 'normal',
			text		: Messages.MY_QUESTIONS,
			cls			: 'forwardListButton',
			badgeCls	: 'badgeicon',
			controller	: 'Questions',
			action		: 'index',
			handler		: comingSoon
		});
		
		this.myLearningProgressButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui			: 'normal',
			text		: Messages.MY_LEARNING_PROGRESS,
			cls			: 'forwardListButton',
			badgeCls	: 'badgeicon',
			controller	: 'Questions',
			action		: 'index',
			handler		: comingSoon
		});
		
		this.inClass = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			items: [{
				cls: 'gravure',
				html: Messages.SESSION_ID + ": " + ARSnova.app.formatSessionID(localStorage.getItem("keyword"))
			}, {
				xtype: 'formpanel',
				cls	 : 'standardForm topPadding',
				scrollable: null,
				
				items: [
						this.feedbackButton,
						this.lectureQuestionButton,
						this.preparationQuestionButton
					]
			}]
		});
		
		this.add([this.toolbar, this.inClass]);
		
		this.on('initialize', function() {
			this.feedbackButton.setBadge([{ badgeText: '0' }]);
		});
	},
	
	/* will be called on session login */
	registerListeners: function(){
		var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		taskManager.start(panel.checkNewSkillQuestionsTask);
		taskManager.start(panel.checkFeedbackRemovedTask);
		taskManager.start(panel.countActiveUsersTask);
		taskManager.start(panel.checkSessionStatusTask);
	},
	
	/* will be called on session logout */
	destroyListeners: function(){
		var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		taskManager.stop(panel.checkNewSkillQuestionsTask);
		taskManager.stop(panel.checkFeedbackRemovedTask);
		taskManager.stop(panel.countActiveUsersTask);
		taskManager.stop(panel.checkSessionStatusTask);
	},
	
	/**
	 * fetch all new unanswered skill questions for this session and show a notification
	 * if user don't want to answer this questions now, save this opinion in localStorage
	 */
	checkNewSkillQuestions: function(){
		ARSnova.app.questionModel.getUnansweredPreparationQuestions(localStorage.getItem("keyword"), {
			success: function(newQuestions){
				ARSnova.app.questionModel.countPreparationQuestionAnswers(localStorage.getItem("keyword"), {
					success: function(response) {
						var numAnswers = parseInt(response.responseText);
						
						var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
						
						panel.preparationQuestionButton.setBadge([
											{badgeText: newQuestions.length, badgeCls: "greybadgeicon"},
											{badgeText: numAnswers, badgeCls: "redbadgeicon"}
										]);
					},
					failure: Ext.emptyFn
				});
			},
			failure: Ext.emptyFn
		});
		ARSnova.app.questionModel.getUnansweredLectureQuestions(localStorage.getItem("keyword"), {
			success: function(newQuestions){
				ARSnova.app.questionModel.countLectureQuestionAnswers(localStorage.getItem("keyword"), {
					success: function(response) {
						var numAnswers = parseInt(response.responseText);
						
						var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
						
						panel.lectureQuestionButton.setBadge([
											{badgeText: newQuestions.length, badgeCls: "greybadgeicon"},
											{badgeText: numAnswers, badgeCls: "redbadgeicon"}
										]);
					},
					failure: Ext.emptyFn
				});
				ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.tab.setBadgeText(newQuestions.length);
				
				if (newQuestions.length > 0) {
					var showNotification = false;
    				var questionsArr = Ext.decode(localStorage.getItem('questionIds'));
    				
					//check for each question if exists a "dont-remind-me"-flag
					for(var i = 0; i < newQuestions.length; i++){
						var question = newQuestions[i];
						if (questionsArr.indexOf(question) == -1){
							questionsArr.push(question);
							showNotification = true;
						}
					}
					localStorage.setItem('questionIds', Ext.encode(questionsArr));
					if (!showNotification) return;
					
					if(newQuestions.length == 1){
						ARSnova.app.questionModel.getQuestionById(newQuestions[0], {
							success: function(response){
								var question = Ext.decode(response.responseText);
								
								Ext.Msg.confirm(
									Messages.ONE_NEW_QUESTION, 
									'"' + Ext.util.Format.htmlEncode(question.text) + '"<br>' + Messages.WANNA_ANSWER, 
									function(answer){
										if (answer == 'yes'){ //show the question to the user
											ARSnova.app.getController('Questions').index();
										}
									}
								);
							},
							failure: function() {
				    			console.log("my sessions request failure");
				    		}
						});
					} else {
						//show a notification window
						Ext.Msg.confirm(
							Messages.THERE_ARE + ' ' + newQuestions.length + ' ' + Messages.NEW_QUESTIONS , Messages.WANNA_ANSWER, 
							function(answer){
								if (answer == 'yes'){ //show the question to the user
									ARSnova.app.getController('Questions').index();
								}
							}
						);
					}					
				}
			},
			failure: function(response){
				console.log('error');
			}
		});
	},
	
	buttonClicked: function(button){
		ARSnova.app.getController(button.config.controller)[button.config.action]();
	},
	
	checkFeedbackRemoved: function() {
		if (localStorage.getItem('user has voted')){
			ARSnova.app.feedbackModel.getUserFeedback(localStorage.getItem("keyword"), {
				empty: function(response){
					Ext.Msg.alert(Messages.NOTICE, Messages.FEEDBACK_RESET);
					localStorage.removeItem('user has voted');
					
					var feedbackButton = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.feedbackButton;
					feedbackButton.badgeEl ? feedbackButton.badgeEl.destroy() : '';
					feedbackButton.badgeEl = null;
					feedbackButton.badgeCls = "badgeicon feedbackARSnova";
					feedbackButton.setBadge([{ badgeText: "0" }]);
				},
				success: function() {},
				failure: function(){
					console.log('server-side error feedbackModel save');
				}
			});
		}
	},
	
	countActiveUsers: function(){
		ARSnova.app.loggedInModel.countActiveUsersBySession(localStorage.getItem("keyword"), {
			success: function(response){
				var value = parseInt(response.responseText);
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	},
	
	/* if the session was closed, show a notification window and stop this task */
	checkSessionStatus: function(){
		ARSnova.app.sessionModel.isActive(localStorage.getItem("keyword"), {
			success: function(isActive){
				if (!isActive) {
					Ext.Msg.show({
						title: 'Hinweis:',
						message: Messages.SESSION_CLOSE_NOTICE,
						buttons: [{
							text: Messages.NOTICE_READ,
							ui: 'action'
						}]
					});
					
					taskManager.stop(ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.checkSessionStatusTask);
				}
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	}
});
