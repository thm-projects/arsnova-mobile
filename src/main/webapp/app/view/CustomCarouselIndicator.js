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
Ext.define('ARSnova.view.CustomCarouselIndicator', {
	override: 'Ext.carousel.Indicator',

	initialize: function() {
		this.callParent();
		this.hasItems = false;
	},

	addIndicator: function() {
		this.indicators.push(this.element.createChild({
			tag: 'span'
		}));

		if(!this.hasItems) {
			var me = this;
			var indicator = this.indicators[0].dom;
			var itemRect = indicator.getBoundingClientRect();

			this.marginLeftRight = parseFloat(window.getComputedStyle(indicator, "").getPropertyValue("margin-left"));
			this.marginTopBottom = parseFloat(window.getComputedStyle(indicator, "").getPropertyValue("margin-top"));
			this.elementWidth = itemRect.right - itemRect.left + (2 * this.marginLeftRight);

			var resizeTask = function() {
				if(me.indicators.length && me.hasItems) {
					var calcWidth = me.indicators.length * me.elementWidth;

					me.screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
					me.setWidth(calcWidth < me.screenWidth ? me.screenWidth : calcWidth);
				}
			};

			this.parent.on('resize', resizeTask);
			this.parent.on('indicatorAdd', resizeTask);
			this.hasItems = true;
		}

		this.parent.fireEvent('indicatorAdd');
	},

	onTap: function(e) {
		var carousel = this.parent,
			target = e.touch.target,
			activeItem = this.activeIndex,
			itemList = this.bodyElement.dom.children,
			itemArray = [].slice.call(itemList),
			targetIndex = itemArray.indexOf(target);

		if(targetIndex === -1 || targetIndex === activeItem) {
			var touch = e.touch,
				firstElement = itemArray[0],
				itemBounding = firstElement.getBoundingClientRect(),
				index = Math.floor((touch.pageX - itemBounding.left + this.marginLeftRight) / this.elementWidth);

			if(itemArray[index]) targetIndex = index;
			if(targetIndex === -1 || targetIndex === activeItem) {
				return this;
			}
		}

		this.animationDirection = activeItem > targetIndex ? 0 : 1;

		if (this.animationDirection) {
			targetIndex = targetIndex - 1;
			if (activeItem === carousel.getMaxItemIndex()) {
				return this;
			}

			carousel.setActiveItem(targetIndex);
			carousel.next();
		}

		else {
			targetIndex = targetIndex + 1;
			if (activeItem === 0) {
				return this;
			}

			carousel.setActiveItem(targetIndex);
			carousel.previous();
		}
	},

	setActiveIndex: function(index) {
		var indicators = this.indicators,
			currentActiveIndex = this.activeIndex,
			currentActiveItem = indicators[currentActiveIndex],
			activeItem = indicators[index],
			baseCls = this.getBaseCls();

		if (currentActiveItem) {
			currentActiveItem.removeCls(baseCls, null, 'active');
		}

		if (activeItem) {
			activeItem.addCls(baseCls, null, 'active');
		}

		this.activeIndex = index;

		var element = this.bodyElement.dom.children[0];
		this.animationDirection = currentActiveIndex > index ? 0 : 1;

		if(element && activeItem && index !== currentActiveIndex && currentActiveIndex !== -1) {
			var lastElement = indicators[indicators.length - 1],
				lastElementRightPos = lastElement.dom.getBoundingClientRect().right,
				itemRect = activeItem.dom.getBoundingClientRect(),
				maxRight = this.screenWidth,
				leftPos = this.getLeft();

			if(lastElementRightPos + Math.abs(leftPos) > maxRight) {
				var offsetPos = 5;

				if (this.animationDirection) {
					var position = itemRect.left,
						elementsTillMaxPos = Math.ceil((maxRight - position) / this.elementWidth);

					if(elementsTillMaxPos < offsetPos) {
						// offsetPos is added in order to simulate a slight movement
						this.setLeft(leftPos - (this.elementWidth * (offsetPos - elementsTillMaxPos)) + offsetPos);
					}
				} else {
					if(itemRect.left + Math.abs(leftPos) < maxRight) {
						this.setLeft(0);
					} else if(leftPos < 0) {
						// offsetPos is added in order to simulate a slight movement
						this.setLeft(leftPos + (this.elementWidth * (currentActiveIndex - index)) - offsetPos);
					}
				}
			}
		}

		return this;
	}
});
