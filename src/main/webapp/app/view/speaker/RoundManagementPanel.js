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
Ext.define('ARSnova.view.speaker.RoundManagementPanel', {
	extend: 'Ext.Panel',

	config: {
		title: Messages.POLL_MANAGEMENT,
		iconCls: 'icon-timer',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
		}
	},

	modes: {
		STOP_TIMER: 0,
		ROUND_MANAGEMENT: 1
	},

	initialize: function () {
		this.callParent(arguments);
		var me = this;

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.STATISTIC,
			ui: 'back',
			scope: this,
			handler: this.defaultBackHandler
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			title: this.getTitle(),
			ui: 'light',
			items: [this.backButton]
		});

		this.countdownTimer = Ext.create('ARSnova.view.components.CountdownTimer', {
			onTimerStart: this.onTimerStart,
			onTimerStop: this.onTimerStop,
			startStopScope: this
		});

		this.startRoundButton = Ext.create('Ext.Button', {
			text: Messages.START_VOTING,
			style: 'margin: 0 auto;',
			ui: 'confirm',
			width: 240,
			scope: this,
			handler: function (button) {
				var me = this;

				button.disable();
				this.startNewPiRound(this.countdownTimer.slider.getValue() * 60, function () {
					me.startRoundButton.hide();
					me.endRoundButton.show();
					me.cancelRoundButton.show();
					me.endRoundButton.disable();
					me.cancelRoundButton.disable();

					if (me.enableReturnOnRoundStart) {
						me.showcaseBackHandler();
					}

					Ext.create('Ext.util.DelayedTask', function () {
						me.endRoundButton.enable();
						me.cancelRoundButton.enable();
					}).delay(1000);

					button.enable();
				});
			}
		});

		this.cancelRoundButton = Ext.create('Ext.Button', {
			text: Messages.CANCEL_DELAYED_ROUND,
			style: 'margin: 0 auto;',
			ui: 'action',
			hidden: true,
			width: 240,
			scope: this,
			handler: function (button) {
				button.disable();
				this.cancelPiRound(function () {
					button.enable();
				});
			}
		});

		this.endRoundButton = Ext.create('Ext.Button', {
			text: Messages.END_VOTE_IMMEDIATELY,
			style: 'margin: 0 auto; margin-top: 20px;',
			ui: 'decline',
			hidden: true,
			width: 240,
			scope: this,
			updateText: function () {
				if (me.statisticChart.questionObj.piRoundActive) {
					me.endRoundButton.setText(Messages.END_VOTE_IMMEDIATELY);
				} else {
					me.endRoundButton.setText(Messages.END_ROUND_IMMEDIATELY);
				}
			},
			handler: function (button) {
				button.disable();
				Ext.Msg.confirm(Messages.END_ROUND, Messages.END_ROUND_WARNING, function (id) {
					if (id === 'yes') {
						this.countdownTimer.stop();
						this.startNewPiRound();
					}

					button.enable();
				}, this);
			}
		});

		this.questionManagementContainer = Ext.create('Ext.Panel', {
			cls: 'centerFormTitle',
			hidden: true
		});

		this.add([
			this.toolbar, {
				xtype: 'formpanel',
				scrollable: null,
				items: [
					this.countdownTimer,
					this.startRoundButton,
					this.cancelRoundButton,
					this.endRoundButton,
					this.questionManagementContainer
				]
			}
		]);

		this.on('painted', this.onPainted);
		this.onBefore('activate', this.beforeActivate);
		this.on('deactivate', this.setDefaultBackButtonHandler);
	},

	onPainted: function () {
		ARSnova.app.innerScrollPanel = this;
	},

	beforeActivate: function () {
		this.statisticChart = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionStatisticChart;
		this.prepareQuestionManagementContainer();
		this.prepareCountdownTimer();
		this.checkRoundFeature();
	},

	defaultBackHandler: function () {
		ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.statisticTabPanel.setActiveItem(0);
	},

	showcaseBackHandler: function () {
		this.statisticChart.backButton.getHandler().apply(
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionStatisticChart
		);
	},

	setDefaultBackButtonHandler: function () {
		this.enableReturnOnRoundStart = false;
		this.backButton.setText(Messages.STATISTIC);
		this.backButton.setHandler(this.defaultBackHandler);
	},

	setShowcaseBackButtonHandler: function () {
		this.enableReturnOnRoundStart = true;
		this.backButton.setText(Messages.BACK);
		this.backButton.setHandler(this.showcaseBackHandler);
	},

	checkRoundFeature: function () {
		var features = Ext.decode(sessionStorage.getItem("features"));
		var enableRoundManagement = features && features.pi;

		if (enableRoundManagement && this.isBarChartQuestion()) {
			this.editButtons.enableRoundManagementButton.active = true;
		} else {
			this.editButtons.enableRoundManagementButton.active = false;
		}
	},

	prepareCountdownButtons: function () {
		if (this.activeMode === this.modes.ROUND_MANAGEMENT) {
			this.prepareRoundManagementButtons();
			this.editButtons.enableRoundManagementButton.setToggleFieldValue(1);
		} else {
			this.prepareStopTimerButtons();
			this.editButtons.enableRoundManagementButton.setToggleFieldValue(0);
		}
	},

	prepareStopTimerButtons: function () {
		var questionObj = this.statisticChart.questionObj;

		this.activeMode = this.modes.STOP_TIMER;
		this.endRoundButton.config.updateText();
		this.startRoundButton.setText(Messages.START_VOTING);
		this.countdownTimer.disableTimerLabel();

		if (!questionObj.piRoundActive) {
			if (questionObj.piRound === 0 && !questionObj.piRoundFinished ||
				questionObj.piRound === 1 && !questionObj.piRoundFinished) {
				this.countdownTimer.slider.show();
				this.startRoundButton.show();
				this.endRoundButton.show();
			} else {
				this.countdownTimer.setTimerLabelText(Messages.VOTING_CLOSED);
				this.countdownTimer.slider.hide();
				this.startRoundButton.hide();
				this.endRoundButton.hide();
			}
			this.cancelRoundButton.hide();
			this.questionManagementContainer.show();
		} else {
			this.endRoundButton.show();
			this.cancelRoundButton.show();
			this.startRoundButton.hide();
			this.questionManagementContainer.hide();
		}
	},

	prepareRoundManagementButtons: function () {
		var questionObj = this.statisticChart.questionObj;

		this.activeMode = this.modes.ROUND_MANAGEMENT;
		this.endRoundButton.setText(Messages.END_ROUND_IMMEDIATELY);
		this.countdownTimer.disableTimerLabel();

		if (!questionObj.piRoundActive) {
			if (questionObj.piRound === 1) {
				if (!questionObj.piRoundFinished) {
					this.startRoundButton.setText(Messages.START_FIRST_ROUND);
				} else if (questionObj.piRoundFinished) {
					this.startRoundButton.setText(Messages.START_SECOND_ROUND);
					this.countdownTimer.setSliderValue(5);
				}
				this.countdownTimer.slider.show();
				this.startRoundButton.show();
			} else {
				this.countdownTimer.setTimerLabelText(Messages.VOTING_CLOSED);
				this.countdownTimer.slider.hide();
				this.startRoundButton.hide();
			}
			this.cancelRoundButton.hide();
			this.endRoundButton.hide();
			this.questionManagementContainer.show();
		} else {
			this.endRoundButton.show();
			this.cancelRoundButton.show();
			this.startRoundButton.hide();
			this.questionManagementContainer.hide();
		}
	},

	onTimerStart: function () {
		this.questionManagementContainer.hide();
	},

	onTimerStop: function () {
	},

	isBarChartQuestion: function () {
		var type = this.statisticChart.questionObj.questionType;
		if (type === 'grid' || type === 'freetext') {
			return false;
		}

		return true;
	},

	changePiRound: function (questionId) {
		var me = this;

		if (this.statisticChart.questionObj._id === questionId) {
			if (this.isBarChartQuestion()) {
				if (this.statisticChart.questionObj.piRound === 1) {
					this.statisticChart.activateFirstSegmentButton();
					this.statisticChart.disablePiRoundElements();
				} else {
					this.statisticChart.activateSecondSegmentButton();
					this.statisticChart.enablePiRoundElements();
				}
			}

			this.questionManagementContainer.show();
			this.startRoundButton.disable();
			this.cancelRoundButton.hide();
			this.endRoundButton.hide();
			this.startRoundButton.show();

			Ext.create('Ext.util.DelayedTask', function () {
				me.startRoundButton.enable();
			}).delay(1000);

			this.prepareCountdownButtons();
		}
	},

	cancelPiRound: function (afterCancelFunction) {
		afterCancelFunction = afterCancelFunction || Ext.emptyFn;
		this.countdownTimer.stop();

		ARSnova.app.questionModel.cancelDelayedPiRound(this.statisticChart.questionObj._id, {
			success: function (response) {
				afterCancelFunction();
			},
			failure: function (response) {
				console.log('server-side error');
			}
		});
	},

	startNewPiRound: function (delay, afterStartFunction) {
		delay = delay || 0;
		afterStartFunction = afterStartFunction || Ext.emptyFn;

		ARSnova.app.questionModel.startNewPiRound(this.statisticChart.questionObj._id, delay, {
			success: function (response) {
				afterStartFunction();
			},
			failure: function (response) {
				console.log('server-side error');
			}
		});
	},

	prepareCountdownTimer: function () {
		var obj = this.statisticChart.questionObj;

		if (!obj.piRoundActive) {
			this.countdownTimer.stop();
		} else {
			this.countdownTimer.start(obj.piRoundStartTime, obj.piRoundEndTime);
		}

		this.prepareCountdownButtons();
	},

	prepareQuestionManagementContainer: function () {
		if (!this.editButtons) {
			this.editButtons = Ext.create('ARSnova.view.speaker.RoundManagementEditButtons', {
				questionObj: this.cleanupQuestionObj(this.statisticChart.questionObj),
				buttonClass: 'mediumActionButton'
			});

			this.questionManagementContainer.add(this.editButtons);
			this.questionManagementContainer.show();
		}

		this.updateEditButtons();
	},

	updateEditButtons: function () {
		this.editButtons.updateData(this.statisticChart.questionObj);
		this.editButtons.updateEnableRoundManagementButtonState();
		this.editButtons.updateQuestionResetButtonState(
			this.statisticChart.hasAnswers
		);
	},

	cleanupQuestionObj: function (questionObj) {
		if (questionObj) {
			questionObj.possibleAnswers.forEach(function (answer) {
				delete answer.formattedText;
			});
		}

		return questionObj;
	}
});
