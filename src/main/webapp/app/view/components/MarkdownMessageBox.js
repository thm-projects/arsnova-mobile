/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2019 The ARSnova Team and Contributors
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

Ext.define('ARSnova.view.components.MarkdownMessageBox', {
	extend: 'Ext.MessageBox',
	xtype: 'markdownMessageBox',

	config: {
		cls: 'markdownMessageBox',
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		hideOnMaskTap: true,
		destroyOnHide: false,
		content: '',
		hidden: true,
		layout: {
			type: 'vbox',
			pack: 'center'
		}
	},

	initialize: function (args) {
		var me = this;
		this.contentPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {cls: 'roundedBox'});
		this.contentPanel.setContent(this.config.content || "", true, true);
		this.add(this.contentPanel);

		this.element.on('tap', function (e) {
			me.hide();
		});

		this.on('hide', function () {
			ARSnova.app.innerScrollPanel = this.storedScrollPanel;
		});

		this.on('show', function () {
			this.storedScrollPanel = ARSnova.app.innerScrollPanel;
			ARSnova.app.innerScrollPanel = this;
		});

		var imgElement = this.contentPanel.element.dom.querySelector('img');

		if (imgElement) {
			imgElement.onload = function () {
				me.updateDimensions();
				me.setHeight(me.getHeight());
			};
		}

		this.setShowAnimation({
			type: 'fadeIn',
			duration: 250,
			easing: 'ease-out',
			listeners: {
				scope: me,
				animationstart: me.updateDimensions,
				animationend: function () {
					me.setHeight(me.getHeight());
				}
			}
		});

		this.setHideAnimation({
			type: 'fadeOut',
			duration: 250,
			easing: 'ease-out',
			listeners: {
				scope: me,
				animationend: me.onAnimationEnd
			}
		});
	},

	onAnimationEnd: function () {
		if (this.config.destroyOnHide) {
			this.destroy();
		}
	},

	updateDimensions: function () {
		var boxOffset = 15;
		this.contentPanel.setStyle('font-size: ' + ARSnova.app.globalZoomLevel + '%;');
		var contentStyle = window.getComputedStyle(this.contentPanel.element.dom, null);
		var height = parseInt(contentStyle.getPropertyValue("height")) +
			parseInt(contentStyle.getPropertyValue('padding-bottom')) +
			parseInt(contentStyle.getPropertyValue('padding-top'));

		this.setHeight(height + boxOffset);
	}
});
