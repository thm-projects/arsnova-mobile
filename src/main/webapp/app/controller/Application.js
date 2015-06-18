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
Ext.define("ARSnova.controller.Application", {
	extend: 'Ext.app.Controller',

	config: {
		routes: {
		}
	},

	launch: function () {
		var me = this;
		me.hrefPanelActive = false;
		me.initializeOnClickOverride();
		me.initializeAdvancedScrolling();
		ARSnova.app.globalZoomLevel = 100;
	},

	/**
	 * toggles boolean value of hrefPanelActive
	 */
	toggleHrefPanelActive: function () {
		this.hrefPanelActive = !this.hrefPanelActive;
	},

	setGlobalZoomLevel: function (zoomLevel) {
		ARSnova.app.globalZoomLevel = zoomLevel;
	},

	/**
	 * initializes mathjax if feature is activated in configuration
	 */
	initializeMathJax: function () {
		var config = ARSnova.app.globalConfig;

		if (config.features.mathJax && !window.MathJax) {
			var head = document.getElementsByTagName("head")[0], script;
			var mathJaxSrc = config.mathJaxSrc || "//cdn.mathjax.org/mathjax/2.4-latest/MathJax.js";

			window.MathJax = {
				jax: ["input/TeX", "output/HTML-CSS"],
				extensions: ["tex2jax.js", "Safe.js"],
				TeX: {
					extensions: ["AMSmath.js", "AMSsymbols.js", "noErrors.js", "noUndefined.js"]
				},
				tex2jax: {
					inlineMath: [['\\(', '\\)'], ['\[\[', '\]\]']],
					processEscapes: true,
					preview: 'none'
				},
				messageStyle: 'none',
				showProcessingMessages: false,
				showMathMenu: false
			};

			script = document.createElement("script");
			script.type = "text/javascript";
			script.src = mathJaxSrc;
			head.appendChild(script);
		}
	},

	/**
	 * overrides onclick event handler in order to change behavior when an tag is clicked
	 */
	initializeOnClickOverride: function () {
		var touchStarted = false,
			currX = 0,
			currY = 0,
			cachedX = 0,
			cachedY = 0;

		var preventClick = function (e) {
			var prevent = false;
			e = e || window.event;
			var element = e.target || e.srcElement;

			if (element.tagName === 'IMG' && element.className === 'resizeableImage' ||
				element.tagName === 'SPAN' && element.className === 'videoImageContainer' ||
				element.tagName === 'A' && element.className !== 'session-export') {
				prevent = true;

				if (element.tagName === 'A' &&
					!ARSnova.app.getController('Application').checkHrefProtocol(element.href)) {
					element.target = '_blank'; // open link in new tab
					prevent = false;
				} else if (!!element.customMaskClick) {
					ARSnova.app.getController('Application').internalElementRefHandler(e);
					prevent = true;
				}
			}

			return prevent;
		};

		document.onclick = function (e) {
			return !preventClick(e);
		};

		Ext.get(document).on('touchend', function (e) {
			if (preventClick(e)) {
				e.preventDefault();
				touchStarted = false;
			}
		});

		Ext.get(document).on('touchmove', function (e) {
			if (preventClick(e)) {
				e.preventDefault();
				var pointer = e.targetTouches ? e.targetTouches[0] : e;
				currX = pointer.pageX;
				currY = pointer.pageY;
			}
		});

		Ext.get(document).on('touchstart', function (e) {
			if (preventClick(e)) {
				e.preventDefault();
				var pointer = e.targetTouches ? e.targetTouches[0] : e;
				cachedX = currX = pointer.pageX;
				cachedY = currY = pointer.pageY;
				touchStarted = true;
				setTimeout(function () {
					if ((cachedX === currX) && !touchStarted && (cachedY === currY)) {
						ARSnova.app.getController('Application').internalElementRefHandler(e);
					}
				}, 200);
			}
		});
	},

	internalElementRefHandler: function (e) {
		e = e || window.event;
		var element = e.target || e.srcElement;
		var controller = ARSnova.app.getController('Application');
		var videoLink = false;

		if (element.tagName === 'IMG' && element.className === 'resizeableImage') {
			controller.showLargerImage(element);
		}

		if (element.tagName === 'SPAN' && element.className === 'videoImageContainer') {
			videoLink = controller.checkVideoContent(element);
		}

		if (element.tagName === 'A' && element.className !== "session-export" || videoLink) {
			var url = !!videoLink ? videoLink : element.href;
			var title = !!videoLink ? element.title : element.innerHTML;

			if (controller.checkHrefProtocol(url)) {
				if (!controller.hrefPanelActive) {
					controller.toggleHrefPanelActive();
					controller.handleInternEmbeddedPageLoading(controller, title, url);
				}
			}
		}
	},

	checkVideoContent: function (element) {
		var url = false;

		switch (element.accessKey) {
			case 'vimeo':
				url = "https://player.vimeo.com/video/" + element.id + "?autoplay=1";
				break;
			case 'youtube':
				url = "https://www.youtube.com/embed/" + element.id + "?autoplay=1";
				break;
		}

		return url;
	},

	handleInternEmbeddedPageLoading: function (controller, title, url) {
		var previewPanel = ARSnova.app.activePreviewPanel;
		controller.embeddedPage = Ext.create('ARSnova.view.components.EmbeddedPageContainer', {
			title: title,
			url: url
		});

		controller.checkFrameOptionsHeader(url, controller, function () {
			if (previewPanel) {
				previewPanel.showEmbeddedPagePreview(controller.embeddedPage);
			} else {
				var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
				var speakerTP = tabPanel.speakerTabPanel;
				var activePanel = speakerTP ? speakerTP.getActiveItem() : tabPanel.getActiveItem();

				if (tabPanel.userTabPanel && activePanel === tabPanel.userQuestionsPanel ||
					speakerTP && activePanel === speakerTP.showcaseQuestionPanel) {
					activePanel.saveActiveIndex();
				}

				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(controller.embeddedPage, 'slide');
			}
		});
	},

	showLargerImage: function (element) {
		var offset = 15;
		var messageBox = Ext.create('Ext.MessageBox', {
			width: '100%',
			height: '100%',
			hideOnMaskTap: true,
			cls: 'largeImageWindow',
			listeners: {
				hide: function () {
					this.destroy();
				}
			}
		});

		var img = Ext.create('Ext.Img', {
			src: element.src,
			mode: 'image',
			listeners: {
				load: function () {
					messageBox.show();
					var parent = this.getParent();
					var parentWidth = parseInt(parent.element.getStyle('width'), 10);
					var parentHeight = parseInt(parent.element.getStyle('height'), 10);
					var imgComputedStyle = window.getComputedStyle(this.element.dom.firstChild, "");
					var width = parseFloat(imgComputedStyle.getPropertyValue("width"));
					var height = parseFloat(imgComputedStyle.getPropertyValue("height"));

					if (height === width) {
						if (parentHeight > parentWidth) {
							parent.setHeight(parentWidth);
							this.setWidth(parentWidth - offset);
							this.setHeight(parentWidth - offset);
						} else {
							parent.setWidth(parentHeight);
							this.setWidth(parentHeight - offset);
							this.setHeight(parentHeight - offset);
						}
					} else if (height > width) {
						this.setWidth('auto');
						parent.setWidth('auto');
						this.setHeight(parentHeight - offset);
					} else {
						this.setHeight('auto');
						parent.setHeight('auto');
						this.setWidth(parentWidth - offset);
					}
				}
			}
		});

		messageBox.add(img);
		messageBox.element.on('tap', function () {
			messageBox.hide();
		});
	},

	showNewWindowWarning: function (url) {
		var messageBox = Ext.create('Ext.MessageBox', {
			zIndex: 9999,
			title: Messages.NOTIFICATION,
			message: Messages.URL_COULD_NOT_BE_FRAMED,
			listeners: {
				hide: function () {
					this.destroy();
				}
			}
		});

		messageBox.setButtons([{
			text: Messages.CONTINUE,
			ui: 'action',
			handler: function () {
				window.open(url, '_blank');
				messageBox.hide();
			}
		}, {
			text: Messages.CANCEL,
			ui: 'action',
			handler: function () {
				messageBox.hide();
			}
		}]);

		messageBox.show();
	},

	/**
	 * check if used protocol is suitable for embeddedPage
	 */
	checkHrefProtocol: function (href) {
		var protocol = href.split(":")[0];

		if (protocol === "http" && (Ext.browser.is.IE || Ext.browser.is.Safari) ||
			protocol === "https") {
			return true;
		}

		return false;
	},

	checkFrameOptionsHeader: function (url, controller, callback) {
		ARSnova.app.restProxy.checkFrameOptionsHeader(url, {
			success: function () {
				callback.call();
			},
			failure: function () {
				controller.toggleHrefPanelActive();
				controller.showNewWindowWarning(url);
			}
		});
	},

	/**
	 * Checks availability of localStorage and cookies. Masks viewport if localStorage
	 * or cookies are not supported.
	 *
	 * @return true if localStorage/cookies are supported - returns false otherwise
	 */
	checkForPrivacyMode: function () {
		var privacyMode = false,
			cookieEnabled = (navigator.cookieEnabled) ? true : false;

		try {
			localStorage.setItem('storageTest', 1);
			localStorage.removeItem('storageTest');

			//if not IE4+ nor NS6+
			if (typeof navigator.cookieEnabled === "undefined" && !cookieEnabled) {
				document.cookie = "cookieTest";
				cookieEnabled = (document.cookie.indexOf("cookieTest") !== -1) ? true : false;
			}
		} catch (e) {
			privacyMode = true;
		}

		if (privacyMode || !cookieEnabled) {
			Ext.Viewport.setMasked({
				xtype: 'mask',
				listeners: {
					tap: function () {
						Ext.Msg.alert(
							Messages.PRIVACY_MODE_WARNING_TITLE,
							Messages.PRIVACY_MODE_WARNING_TEXT,
							Ext.emptyFn
						);
					}
				}
			});

			Ext.Viewport.getMasked().fireEvent('tap');
			return false;
		}

		return true;
	},

	/**
	 * adds mouse scrolling feature if app is used in desktop browser
	 */
	initializeAdvancedScrolling: function () {
		if (Ext.os.is.Desktop) {
			var doScroll = function (e) {
				e = window.event || e;
				var direction = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
				var acceleration = 40;
				var delta = 0;

				if (e.wheelDelta) {
					delta = e.wheelDelta / 120;
				} else if (e.detail) {
					delta = e.detail / 3;
				}

				if (ARSnova.app.mainTabPanel == null) {
					return;
				}

				/** check if previewBox is activeItem */
				var scrollMe = ARSnova.app.innerScrollPanel ? ARSnova.app.innerScrollPanel :
					ARSnova.app.mainTabPanel.tabPanel.getActiveItem();

				if (scrollMe) {
					var scrollable = scrollMe.getActiveItem().getScrollable();

					/** check if tabPanel is activeItem */
					if (scrollable && typeof scrollable.getScroller === 'function') {
						scrollMe = scrollMe.getActiveItem();
					}

					if (scrollMe.disableScrolling) {
						return;
					}

					if (scrollMe.getScrollable()) {
						var scroller = scrollMe.getScrollable().getScroller();
						var pixels = acceleration * (delta < 0 ? -delta : delta);
						var maxPosition = scroller.getMaxPosition().y;
						var currentPos = scroller.position.y;


						var newPos = currentPos;
						if (direction === 1) {
							if (currentPos >= pixels) {
								newPos = currentPos - pixels;
							} else {
								newPos = 0;
							}
						} else if (direction === -1) {
							if (currentPos <= maxPosition - pixels) {
								newPos = currentPos + pixels ;
							} else {
								newPos = maxPosition;
							}
						}

						scroller.scrollTo(0, newPos);
					}
				}

				e.preventDefault();
			};

			if (window.addEventListener) {
				window.addEventListener("mousewheel", doScroll, false);
				window.addEventListener("DOMMouseScroll", doScroll, false);
			} else {
				window.attachEvent("onmousewheel", doScroll);
			}
		}
	},

	showQRCode: function () {
		var url = window.location + 'id/' + sessionStorage.getItem('keyword'),
			heightOffset = 110, widthOffset = 60;

		var messageBox = Ext.create('Ext.MessageBox', {
			cls: 'qr-code',
			hideOnMaskTap: true,
			listeners: {
				hide: function () {
					this.destroy();
				}
			}
		}).show();

		var messageBoxCS = window.getComputedStyle(messageBox.element.dom, "");
		var height = parseFloat(messageBoxCS.getPropertyValue("height")) - heightOffset;
		var width = parseFloat(messageBoxCS.getPropertyValue("width")) - widthOffset;

		if (width > height) {
			width = height;
		} else if (height > width) {
			height = width;
			messageBox.setHeight(width + heightOffset);
		}

		messageBox.element.on('*', function (e) {
			switch (e.type) {
				case 'mouseup':
				case 'mousedown':
				case 'touchstart':
				case 'touchend': {
					messageBox.hide();
				}
			}
		});

		var messageInner = messageBox.element.select('.x-msgbox-inner').elements[0];
		new window.QRCode(document.getElementById(messageInner.id), {
			text: url,
			width: width,
			height: height,
			colorDark: "#000000",
			colorLight: "#FFFFFF"
		});

		messageBox.setMessage(window.location + 'id/&#8203;' + sessionStorage.getItem('keyword'));
	}
});
