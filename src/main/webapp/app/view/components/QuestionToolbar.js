/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
Ext.define('ARSnova.view.components.QuestionToolbar', {
	extend: 'Ext.TitleBar',

	config: {
		title: Messages.QUESTION,
		docked: 'top',
		ui: 'light',

		showcase: false,
		backButtonHandler: Ext.emptyFn,
		statisticsButtonHandler: Ext.emptyFn
	},

	constructor: function () {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			ui: 'back',
			align: 'left',
			text: Messages.BACK,
			scope: this,
			handler: function () {
				var animation = {
					type: 'slide',
					direction: 'right',
					duration: 700
				};
				var callback = this.getBackButtonHandler();
				callback(animation);
			}
		});

		this.clockElement = Ext.create('Ext.Component', {
			cls: 'x-toolbar-title x-title',
			hidden: true,
			align: 'left'
		});

		this.answerCounter = Ext.create('Ext.Component', {
			cls: "x-toolbar-title alignRight counterText",
			align: 'right'
		});

		this.flipFlashcardButton = Ext.create('Ext.Button', {
			iconCls: 'icon-flip',
			style: 'padding: 0; width: 44px',
			align: 'right',
			hidden: true
		});

		this.flipAllFlashcardsButton = Ext.create('Ext.Button', {
			iconCls: ARSnova.app.getController('FlashcardQuestions').flip ?
				'icon-flashcard-back' : 'icon-flashcard-front',
			style: 'padding: 0; width: 44px',
			align: 'right',
			hidden: true,
			handler: function () {
				var ctrl = ARSnova.app.getController('FlashcardQuestions');
				if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
					ARSnova.app.sessionModel.flipFlashcards(!ctrl.flip, {
						success: function (response) {},
						failure: function (response) {}
					});
				} else {
					ctrl.flipFlashcards(!ctrl.flip);
				}
			}
		});

		this.statisticsButton = Ext.create('Ext.Button', {
			iconCls: 'icon-chart',
			style: 'padding: 0; width: 44px',
			handler: this.getStatisticsButtonHandler(),
			align: 'right'
		});

		this.add([
			this.backButton,
			this.clockElement,
			this.answerCounter,
			this.statisticsButton,
			this.flipFlashcardButton,
			this.flipAllFlashcardsButton
		]);
	},

	setAnswerCounter: function (value, option) {
		if (!option) {
			option = value === 1 ? Messages.ANSWER : Messages.ANSWERS;
		} else if (option === Messages.COMMENT) {
			option = value === 1 ? Messages.COMMENT : Messages.COMMENTS;
		} else if (option === Messages.ABSTENTION) {
			option = value === 1 ? Messages.ABSTENTION : Messages.ABSTENTIONS;
		}

		if (moment.locale() === "en") {
			option = option.toLowerCase();
		}

		this.answerCounter.setHtml(value + ' ' + option);
	},

	updateAnswerCounter: function (value) {
		var counter = this.answerCounter.getHtml().split(" "),
			counterText = this.getAnswerCounterText();

		switch (counterText) {
			case Messages.ANSWER:
			case Messages.ANSWERS:
			case Messages.ABSTENTION:
			case Messages.ABSTENTIONS:
			case Messages.ABSTENTION.toLowerCase():
			case Messages.ABSTENTIONS.toLowerCase():
				this.setAnswerCounter(value);
				break;
			default:
				counter[0] = value;
				this.answerCounter.setHtml(counter.join(" "));
		}
	},

	getAnswerCounterText: function () {
		var counter = this.answerCounter.getHtml().split(" "),
		lastString = counter[counter.length - 1];

		return lastString;
	},

	setAnswerCounterText: function (text) {
		var counter = this.answerCounter.getHtml().split(" ");
		counter[counter.length - 1] = text;

		this.answerCounter.setHtml(counter.join(" "));
	},

	updateTime: function () {
		var actualTime = new Date().toTimeString().substring(0, 8);
		this.clockElement.setHtml(actualTime);
		this.clockElement.setHidden(false);
	},

	checkStatisticButtonIcon: function (question) {
		if (question && question.questionType === 'slide') {
			this.statisticsButton.setIconCls('icon-comment');
		} else {
			this.statisticsButton.setIconCls(this.statisticsButton.config.iconCls);
		}
	},

	checkFlashcard: function (questionPanel) {
		var questionObj = questionPanel.questionObj;
		var isFlashcard = questionObj && questionObj.questionType === 'flashcard';

		if (isFlashcard) {
			this.flipFlashcardButton.setScope(questionPanel);
			this.flipFlashcardButton.setHandler(questionPanel.flipFlashcardHandler);
			this.flipAllFlashcardsButton.setHidden(false);
			this.flipFlashcardButton.setHidden(false);
		} else {
			this.flipAllFlashcardsButton.setHidden(true);
			this.flipFlashcardButton.setHidden(true);
		}
	},

	checkStatistics: function (question, isDisabled) {
		var showStatistics = question && question.showStatistic && isDisabled && question.questionType !== 'flashcard' ||
			question && question.showStatistic && question.questionType === 'slide';

		this.statisticsButton.setHidden(!showStatistics);
	}
});
