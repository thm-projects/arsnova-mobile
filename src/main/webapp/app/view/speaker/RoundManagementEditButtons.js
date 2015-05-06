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
Ext.define('ARSnova.view.speaker.RoundManagementEditButtons', {
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

	modes: {
		STOP_TIMER: 0,
		ROUND_MANAGEMENT: 1
	},

	initialize: function () {
		this.callParent(arguments);

		this.questionObj = this.config.questionObj;
		var features = Ext.decode(sessionStorage.getItem("features"));
		var enableRoundManagement = features && features.pi;

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

		this.enableRoundManagementButton = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'togglefield',
			cls: this.config.buttonClass,
			text: Messages.SWITCH_VOTING_MODE,
			toggleConfig: {
				scope: this,
				label: false,
				value: this.isRoundManagementActive,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue) {
						var panel = this.getParent().getParent().getParent();
						var storedVotingModes = JSON.parse(localStorage.getItem("storedVotingModes"));
						storedVotingModes = !!storedVotingModes ? storedVotingModes : {};

						if (newValue === 1 && oldValue === 0) {
							panel.prepareRoundManagementButtons();
							storedVotingModes[this.questionObj._id] = this.modes.ROUND_MANAGEMENT;
						} else {
							panel.prepareStopTimerButtons();
							delete storedVotingModes[this.questionObj._id];
						}

						if (Object.keys(storedVotingModes).length) {
							localStorage.setItem("storedVotingModes", JSON.stringify(storedVotingModes));
						} else {
							localStorage.removeItem("storedVotingModes");
						}
					}
				}
			}
		});

		this.statusButton = Ext.create('ARSnova.view.VoteStatusButton', {
			cls: this.config.buttonClass,
			questionObj: this.questionObj,
			parentPanel: this
		});

		this.add([
			this.statusButton,
			enableRoundManagement ? this.enableRoundManagementButton : {},
			this.questionResetButton
		]);
	},

	updateQuestionResetButtonState: function (hasAnswers) {
		if (this.questionObj.piRound === 1 && !this.questionObj.piRoundFinished && !hasAnswers) {
			this.questionResetButton.hide();
		} else {
			this.questionResetButton.show();
		}
	},

	updateData: function (questionObj) {
		this.questionObj = questionObj;
		this.config.questionObj = questionObj;
		this.statusButton.updateData(questionObj);
	}
});
