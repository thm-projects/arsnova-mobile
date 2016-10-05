/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2016 The ARSnova Team
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
		if (['vote', 'school', 'freetext', 'flashcard', 'slide'].indexOf(type) !== -1
				|| (['grid'].indexOf(type) !== -1 && type === 'moderation')) {
			this.hasCorrectAnswers = false;
		}
		if ((['yesno', 'mc', 'sc', 'abcd'].indexOf(type) !== -1) || (type === "freetext" && this.questionObj.fixedAnswer)) {
			this.isExportableToClick = true;
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
						if (newValue === (this.questionObj.showStatistic || 0)) {
							return;
						}

						var me = this;
						var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_ACTIVATION);
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

		this.showCorrectAnswerButton = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'togglefield',
			text: Messages.MARK_CORRECT_ANSWER,
			cls: this.config.buttonClass,
			toggleConfig: {
				scope: this,
				label: false,
				value: this.questionObj.showAnswer || 0,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
						if (newValue === (this.questionObj.showAnswer || 0)) {
							return;
						}

						var me = this;
						var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_ACTIVATION);
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

		this.exportToClickButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.QUESTION_EXPORT_TO_CLICK,
			cls: this.config.buttonClass,
			hidden: !ARSnova.app.globalConfig.features.exportToClick,
			imageCls: 'icon-cloud-download',
			scope: this,
			handler: function () {
				var messageBox = Ext.create('Ext.MessageBox', {
					title: Messages.QUESTION_EXPORT_TO_CLICK_MSBOX_TITLE,
					message: Messages.QUESTION_EXPORT_TO_CLICK_MSBOX_INFO.replace(/###/, localStorage.getItem("shortName") + "_" + this.questionObj.subject + ".json"),
					cls: 'exportToClickBox',
					hide: function () {
					}
				});

				var question = this.questionObj;

				messageBox.setButtons([{
					text: Messages.CONTINUE,
					itemId: 'continue',
					ui: 'action',
					handler: function () {
						var questionExportController = ARSnova.app.getController('QuestionExport');
						var clickQuestionObject = questionExportController.exportQuestionToClick(question);
						questionExportController.saveClickQuestionOnFileSystem(clickQuestionObject, question.subject);
						messageBox.hide();
					}
				}]);

				messageBox.show();
			}
		});

		this.voteManagementButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.RELEASE_VOTE,
			cls: this.config.buttonClass,
			imageCls: 'icon-timer',
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
		this.hideElements(this.questionObj.piRoundActive);
	},

	changeVoteManagementButtonState: function () {
		this.voteManagementButton.setHidden(
			ARSnova.app.activePiQuestion &&
			ARSnova.app.activePiQuestion !== this.questionObj._id ||
			this.questionObj.questionType === 'slide'
		);
	},

	hideElements: function (isHidden) {
		this.statusButton.setHidden(isHidden);
		this.releaseStatisticButton.setHidden(isHidden);
		this.showCorrectAnswerButton.setHidden(isHidden);
	},

	getOneRowedComponents: function () {
		this.showCorrectAnswerButton.setCls(this.config.buttonClass);
		this.statusButton.button.setCls(this.config.buttonClass);
		this.releaseStatisticButton.setCls(this.config.buttonClass);
		this.exportToClickButton.setCls(this.config.buttonClass);

		return [{
			xtype: 'panel',
			layout:  this.config.layoutTemplate,
			items: [
				this.voteManagementButton,
				this.statusButton,
				this.releaseStatisticButton,
				this.isExportableToClick ? this.exportToClickButton : {},
				this.hasCorrectAnswers ? this.showCorrectAnswerButton : {}
			]
		}];
	},

	getTwoRowedComponents: function () {
		var firstRowComponents = [
			this.voteManagementButton,
			this.statusButton,
			this.releaseStatisticButton,
			this.isExportableToClick ? this.exportToClickButton : {}
		];

		var secondRowComponents = [
			this.hasCorrectAnswers ? this.showCorrectAnswerButton : {}
		];

		this.showCorrectAnswerButton.removeCls(this.config.buttonClass);
		this.statusButton.button.removeCls(this.config.buttonClass);
		this.releaseStatisticButton.removeCls(this.config.buttonClass);
		this.exportToClickButton.removeCls(this.config.buttonClass);

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
				if (this.questionObj.votingDisabled) {
					this.voteManagementButton.setButtonText(Messages.RELEASE_VOTE);
				} else {
					this.voteManagementButton.setButtonText(Messages.ACTIVATE_TIMER);
				}
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
		this.showCorrectAnswerButton.setToggleFieldValue(showAnswer);
	}
});
