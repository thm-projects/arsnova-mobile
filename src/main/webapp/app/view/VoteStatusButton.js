/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2019 The ARSnova Team and Contributors
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
Ext.define('ARSnova.view.VoteStatusButton', {
	extend: 'Ext.Panel',

	config: {
		wording: {
			release: Messages.RELEASE_VOTE,
			confirm: Messages.CONFIRM_CLOSE_VOTE,
			confirmMessage: Messages.CONFIRM_CLOSE_VOTE_MESSAGE
		},
		slideWording: {
			release: Messages.ALLOW_COMMENTS
		}
	},

	handler: null,
	isOpen: false,

	questionObj: null,
	parentPanel: null,

	constructor: function (args) {
		this.callParent(arguments);

		this.questionObj = args.questionObj;
		this.parentPanel = args.parentPanel;

		this.isOpen = this.questionObj && !this.questionObj.votingDisabled;
		var label = this.questionObj && this.questionObj.questionType === 'slide' ?
				this.getSlideWording().release : this.getWording().release;

		this.button = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'togglefield',
			text: label,
			disabledCls: '',
			scope: this,
			cls: this.getCls(),
			toggleConfig: {
				scope: this,
				label: false,
				value: this.isOpen ? 1 : 0,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
						if (newValue && !this.isOpen || !newValue && this.isOpen) {
							this.changeStatus();
						}
					}
				}
			}
		});

		this.add([this.button]);
	},

	changeStatus: function () {
		var me = this;
		var id = this.questionObj._id;
		this.button.disable();

		if (this.isOpen) {
			Ext.Msg.confirm(this.getWording().confirm, this.getWording().confirmMessage, function (buttonId) {
				if (buttonId !== "no") {
					/* close voting */
					ARSnova.app.questionModel.disableQuestionVoting(id, 1, {
						success: function (response) {
							me.votingClosedSuccessfully();
						},
						failure: function (records, operation) {
							Ext.Msg.alert(Messages.NOTIFICATION, Messages.QUESTION_COULD_NOT_BE_SAVED);
							this.button.enable();
						}
					});
				} else {
					me.button.setToggleFieldValue(true);
					this.button.enable();
				}
			}, this);
		} else {
			/* open voting */
			ARSnova.app.questionModel.disableQuestionVoting(id, 0, {
				success: function (response) {
					me.votingOpenedSuccessfully();
				},
				failure: function (records, operation) {
					Ext.Msg.alert(Messages.NOTIFICATION, Messages.QUESTION_COULD_NOT_BE_SAVED);
					this.button.enable();
				}
			});
		}
	},

	checkInitialStatus: function () {
		if (this.isRendered) {
			return;
		}

		if (!this.questionObj.votingDisabled) {
			this.isOpen = false;
			this.button.setToggleFieldValue(false);
		} else {
			this.isOpen = true;
			this.button.setToggleFieldValue(true);
		}
		this.isRendered = true;
	},

	updateData: function (questionObj) {
		this.questionObj = questionObj;
		this.toggleStatusButton(!questionObj.votingDisabled);
	},

	toggleStatusButton: function (active) {
		this.button.setToggleFieldValue(active);
		this.isOpen = active;
	},

	votingClosedSuccessfully: function () {
		this.isOpen = false;
		this.button.enable();

		if (this.parentPanel) {
			this.parentPanel.questionObj.votingDisabled = true;
		}
	},

	votingOpenedSuccessfully: function () {
		this.isOpen = true;
		this.button.enable();

		if (this.parentPanel) {
			this.parentPanel.questionObj.active = true;
			this.parentPanel.questionObj.votingDisabled = false;
		}
	}
});
