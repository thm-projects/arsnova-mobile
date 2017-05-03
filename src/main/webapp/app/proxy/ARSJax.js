/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
Ext.define('ARSnova.proxy.ARSJax', {
	extend: 'Ext.util.Observable',

	config: {
		maxStatusCodes: 8,
		notificationThreshold: 4
	},

	lastStatusCodes: [],

	constructor: function () {
		this.callParent(arguments);
	},

	request: function (options) {
		var me = this;
		var success = options.success || Ext.emptyFn,
			failure = options.failure || Ext.emptyFn;
		var prefix = (ARSnova.app.globalConfig ? ARSnova.app.globalConfig.apiPath : "") + "/";

		var headers = options.headers || {};
		headers.accept = "application/vnd.de.thm.arsnova.v2+json,application/json";
		if (ARSnova.app.checkMobileDeviceType()) {
			options.url = ARSnova.app.absoluteUrl + options.url;
		}

		Ext.Ajax.request({
			url: prefix + options.url,
			method: options.method,
			params: options.params,
			jsonData: options.jsonData,
			headers: headers,
			disableCaching: options.disableCaching,

			success: function (response) {
				me.handleCode(response.status);
				var fn = options[response.status] || success;
				fn.apply(this, arguments);
			},

			failure: function (response) {
				me.handleCode(response.status);
				var fn = options[response.status] || failure;
				fn.apply(this, arguments);
			}
		});
	},

	handleCode: function (statusCode) {
		this.lastStatusCodes.push(statusCode);
		if (this.lastStatusCodes.length > this.getMaxStatusCodes()) {
			this.lastStatusCodes.splice(0, 1);
		}
		var unauthorized = this.lastStatusCodes.filter(function (code) {
			return code === 401;
		});

		if (unauthorized.length > this.getNotificationThreshold()) {
			this.fireEvent("arsnova/arsjax/status/401");
		}
	}
});
