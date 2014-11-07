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
Ext.define('ARSnova.view.CustomMessageBox', {
	override: 'Ext.MessageBox',

	config: {
		showAnimation: {
			type: 'fade',
			duration: 200
		}
	},
	/* Workaround for Google Chrome 34 (MessageBox sometimes cannot be closed).
	 * TODO: Remove as soon as fixed by Sencha or in Chrome */
	hide: function () {
		if (this.activeAnimation && this.activeAnimation._onEnd) {
			this.activeAnimation._onEnd();
		}
		return this.callParent(arguments);
	},

	confirm: function (title, message, fn, scope) {
		this.callParent(arguments);

		return this.show({
			title: title || null,
			message: message || null,
			buttons: [
				{text: Messages.YES, itemId: 'yes', ui: 'action'},
				{text: Messages.NO,  itemId: 'no', ui: 'action'}
			],
			promptConfig: false,
			scope: scope,
			fn: function () {
				if (fn) {
					fn.apply(scope, arguments);
				}
			}
		});
	}
});
