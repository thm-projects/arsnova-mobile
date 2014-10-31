/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
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
Ext.define('ARSnova.view.QuestionStatusButton', {
	extend: 'Ext.Panel',

	config: {
		wording: {
			stop: Messages.STOP_QUESTION,
			release: Messages.RELEASE_QUESTION,
			confirm: Messages.CONFIRM_CLOSE_QUESTION,
			confirmMessage: Messages.CONFIRM_CLOSE_QUESTION_MESSAGE
		}
	},

	handler: null,
	isOpen: false,

	questionObj: null,

	questionIsOpenButton: null,
	questionIsClosedButton: null,

	constructor: function (args) {
		this.callParent(arguments);

		this.questionObj = args.questionObj;
		
		this.questionIsClosedButton = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'icon',
			text: this.getWording().release,
			imageCls: 'icon-play thm-green',
			imageStyle: {
				'font-size': '52px',
				'margin-top': '14px',
				'margin-left': '18px'
			},
			scope: this,
			handler: function () {
				this.changeStatus();
			}
		});

		this.questionIsOpenButton = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'icon',
			text: this.getWording().stop,
			imageCls: 'icon-pause',
			imageStyle: {
				'font-size': '52px',
				'margin-top': '14px',
				'margin-left': '18px'
			},
			scope: this,
			handler: function () {
				this.changeStatus();
			}
		});

		this.add([this.questionIsClosedButton, this.questionIsOpenButton]);

		if (this.questionObj && this.questionObj.active == 1) {
			this.isOpen = true;
			this.questionIsClosedButton.hide();
		} else {
			this.isOpen = false;
			this.questionIsOpenButton.hide();
		}
	},

	changeStatus: function () {
		var id = this.questionObj._id;

		if (this.isOpen) {
			Ext.Msg.confirm(this.getWording().confirm, this.getWording().confirmMessage, function (buttonId) {
				if (buttonId != "no") {
					/* close this question */
					ARSnova.app.getController('Questions').setActive({
						questionId: id,
						active: 0,
						callback: this.questionClosedSuccessfully
					});
				}
			}, this);
		} else {
			/* open this question */
			ARSnova.app.getController('Questions').setActive({
				questionId: id,
				active: 1,
				callback: this.questionOpenedSuccessfully
			});
		}
	},

	checkInitialStatus: function () {
		if (this.isRendered) return;

		if (localStorage.getItem('active') == 1) {
			this.isOpen = true;
		} else {
			this.isOpen = false;
		}
		this.isRendered = true;
	},

	questionClosedSuccessfully: function () {
		this.isOpen = false;
		this.questionIsClosedButton.show();
		this.questionIsOpenButton.hide();
	},

	questionOpenedSuccessfully: function () {
		this.isOpen = true;
		this.questionIsOpenButton.show();
		this.questionIsClosedButton.hide();
	}
});
