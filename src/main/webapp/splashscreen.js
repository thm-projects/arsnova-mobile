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
(function () {
	var doc = window.document;
	var xhttp = new XMLHttpRequest();
	var splashscreenImage = new Image();
	var configUrl = '/arsnova-config';

	var showContainer = function (timer) {
		var innerSplashContainer = doc.getElementById('innerSplashScreenContainer');

		if (innerSplashContainer) {
			innerSplashContainer.style.display = 'initial';
			innerSplashContainer.classList.remove('isPaused');

			setTimeout(function () {
				window.closeSplashScreen = true;
				if (ARSnova && ARSnova.app) {
					ARSnova.app.closeSplashScreen();
				}
			}, timer);
		}
	};

	var applySplashScreenStyle = function (response) {		
		var imgElement = doc.getElementById('splashScreenLogo');
		splashscreenImage.src = response.splashscreen.logo;

		imgElement.onload = imgElement.onerror = imgElement.onabort = function () { 
			showContainer(response && response.splashscreen && response.splashscreen.logo
				|| !response.splashscreen.slogan ? 3000 : 1000);
		};

		imgElement.src = response.splashscreen.logo;
		doc.body.style.background = response.splashscreen.bgColor;
		doc.getElementById("splashScreenSlogan").innerHTML = response.splashscreen.slogan;
		doc.styleSheets[0].insertRule('.circleLoadingInd div:before { background-color: ' +
			response.splashscreen.loadIndColor + ' !important }', 0);
	};

	var destroySplashscreen = function () {
		if (doc.readyState === 'complete') {
			doc.getElementById("splashScreenContainer").style.display = 'none';
		} else {
			window.onload = function () {
				doc.getElementById("splashScreenContainer").style.display = 'none';
			};
		}
	};

	xhttp.onreadystatechange = function() {
		if (xhttp.readyState === 4) {
			if (xhttp.status === 200) {
				var response = JSON.parse(xhttp.responseText);
				if (doc.readyState === 'complete') {
					applySplashScreenStyle(response);
				} else {
					window.onload = function () {
						applySplashScreenStyle(response);
					};
				}
			} else {
				destroySplashscreen();
			}
		}
	};

	xhttp.open("GET", window.location.origin + configUrl, true);
	xhttp.timeout = 1000;
	xhttp.send();
})();