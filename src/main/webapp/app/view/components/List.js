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
Ext.define('ARSnova.view.components.List', {
	extend: 'Ext.List',

	config: {
		layout: 'fit',
		height: '100%',
		variableHeights: true,
		scrollable: {disabled: true}
	},

	initialize: function () {
		this.callParent();

		/** initialize list listeners */
		this.on({
			painted: this.onPainted,
			add: this.updateListHeight,
			resize: this.updateListHeight,
			updateData: this.updateListHeight,
			itemindexchange: this.updateListHeight,
			order: 'after',
			scope: this
		});
	},

	isEmpty: function () {
		var store = this.getStore();
		return !(store && store.getCount());
	},

	onPainted: function (list, eOpts) {
		var me = this;
		this.updateListHeight();

		if (window.MathJax) {
			MathJax.Hub.Queue(["Delay", MathJax.Callback, 700], function () {
				me.updateListHeight();
			});
		}
	},

	updateListHeight: function () {
		if (!this.isEmpty()) {
			var listItemsDom = this.element.select(".x-list .x-inner .x-inner").elements[0];
			var me = this;

			Ext.create('Ext.util.DelayedTask', function () {
				listItemsDom.style.display = 'none';
				me.resizeList(me.element, listItemsDom);
				listItemsDom.style.display = '';
				me.resizeList(me.element, listItemsDom);
			}).delay(100);
		}
	},

	resizeList: function (listEl, listItemsDom) {
		this.setHeight(
			parseInt(window.getComputedStyle(listItemsDom, "").getPropertyValue("height")) +
			parseInt(window.getComputedStyle(listEl.dom, "").getPropertyValue("padding-top")) +
			parseInt(window.getComputedStyle(listEl.dom, "").getPropertyValue("padding-bottom"))
		);
	}
});
