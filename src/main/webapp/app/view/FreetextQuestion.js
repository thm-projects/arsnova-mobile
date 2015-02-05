/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('ARSnova.view.FreetextQuestion', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.model.Answer',
		'ARSnova.view.CustomMask'
	],

	config: {
		viewOnly: false,
		padding: '0 0 50 0',

		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	initialize: function () {
		this.callParent(arguments);

		var self = this;
		this.questionObj = this.config.questionObj;
		this.viewOnly = typeof this.config.viewOnly === "undefined" ? false : this.config.viewOnly;

		this.customMask = Ext.create('ARSnova.view.CustomMask', {
			mainPanel: this
		});

		if(ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			this.editButtons = Ext.create('ARSnova.view.speaker.ShowcaseEditButtons', {
				questionObj: this.questionObj
			});
		}

		this.on('preparestatisticsbutton', function (button) {
			var scope = self;
			button.scope = this;
			button.setHandler(function () {
				scope.statisticButtonHandler(scope);
			});
		});

		this.answerSubject = Ext.create('Ext.form.Text', {
			name: "answerSubject",
			placeHolder: Messages.QUESTION_SUBJECT_PLACEHOLDER,
			label: Messages.QUESTION_SUBJECT,
			maxLength: 140
		});

		this.answerText = Ext.create('Ext.form.TextArea', {
			placeHolder: Messages.FORMAT_PLACEHOLDER,
			label: Messages.FREETEXT_ANSWER_TEXT,
			name: 'text',
			maxLength: 2500,
			maxRows: 7
		});

		// Setup question title and text to disply in the same field; markdown handles HTML encoding
		var questionString = this.questionObj.subject.replace(/\./, "\\.")
			+ '\n\n' // inserts one blank line between subject and text
			+ this.questionObj.text;

		// Create standard panel with framework support
		var questionPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			cls: "roundedBox allCapsHeader"
		});
		questionPanel.setContent(questionString, true, true);

		this.buttonContainer = Ext.create('Ext.Container', {
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
			defaults: {
				style: {
					margin: '10px'
				}
			},
			hidden: this.viewOnly || !!this.questionObj.userAnswered || !!this.questionObj.isAbstentionAnswer,
			items: [{
				flex: 1,
				xtype: 'button',
				ui: 'confirm',
				cls: 'login-button noMargin',
				text: Messages.SAVE,
				handler: this.saveHandler,
				scope: this
			}, !!!this.questionObj.abstention ? {hidden: true}: {
				flex: 1,
				xtype: 'button',
				ui: 'action',
				cls: 'login-button noMargin',
				text: Messages.ABSTENTION,
				handler: this.abstentionHandler,
				scope: this
			}]
		});

		this.add([
			Ext.create('Ext.Panel', {
				items: [{
					xtype: 'formpanel',
					scrollable: null,
					submitOnAction: false,
					items: [questionPanel, this.viewOnly ? {} : {
						xtype: 'fieldset',
						items: [this.answerSubject, this.answerText]
					},
					this.buttonContainer]
				}]
			}), this.editButtons ? this.editButtons : {}
		]);

		this.on('activate', function () {
			if (this.isDisabled()) this.disableQuestion();

			if(this.viewOnly) {
				this.setAnswerCount();
			}
		});
	},

	getQuestionTypeMessage: function(msgAppendix) {
		msgAppendix = msgAppendix ? msgAppendix : "";
		var message;

		switch (this.questionObj.questionType) {
			case "freetext":
				message = this.questionObj.questionType.toUpperCase();
				break;
			default:
				message = Messages.QUESTION;
				msgAppendix = "";
		}

		return Messages[message + msgAppendix];
	},

	setAnswerCount: function() {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;

		ARSnova.app.answerModel.getAnswerAndAbstentionCount(this.questionObj._id, {
			success: function (response) {
				var numAnswers = JSON.parse(response.responseText),
					answerCount = parseInt(numAnswers[0]),
					abstentionCount = parseInt(numAnswers[1]);

				if(answerCount === abstentionCount && answerCount !== 0) {
					sTP.showcaseQuestionPanel.toolbar.setAnswerCounter(abstentionCount, Messages.ABSTENTION);
				} else {
					sTP.showcaseQuestionPanel.toolbar.setAnswerCounter(answerCount);
				}
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	},

	saveHandler: function (button, event) {
		if (this.isEmptyAnswer()) {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.MISSING_INPUT);
			return;
		}

		Ext.Msg.confirm('', Messages.SUBMIT_ANSWER, function (button) {
			if (button === "yes") {
				this.storeAnswer();
				this.buttonContainer.setHidden(true);
			}
		}, this);
	},

	statisticButtonHandler: function (scope) {
		var p = Ext.create('ARSnova.view.FreetextAnswerPanel', {
			question: scope.questionObj,
			lastPanel: scope
		});
		ARSnova.app.mainTabPanel.animateActiveItem(p, 'slide');
	},

	abstentionHandler: function (button, event) {
		Ext.Msg.confirm('', Messages.SUBMIT_ANSWER, function (button) {
			if (button === "yes") {
				this.storeAbstention();
				this.buttonContainer.setHidden(true);
			}
		}, this);
	},

	selectAbstentionAnswer: function () {},

	isEmptyAnswer: function () {
		return this.answerSubject.getValue().trim() === "" || this.answerText.getValue().trim() === "";
	},

	saveAnswer: function (answer) {
		var self = this;

		answer.saveAnswer({
			success: function () {
				var questionsArr = Ext.decode(localStorage.getItem(self.questionObj.questionVariant + 'QuestionIds'));
				if (questionsArr.indexOf(self.questionObj._id) === -1) {
					questionsArr.push(self.questionObj._id);
				}
				localStorage.setItem(self.questionObj.questionVariant + 'QuestionIds', Ext.encode(questionsArr));

				self.disableQuestion();
				if(typeof self.questionObj !== 'undefined' && !!self.questionObj.showStatistic && self.questionObj.questionType !== 'flashcard') {
					self.statisticButtonHandler(self);
				}
				ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.showNextUnanswered();
				ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.checkIfLastAnswer();
			},
			failure: function (response, opts) {
				console.log('server-side error');
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.ANSWER_CREATION_ERROR);
				Ext.Msg.doComponentLayout();
			}
		});
	},

	storeAnswer: function () {
		var self = this;

		ARSnova.app.answerModel.getUserAnswer(this.questionObj._id, {
			empty: function () {
				var answer = Ext.create('ARSnova.model.Answer', {
					type: "skill_question_answer",
					sessionId: localStorage.getItem("sessionId"),
					questionId: self.questionObj._id,
					answerSubject: self.answerSubject.getValue(),
					answerText: self.answerText.getValue(),
					timestamp: Date.now(),
					user: localStorage.getItem("login"),
					questionVariant: self.questionObj.questionVariant
				});

				self.saveAnswer(answer);
			},
			success: function (response) {
				var theAnswer = Ext.decode(response.responseText);

				var answer = Ext.create('ARSnova.model.Answer', theAnswer);
				answer.set('answerSubject', self.answerSubject.getValue());
				answer.set('answerText', self.answerText.getValue());
				answer.set('timestamp', Date.now());
				answer.set('abstention', false);

				self.saveAnswer(answer);
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	},

	storeAbstention: function () {
		var self = this;

		ARSnova.app.answerModel.getUserAnswer(this.questionObj._id, {
			empty: function () {
				var answer = Ext.create('ARSnova.model.Answer', {
					type: "skill_question_answer",
					sessionId: localStorage.getItem("sessionId"),
					questionId: self.questionObj._id,
					timestamp: Date.now(),
					user: localStorage.getItem("login"),
					abstention: true,
					questionVariant: self.questionObj.questionVariant
				});

				self.saveAnswer(answer);
			},
			success: function (response) {
				var theAnswer = Ext.decode(response.responseText);

				var answer = Ext.create('ARSnova.model.Answer', theAnswer);
				answer.set('timestamp', Date.now());
				answer.set('abstention', true);

				self.saveAnswer(answer);
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	},

	disableQuestion: function () {
		this.setDisabled(true);
		this.mask(this.customMask);
	},

	setAnswerText: function (subject, answer) {
		this.answerSubject.setValue(subject);
		this.answerText.setValue(answer);
	}

	/*doTypeset: function (parent) {
		if (typeof this.questionTitle.element !== "undefined") {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.questionTitle.element.dom]);
		} else {
			// If the element has not been drawn yet, we need to retry later
			Ext.defer(Ext.bind(this.doTypeset, this), 100);
		}
	}*/
});
