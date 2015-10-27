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
var splashscreen = (function (win) { 
	var doc = win.document;

	function showLoadingIndicator () {
		doc.getElementById("loadingInd").classList.add('showSplashScreenElement');
	}

	function hideSplashScreen () {
		doc.getElementById("splashScreenContainer").style.display = 'none';
	}

	function showContainer (timer, scaleWidth) {
		var innerSplashContainer = doc.getElementById('innerSplashScreenContainer');
		innerSplashContainer.style.width = scaleWidth ? '90%' : 'initial';
		innerSplashContainer.children[0].classList.add('showSplashScreenElement');
		innerSplashContainer.children[1].classList.add('showSplashScreenElement');

		setTimeout(function () {
			window.closeSplashScreen = true;
			if (ARSnova && ARSnova.app && typeof ARSnova.app.closeSplashScreen === 'function') {
				ARSnova.app.closeSplashScreen();
			} else {
				hideSplashscreen();
			}
		}, timer);
	}

	function applySplashScreenStyle (response, imgObject) {
		var imgElement = doc.getElementById('splashScreenLogo');

		showLoadingIndicator();
		imgObject.src = response.splashscreen.logo;
		imgElement.onload = imgElement.onerror = imgElement.onabort = function () { 
			scaleWidth = imgObject.naturalWidth / imgObject.naturalHeight >= 2;
			showContainer(response && response.splashscreen && response.splashscreen.logo
				|| response.splashscreen.slogan ? 3000 : 1000, scaleWidth);
		};

		imgElement.src = response.splashscreen.logo;
		doc.body.style.background = response.splashscreen.bgColor;
		doc.getElementById("splashScreenSlogan").innerHTML = response.splashscreen.slogan;
		doc.styleSheets[0].insertRule('.circleLoadingInd div:before { background-color: ' +
			response.splashscreen.loadIndColor + ' !important }', 0);
	}

	return {
		hideSplashScreen: hideSplashScreen,
		showLoadingIndicator: showLoadingIndicator,
		applySplashScreenStyle: applySplashScreenStyle
	};
} (window));

(function () {
	var doc = window.document;
	var xhttp = new XMLHttpRequest();
	var imgObject = new Image();
	var configUrl = '/arsnova-config';

	xhttp.onreadystatechange = function() {
		if (xhttp.readyState === 4) {
			if (xhttp.status === 200) {
				var response = JSON.parse(xhttp.responseText);
				if (doc.readyState === 'complete') {
					splashscreen.applySplashScreenStyle(response, imgObject);
				} else {
					window.onload = function () {
						splashscreen.applySplashScreenStyle(response, imgObject);
					};
				}
			} else {
				if (doc.readyState === 'complete') {
					splashscreen.hideSplashScreen();
				} else {
					window.onload = splashscreen.hideSplashScreen;
				}
			}
		}
	};

	xhttp.open("GET", window.location.origin + configUrl, true);
	xhttp.timeout = 1000;
	xhttp.send();
})();
