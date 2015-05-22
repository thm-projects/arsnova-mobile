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
		layoutTemplate: {
			type: 'hbox',
			pack: 'center'
		},

		buttonClass: ''
	},

	initialize: function () {
		this.callParent(arguments);

		this.questionObj = this.config.questionObj;
		var type = this.questionObj.questionType;

		this.hasCorrectAnswers = !this.questionObj.noCorrect;
		if (['vote', 'school', 'freetext', 'flashcard'].indexOf(type) !== -1
				|| (['grid'].indexOf(type) !== -1 && type === 'moderation')) {
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

		if (!this.isFreetextType) {
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

		this.voteManagementButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.RELEASE_VOTE,
			cls: this.config.buttonClass,
			imageCls: 'icon-timer thm-green',
			scope: this,
			handler: function () {
				ARSnova.app.getController('Statistics').prepareSpeakerStatistics(
					ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel, true
				);
			}
		});

		this.statusButton = Ext.create('ARSnova.view.QuestionStatusButton', {
			cls: this.config.buttonClass,
			questionObj: this.questionObj,
			parentPanel: this
		});

		this.on('resize', this.onResize);
		this.changeHiddenState();
		this.addComponents();
	},

	addComponents: function () {
		this.twoRows = document.body.clientWidth < 450;
		var components;

		if (this.questionObj.questionType === 'flashcard') {
			components = [{
				xtype: 'panel',
				layout: this.config.layoutTemplate,
				items: [this.statusButton]
			}];
		} else {
			components = this.twoRows ?
				this.getTwoRowedComponents() :
				this.getOneRowedComponents();
		}

		this.add(components);
	},

	onResize: function () {
		var clientWidth = document.body.clientWidth;

		if (clientWidth >= 450 && this.twoRows ||
			clientWidth < 450 && !this.twoRows) {
			this.removeAll(false);
			this.addComponents();
		}
	},

	changeHiddenState: function () {
		if (this.questionObj.piRound === 1 && !this.questionObj.piRoundFinished ||
			this.questionObj.piRoundActive) {
			this.hideElements(true);
		} else {
			this.hideElements(false);
		}
	},

	hideElements: function (isHidden) {
		this.statusButton.setHidden(isHidden);
		this.releaseStatisticButton.setHidden(isHidden);

		if (this.showCorrectAnswerButton) {
			this.showCorrectAnswerButton.setHidden(isHidden);
		}
	},

	getOneRowedComponents: function () {
		if (this.showCorrectAnswerButton) {
			this.showCorrectAnswerButton.setCls(this.config.buttonClass);
		}

		this.statusButton.button.setCls(this.config.buttonClass);
		this.releaseStatisticButton.setCls(this.config.buttonClass);

		return [{
			xtype: 'panel',
			layout:  this.config.layoutTemplate,
			items: [
				this.voteManagementButton,
				this.statusButton,
				this.releaseStatisticButton,
				this.hasCorrectAnswers ? this.showCorrectAnswerButton : {}
			]
		}];
	},

	getTwoRowedComponents: function () {
		var firstRowComponents = [
			this.voteManagementButton,
			this.statusButton,
			this.releaseStatisticButton
		];

		var secondRowComponents = [
			this.hasCorrectAnswers ? this.showCorrectAnswerButton : {}
		];

		if (this.showCorrectAnswerButton) {
			this.showCorrectAnswerButton.removeCls(this.config.buttonClass);
		}

		this.statusButton.button.removeCls(this.config.buttonClass);
		this.releaseStatisticButton.removeCls(this.config.buttonClass);

		return [{
			xtype: 'panel',
			layout: this.config.layoutTemplate,
			items: firstRowComponents
		}, {
			xtype: 'panel',
			style: 'margin-top: 10px',
			layout:  this.config.layoutTemplate,
			items: secondRowComponents
		}];
	},

	updateVoteManagementButtonState: function () {
		if (this.voteManagementButton) {
			if (this.questionObj.piRoundActive) {
				this.voteManagementButton.setButtonText(Messages.READJUST_TIMER);
			} else {
				this.voteManagementButton.setButtonText(Messages.RELEASE_VOTE);
			}
		}
	},

	updateData: function (questionObj) {
		var active = questionObj.active,
			showAnswer = questionObj.showAnswer ? 1 : 0,
			showStatistic = questionObj.showStatistic ? 1 : 0;

		this.updateVoteManagementButtonState();
		this.statusButton.toggleStatusButton(active);
		this.releaseStatisticButton.setToggleFieldValue(showStatistic);

		if (this.showCorrectAnswerButton) {
			this.showCorrectAnswerButton.setToggleFieldValue(showAnswer);
		}
	}
});
