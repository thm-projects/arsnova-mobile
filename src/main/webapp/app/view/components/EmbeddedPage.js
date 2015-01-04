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

Ext.define('ARSnova.view.components.EmbeddedPage', {
	extend: 'Ext.Component',
	xtype: 'embeddedpage',

	config: {
		title: 'EmbeddedPage',
		scrollable: true,
		fullscreen: false
	},
	
	disableScrolling: true,

	initialize: function () {
		this.callParent(arguments);
    
		this.on('painted', function () {
			if(!this.defined) {
				this.defined = true;

				Ext.DomHelper.append(this.element, {
					tag: 'div',
					scrolling: 'no',
					cls: 'embeddedPageElement',
					style: Ext.os.is.iOS ? 'overflow: auto;' : '',
					children: [this.iframe = {
						tag: 'iframe',
						src: this.config.src,
						cls: 'embeddedPageElement',
						id: this.id + '-iframe',
						scrolling: 'yes'
					}]
				});
			}
		});
	}
});