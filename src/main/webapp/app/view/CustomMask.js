/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2021 The ARSnova Team and Contributors
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
Ext.define('ARSnova.view.CustomMask', {
	extend: 'Ext.Container',
	xtype: 'custom-mask',

	config: {
		baseCls: Ext.baseCSSPrefix + 'mask',
		cls: 'displayInherit',
		transparent: false,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	/**
	 * needs the masked panel as argument, as the panel has to react on mask scrolling events
	 */
	initialize: function () {
		this.callParent(arguments);

		var scroller = this.getScrollable().getScroller();
		this.overwriteScrollerMaxPosition(scroller, this.config.mainPanel);
		this.element.down('.x-mask-inner').removeCls('x-mask-inner');

		this.textElement = Ext.DomHelper.append(this.element, {
			tag: 'div',
			cls: 'customMaskTextElement'
		});

		scroller.on('*', 'onScrollEvent', this);
		this.element.on('*', 'onEvent', this);
		this.on({hide: 'onHide'});
	},

	setTextMessage: function (text, cls) {
		this.textElement.innerHTML = text;
		if (cls) {
			this.textElement.className = 'customMaskTextElement ' + cls;
		}
	},

	onHide: function () {
		Ext.util.InputBlocker.unblockInputs();

		if (Ext.browser.is.AndroidStock4 && Ext.os.version.getMinor() === 0) {
			var firstChild = this.element.getFirstChild();
			if (firstChild) {
				firstChild.redraw();
			}
		}
	},

	onEvent: function (e) {
		var controller = arguments[arguments.length - 1];

		if (controller.info.eventName === 'tap') {
			this.fireEvent('tap', this, e);
			this.performClickOnMaskedElement(e);
		}

		return false;
	},

	onScrollEvent: function (e) {
		var controller = arguments[arguments.length - 1],
			mainScroller = this.config.mainPanel.getScrollable().getScroller();

		switch (controller.info.eventName) {
			case 'scrollStart':
			case 'scrollEnd':
			case 'scroll':
				mainScroller.scrollTo(e.position.x, e.position.y);
				break;
		}

		return false;
	},

	performClickOnMaskedElement: function (event) {
		var x = event.pageX, y = event.pageY;
		var containers = [], clicked = false;
		var el = document.elementFromPoint(x, y);
		var timeoutTries = 30, counter = 0;

		while (el && el.tagName !== "BODY" && el.tagName !== "HTML" && counter < timeoutTries) {
			containers.push(el);
			el.style.display = "none";
			if (this.isClickableElement(el)) {
				break;
			}

			el = document.elementFromPoint(x, y);
			counter++;
		}

		for (var i = 0; i < containers.length; i++) {
			var container = containers[i];
			container.style.display = "";

			// perform fake click on underlying element
			if (!clicked) {
				if (this.isClickableElement(container)) {
					var component = Ext.getCmp(container.id);

					if (component) {
						if (!component.getDisabled()) {
							component.fireAction("tap", [component, event], 'doTap');
							container.customMaskClick = true;
						}
					} else {
						container.customMaskClick = true;

						if (container.click) {
							container.click();
						} else if (document.createEvent) {
							if (event.target !== container) {
								var evt = document.createEvent("MouseEvents");
								evt.initMouseEvent("click", true, true, window,
									0, 0, 0, 0, 0, false, false, false, false, 0, null);
								container.dispatchEvent(evt);
							}
						}
					}
					clicked = true;
				}
			}
		}
	},

	isClickableElement: function (el) {
		return el.tagName === 'IMG' && el.className === 'resizeableImage' ||
			el.tagName === 'SPAN' && el.className === 'videoImageContainer' ||
			el.tagName === 'A' && el.className === 'hyperlink' ||
			el.tagName === 'DIV' && el.className.split(" ").indexOf("maskClickable") !== -1;
	},

	overwriteScrollerMaxPosition: function (scroller, mainPanel) {
		scroller.getMaxPosition = function () {
			var mainScroller = mainPanel.getScrollable().getScroller(),
				maxPosition = mainScroller.maxPosition,
				size, containerSize;

			if (!maxPosition) {
				size = mainScroller.getSize();
				containerSize = mainScroller.getContainerSize();

				this.maxPosition = maxPosition = {
					x: Math.max(0, size.x - containerSize.x),
					y: Math.max(0, size.y - containerSize.y)
				};

				this.fireEvent('maxpositionchange', this, maxPosition);
			}

			return maxPosition;
		};
	},

	updateTransparent: function (newTransparent) {
		this[newTransparent ? 'addCls' : 'removeCls'](this.getBaseCls() + '-transparent');
	}
});
