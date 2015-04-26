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

	requires: ['ARSnova.view.VoteStatusButton'],

	config: {
		layout: {
			type: 'hbox',
			pack: 'center'
		},

		buttonClass: '',
		speakerStatistics: false,
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
			cls: this.config.buttonClass,
			toggleConfig: {
				scope: this,
				label: false,
				value: this.questionObj.showStatistic ? 1 : 0,
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
				cls: this.config.buttonClass,
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

		if (this.config.speakerStatistics) {
			this.deleteAnswersButton = Ext.create('ARSnova.view.MatrixButton', {
				buttonConfig: 'icon',
				text: Messages.DELETE_ANSWERS,
				imageCls: 'icon-close thm-orange',
				cls: this.config.buttonClass,
				scope: this,
				handler: function () {
					var me = this;
					Ext.Msg.confirm(Messages.DELETE_ANSWERS_REQUEST, Messages.QUESTION_REMAINS, function (answer) {
						if (answer === 'yes') {
							ARSnova.app.questionModel.deleteAnswers(me.questionObj._id, {
								success: function () {
									Ext.toast(Messages.DELETE_ROUND_ANSWERS_COMPLETED, 3000);
									me.deleteAnswersButton.hide();
								},
								failure: function (response) {
									console.log('server-side error delete question');
								}
							});
						}
					});
				}
			});

			this.questionResetButton = Ext.create('ARSnova.view.MatrixButton', {
				buttonConfig: 'icon',
				text: Messages.RESET_QUESTION,
				imageCls: 'icon-renew thm-orange',
				cls: this.config.buttonClass,
				scope: this,
				handler: function () {
					var me = this;
					Ext.Msg.confirm(Messages.RESET_ROUND, Messages.RESET_ROUND_WARNING, function (answer) {
						if (answer === 'yes') {
							ARSnova.app.questionModel.resetPiRoundState(me.questionObj._id, {
								success: function () {
									Ext.toast(Messages.RESET_ROUND_COMPLETED, 3000);
									me.questionResetButton.hide();
								},
								failure: function (response) {
									console.log('server-side error');
								}
							});
						}
					});
				}
			});

			this.statusButton = Ext.create('ARSnova.view.VoteStatusButton', {
				cls: this.config.buttonClass,
				questionObj: this.questionObj,
				parentPanel: this
			});
		} else {
			this.statusButton = Ext.create('ARSnova.view.QuestionStatusButton', {
				cls: this.config.buttonClass,
				questionObj: this.questionObj,
				parentPanel: this
			});
		}

		this.add([
			this.statusButton,
			this.config.speakerStatistics ? this.questionResetButton : {},
			this.config.speakerStatistics || type === "flashcard" ? {} : this.releaseStatisticButton,
			this.hasCorrectAnswers && !this.config.speakerStatistics ? this.showCorrectAnswerButton : {},
			this.config.speakerStatistics ? this.deleteAnswersButton : {}
		]);
	},

	updateDeleteButtonState: function (hasAnswers) {
		if (this.config.speakerStatistics) {
			if (hasAnswers) {
				this.deleteAnswersButton.show();
			} else {
				this.deleteAnswersButton.hide();
			}
		}
	},

	updateQuestionResetButtonState: function () {
		if (this.config.speakerStatistics) {
			if (this.questionObj.piRound === 1 && !this.questionObj.piRoundFinished) {
				this.questionResetButton.hide();
			} else {
				this.questionResetButton.show();
			}
		}
	},

	updateData: function (questionObj) {
		var active = this.config.speakerStatistics ? !questionObj.votingDisabled : questionObj.active,
			showAnswer = questionObj.showAnswer ? 1 : 0,
			showStatistic = questionObj.showStatistic ? 1 : 0;

		this.statusButton.toggleStatusButton(active);
		this.showCorrectAnswerButton.setToggleFieldValue(showAnswer);
		this.releaseStatisticButton.setToggleFieldValue(showStatistic);
	}
});
