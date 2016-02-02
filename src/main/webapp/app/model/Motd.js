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
Ext.define('ARSnova.model.Motd', {
	extend: 'ARSnova.model.ARSmodel',

	config: {
		proxy: {type: 'restProxy'},

		fields: [
			'startdate',
			'enddate',
			'title',
			'text',
			'motdkey',
			'audience',
			'sessionkey',
			'_id',
			'_rev'
		],

		validations: [
			{
				type: 'presence',
				field: 'startdate',
				message: Messages.MOTD_NOTIFICATION_STARTDATE
			}, {
				type: 'presence',
				field: 'enddate',
				message: Messages.MOTD_NOTIFICATION_ENDDATE
			}, {
				type: 'presence',
				field: 'title',
				message: Messages.MOTD_NOTIFICATION_TITLE
			}, {
				type: 'presence',
				field: 'text',
				message: Messages.MOTD_NOTIFICATION_TEXT
			}
		],

		idProperty: 'motdkey'
	},

	getMotd: function (motdkey, callbacks) {
		return this.getProxy().getMotd(motdkey, callbacks);
	},

	saveMotd: function (callbacks) {
		return this.getProxy().saveMotd(this, callbacks);
	},

	updateMotd: function (callbacks) {
		return this.getProxy().updateMotd(this, callbacks);
	},

	destroy: function (motdObj, callbacks) {
		return this.getProxy().deleteMotd(motdObj, callbacks);
	},

	getAllMotds: function (callbacks) {
		return this.getProxy().getAllMotds(callbacks);
	},

	getAllSessionMotds: function (key, callbacks) {
		return this.getProxy().getAllSessionMotds(key, callbacks);
	}
});
