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

Ext.define('ARSnova.view.components.DetailsRadioField', {
	extend: 'Ext.field.Radio',
	xtype: 'detailsradiofield',

	config: {
		cls: 'detailsRadioField',
		details: '',
		label: '',
		shortLabel: '',
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	initialize: function (args) {
		this.callParent(args);
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var me = this;

		this.infoButton = Ext.DomHelper.insertFirst(this.element, {
			reference: 'info',
			tag: 'div',
			cls: 'detailsInfoButton'
		});

		if (this.config.details === '') {
			this.infoButton.style.display = 'none';
		}

		if (screenWidth < 520 && this.config.shortLabel.length > 1) {
			this.setLabel(this.config.shortLabel);
		}

		this.infoButton.onclick = function () {
			Ext.create('ARSnova.view.components.MarkdownMessageBox', {
				content: me.config.details,
				destroyOnHide: true
			}).show();
		};
	}
});
