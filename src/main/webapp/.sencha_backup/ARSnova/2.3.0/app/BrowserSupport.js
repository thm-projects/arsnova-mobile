Ext.define('ARSnova.BrowserSupport', {
	extend: 'Ext.Base',
	
	requires: ['ARSnova.BrowserDetect'],
	
	config: {
		supported: {
			"Chrome" : 0,
			"Safari" : 0,
			"Firefox" : 22,
			"Opera" : 15,
			"Explorer" : 10,
			"Android" : 2
		}
	},
	
	constructor: function(config) {
		this.initConfig(config);
		
		this.detect = Ext.create("ARSnova.BrowserDetect");
	},
	
	getRequiredBrowserVersion: function() {
		return this.getSupported()[this.detect.browser];
	},
	
	getRequiredBrowsers: function() {
		var browsers = [];
		for (var browser in this.getSupported()) {
			// hasOwnProperty does not seem to work here
			browsers.push(browser);
		}
		return browsers;
	},
	
	isBrowserSupported: function(updateRequiredCallback, browserUnsupportedCallback, scope) {
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