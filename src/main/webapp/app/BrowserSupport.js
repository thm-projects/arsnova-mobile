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
(function () {
/* jscs:disable validateIndentation */
"use strict";
Ext.define('ARSnova.BrowserSupport', {
	/* jscs:enable */
	extend: 'Ext.Base',

	requires: ['ARSnova.BrowserDetect'],

	config: {
		supported: {
			"Chrome": 0,
			"Safari": 0,
			"Firefox": 22,
			"Opera": 15,
			"Explorer": 10,
			"Android": 2
		}
	},

	constructor: function (config) {
		this.initConfig(config);

		this.detect = Ext.create("ARSnova.BrowserDetect");
	},

	getRequiredBrowserVersion: function () {
		return this.getSupported()[this.detect.browser];
	},

	getRequiredBrowsers: function () {
		var browsers = [];
		var supported = this.getSupported();
		for (var browser in supported) {
			if (supported.hasOwnProperty(browser)) {
				browsers.push(browser);
			}
		}
		return browsers;
	},

	isBrowserSupported: function (updateRequiredCallback, browserUnsupportedCallback, scope) {
		if (this.getSupported()[this.detect.browser] !== undefined) {
			var hasMinimumVersion = this.getRequiredBrowserVersion() <= this.detect.version;
			if (!hasMinimumVersion) {
				updateRequiredCallback.call(scope || this, this.detect.browser, this.getRequiredBrowserVersion());
			}
		} else {
			browserUnsupportedCallback.call(scope || this, this.getRequiredBrowsers());
		}
	}
});
}());
