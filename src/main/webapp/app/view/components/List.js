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
		scrollable: {disabled: true},

		/* pagination */
		loadHandler: Ext.emptyFn,
		loadScope: this,
		totalRange: -1,
		listOffset: 5,
		lastOffset: 0,
		offset: 0
	},

	initialize: function () {
		this.callParent();
		this.resetPagination();

		/** initialize list listeners */
		this.on({
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

	updateListHeight: function () {
		if (!this.isEmpty()) {
			var listItemsDom = this.element.select(".x-list .x-inner .x-inner").elements[0];
			var me = this;

			if (this.loadMoreButton) {
				this.addCls('paginationSessionList');
			} else {
				this.removeCls('paginationSessionList');
			}

			Ext.create('Ext.util.DelayedTask', function () {
				if (me.element) {
					listItemsDom.style.display = 'none';
					me.resizeList(me.element, listItemsDom);
					listItemsDom.style.display = '';
					me.resizeList(me.element, listItemsDom);
				}
			}).delay(100);
		}
	},

	resizeList: function (listEl, listItemsDom) {
		this.setHeight(
			parseInt(window.getComputedStyle(listItemsDom, "").getPropertyValue("height")) +
			parseInt(window.getComputedStyle(listEl.dom, "").getPropertyValue("padding-top")) +
			parseInt(window.getComputedStyle(listEl.dom, "").getPropertyValue("padding-bottom"))
		);
	},

	resetOffsetState: function () {
		this.setOffset(this.getLastOffset());
	},

	getStartIndex: function () {
		return this.getOffset() === -1 ? -1 : this.itemsCount;
	},

	getEndIndex: function () {
		var offset = this.getOffset();

		if (offset === -1 || (this.getTotalRange() !== -1 && offset >= this.getTotalRange())) {
			return -1;
		}

		return offset - 1;
	},

	resetPagination: function () {
		this.setTotalRange(-1);
		this.setOffset(this.getListOffset());
		this.setLastOffset(this.getListOffset());
	},

	updatePagination: function (length, totalRange) {
		var offset = this.getOffset();

		if (offset >= totalRange || offset === -1 || totalRange === -1) {
			this.removeLoadMoreButton();
			offset = -1;
		} else {
			this.addLoadMoreButton();
			offset += length < this.getListOffset() ?
				length : this.getListOffset();
		}

		this.setLastOffset(this.getOffset());
		this.setTotalRange(totalRange);
		this.setOffset(offset);
		this.refresh();
	},

	addLoadMoreButton: function () {
		if (!this.loadMoreButton && this.getLoadHandler() !== Ext.emptyFn) {
			this.loadMoreButton = Ext.create('Ext.Button', {
				cls: 'loadMoreButton standardListButton',
				text: Messages.LOAD_MORE,
				handler: this.getLoadHandler(),
				scope: this.getLoadScope(),
				ui: 'normal'
			});

			this.add(this.loadMoreButton);
			this.updateListHeight();
		}
	},

	removeLoadMoreButton: function () {
		if (this.loadMoreButton) {
			this.remove(this.loadMoreButton);
			delete this.loadMoreButton;
			this.updateListHeight();
		}
	}
});
