/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2016 The ARSnova Team
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
Ext.define('ARSnova.model.LoggedIn', {
	extend: 'Ext.data.Model',

	config: {
		proxy: {type: 'restProxy'}
	},

	activeUserCount: 0,

	constructor: function () {
		this.callParent(arguments);

		ARSnova.app.socket.addListener("arsnova/socket/activeusercount/update", function (count) {
			this.activeUserCount = count;
		}, this);
	},

	resetActiveUserCount: function () {
		this.activeUserCount = 0;
	},

	countActiveUsersBySession: function (sessionKeyword, callbacks) {
		return this.activeUserCount;
	}
});
