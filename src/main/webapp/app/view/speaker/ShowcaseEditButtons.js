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
Ext.define('ARSnova.view.speaker.ShowcaseEditButtons', {
	extend: 'Ext.Panel',

	config: {
		layout: {
			type: 'hbox',
			pack: 'center'
		},

		style: "margin: 10px"
	},

	initialize: function () {
		this.callParent(arguments);

		this.questionObj = this.config.questionObj;
		var type = this.questionObj.questionType;

		this.hasCorrectAnswers = !this.questionObj.noCorrect;
		if (['vote', 'school', 'freetext', 'flashcard'].indexOf(this.questionObj.questionType) !== -1
				|| (['grid'].indexOf(this.questionObj.questionType) !== -1 && this.questionObj.gridType === 'moderation')) {
			this.hasCorrectAnswers = false;
		}

		this.releaseStatisticButton = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'togglefield',
			text: Messages.RELEASE_STATISTIC,
			toggleConfig: {
				scope: this,
				label: false,
				value: this.questionObj.showStatistic ? this.questionObj.showStatistic : 0,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
						if (newValue === 0 && typeof this.questionObj.showStatistic === "undefined" ||
								newValue === this.questionObj.showStatistic) {
							return;
						}

						var me = this;
						var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_ACTIVATION);
						var question = Ext.create('ARSnova.model.Question', this.questionObj);

						switch (newValue) {
							case 0:
								delete question.data.showStatistic;
								delete question.raw.showStatistic;
								break;
							case 1:
								question.set('showStatistic', true);
								question.raw.showStatistic = true;
								break;
						}

						question.publishSkillQuestionStatistics({
							success: function (response) {
								hideLoadMask();
								me.questionObj = question.getData();
							},
							failure: function () {
								hideLoadMask();
								console.log('could not save showStatistic flag');
							}
						});
					}
				}
			}
		});

		if (this.questionObj.questionType !== "freetext") {
			this.showCorrectAnswerButton = Ext.create('ARSnova.view.MatrixButton', {
				buttonConfig: 'togglefield',
				text: Messages.MARK_CORRECT_ANSWER,
				toggleConfig: {
					scope: this,
					label: false,
					value: this.questionObj.showAnswer ? this.questionObj.showAnswer : 0,
					listeners: {
						scope: this,
						change: function (toggle, newValue, oldValue, eOpts) {
							if (newValue === 0 && typeof this.questionObj.showAnswer === "undefined" ||
								newValue === this.questionObj.showAnswer) {
								return;
							}

							var me = this;
							var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_ACTIVATION);
							var question = Ext.create('ARSnova.model.Question', this.questionObj);

							switch (newValue) {
								case 0:
									delete question.data.showAnswer;
									delete question.raw.showAnswer;
									break;
								case 1:
									question.set('showAnswer', 1);
									question.raw.showAnswer = 1;
									break;
							}
							question.publishCorrectSkillQuestionAnswer({
								success: function (response) {
									hideLoadMask();
									me.questionObj = question.getData();
								},
								failure: function () {
									hideLoadMask();
									console.log('could not save showAnswer flag');
								}
							});
						}
					}
				}
			});
		}

		this.questionStatusButton = Ext.create('ARSnova.view.QuestionStatusButton', {
			questionObj: this.questionObj
		});

		this.add([
			this.questionStatusButton,
			type === "flashcard" ? {} : this.releaseStatisticButton,
			this.hasCorrectAnswers ? this.showCorrectAnswerButton : {}
		]);
	}
});
