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
		if (typeof this.getSupported()[this.detect.browser] !== "undefined") {
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
