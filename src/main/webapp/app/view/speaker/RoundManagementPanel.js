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
Ext.define('ARSnova.view.speaker.RoundManagementPanel', {
	extend: 'Ext.Panel',

	config: {
		title: Messages.POLL_MANAGEMENT,
		iconCls: 'icon-timer',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	modes: {
		STOP_TIMER: 0,
		ROUND_MANAGEMENT: 1
	},

	initialize: function (arguments) {
		this.callParent(arguments);

		this.toolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			title: this.getTitle(),
			ui: 'light',
			items: [{
				xtype: 'button',
				text: Messages.STATISTIC,
				ui: 'back',
				scope: this,
				handler: function () {
					ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.statisticTabPanel.setActiveItem(0);
				}
			}]
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
			style: 'margin-top: 25px',
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
	},

	onPainted: function () {
		ARSnova.app.innerScrollPanel = this;
	},

	beforeActivate: function () {
		this.statisticChart = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionStatisticChart;
		this.prepareQuestionManagementContainer();
		this.checkStoredVotingMode();
		this.prepareCountdownTimer();
	},

	checkStoredVotingMode: function () {
		var questionId = this.statisticChart.questionObj._id;
		var storedVotingModes = JSON.parse(localStorage.getItem("storedVotingModes"));
		var features = Ext.decode(sessionStorage.getItem("features"));
		var enableRoundManagement = features && features.pi;

		this.activeMode = this.modes.STOP_TIMER;

		if (enableRoundManagement) {
			this.editButtons.enableRoundManagementButton.show();

			if (!!storedVotingModes && storedVotingModes[questionId] === this.modes.ROUND_MANAGEMENT) {
				this.activeMode = this.modes.ROUND_MANAGEMENT;
				this.editButtons.enableRoundManagementButton.setToggleFieldValue(1);
			} else {
				this.editButtons.enableRoundManagementButton.setToggleFieldValue(0);
			}
		} else {
			this.editButtons.enableRoundManagementButton.hide();
		}
	},

	prepareCountdownButtons: function () {
		if (this.activeMode === this.modes.STOP_TIMER) {
			this.prepareStopTimerButtons();
		} else {
			this.prepareRoundManagementButtons();
		}
	},

	prepareStopTimerButtons: function () {
		var questionObj = this.statisticChart.questionObj;

		this.activeMode = this.modes.STOP_TIMER;
		this.startRoundButton.setText(Messages.START_VOTING);
		this.endRoundButton.setText(Messages.END_VOTE_IMMEDIATELY);
		this.countdownTimer.disableTimerLabel();

		if (!questionObj.piRoundActive) {
			if (questionObj.piRound === 1 && !questionObj.piRoundFinished) {
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

	changePiRound: function (questionId) {
		var me = this;

		if (this.statisticChart.questionObj._id === questionId) {
			if (this.statisticChart.questionObj.piRound === 1) {
				this.statisticChart.activateFirstSegmentButton();
				this.statisticChart.disablePiRoundElements();
			} else {
				this.statisticChart.activateSecondSegmentButton();
				this.statisticChart.enablePiRoundElements();
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
		afterCancelFuction = !!afterCancelFunction ? afterCancelFunction : Ext.emptyFn;
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
		delay = !!delay || delay > 0 ? delay : 0;
		afterStartFunction = !!afterStartFunction ? afterStartFunction : Ext.emptyFn;

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
