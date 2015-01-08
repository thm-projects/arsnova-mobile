/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
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
	toggleHrefPanelActive: function() {
		this.hrefPanelActive = !this.hrefPanelActive;
	},
	
	/** 
	 * check if used protocol is http/https 
	 */
	checkHrefProtocol: function(href) {
		switch(href.split(":")[0]) {
			case "http":
				if(Ext.browser.is.IE || Ext.browser.is.Safari) {
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
	initializeHrefOverride: function() {
		document.onclick = function (e) {
			e = e ||  window.event;
			var element = e.target || e.srcElement;
			var controller = ARSnova.app.getController('Application');

			if (element.tagName == 'A') {
				if(controller.checkHrefProtocol(element.href)) {
					if(!controller.hrefPanelActive) {
						controller.toggleHrefPanelActive();
						
						var previewPanel = ARSnova.app.activePreviewPanel;
						
						controller.embeddedPage = Ext.create('ARSnova.view.components.EmbeddedPageContainer', {
							title: element.innerHTML,
							onClickElement: element
						});
						
						if(previewPanel) {
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
	checkForPrivacyMode: function() {
		var privacyMode = false,
			cookieEnabled = (navigator.cookieEnabled) ? true : false;
		
		try {
			localStorage.setItem('storageTest', 1);
			localStorage.removeItem('storageTest');
			
			//if not IE4+ nor NS6+
			if (typeof navigator.cookieEnabled=="undefined" && !cookieEnabled){ 
				document.cookie= "cookieTest";
				cookieEnabled= (document.cookie.indexOf("cookieTest") != -1) ? true : false;
			}			
		} catch (e) {	
			privacyMode = true;
		}
		
		if(privacyMode || !cookieEnabled) {
			Ext.Viewport.setMasked({ 
				xtype: 'mask',
				listeners: {
					tap: function() { 
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
	initializeAdvancedScrolling: function() {
		if(Ext.os.is.Desktop) {
			var doScroll = function (e) {
				e = window.event || e;
				var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

				if(ARSnova.app.mainTabPanel == null) return;
				
				/** check if previewBox is activeItem */
				var scrollMe = ARSnova.app.innerScrollPanel ? ARSnova.app.innerScrollPanel :
					ARSnova.app.mainTabPanel.tabPanel.getActiveItem();
				
				if(scrollMe) {
					var scrollable = scrollMe.getActiveItem().getScrollable();
						
					/** check if tabPanel is activeItem */
					if(scrollable && typeof scrollable.getScroller === 'function') {
						scrollMe = scrollMe.getActiveItem();
					}

					if(scrollMe.disableScrolling) return;
					
					if(scrollMe.getScrollable()) {
						var scroller = scrollMe.getScrollable().getScroller();
						var maxPosition = scroller.getMaxPosition().y;
						var currentPos = scroller.position.y; 
					
						var newPos = currentPos;
						if (delta === 1) {
							if (currentPos >= 10) {
								newPos = currentPos - 10;
							}
							else {
								newPos = 0;
							}
						}
						else if (delta === -1) {
							if (currentPos <= maxPosition - 10) {
								newPos = currentPos + 10;
							}
							else {
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
	}
});
