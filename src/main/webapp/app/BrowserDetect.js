(function () {
	/* jscs:disable validateIndentation */
	"use strict";
	// by http://www.quirksmode.org/js/detect.html
	Ext.define('ARSnova.BrowserDetect', {
		/* jscs:enable */
		constructor: function () {
			var browser = this.searchString(this.dataBrowser) || "An unknown browser",
			userAgentVersion = this.searchVersion(navigator.userAgent),
			appVersion = this.searchVersion(navigator.appVersion);
			this.browser = browser;
			this.version = userAgentVersion || appVersion || "an unknown version";
			this.OS = this.searchString(this.dataOS) || "an unknown OS";

			if (this.extractAndroidVersion() !== null) {
				this.browser = 'Android';
				this.version = this.searchVersion(
						this.extractAndroidVersion().match(/[1-9]+[0-9]*\.[0-9]+/));
			}
		},

		extractAndroidVersion: function () {
			// Should match 'Android x.y'
			var version = navigator.userAgent.match(/Android [1-9]+[0-9]*\.[0-9]+/);
			if (version === null) {
				return null;
			}
			return version.toString();
		},

		searchString: function (data) {
			for (var i = 0; i < data.length; i++) {
				var dataString = data[i].string;
				var dataProp = data[i].prop;
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if (dataString) {
					if (dataString.indexOf(data[i].subString) !== -1) {
						return data[i].identity;
					}
				} else if (dataProp) {
					return data[i].identity;
				}
			}
		},

		searchVersion: function (dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index === -1) {
				// iOS WebView Fallback
				return parseFloat(dataString);
			}
			return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
		},

		dataBrowser: [{
				string: navigator.userAgent,
				subString: "Chrome",
				identity: "Chrome"
			}, {
				string: navigator.userAgent,
				subString: "OmniWeb",
				versionSearch: "OmniWeb/",
				identity: "OmniWeb"
			}, {
				string: navigator.vendor,
				subString: "Apple",
				identity: "Safari",
				versionSearch: "Version"
			}, {
				prop: window.opera,
				identity: "Opera",
				versionSearch: "Version"
			}, {
				string: navigator.vendor,
				subString: "iCab",
				identity: "iCab"
			}, {
				string: navigator.vendor,
				subString: "KDE",
				identity: "Konqueror"
			}, {
				string: navigator.userAgent,
				subString: "Firefox",
				identity: "Firefox"
			}, {
				string: navigator.vendor,
				subString: "Camino",
				identity: "Camino"
			}, {
				// for newer Netscapes (6+)
				string: navigator.userAgent,
				subString: "Netscape",
				identity: "Netscape"
			}, {
				string: navigator.userAgent,
				subString: "MSIE",
				identity: "Explorer",
				versionSearch: "MSIE"
			}, {
				string: navigator.userAgent,
				subString: "Trident",
				identity: "Explorer",
				versionSearch: "rv"
			}, {
				string: navigator.userAgent,
				subString: "Gecko",
				identity: "Mozilla",
				versionSearch: "rv"
			}, {
				// for older Netscapes (4-)
				string: navigator.userAgent,
				subString: "Mozilla",
				identity: "Netscape",
				versionSearch: "Mozilla"
			}
		],

		dataOS: [{
				string: navigator.platform,
				subString: "Win",
				identity: "Windows"
			}, {
				string: navigator.platform,
				subString: "Mac",
				identity: "Mac"
			}, {
				string: navigator.userAgent,
				subString: "iPhone",
				identity: "iPhone/iPod"
			}, {
				string: navigator.platform,
				subString: "Linux",
				identity: "Linux"
			}
		]
	});
}
	());
