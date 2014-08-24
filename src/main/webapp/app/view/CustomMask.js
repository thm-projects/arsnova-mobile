/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/CustomMask.js
 - Beschreibung: Angepasste Maske, um Scrolling innerhalb eines Carousel zu ermoeglichen
 - Version:      1.0, 21/05/13
 - Autor(en):    Andreas Gaertner <andreas.gaertner@mni.thm.de>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
Ext.define('ARSnova.view.CustomMask', {
	extend: 'Ext.Container',
	xtype: 'custom-mask',

	config: {
		baseCls: Ext.baseCSSPrefix + 'mask',
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
	initialize: function() {
		this.callParent(arguments);

		var scroller = this.getScrollable().getScroller();
		this.overwriteScrollerMaxPosition(scroller, this.config.mainPanel);
		this.element.down('.x-mask-inner').removeCls('x-mask-inner');

		scroller.on('*', 'onScrollEvent', this);
		this.element.on('*', 'onEvent', this);
		this.on({hide: 'onHide'});
	},

	onHide: function(){
		Ext.util.InputBlocker.unblockInputs();

		if (Ext.browser.is.AndroidStock4 && Ext.os.version.getMinor() === 0) {
			var firstChild = this.element.getFirstChild();
			if (firstChild) {
				firstChild.redraw();
			}
		}
	},

	onEvent: function(e) {
		var controller = arguments[arguments.length - 1];

		if(controller.info.eventName === 'tap') {
			this.fireEvent('tap', this, e);
		}

		return false;
	},

	onScrollEvent: function(e) {
		var controller = arguments[arguments.length - 1],
			mainScroller = this.config.mainPanel.getScrollable().getScroller();

		switch(controller.info.eventName) {
			case 'scrollStart':
			case 'scrollEnd':
			case 'scroll':
				mainScroller.scrollTo(e.position.x, e.position.y);
				break;
		}

		return false;
	},

	overwriteScrollerMaxPosition: function(scroller, mainPanel) {
		scroller.getMaxPosition = function() {
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

	updateTransparent: function(newTransparent) {
		this[newTransparent ? 'addCls' : 'removeCls'](this.getBaseCls() + '-transparent');
	}
});
