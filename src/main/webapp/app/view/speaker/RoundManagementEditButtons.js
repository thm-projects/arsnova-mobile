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

	initialize: function () {
		this.callParent(arguments);

		this.questionObj = this.config.questionObj;

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

		this.add([
			this.statusButton,
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
