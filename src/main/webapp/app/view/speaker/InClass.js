/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/speaker/inClass.js
 - Beschreibung: Startseite für Session-Inhaber.
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
Ext.define('ARSnova.view.speaker.InClass', {
	extend: 'Ext.Panel',
	
	config: {
		fullscreen: true,
		title	: Messages.FEEDBACK,
		iconCls	: 'feedbackMedium',
		scroll  : 'vertical',
	},
	
	inClassItems			: null,
	audienceQuestionButton	: null,
	questionsFromUserButton	: null,
	flashcardButton			: null,
	quizButton			 	: null,
		
	inClassActions: null,
	sessionStatusButton			: null,
	createAdHocQuestionButton	: null,
	
	/**
	 * count every x seconds all actually logged-in users for this sessions
	 */
	countActiveUsersTask: {
		name: 'count the actually logged in users',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countActiveUsers();
		},
		interval: 15000
	},
	
	/**
	 * task for speakers in a session
	 * count every x seconds the number of feedback questions
	 */
	countFeedbackQuestionsTask: {
		name: 'count feedback questions',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestions();
		},
		interval: 15000
	},
	
	initialize: function(){
		this.callParent(arguments);
		
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
			title: localStorage.getItem("shortName"),
			docked: 'top',
			items: [
		        this.sessionLogoutButton
			]
		});
		
		this.audienceQuestionButton = Ext.create('Ext.Button', {
			ui				: 'normal',
			text			: Messages.QUESTIONS_TO_STUDENTS,
			cls				: 'forwardListButton',
			badgeCls		: 'badgeicon',
			doubleBadgeCls	: 'doublebadgeicon',
			controller		: 'Questions',
			action			: 'listAudienceQuestions',
			handler			: this.buttonClicked
		});
		
		this.feedbackQuestionButton = Ext.create('Ext.Button', {
			ui			: 'normal',
			text		: Messages.QUESTIONS_FROM_STUDENTS,
			cls			: 'forwardListButton',
			badgeCls	: 'bluebadgeicon',
			controller	: 'Questions',
			action		: 'listFeedbackQuestions',
			handler		: this.buttonClicked
		});
		
		this.flashcardButton = Ext.create('Ext.Button', {
			ui			: 'normal',
			text		: Messages.FLASHCARDS,
			listeners: {
				click: {
					element: 'element',
					fn: function (e) {
						window.open("http://www.cobocards.com/");
					}
				}
			}
		});
		
		this.inClassItems = Ext.create('Ext.form.FormPanel', {
			style: { marginLeft: '15px', marginRight: '15px'},
			scrollable: null,
			
			items: [{
				cls: 'gravure',
				html: localStorage.getItem("name")
			}, {
				xtype: 'formpanel',
				cls	 : 'standardForm topPadding',
				scrollable: null,
				
				items: [
					this.audienceQuestionButton,
					this.feedbackQuestionButton,
					this.flashcardButton
				]
			}, {
				xtype: 'fieldset',
				cls	 : 'standardFieldset noMargin',
				instructions: "Session-ID: " + ARSnova.app.formatSessionID(localStorage.getItem("keyword")),
			}]
		});
		
		this.createAdHocQuestionButton = Ext.create('Ext.Panel', {
			cls: 'threeButtons left',
			
			items: [{
				xtype		: 'button',
				text		: ' ',
				cls			: 'questionMark',
				controller	: 'Questions',
				action		: 'adHoc',
				handler		: this.buttonClicked
			}, {
				html: Messages.AH_HOC_QUESTION,
				cls	: 'centerTextSmall'
			}]
		});
		
		this.sessionStatusButton = Ext.create('ARSnova.view.SessionStatusButton');
		
		this.deleteSessionButton = Ext.create('Ext.Panel', {
			cls: 'threeButtons left',
			
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'deleteIcon',
				scope	: this,
				handler	: function(){
					var msg = Messages.ARE_YOU_SURE +
							"<br>" + Messages.DELETE_SESSION_NOTICE;
					Ext.Msg.confirm(Messages.DELETE_SESSION, msg, function(answer){
						if (answer == 'yes') {
							ARSnova.app.showLoadMask(Messages.LOAD_MASK_SESSION_DELETE);
							ARSnova.app.sessionModel.destroy(localStorage.getItem('sessionId'), localStorage.getItem('login'), {
								success: function(){
									ARSnova.app.removeVisitedSession(localStorage.getItem('sessionId'));
									ARSnova.app.mainTabPanel.tabPanel.on('cardswitch', function(){
										ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.mySessionsPanel.loadCreatedSessions();
										setTimeout("ARSnova.app.hideLoadMask()", 1000);
									}, this, {single:true});
									ARSnova.app.getController('Sessions').logout();
								},
								failure: function(response){
									console.log('server-side error delete session');
								}
							});
						}
					});
				}
			}, {
				html: Messages.DELETE_SESSION,
				cls	: 'centerTextSmall'
			}]
		});
		
		this.inClassActions = Ext.create('Ext.form.FormPanel', {
			cls	 : 'actionsForm',
			scrollable: null,
				
			items: [
			    this.createAdHocQuestionButton,
			    this.sessionStatusButton,
			    this.deleteSessionButton
	        ]
				        
		});
		
		this.add([this.toolbar, this.inClassItems, this.inClassActions]);
		
		this.on('destroy', this.destroyListeners);
		
		this.on('painted', function(){
			this.updateBadges();
		});
	},
	
	buttonClicked: function(button){
		ARSnova.app.getController(button.controller)[button.action]();
	},
	
	/* will be called on session login */
	registerListeners: function(){
		var inClassPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		taskManager.start(inClassPanel.countActiveUsersTask);
		taskManager.start(inClassPanel.countFeedbackQuestionsTask);
	},

	/* will be called on session logout */
	destroyListeners: function(){
		var inClassPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		taskManager.stop(inClassPanel.countActiveUsersTask);
		taskManager.stop(inClassPanel.countFeedbackQuestionsTask);
	},
	
	updateBadges: function(){
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		panel.updateAudienceQuestionBadge();
	},
	
	updateAudienceQuestionBadge: function() {
		var failureCallback = function() {
			console.log('server-side error');
		};
		
		ARSnova.app.questionModel.countSkillQuestions(localStorage.getItem("keyword"), {
			success: function(response) {
				var numQuestions = parseInt(response.responseText);
				ARSnova.app.questionModel.countTotalAnswers(localStorage.getItem("keyword"), {
					success: function(response) {
						var numAnswers = parseInt(response.responseText);
						
						var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
						var audienceQuestionButton = panel.audienceQuestionButton;
						
						audienceQuestionButton.setBadgeText(numQuestions);
						var setAdditionalBadge = function() {
							if (!audienceQuestionButton.doubleBadge && numAnswers) {
								audienceQuestionButton.doubleBadge = audienceQuestionButton.element.createChild({
									tag: 'span',
									cls: audienceQuestionButton.doubleBadgeCls,
									html: numAnswers
								});
								audienceQuestionButton.badgeEl.addCls("withdoublebadge");
							} else if (audienceQuestionButton.doubleBadge) {
								if (numAnswers) {
									audienceQuestionButton.doubleBadge.setHTML(numAnswers);
								} else {
									audienceQuestionButton.doubleBadge.remove();
									audienceQuestionButton.doubleBadge = null;
									audienceQuestionButton.badgeEl.removeCls("withdoublebadge");
								}
							}
						};
						if (!audienceQuestionButton.rendered) {
							audienceQuestionButton.on('afterrender', setAdditionalBadge);
						} else {
							setAdditionalBadge();
						}
					},
					failure: failureCallback
				});
			}, 
			failure: failureCallback
		});
	},
	
	countActiveUsers: function(){
		ARSnova.app.loggedInModel.countActiveUsersBySession(localStorage.getItem("keyword"), {
			success: function(response){
				var value = parseInt(response.responseText);
				if (value > 0) {
					// Do not count myself ;-)
					value--;
				}
				
				//update feedback counter
				var counterEl = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.feedbackCounter;
				var title = counterEl.getText().split("/");
				title[1] = value;
				title = title.join("/");
				counterEl.setHtml(title);
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	},
	
	countFeedbackQuestions: function(){
		ARSnova.app.questionModel.countFeedbackQuestions(localStorage.getItem("keyword"), {
			success: function(response){
				var questionCount = Ext.decode(response.responseText);
				
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab.setBadgeText(questionCount.unread);
				ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton.setBadgeText(questionCount.total);
			}, 
			failure: function(){
				console.log('server-side error');
			}
		});
	}
});