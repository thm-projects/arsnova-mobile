/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2021 The ARSnova Team and Contributors
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
Ext.define("ARSnova.controller.Version", {
	extend: 'Ext.app.Controller',

	info: {},
	promise: null,

	getInfo: function () {
		if (!this.promise) {
			var me = this;
			var backendPromise = new RSVP.Promise();
			var frontendPromise = new RSVP.Promise();
			var headers = {
				"Accept": "application/json"
			};
			this.promise = new RSVP.Promise();

			ARSnova.app.configLoaded.then(function () {
				Ext.Ajax.request({
					url: ARSnova.app.globalConfig.apiPath + "/",
					headers: headers,
					success: function (response) {
						me.info.backend = Ext.decode(response.responseText);
						backendPromise.resolve(me.info.backend);
					}
				});

				/* This request is not sent to the API so the RestProxy is not used  */
				Ext.Ajax.request({
					url: location.pathname + "resources/version.json",
					headers: headers,
					success: function (response) {
						me.info.frontend = Ext.decode(response.responseText);
						frontendPromise.resolve(me.info.frontend);
					}
				});
			});

			RSVP.all([backendPromise, frontendPromise]).then(function (infos) {
				console.log(me.info);
				me.promise.resolve(me.info);
			});
		}

		return this.promise;
	}
});
