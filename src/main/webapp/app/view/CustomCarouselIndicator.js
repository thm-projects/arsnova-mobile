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
	
	onTap: function(e) {
		var carousel = this.parent;
			target = e.touch.target,
			activeItem = this.activeIndex,
			itemList = this.bodyElement.dom.children,
			itemArray = [].slice.call(itemList),
			targetIndex = itemArray.indexOf(target);
						
		if(targetIndex === -1 || targetIndex === activeItem) {
			var touch = e.touch,
				itemBounding;
			
			itemArray.some(function(element, index) {
				itemBounding = element.getBoundingClientRect();
				margin = parseFloat(window.getComputedStyle(element, "").getPropertyValue("margin"));
				
				if(	touch.pageX < itemBounding.right + margin && 
					touch.pageX > itemBounding.left - margin ||
					touch.pageY < itemBounding.top + margin && 
					touch.pageY > itemBounding.bottom - margin) {
					targetIndex = index;
					return true;
				}
				
				index++;
			});
			
			if(targetIndex === -1 || targetIndex === activeItem) {
				return this;
			}
		}
		
		this.animationDirection = activeItem > targetIndex ? 0 : 1;
		
		if (this.animationDirection) {
			targetIndex = targetIndex-1;
			if (activeItem === carousel.getMaxItemIndex()) {
				return this;
			}
	        
			carousel.setActiveItem(targetIndex);
			carousel.next();
		}
		
		else {
			targetIndex = targetIndex+1;
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
		
		element = this.bodyElement.dom.children[0];
		this.animationDirection = currentActiveIndex > index ? 0 : 1;
		
		if(element && activeItem && index !== currentActiveIndex) {
			var lastElement = indicators[indicators.length-1],
				lastElementRightPos = lastElement.dom.getBoundingClientRect().right,
				maxRight = this.element.getPageBox().right;
			
			if(lastElementRightPos > maxRight) {
				var itemRect = activeItem.dom.getBoundingClientRect(),
					margins = parseFloat(window.getComputedStyle(activeItem.dom, "").getPropertyValue("margin"))*2,
					elementWidth = itemRect.right - itemRect.left + margins,
					leftPos = this.getLeft(),
					offsetPos = 5;
				
				if (this.animationDirection) {
					var position = itemRect.left + leftPos,
						elementsTillMaxPos = Math.ceil((maxRight - position) / elementWidth);
					
					if(elementsTillMaxPos < offsetPos) {
						// offsetPos is added in order to simulate a slight movement
						this.setLeft(leftPos - (elementWidth * (offsetPos-elementsTillMaxPos)) + offsetPos);
					}
				} else {
					if(itemRect.left < maxRight - (elementWidth * offsetPos)) {
						this.setLeft(0);
					} else if(leftPos < 0) {
						// offsetPos is added in order to simulate a slight movement
						this.setLeft(leftPos + (elementWidth * (currentActiveIndex - index)) - offsetPos);
					}
				}
			}
		}

		return this;
	}
});
