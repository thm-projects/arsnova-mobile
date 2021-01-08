/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2021 The ARSnova Team and Contributors
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
Ext.define('ARSnova.view.user.QuestionPanel', {
	extend: 'Ext.Carousel',

	requires: [
		'ARSnova.view.Question',
		'ARSnova.view.ImageAnswerPanel',
		'ARSnova.view.FreetextAnswerPanel',
		'ARSnova.view.CustomCarouselIndicator',
		'ARSnova.view.components.QuestionToolbar'
	],

	config: {
		fullscreen: true,
		title: Messages.QUESTIONS,
		iconCls: 'icon-presenter',
		cls: 'userQuestions',

		mode: 'lecture',
		questionLoader: null,
		questionCountLoader: null,
		questionTitle: Messages.LECTURE_QUESTION_LONG,
		questionTitleShort: Messages.LECTURE_QUESTIONS
	},

	/* item index 0 and 1 are occupied by the carousel and toolbar. */
	carouselOffset: 2,

	questions: [],

	initialize: function () {
		this.callParent(arguments);

		this.setLectureMode();

		this.on('activeitemchange', function (panel, newCard, oldCard) {
			this.toolbar.checkStatistics(newCard.questionObj, newCard.isDisabled());

			newCard.fireEvent('preparestatisticsbutton', this.toolbar.statisticsButton);
		});

		this.toolbar = Ext.create('ARSnova.view.components.QuestionToolbar', {
			title: Messages.QUESTION,
			backButtonHandler: function (animation) {
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userTabPanel, animation);
			}
		});

		this.sessionLogoutButton = Ext.create('Ext.Button', {
			ui: 'back',
			text: Messages.SESSIONS,
			cls: ARSnova.app.loginMode === ARSnova.app.LOGIN_THM ? "thm" : "",
			handler: function () {
				ARSnova.app.getController('Sessions').logout();
			}
		});

		this.add([this.toolbar]);
		this.lastActiveIndex = -1;

		this.onBefore('activate', this.beforeActivate, this);
		this.onAfter('activate', this.onActivate, this);
		this.on('activeitemchange', this.onItemChange);
	},

	beforeActivate: function () {
		this.removeAll();
		this.getIndicator().hide();
	},

	onActivate: function () {
		if (this.alreadyRenewed) {
			this.alreadyRenewed = false;
		} else {
			this.activeQuestionIds = [];
			this.getUnansweredSkillQuestions();
		}
	},

	onItemChange: function (panel, newQuestion, oldQuestion) {
		if (oldQuestion && oldQuestion.questionObj && oldQuestion.countdownTimer) {
			oldQuestion.countdownTimer.stop();
		}

		if (newQuestion.questionObj) {
			newQuestion.updateQuestionText();
			this.toolbar.checkFlashcard(newQuestion);
			this.toolbar.checkStatisticButtonIcon(newQuestion.questionObj);
			this.toolbar.setTitle(Ext.util.Format.htmlEncode(newQuestion.getQuestionTypeMessage()));
		}
	},

	setPreparationMode: function () {
		this.setQuestionCountLoader(Ext.bind(ARSnova.app.questionModel.countPreparationQuestions, ARSnova.app.questionModel));
		this.setQuestionLoader(Ext.bind(ARSnova.app.questionModel.getPreparationQuestionsForUser, ARSnova.app.questionModel));
		this.setQuestionTitle(Messages.PREPARATION_QUESTION_LONG);
		this.setQuestionTitleShort(Messages.PREPARATION_QUESTION_SHORT);
		this.setMode('preparation');
	},

	setLectureMode: function () {
		this.setQuestionCountLoader(Ext.bind(ARSnova.app.questionModel.countLectureQuestions, ARSnova.app.questionModel));
		this.setQuestionLoader(Ext.bind(ARSnova.app.questionModel.getLectureQuestionsForUser, ARSnova.app.questionModel));
		this.setQuestionTitle(Messages.LECTURE_QUESTION_LONG);
		this.setQuestionTitleShort(Messages.LECTURE_QUESTIONS);
		this.setMode('lecture');
	},

	setFlashcardMode: function () {
		this.setQuestionCountLoader(Ext.bind(ARSnova.app.questionModel.countFlashcards, ARSnova.app.questionModel));
		this.setQuestionLoader(Ext.bind(ARSnova.app.questionModel.getFlashcardsForUser, ARSnova.app.questionModel));
		this.setQuestionTitle(Messages.FLASHCARDS);
		this.setQuestionTitleShort(Messages.FLASHCARD_SHORT);
		this.setMode('flashcard');
	},

	getUnansweredSkillQuestions: function () {
		var self = this;
		var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_SEARCH_QUESTIONS);
		this.getQuestionLoader()(sessionStorage.getItem("keyword"), {
			success: function (questions) {
				var userQuestionsPanel = ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel;
				var questionsArr = [];
				var questionIds = [];

				if (questions.length === 0) {
					// no available questions found

					self.getQuestionCountLoader()(sessionStorage.getItem("keyword"), {
						success: function (response) {
							var questionsInCourse = Ext.decode(response.responseText);

							if (questionsInCourse > 0) {
								userQuestionsPanel.add({
									cls: 'centerText',
									html: Messages.NO_UNLOCKED_QUESTIONS
								});
								userQuestionsPanel.next();
								userQuestionsPanel.toolbar.statisticsButton.hide();
								userQuestionsPanel._indicator.hide();
							} else {
								userQuestionsPanel.add({
									cls: 'centerText',
									html: Messages.NO_QUESTIONS
								});
								userQuestionsPanel.next();
								userQuestionsPanel._indicator.hide();
							}
						},
						failure: function () {
							hideLoadMask();
							console.log('error');
						}
					});
					return;
				}

				if (questions.length === 1) {
					userQuestionsPanel.getIndicator().hide();
				} else if (questions.length > 1) {
					userQuestionsPanel.getIndicator().show();
				}

				questions.forEach(function (question) {
					questionsArr[question._id] = question;
					questionIds.push(question._id);
				});

				ARSnova.app.answerModel.getAnswerByUserAndSession(sessionStorage.getItem("keyword"), {
					success: function (response) {
						var answers = Ext.decode(response.responseText);

						answers.forEach(function (answer) {
							if (questionsArr[answer.questionId]) {
								questionsArr[answer.questionId].userAnswered = answer.answerText;
								questionsArr[answer.questionId].answerSubject = answer.answerSubject;
								questionsArr[answer.questionId].isAbstentionAnswer = answer.abstention;
								questionsArr[answer.questionId].answerThumbnailImage = answer.answerThumbnailImage;
							}
						});

						userQuestionsPanel.addQuestions(questionsArr, questionIds, hideLoadMask);
					},
					failure: function (response) {
						hideLoadMask();
						console.log('error');
					}
				});
			},
			failure: function (response) {
				hideLoadMask();
				console.log('error');
			}
		});
	},

	addQuestion: function (question, index) {
		var questionPanel;
		var questionsLength = this.getInnerItems().length;
		var isUnanswered = !question.userAnswered && !question.isAbstentionAnswer;

		// do not add the same question multiple times
		if (this.questions.indexOf(question._id) !== -1) {
			return;
		}
		this.questions.push(question._id);
		/**
		 * add question to questionPanel
		 */
		if (question.questionType === 'freetext' || question.questionType === 'slide') {
			questionPanel = Ext.create('ARSnova.view.FreetextQuestion', {
				itemId: question._id,
				questionObj: question
			});
		} else {
			questionPanel = Ext.create('ARSnova.view.Question', {
				itemId: question._id,
				questionObj: question
			});
		}

		this.checkAnswer(questionPanel);

		if (index < this.nextUnansweredIndex) {
			this.insert(questionsLength - 1, questionPanel);
			this.resetIndicatorPosition();
		} else {
			this.add(questionPanel);
			this.updateIndicatorPosition(this.nextUnansweredIndex);
		}

		this.getIndicator().setIndicatorColorAnswered(index, !isUnanswered);
		this.setActiveItem(this.nextUnansweredIndex);
	},

	addQuestions: function (questions, questionIds, hideIndicatorFn) {
		var me = this;
		var index = 0;
		var activeIndex = -1;
		var questionIndex = 0;
		var isNextUnanswered = false;
		this.nextUnansweredIndex = me.getNextUnansweredIndex(questions, questionIds);

		if (this.nextUnansweredIndex) {
			var question = questions[questionIds[this.nextUnansweredIndex]];
			isNextUnanswered = !question.userAnswered && !question.isAbstentionAnswer;
			this.addQuestion(question);
		}

		var addQuestionTask = function () {
			var questionId = questionIds[questionIndex];
			me.addQuestion(questions[questionId], questionIndex);

			// Select one of the new questions that have been added by the lecturer.
			// The list of new questions is not sorted, so we select the first question that
			// matches the ID of one of the new questions.
			if (me.activeQuestionIds.indexOf(questionId) !== -1 && activeIndex === -1) {
				activeIndex = index;
			}

			index++;
			if (questionIndex === questionIds.length - 1) {
				if (me.lastActiveIndex !== -1) {
					activeIndex = me.lastActiveIndex;
					me.lastActiveIndex = -1;
				}

				if (activeIndex !== -1) {
					me.setActiveItem(activeIndex);
				}

				if (me.nextUnansweredIndex) {
					me.getIndicator().setIndicatorColorAnswered(me.nextUnansweredIndex, !isNextUnanswered);
				}
				hideIndicatorFn();
			} else {
				questionIndex++;
				Ext.create('Ext.util.DelayedTask', function () {
					addQuestionTask();
				}).delay(10);
			}
		};

		addQuestionTask();
	},

	removeQuestions: function (questions) {
		var me = this;
		var index, activeIndex;

		if (questions.length === me.questions.length) {
			this.removeAll();
		} else {
			questions.forEach(function (question) {
				index = me.questions.indexOf(question._id);
				activeIndex = me.getActiveIndex();

				if (index !== -1) {
					delete me.questions[index];
					me.removeInnerAt(index);

					if (activeIndex === index) {
						Ext.toast(Messages.ACTIVE_QUESTION_CLOSED, 2000);
					}
				}
			});
		}

		// show message if no question available
		if (this.getInnerItems().length === 0) {
			this.add({
				cls: 'centerText',
				html: Messages.NO_UNLOCKED_QUESTIONS
			});

			this.setActiveItem(0);
			this.getIndicator().hide();
		}

		// remove empty fields
		this.questions = Ext.Array.clean(me.questions);
	},

	checkAnswer: function (questionPanel) {
		var questionObj = questionPanel.questionObj;

		if (!questionObj.userAnswered && !questionObj.isAbstentionAnswer) {
			return;
		}

		if (questionObj.isAbstentionAnswer && ["mc", "grid"].indexOf(questionObj.questionType) === -1) {
			questionPanel.selectAbstentionAnswer();
			questionPanel.disableQuestion();
			return;
		}

		if (questionObj.questionType === "freetext") {
			questionPanel.setAnswerText(questionObj.answerSubject, questionObj.userAnswered, questionObj.answerThumbnailImage);
			questionPanel.disableQuestion();
			return;
		}

		if (questionObj.questionType === "grid") {
			questionPanel.setGridAnswer(questionObj.userAnswered);
			questionPanel.disableQuestion();
			return;
		}

		if (questionObj.questionType === "flashcard") {
			return;
		}

		var list = questionPanel.answerList;
		var data = list ? list.getStore() : Ext.create('Ext.data.Store', {model: 'ARSnova.model.Answer'});

		if (questionObj.questionType === 'mc') {
			if (!questionObj.isAbstentionAnswer) {
				var answers = questionObj.userAnswered.split(",");
				// sanity check: is it a correct answer array?
				if (questionObj.possibleAnswers.length !== answers.length) {
					return;
				}
				var selectedIndexes = answers.map(function (isSelected, index) {
					return isSelected === "1" ? list.getStore().getAt(index) : -1;
				}).filter(function (index) {
					return index !== -1;
				});
				list.select(selectedIndexes, true);
			}
			questionPanel.disableQuestion();
		} else {
			var index = data.find('text', questionObj.userAnswered);
			if (index !== -1) {
				list.select(data.getAt(index));
				questionPanel.disableQuestion();
			}
		}
		if (questionObj.showAnswer) {
			list.getStore().each(function (item) {
				item.set('questionAnswered', true);
			});
		}
	},

	/**
	 * Checks if statistic button for the active question should be shown.
	 * The button will only become visible if showStatistic is enabled in
	 * speaker.questionDetailsPanel and the active question is already answered.
	 */
	checkStatisticsRelease: function () {
		var questionView = this.getActiveItem();

		if (questionView.questionObj.piRoundActive) {
			return;
		}

		questionView.fireEvent('preparestatisticsbutton', this.toolbar.statisticsButton);
		this.toolbar.checkStatistics(questionView.questionObj, questionView.isDisabled());
	},

	/**
	 * Check if last answered Question was last unanswered question in carousel.
	 * If it was the last one, the application moves back to user.InClass panel.
	 */
	checkIfLastAnswer: function () {
		var questionPanels = this.items.items;
		var allAnswered = true;

		for (var i = this.carouselOffset, questionPanel; i < questionPanels.length; i++) {
			questionPanel = questionPanels[i];
			if (questionPanel.isDisabled()) {
				continue;
			}

			allAnswered = false;
			break;
		}

		if (allAnswered) {
			ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userTabPanel, {
				type: 'slide',
				direction: 'right',
				scope: this
			});
		}
	},

	getNextUnansweredIndex: function (questions, questionIds) {
		var notAnswered, question, index = 0;

		questionIds.some(function (id) {
			question = questions[id];
			notAnswered = !question.userAnswered && !question.isAbstentionAnswer;

			if (notAnswered && !question.votingDisabled) {
				index = questionIds.indexOf(id);
				return true;
			}
		});

		return index;
	},

	/**
	 * Determines the current index in the carousel and iterates the following items
	 * to find the next unanswered question. If the last index of the carousel is reached
	 * the items before the current position will be checked also.
	 */
	showNextUnanswered: function () {
		var questionPanels = this.items.items;
		var activeQuestion = this.getActiveItem();
		var lastQuestion = questionPanels[questionPanels.length - 1];

		if (!activeQuestion.isDisabled()) {
			return;
		}
		this.checkStatisticsRelease();

		var i, questionPanel;
		var currentPosition = 0;
		for (i = 0; i < questionPanels.length; i++) {
			questionPanel = questionPanels[i];
			if (questionPanel === activeQuestion) {
				currentPosition = i;
				break;
			}
		}

		var spin = false;
		for (i = currentPosition; i < questionPanels.length; i++) {
			questionPanel = questionPanels[i];
			if (spin && i === currentPosition) {
				break;
			}

			if (questionPanel.isDisabled()) {
				if (questionPanel === lastQuestion) {
					i = this.carouselOffset;
					spin = true;
				} else {
					continue;
				}
			}

			this.setActiveItem(i - this.carouselOffset);
			break;
		}
	},

	setSinglePageMode: function (singlePageMode, tabPanel) {
		if (singlePageMode) {
			this.toolbar.remove(this.toolbar.backButton, false);
			this.toolbar.add(this.sessionLogoutButton);
		} else {
			this.toolbar.remove(this.sessionLogoutButton, false);
			this.toolbar.add(this.toolbar.backButton);
		}
	},

	saveActiveIndex: function () {
		this.lastActiveIndex = this.getActiveIndex();
	},

	renew: function (questionIds) {
		this.activeQuestionIds = questionIds.map(function (question) {
			return question._id;
		});

		this.removeAll();
		this.getUnansweredSkillQuestions();
		if (ARSnova.app.mainTabPanel.tabPanel.getActiveItem() !== this) {
			this.alreadyRenewed = true;
		}
	},

	removeAll: function () {
		var result = this.callParent(arguments);
		this.questions = [];
		return result;
	}
});
