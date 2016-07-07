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
var splashscreen = (function (win) {
	var doc = win.document;

	/**
	 * Hides splashscreen by setting the CSS display property to "none"
	 */
	function hideSplashScreen() {
		doc.getElementById("splashScreenContainer").style.display = 'none';
	}

	/**
	 * Adds the class "showSplashScreenElement" to the loading indicator element
	 * in order to trigger a ease-in transition.
	 */
	function showLoadingIndicator() {
		doc.getElementById("loadingInd").classList.add('showSplashScreenElement');
	}

	/**
	 * Triggers ease-in transitions for splashscreen logo and label. Executes a timed
	 * function, which forces the splashscreen to close/hide after the specified time.
	 */
	function showInnerContainer(milliseconds, scaleWidth) {
		var innerSplashContainer = doc.getElementById('innerSplashScreenContainer');
		innerSplashContainer.style.width = scaleWidth ? '90%' : 'initial';
		innerSplashContainer.children[0].classList.add('showSplashScreenElement');
		innerSplashContainer.children[1].classList.add('showSplashScreenElement');

		setTimeout(function () {
			window.closeSplashScreen = true;
			if (window.ARSnova && ARSnova.app && typeof ARSnova.app.closeSplashScreen === 'function') {
				ARSnova.app.closeSplashScreen();
			} else {
				setTimeout(hideSplashScreen, 3000);
			}
		}, milliseconds);
	}

	/**
	 * Applies configured styles to the splashscreen html elements
	 */
	function applySplashScreenStyle(responseText, imgObject) {
		var response = JSON.parse(responseText);
		var imgElement = doc.getElementById('splashScreenLogo');
		var minDelay = typeof response.splashscreen.minDelay !== 'undefined' ?
			response.splashscreen.minDelay : 3000;

		// save config object
		window.arsnovaConfig = response;

		// preload splashscreen logo
		imgObject.src = response.splashscreen.logo;

		// function to call when loading of splashscreen logo finished
		imgElement.onload = function () {
			// show loading indicator
			showLoadingIndicator();

			var scaleWidth = imgObject.naturalWidth / imgObject.naturalHeight >= 2;
			var milliseconds = response.splashscreen && response.splashscreen.logo ||
				response.splashscreen.slogan ? minDelay : 1000;
			showInnerContainer(milliseconds, scaleWidth);
		};

		// function to call when loading of splashscreen logo failed
		imgElement.onerror = imgElement.onabort = function () {
			hideSplashScreen();
		};

		// apply styles from splashscreen configuration
		imgElement.src = response.splashscreen.logo;
		window.document.body.style.background = response.splashscreen.bgcolor || 'inital';
		doc.getElementById("splashScreenContainer").style.background = response.splashscreen.bgcolor;
		doc.getElementById("splashScreenSlogan").style.color = response.splashscreen.sloganColor;
		doc.getElementById("splashScreenSlogan").innerHTML = response.splashscreen.slogan;
		doc.styleSheets[0].insertRule('.circleLoadingInd div:before { background-color: ' +
			response.splashscreen.loadIndColor + ' !important }', 0);
	}

	return {
		hideSplashScreen: hideSplashScreen,
		showLoadingIndicator: showLoadingIndicator,
		applySplashScreenStyle: applySplashScreenStyle
	};
}(window));

/**
 * Self-invoking function. Sends a Ajax request in order to get the
 * splashscreen configuration from specified url (arsnova-backend).
 */
(function () {
	var doc = window.document;
	var xhttp = new XMLHttpRequest();
	var imgObject = new Image();
	var configUrl = '/arsnova-config';

	// listen for Ajax readyState changes
	xhttp.onreadystatechange = function () {
		if (xhttp.readyState === 4 && doc.readyState === 'complete') {
			if (xhttp.status === 200) {
				splashscreen.applySplashScreenStyle(xhttp.responseText, imgObject);
			} else {
				splashscreen.hideSplashScreen();
			}
		} else if (xhttp.readyState === 4) {
			window.onload = xhttp.status === 200 ? function () {
				splashscreen.applySplashScreenStyle(xhttp.responseText, imgObject);
			} : splashscreen.hideSplashScreen;
		}
	};

	// send the request
	xhttp.open("GET", window.location.origin + configUrl, true);
	xhttp.timeout = 1000;
	xhttp.send();
})();
