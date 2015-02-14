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
		this.hrefPanelActive = false;

		me.initializeHrefOverride();
		me.initializeAdvancedScrolling();
	},

	/**
	 * toggles boolean value of hrefPanelActive
	 */
	toggleHrefPanelActive: function () {
		this.hrefPanelActive = !this.hrefPanelActive;
	},

	/**
	 * initializes mathjax if feature is activated in configuration
	 */
	initializeMathJax: function() {
		var config = ARSnova.app.globalConfig;

		if(config.features.mathJax && !window.MathJax) {
			var head = document.getElementsByTagName("head")[0], script;
			var mathJaxSrc = config.mathJaxSrc || "//cdn.mathjax.org/mathjax/2.4-latest/MathJax.js";

			window.MathJax = {
				jax: ["input/TeX","output/HTML-CSS"],
				extensions: ["tex2jax.js","Safe.js"],
				TeX: {
					extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
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
	 * check if used protocol is http/https
	 */
	checkHrefProtocol: function (href) {
		switch (href.split(":")[0]) {
			case "http":
				if (Ext.browser.is.IE || Ext.browser.is.Safari) {
					return true;
				}
				break;
			case "https":
				return true;
				break;
		}

		return false;
	},

	/**
	 * overrides onclick event handler in order to change behavior when an a-tag is clicked
	 */
	initializeHrefOverride: function () {
		document.onclick = function (e) {
			e = e || window.event;
			var element = e.target || e.srcElement;
			var controller = ARSnova.app.getController('Application');

			if (element.tagName === 'A' && element.className !== "session-export") {
				if (controller.checkHrefProtocol(element.href)) {
					if (!controller.hrefPanelActive) {
						controller.toggleHrefPanelActive();

						var previewPanel = ARSnova.app.activePreviewPanel;

						controller.embeddedPage = Ext.create('ARSnova.view.components.EmbeddedPageContainer', {
							title: element.innerHTML,
							onClickElement: element
						});

						if (previewPanel) {
							previewPanel.showEmbeddedPagePreview(controller.embeddedPage);
						} else {
							ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(controller.embeddedPage, 'slide');
						}
					}

					return false; // prevent default action and stop event propagation
				} else {
					element.target = '_blank'; // open link in new tab
				}
			}
		};
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
			if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) {
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

				if (ARSnova.app.mainTabPanel == null) return;

				/** check if previewBox is activeItem */
				var scrollMe = ARSnova.app.innerScrollPanel ? ARSnova.app.innerScrollPanel :
					ARSnova.app.mainTabPanel.tabPanel.getActiveItem();

				if (scrollMe) {
					var scrollable = scrollMe.getActiveItem().getScrollable();

					/** check if tabPanel is activeItem */
					if (scrollable && typeof scrollable.getScroller === 'function') {
						scrollMe = scrollMe.getActiveItem();
					}

					if (scrollMe.disableScrolling) return;

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
	
	showQRCode: function() {
		var url = window.location + 'id/' + sessionStorage.getItem('keyword'),
			heightOffset = 110, widthOffset = 60;

		var messageBox = Ext.create('Ext.MessageBox', {
			cls: 'qr-code',
			title: 'QR-Code',
			hideOnMaskTap: true,
			listeners: {
				hide: function() {
					this.destroy();
				}
			}
		}).show();

		var messageBoxCS = window.getComputedStyle(messageBox.element.dom, "");
		var height = parseFloat(messageBoxCS.getPropertyValue("height")) - heightOffset;
		var width = parseFloat(messageBoxCS.getPropertyValue("width")) - widthOffset;

		if(width > height) width = height;
		else if (height > width) {
			height = width;
			messageBox.setHeight(width + heightOffset);
		}

		messageBox.element.on('*', function(e) {
			switch(e.type) {
				case 'mouseup':
				case 'mousedown':
				case 'touchstart':
				case 'touchend': {
					messageBox.hide();
				}
			}
		});

		var messageInner = messageBox.element.select('.x-msgbox-inner').elements[0];
		new QRCode(document.getElementById(messageInner.id), {
		    text: url,
		    width: width,
		    height: height,
		    colorDark : "#000000",
		    colorLight : "#ffffff"
		});

		messageBox.setMessage(window.location + 'id/&#8203;' + sessionStorage.getItem('keyword'));
	}
});
