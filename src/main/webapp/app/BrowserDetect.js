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
// by http://www.quirksmode.org/js/detect.html
Ext.define('ARSnova.BrowserDetect', {
	/* jscs:enable */
	constructor: function () {
		var browser = this.searchString(this.dataBrowser) || "Unknown browser",
			userAgentVersion = this.searchVersion(navigator.userAgent);
		this.browser = browser;
		this.version = userAgentVersion || 0;
		this.os = this.searchString(this.dataOS) || "Unknown OS";
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
			return null;
		}
		var version = dataString.substr(index).match(/([0-9]+(\.[0-9]+)?)/);
		return version[1];
	},

	/* Do not change the order of these objects unless you know what you are
	 * doing! */
	dataBrowser: [{
		string: navigator.vendor,
		subString: "Apple Computer",
		identity: "Safari",
		versionSearch: "Version"
	}, {
		prop: window.opera,
		identity: "Opera",
		versionSearch: "Version"
	}, {
		string: navigator.userAgent,
		subString: "Edge/",
		identity: "Edge"
	}, {
		string: navigator.userAgent,
		subString: "MSIE ",
		identity: "Internet Explorer",
		versionSearch: "MSIE"
	}, {
		string: navigator.userAgent,
		subString: "Trident/",
		identity: "Internet Explorer",
		versionSearch: "rv"
	}, {
		string: navigator.userAgent,
		subString: "Firefox/",
		identity: "Firefox"
	}, {
		string: navigator.userAgent,
		subString: "Chrome/",
		identity: "Chrome"
	}, {
		string: navigator.userAgent,
		subString: "Android ",
		identity: "Android Browser",
		versionSearch: "Android"
	}, {
		string: navigator.userAgent,
		subString: "Gecko/",
		identity: "Mozilla",
		versionSearch: "rv"
	}],

	dataOS: [{
		string: navigator.userAgent,
		subString: "Windows Phone",
		identity: "Windows Phone"
	}, {
		string: navigator.platform,
		subString: "Win",
		identity: "Windows"
	}, {
		string: navigator.userAgent,
		subString: "iPad",
		identity: "iPad"
	}, {
		string: navigator.userAgent,
		subString: "iPhone",
		identity: "iPhone"
	}, {
		string: navigator.platform,
		subString: "Mac",
		identity: "Mac OS"
	}, {
		string: navigator.userAgent,
		subString: "Android",
		identity: "Android (Linux)"
	}, {
		string: navigator.platform,
		subString: "Linux",
		identity: "Linux"
	}]
});
}());
