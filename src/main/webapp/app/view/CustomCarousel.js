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
Ext.define('ARSnova.view.CustomCarousel', {
	override: 'Ext.carousel.Carousel',

	initialize: function () {
		this.callParent();

		this.leftArrow = Ext.DomHelper.append(this.bodyElement, {
			tag: 'div',
			cls: 'carouselNavigationElement arrow-left hidden'
		}, true);

		this.rightArrow = Ext.DomHelper.append(this.bodyElement, {
			tag: 'div',
			cls: 'carouselNavigationElement arrow-right hidden'
		}, true);

		/** initialize navigation listeners */
		this.initializeNavigationListeners();

		/** dock indicator bar to top */
		this.dockIndicatorBarToTop();

		/** initialize carousel listeners */
		this.on('add', this.checkNavigationElements);
		this.on('resize', this.checkNavigationElements);
	},

	dockIndicatorBarToTop: function () {
		this.getIndicator().element.dom.style.bottom = "";

		this.on('add', function (carousel, item, index) {
			if (item.xtype === 'panel' && item.getActiveItem) {
				item.getActiveItem().setStyle('margin-top: 56px');
			}
		});
	},

	doSetActiveItem: function () {
		this.callParent(arguments);

		if (this.getMaxItemIndex() > 0) {
			this.checkNavigationElements();
		}
	},

	resetIndicatorPosition: function () {
		this.getIndicator().setLeft(0);
	},

	updateIndicatorPosition: function (position) {
		var indicator = this.getIndicator();

		if (position) {
			indicator.setActiveIndex(0);
			indicator.setActiveIndex(position);
		}
	},

	initializeNavigationListeners: function () {
		var self = this;

		this.leftArrow.on('tap', function () {
			self.previous();
		});

		this.rightArrow.on('tap', function () {
			self.next();
		});

		this.leftArrow.on('touchstart', function () {
			self.leftArrow.addCls('x-button-pressing');
		});

		this.rightArrow.on('touchstart', function () {
			self.rightArrow.addCls('x-button-pressing');
		});

		this.leftArrow.on('touchend', function () {
			self.leftArrow.removeCls('x-button-pressing');
		});

		this.rightArrow.on('touchend', function () {
			self.rightArrow.removeCls('x-button-pressing');
		});
	},

	checkNavigationElements: function () {
		var activeIndex = this.getActiveIndex(),
			innerItemCount = this.getInnerItems().length,
			screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width,
			showNavigationElements = screenWidth >= 840 && innerItemCount > 0 && activeIndex !== -1;

		if (showNavigationElements) {
			this.addCls('setMaxCaruselWidth');
		} else {
			this.removeCls('setMaxCaruselWidth');
		}

		if (showNavigationElements && activeIndex !== 0) {
			this.leftArrow.removeCls('hidden');
		} else {
			this.leftArrow.addCls('hidden');
		}

		if (showNavigationElements && activeIndex !== this.getMaxItemIndex()) {
			this.rightArrow.removeCls('hidden');
		} else {
			this.rightArrow.addCls('hidden');
		}
	}
});
