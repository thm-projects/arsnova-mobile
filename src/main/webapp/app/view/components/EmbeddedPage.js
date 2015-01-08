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
		fullscreen: true
	},
	
	disableScrolling: true,

	initialize: function () {
		this.callParent(arguments);
		
		this.frameContainer = Ext.DomHelper.append(this.element, {
			tag: 'div',
			scrolling: 'no',
			cls: 'embeddedPageElement',
			style: Ext.os.is.iOS ? 'overflow: auto;' : ''
		});
		
		this.on('resize', function(element) {
			this.frame.width = element.getWidth() + 'px';
		});
    
		this.on('painted', function () {
			if(!this.defined) {
				this.defined = true;
				
				this.frame = Ext.DomHelper.append(this.frameContainer, {
					tag: 'iframe',
					src: this.config.src,
					id: this.id + '-iframe',
					style: 'border: 0;',
					frameBorder: '0',
					scrolling: Ext.os.is.iOS ? 'no' : 'yes',
					width: this.element.getWidth() + 'px',
					height: '100%'
				});
			}
		});
	}
});