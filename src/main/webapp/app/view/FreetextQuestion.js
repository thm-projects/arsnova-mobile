/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/FreetextQuestion.js
 - Beschreibung: Template für Freitext-Fragen.
 - Version:      1.0, 22/05/12
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
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
Ext.define('ARSnova.view.FreetextQuestion', {
	extend: 'Ext.Panel',
	
	config: {
		scroll: 'vertical',
		
		viewOnly: false,
		
		listeners: {
			preparestatisticsbutton: function(button) {
				button.scope = this;
				button.handler = function() {
					var p = Ext.create('ARSnova.view.FreetextAnswerPanel', {
						question: this.questionObj,
						lastPanel: this
					});
					ARSnova.app.mainTabPanel.animateActiveItem(p, 'slide');
				};
			}
		},
	},
	
	constructor: function(arguments) {
		this.callParent(arguments);
		
		this.questionObj = arguments.questionObj;
		this.viewOnly = typeof arguments.viewOnly === "undefined" ? false : arguments.viewOnly;
		
		this.answerSubject = Ext.create('Ext.form.Text', {
			name: "answerSubject",
			placeHolder: Messages.QUESTION_SUBJECT_PLACEHOLDER,
			label: Messages.QUESTION_SUBJECT,
			maxLength: 140
		});
		
		this.answerText = Ext.create('Ext.form.TextArea', {
			placeHolder	: Messages.QUESTION_TEXT_PLACEHOLDER,
			label: Messages.FREETEXT_ANSWER_TEXT,
			name: 'text',
			maxLength: 2500,
			maxRows: 7
		});

		this.questionTitle = Ext.create('Ext.Component', {
			cls: 'roundedBox',
			html: '<p class="title">' + this.questionObj.subject + '<p/>' + '<p>' + this.questionObj.text + '</p>'
		});
		
		this.add([Ext.create('Ext.Panel', {
			items: [this.questionTitle, this.viewOnly ? {} : {
					xtype: 'formpanel',
					scrollable: null,
					submitOnAction: false,
					items: [{
						xtype: 'fieldset',
						items: [this.answerSubject, this.answerText]
					}, {
						xtype	: 'button',
						ui: 'confirm',
						cls: 'login-button noMargin',
						text: Messages.SAVE,
						handler: this.saveHandler,
						scope: this
					}]
				}
			]
		})]);
		
		this.on('activate', function(){
			/*
			 * Bugfix, because panel is normally disabled (isDisabled == true),
			 * but is not rendered as 'disabled'
			 */
			if(this.isDisabled()) this.disable();
		});
	},
	
	saveHandler: function(button, event) {
		if (this.isEmptyAnswer()) {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.MISSING_INPUT);
			return;
		}
		
		Ext.Msg.confirm('', Messages.ARE_YOU_SURE, function (button) {
			if (button === "yes") {
				this.storeAnswer();
			}
		}, this);
	},
	
	isEmptyAnswer: function() {
		return this.answerSubject.getValue().trim() === "" || this.answerText.getValue().trim() === "";
	},
		
	storeAnswer: function () {
		var self = this;
		
		var saveAnswer = function(answer) {
			answer.saveAnswer({
				success: function() {
					var questionsArr = Ext.decode(localStorage.getItem('questionIds'));
					if (questionsArr.indexOf(self.questionObj._id) == -1) {
						questionsArr.push(self.questionObj._id);
					}
					localStorage.setItem('questionIds', Ext.encode(questionsArr));

					self.decrementQuestionBadges();
					self.disable();
					Ext.create('Ext.Panel', {
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
									ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.showNextUnanswered();
								};
								setTimeout("delayedFn()", 2000);
							}
						}
					}).show();
				},
				failure: function(response, opts) {
					console.log('server-side error');
					Ext.Msg.alert(Messages.NOTIFICATION, Messages.ANSWER_CREATION_ERROR);
				}
			});
		};
		
		ARSnova.app.answerModel.getUserAnswer(this.questionObj._id, {
			empty: function() {
				var answer = Ext.create('ARSnova.model.Answer', {
					type	 		: "skill_question_answer",
					sessionId		: localStorage.getItem("sessionId"),
					questionId		: self.questionObj._id,
					answerSubject	: self.answerSubject.getValue(),
					answerText		: self.answerText.getValue(),
					timestamp		: Date.now(),
					user			: localStorage.getItem("login")
				});
				
				saveAnswer(answer);
			},
			success: function(response) {
				var theAnswer = Ext.decode(response.responseText);
				
				var answer = Ext.create('ARSnova.model.Answer', theAnswer);
				answer.set('answerSubject', self.answerSubject.getValue());
				answer.set('answerText', self.answerText.getValue());
				answer.set('timestamp', Date.now());
				
				saveAnswer(answer);
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	},
	
	decrementQuestionBadges: function() {
		// Update badge inside the tab panel at the bottom of the screen
		var tab = ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.tab;
		tab.setBadgeText(tab.badgeText - 1);
		// Update badge on the user's home view
		var button = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.questionButton;
		button.setBadgeText(button.badgeText - 1);
	},
	
	setAnswerText: function(subject, answer) {
		this.answerSubject.setValue(subject);
		this.answerText.setValue(answer);
	},
	
	doTypeset: function(parent) {
		if (typeof this.questionTitle.element !== "undefined") {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.questionTitle.id]);
			MathJax.Hub.Queue(Ext.bind(function() {
				this.questionTitle.doComponentLayout();
			}, this));
		} else {
			// If the element has not been drawn yet, we need to retry later
			Ext.defer(Ext.bind(this.doTypeset, this), 100);
		}
	}
});