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
					var p = new ARSnova.views.FreetextAnswerPanel(this.questionObj, this);
					ARSnova.mainTabPanel.setActiveItem(p, 'slide');
				};
			}
		},
	},
	
	initialize: function(questionObj, viewOnly) {
		this.callParent();
		
		this.questionObj = questionObj;
		this.viewOnly = typeof viewOnly === "undefined" ? false : viewOnly;
		
		this.answerSubject = new Ext.form.Text({
			name: "answerSubject",
			placeHolder: Messages.QUESTION_SUBJECT_PLACEHOLDER,
			label: Messages.QUESTION_SUBJECT,
			maxLength: 140
		});
		
		this.answerText = new Ext.form.TextArea({
			placeHolder	: Messages.QUESTION_TEXT_PLACEHOLDER,
			label: Messages.FREETEXT_ANSWER_TEXT,
			name: 'text',
			maxLength: 2500,
			maxRows: 7
		});

		this.questionTitle = new Ext.Component({
			cls: 'roundedBox',
			html: '<p class="title">' + questionObj.subject + '<p/>' + '<p>' + questionObj.text + '</p>'
		});
		
		this.items = [new Ext.Panel({
			items: [this.questionTitle, this.viewOnly ? {} : {
					xtype: 'form',
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
		})];
	},
	
	initComponent: function(){
		this.on('activate', function(){
			/*
			 * Bugfix, because panel is normally disabled (isDisabled == true),
			 * but is not rendered as 'disabled'
			 */
			if(this.isDisabled()) this.disable();
		});
		
		ARSnova.views.FreetextQuestion.superclass.initComponent.call(this);
	},
	
	saveHandler: function(button, event) {
		if (this.isEmptyAnswer()) {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.MISSING_INPUT);
			Ext.Msg.doComponentLayout();
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
		
		ARSnova.answerModel.getUserAnswer(this.questionObj._id, {
			empty: function() {
				var answer = Ext.ModelMgr.create({
					type	 		: "skill_question_answer",
					sessionId		: localStorage.getItem("sessionId"),
					questionId		: self.questionObj._id,
					answerSubject	: self.answerSubject.getValue(),
					answerText		: self.answerText.getValue(),
					timestamp		: Date.now(),
					user			: localStorage.getItem("login")
				}, 'Answer');
				
				saveAnswer(answer);
			},
			success: function(response) {
				var theAnswer = Ext.decode(response.responseText);
				
				var answer = Ext.ModelMgr.create(theAnswer, "Answer");
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
		var tab = ARSnova.mainTabPanel.tabPanel.userQuestionsPanel.tab;
		tab.setBadge(tab.badgeText - 1);
		// Update badge on the user's home view
		var button = ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.questionButton;
		button.setBadge(button.badgeText - 1);
	},
	
	setAnswerText: function(subject, answer) {
		this.answerSubject.setValue(subject);
		this.answerText.setValue(answer);
	},
	
	doTypeset: function(parent) {
		if (typeof this.questionTitle.getEl() !== "undefined") {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.questionTitle.id]);
			MathJax.Hub.Queue(Ext.createDelegate(function() {
				this.questionTitle.doComponentLayout();
			}, this));
		} else {
			// If the element has not been drawn yet, we need to retry later
			Ext.defer(Ext.createDelegate(this.doTypeset, this), 100);
		}
	}
});