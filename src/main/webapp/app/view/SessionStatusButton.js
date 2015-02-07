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
Ext.define('ARSnova.view.SessionStatusButton', {
	extend: 'Ext.Panel',

	config: {
		cls: ''
	},

	handler: null,
	isOpen: false,

	sessionIsOpenButton: null,
	sessionIsClosedButton: null,

	initialize: function () {
		this.callParent(arguments);

		this.sessionIsClosed = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'icon',
			cls: 'actionButton',
			text: Messages.START_SESSION,
			imageCls: 'icon-unlock',
			imageStyle: {
				'font-size': '64px',
				'margin-top': '9px !important'
			},
			handler: function () {
				ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.sessionStatusButton.changeStatus();
			}
		});

		this.sessionIsOpen = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'icon',
			cls: 'actionButton',
			text: Messages.STOP_SESSION,
			imageCls: 'icon-lock',
			imageStyle: {
				'font-size': '64px',
				'margin-top': '9px !important'
			},
			handler: function () {
				ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.sessionStatusButton.changeStatus();
			}
		});

		this.add([this.sessionIsClosed, this.sessionIsOpen]);

		if (localStorage.getItem('active') === "1") {
			this.isOpen = true;
			this.sessionIsClosed.hide();
		} else {
			this.isOpen = false;
			this.sessionIsOpen.hide();
		}
	},

	changeStatus: function () {
		if (this.isOpen) {
			Ext.Msg.confirm(Messages.CONFIRM_CLOSE_SESSION, Messages.CONFIRM_CLOSE_SESSION_MESSAGE, function (buttonId) {
				if (buttonId !== "no") {
					/* close this session */
					ARSnova.app.getController('Sessions').setActive({
						active: 0,
						callback: this.sessionClosedSuccessfully
					});
				}
			}, this);
		} else {
			/* open this session */
			ARSnova.app.getController('Sessions').setActive({
				active: 1,
				callback: this.sessionOpenedSuccessfully
			});
		}
	},

	checkInitialStatus: function () {
		if (this.isRendered) return;

		if (localStorage.getItem('active') === "1") {
			this.isOpen = true;
		} else {
			this.isOpen = false;
		}
		this.isRendered = true;
	},

	sessionClosedSuccessfully: function () {
		this.isOpen = false;
		this.sessionIsClosed.show();
		this.sessionIsOpen.hide();
	},

	sessionOpenedSuccessfully: function () {
		this.isOpen = true;
		this.sessionIsOpen.show();
		this.sessionIsClosed.hide();
	}
});
