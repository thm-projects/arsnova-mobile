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
		layoutTemplate: {
			type: 'hbox',
			pack: 'center'
		},

		style: 'margin-top: 25px; margin-bottom: 25px',
		buttonClass: ''
	},

	modes: {
		STOP_TIMER: 0,
		ROUND_MANAGEMENT: 1
	},

	initialize: function () {
		this.callParent(arguments);

		this.questionObj = this.config.questionObj;

		this.questionResetButton = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'icon',
			text: Messages.RESET_QUESTION,
			imageCls: 'icon-renew',
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
			hidden: true,
			toggleConfig: {
				scope: this,
				label: false,
				value: this.isRoundManagementActive,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue) {
						var panel = this.getParent().getParent().getParent();

						if (newValue === 1 && oldValue === 0) {
							panel.prepareRoundManagementButtons();
						} else {
							panel.prepareStopTimerButtons();
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

		this.on('resize', this.onResize);
		this.addComponents();
	},

	addComponents: function () {
		this.twoRows = document.body.clientWidth < 380;
		var	components = this.twoRows ?
			this.getTwoRowedComponents() :
			this.getOneRowedComponents();

		this.add(components);
	},

	onResize: function () {
		var clientWidth = document.body.clientWidth;

		if (clientWidth >= 380 && this.twoRows ||
			clientWidth < 380 && !this.twoRows) {
			this.removeAll(false);
			this.addComponents();
		}
	},

	getOneRowedComponents: function () {
		return [{
			xtype: 'panel',
			layout:  this.config.layoutTemplate,
			items: [
				this.enableRoundManagementButton,
				this.statusButton,
				this.questionResetButton
			]
		}];
	},

	getTwoRowedComponents: function () {
		var firstRowComponents = [
			this.enableRoundManagementButton,
			this.statusButton
		];

		var secondRowComponents = [
			this.questionResetButton
		];

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

	updateEnableRoundManagementButtonState: function () {
		if (this.questionObj.piRound === 0 && !this.questionObj.piRoundFinished ||
			this.questionObj.piRound === 1 && !this.questionObj.piRoundFinished ||
			!this.enableRoundManagementButton.active) {
			this.enableRoundManagementButton.hide();
		} else {
			this.enableRoundManagementButton.show();
		}
	},

	updateQuestionResetButtonState: function (hasAnswers) {
		if (this.questionObj.piRound === 0 && !this.questionObj.piRoundFinished && !hasAnswers ||
			this.questionObj.piRound === 1 && !this.questionObj.piRoundFinished && !hasAnswers) {
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
