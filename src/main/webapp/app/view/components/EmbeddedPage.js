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

Ext.define('ARSnova.view.components.EmbeddedPage', {
	extend: 'Ext.Component',
	xtype: 'embeddedpage',

	config: {
		title: 'EmbeddedPage',
		scrollable: true,
		fullscreen: false,
		height: '100%',
		width: '100%'
	},

	disableScrolling: true,

	initialize: function () {
		this.callParent(arguments);

		var self = this;

		this.frameContainer = Ext.DomHelper.append(this.element, {
			tag: 'div',
			scrolling: 'no',
			cls: 'embeddedPageElement hidden',
			style: Ext.os.is.iOS ? 'overflow: auto !important;' : ''
		});

		this.loadingIndicator = Ext.DomHelper.append(this.element, {
			tag: 'div',
			cls: 'appLoadingIndicator',
			id: this.id + '-appLoadingIndicator',
			children: [{
				tag: 'div'
			}, {
				tag: 'div'
			}, {
				tag: 'div'
			}]
		});

		this.on('resize', function (element) {
			if (!!this.frame) {
				this.frame.width = element.getWidth() + 'px';
			}
		});

		this.on('painted', function () {
			if (!this.defined) {
				this.defined = true;

				self.frame = Ext.DomHelper.append(self.frameContainer, {
					tag: 'iframe',
					src: self.config.src,
					frameBorder: '0',
					style: 'border: 0;',
					id: self.id + '-iframe',
					scrolling: Ext.os.is.iOS ? 'no' : 'yes',
					width: self.element.getWidth() + 'px',
					allowfullscreen: true,
					height: '100%'
				});

				self.frame.onload = function () {
					Ext.fly(self.id + '-appLoadingIndicator').destroy();
					self.frameContainer.className = 'embeddedPageElement';
				};
			}
		});
	}
});
