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
Ext.define('ARSnova.view.speaker.ShowcaseQuestionPanel', {
	extend: 'Ext.Carousel',

	requires: [
		'ARSnova.view.Question',
		'ARSnova.view.CustomCarousel',
		'ARSnova.view.CustomCarouselIndicator',
		'ARSnova.view.ImageAnswerPanel',
		'ARSnova.view.FreetextAnswerPanel',
		'ARSnova.view.speaker.QuestionStatisticChart',
		'ARSnova.view.components.QuestionToolbar'
	],

	config: {
		fullscreen: true,
		title: Messages.QUESTIONS,

		controller: null,
		questionTitleLong: Messages.LECTURE_QUESTION_LONG,
		questionTitleShort: Messages.LECTURE_QUESTIONS
	},

	initialize: function () {
		this.callParent(arguments);

		this.on('activeitemchange', function (panel, newCard, oldCard) {
			if (newCard.questionObj.questionType !== 'flashcard') {
				this.toolbar.statisticsButton.show();
			} else {
				this.toolbar.statisticsButton.hide();
			}

			newCard.fireEvent('preparestatisticsbutton', this.toolbar.statisticsButton);
		}, this);

		this.toolbar = Ext.create('ARSnova.view.components.QuestionToolbar', {
			cls: 'speakerTitleText',
			showcase: true,
			backButtonHandler: function (animation) {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				ARSnova.app.innerScrollPanel = false;

				if (sTP.showcaseQuestionPanel.inclassBackButtonHandle) {
					sTP.animateActiveItem(sTP.inClassPanel, animation);
					sTP.showcaseQuestionPanel.inclassBackButtonHandle = false;
				} else {
					sTP.animateActiveItem(sTP.audienceQuestionPanel, animation);
				}
			},
			statisticsButtonHandler: function (button) {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.questionStatisticChart = Ext.create('ARSnova.view.speaker.QuestionStatisticChart', {
					question: ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel._activeItem._activeItem.questionObj,
					lastPanel: this
				});
				sTP.animateActiveItem(sTP.questionStatisticChart, 'slide');
			}
		});

		this.add([this.toolbar]);
		this.lastActiveIndex = -1;

		this.on('activate', this.onActivate);
		this.on('activate', this.beforeActivate, this, null, 'before');
		this.on('activeitemchange', this.onItemChange);
		this.onAfter('painted', function () {
			ARSnova.app.innerScrollPanel = this;

			if (this.getActiveItem()) {
				this.getActiveItem().checkPiRoundActivation();
			}
		});
	},

	beforeActivate: function () {
		this.removeAll();
		this._indicator.show();
		this.toolbar.setTitle("");
	},

	onActivate: function () {
		this.getAllSkillQuestions();
	},

	onItemChange: function (panel, newQuestion, oldQuestion) {
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

		if (newQuestion.questionObj) {
			if (screenWidth >= 520) {
				this.toolbar.setTitle(newQuestion.getQuestionTypeMessage());
			} else {
				this.toolbar.setTitle('');
			}

			newQuestion.updateQuestionText();
		}
	},

	getAllSkillQuestions: function () {
		var hideIndicator = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH_QUESTIONS);

		this.getController().getQuestions(sessionStorage.getItem("keyword"), {
			success: function (response) {
				var activeIndex = 0;
				var questions = Ext.decode(response.responseText);
				var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.showcaseQuestionPanel;

				if (questions.length === 1) {
					panel._indicator.hide();
				}

				var questionsArr = [];
				var questionIds = [];
				questions.forEach(function (question) {
					questionsArr[question._id] = question;
					questionIds.push(question._id);
				});
				questionIds.forEach(function (questionId) {
					panel.addQuestion(questionsArr[questionId]);
				});

				if (panel.lastActiveIndex !== -1) {
					activeIndex = panel.lastActiveIndex;
					panel.lastActiveIndex = -1;
				}
				panel.setActiveItem(activeIndex);
				panel.checkFirstQuestion();
				hideIndicator();
			},
			failure: function (response) {
				console.log('error');
				hideIndicator();
			}
		});
	},

	addQuestion: function (question) {
		var questionPanel;
		if (question.questionType === 'freetext') {
			questionPanel = Ext.create('ARSnova.view.FreetextQuestion', {
				itemId: question._id,
				questionObj: question,
				viewOnly: true
			});
		} else {
			questionPanel = Ext.create('ARSnova.view.Question', {
				itemId: question._id,
				questionObj: question,
				viewOnly: true
			});
		}
		this.add(questionPanel);
	},

	saveActiveIndex: function () {
		this.lastActiveIndex = this.getActiveIndex();
	},

	checkFirstQuestion: function () {
		var firstQuestionView = this.items.items[0];

		firstQuestionView.fireEvent('preparestatisticsbutton', this.toolbar.statisticsButton);
	},

	setLectureMode: function () {
		this.setQuestionTitleLong(Messages.LECTURE_QUESTION_LONG);
		this.setQuestionTitleShort(Messages.LECTURE_QUESTIONS);
	},

	setPreparationMode: function () {
		this.setQuestionTitleLong(Messages.PREPARATION_QUESTION_LONG);
		this.setQuestionTitleShort(Messages.PREPARATION_QUESTION_SHORT);
	}
});
