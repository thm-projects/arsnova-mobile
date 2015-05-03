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
			sliderDefaultValue: 2,
			onTimerStart: this.onTimerStart,
			onTimerStop: this.onTimerStop,
			startStopScope: this
		});

		this.startRoundButton = Ext.create('Ext.Button', {
			text: Messages.START_FIRST_ROUND,
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
			text: Messages.END_ROUND_IMMEDIATELY,
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

		this.questionManagementContainer = Ext.create('Ext.form.FieldSet', {
			cls: 'centerFormTitle',
			hidden: true
		});

		this.roundManagementContainer = Ext.create('Ext.form.FieldSet', {
			cls: 'centerFormTitle',
			items: [
				this.countdownTimer,
				this.startRoundButton,
				this.cancelRoundButton,
				this.endRoundButton
			]
		});

		this.add([
			this.toolbar,
			{
				xtype: 'formpanel',
				scrollable: null,
				items: [
					this.roundManagementContainer,
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
		this.prepareCountdownTimer();
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
			this.endRoundButton.hide();
			this.cancelRoundButton.hide();
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
				console.debug('New question round canceled');
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
				console.debug('New question round started.');
			},
			failure: function (response) {
				console.log('server-side error');
			}
		});
	},

	prepareCountdownTimer: function () {
		var obj = this.statisticChart.questionObj;

		if (obj.piRoundActive) {
			this.countdownTimer.start(obj.piRoundStartTime, obj.piRoundEndTime);
		} else {
			this.countdownTimer.stop();
		}

		this.prepareCountdownButtons();
	},

	prepareQuestionManagementContainer: function () {
		if (!this.editButtons) {
			this.editButtons = Ext.create('ARSnova.view.speaker.RoundManagementEditButtons', {
				buttonClass: 'smallerActionButton',
				questionObj: this.cleanupQuestionObj(this.statisticChart.questionObj)
			});

			this.questionManagementContainer.add(this.editButtons);
			this.questionManagementContainer.show();
		}

		this.updateEditButtons();
	},

	prepareCountdownButtons: function () {
		var questionObj = this.statisticChart.questionObj;

		if (!questionObj.piRoundActive) {
			if (questionObj.piRound === 1) {
				if (!questionObj.piRoundFinished) {
					this.startRoundButton.setText(Messages.START_FIRST_ROUND);
					this.countdownTimer.slider.show();
					this.startRoundButton.show();
				} else if (questionObj.piRoundFinished) {
					this.startRoundButton.setText(Messages.START_SECOND_ROUND);
					this.countdownTimer.slider.show();
					this.startRoundButton.show();
				}
			} else {
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

	updateEditButtons: function () {
		this.editButtons.updateData(this.statisticChart.questionObj);
		this.editButtons.updateQuestionResetButtonState(this.statisticChart.hasAnswers);
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
