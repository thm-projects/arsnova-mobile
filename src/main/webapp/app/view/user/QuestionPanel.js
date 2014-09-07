/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
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

	requires: ['ARSnova.view.Question', 'ARSnova.view.components.QuestionToolbar'],

	config: {
		fullscreen: true,
		title: Messages.QUESTIONS,
		iconCls: 'tabBarIconQuestion',

		questionLoader: null,
		questionCountLoader: null
	},

	/* item index 0 and 1 are occupied by the carousel and toolbar. */
	carouselOffset: 2,

	initialize: function() {
		this.callParent(arguments);

		this.setLectureMode();

		this.on('activeitemchange', function(panel, newCard, oldCard) {
			this.toolbar.setQuestionTitle(newCard.questionObj);
			this.toolbar.incrementQuestionCounter(panel.activeIndex);
			this.toolbar.checkStatistics(newCard.questionObj, newCard.isDisabled());

			newCard.fireEvent('preparestatisticsbutton', this.toolbar.statisticsButton);
		});

		this.toolbar = Ext.create('ARSnova.view.components.QuestionToolbar', {
			title: Messages.QUESTION,
			backButtonHandler: function(animation) {
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userTabPanel, animation);
			}
		});

		this.add([this.toolbar]);

		this.onBefore('activate', this.beforeActivate, this);
		this.onAfter('activate', this.onActivate, this);
		this.on('add', function(panel, component, index) {
			component.doTypeset && component.doTypeset(panel);
		});
	},

	beforeActivate: function(){
		this.removeAll(false);
		this._indicator.show();
	},

	onActivate: function(){
		this.getUnansweredSkillQuestions();
	},

	setPreparationMode: function() {
		this.setQuestionCountLoader(Ext.bind(ARSnova.app.questionModel.countPreparationQuestions, ARSnova.app.questionModel));
		this.setQuestionLoader(Ext.bind(ARSnova.app.questionModel.getPreparationQuestionsForUser, ARSnova.app.questionModel));
	},

	setLectureMode: function() {
		this.setQuestionCountLoader(Ext.bind(ARSnova.app.questionModel.countLectureQuestions, ARSnova.app.questionModel));
		this.setQuestionLoader(Ext.bind(ARSnova.app.questionModel.getLectureQuestionsForUser, ARSnova.app.questionModel));
	},

	getUnansweredSkillQuestions: function(){
		var self = this;

		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH_QUESTIONS);
		this.getQuestionLoader()(localStorage.getItem("keyword"), {
			success: function(questions){
				var userQuestionsPanel = ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel;
				var questionsArr = [];
				var questionIds = [];

				if (questions.length == 0){
					//no available questions found

					self.getQuestionCountLoader()(localStorage.getItem("keyword"), {
						success: function(response){
							var questionsInCourse = Ext.decode(response.responseText);

							if (questionsInCourse > 0) {
								userQuestionsPanel.toolbar.questionCounter.hide();
								userQuestionsPanel.add({
									cls: 'centerText',
									html: Messages.NO_UNLOCKED_QUESTIONS
								});
								userQuestionsPanel.next();
								userQuestionsPanel.toolbar.statisticsButton.hide();
								userQuestionsPanel._indicator.hide();
							} else {
								userQuestionsPanel.toolbar.questionCounter.hide();
								userQuestionsPanel.add({
									cls: 'centerText',
									html: Messages.NO_QUESTIONS
								});
								userQuestionsPanel.next();
								userQuestionsPanel._indicator.hide();
							}
							hideLoadMask();
						},
						failure: function() {
							hideLoadMask();
							console.log('error');
						}
					});
					return;

				} else {
					userQuestionsPanel.toolbar.resetQuestionCounter(questions.length);
				}

				if (questions.length == 1){
					userQuestionsPanel._indicator.hide();
				}

				questions.forEach(function(question){
					questionsArr[question._id] = question;
					questionIds.push(question._id);
				});

				ARSnova.app.answerModel.getAnswerByUserAndSession(localStorage.getItem("keyword"), {
					success: function(response){
						var answers = Ext.decode(response.responseText);

						answers.forEach(function(answer){
							if(questionsArr[answer.questionId]) {
								questionsArr[answer.questionId].userAnswered = answer.answerText;
								questionsArr[answer.questionId].answerSubject = answer.answerSubject;
								questionsArr[answer.questionId].isAbstentionAnswer = answer.abstention;
							}
						});
						questionIds.forEach(function(questionId){
							userQuestionsPanel.addQuestion(questionsArr[questionId]);
						});

						// bugfix (workaround): after removing all items from carousel the active index
						// is set to -1. To fix that you have manually  set the activeItem on the first
						// question.
						self.setActiveItem(0);

						userQuestionsPanel.checkAnswer();
						userQuestionsPanel.showNextUnanswered();
					},
					failure: function(response){
						console.log('error');
					}
				});
				hideLoadMask();
			},
			failure: function(response) {
				hideLoadMask();
				console.log('error');
			}
		});
	},

	addQuestion: function(question){
		/**
		 * add question to questionPanel
		 */
		if (question.questionType === 'freetext') {
			this.add(Ext.create('ARSnova.view.FreetextQuestion', {
				questionObj: question
			}));
		} else {
			this.add(Ext.create('ARSnova.view.Question', {
				questionObj: question
			}));
		}
	},

	checkAnswer: function(){
		this.getInnerItems().forEach(function(questionPanel) {
			var questionObj = questionPanel.questionObj;
			if (!questionObj.userAnswered && !questionObj.isAbstentionAnswer) return;

			if (questionObj.isAbstentionAnswer && "mc" !== questionObj.questionType) {
				questionPanel.selectAbstentionAnswer();
				questionPanel.disableQuestion();
				return;
			}

			if (questionObj.questionType === "freetext") {
				questionPanel.setAnswerText(questionObj.answerSubject, questionObj.userAnswered);
				questionPanel.disableQuestion();
				return;
			}

			if (questionObj.questionType === "grid") {
				questionPanel.setGridAnswer(questionObj.userAnswered);
				questionPanel.disableQuestion();
				return;
			}

			var list = questionPanel.answerList;
			var data = list ? list.getStore(): Ext.create('Ext.data.Store', {model:'ARSnova.model.Answer'});

			if (questionObj.questionType === 'mc') {
				if (!questionObj.isAbstentionAnswer) {
					var answers = questionObj.userAnswered.split(",");
					// sanity check: is it a correct answer array?
					if (questionObj.possibleAnswers.length !== answers.length) {
						return;
					}
					var selectedIndexes = answers.map(function(isSelected, index) {
						return isSelected === "1" ? list.getStore().getAt(index): -1;
					}).filter(function(index) {
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
				list.getStore().each(function(item) {
					item.set('questionAnswered', true);
				});
			}
		}, this);
	},

	/**
	 * Checks if statistic button for the active question should be shown.
	 * The button will only become visible if showStatistic is enabled in
	 * speaker.questionDetailsPanel and the active question is already answered.
	 */
	checkStatisticRelease: function() {
		var questionView = this.getActiveItem();

		questionView.fireEvent('preparestatisticsbutton', this.toolbar.statisticsButton);
	this.toolbar.checkStatistics(questionView.questionObj, questionView.isDisabled());
	},

	/**
	 * Check if last answered Question was last unanswered question in carousel.
	 * If it was the last one, the application moves back to user.InClass panel.
	 */
	checkIfLastAnswer: function(){
		var questionPanels = this.items.items;
		var allAnswered = true;

		for (var i = this.carouselOffset, questionPanel; questionPanel = questionPanels[i]; i++) {
			if(questionPanel.isDisabled()) {
				continue;
			}

			allAnswered = false;
			break;
		}

		if(allAnswered) {
			ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userTabPanel, {
				type: 'slide',
				direction: 'right',
				duration: 700,
				scope: this
			});
		}
	},

	/**
	 * Determines the current index in the carousel and iterates the following items
	 * to find the next unanswered question. If the last index of the carousel is reached
	 * the items before the current position will be checked also.
	 */
	showNextUnanswered: function(){
		var questionPanels = this.items.items;
		var activeQuestion = this.getActiveItem();
		var lastQuestion = questionPanels[questionPanels.length-1];

		if(!activeQuestion.isDisabled()) return;
		this.checkStatisticRelease();

		var currentPosition = 0;
		for (var i = 0, questionPanel; questionPanel = questionPanels[i]; i++) {
			if (questionPanel == activeQuestion) {
				currentPosition = i;
				break;
			}
		}

		var spin = false;
		for (var i = currentPosition, questionPanel; questionPanel = questionPanels[i]; i++) {
			if(spin && i == currentPosition) {
				break;
			}

			if(questionPanel.isDisabled()) {
				if(questionPanel == lastQuestion) {
					i = this.carouselOffset;
					spin = true;
				}
				else continue;
			}

			this.setActiveItem(i - this.carouselOffset);
			break;
		}
	},

	renew: function() {
		this.removeAll();
		this.getUnansweredSkillQuestions();
	}
});
