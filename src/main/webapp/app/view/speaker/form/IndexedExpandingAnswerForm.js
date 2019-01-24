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
Ext.define('ARSnova.view.speaker.form.IndexedExpandingAnswerForm', {
	extend: 'ARSnova.view.speaker.form.ExpandingAnswerForm',

	config: {
		singleChoice: true,
		wording: {
			placeHolder: "",
			/** 'arabic' or 'alphabet' **/
			enumeration: 'alphabet'
		}
	},

	isIndexPresent: false,

	getValues: function () {
		var values = this.callParent(arguments);
		var labelGenerator = this.getEnumeration();
		values.forEach(function (item, index) {
			if (!this.isIndexPresent) {
				item.text = item.text ? (labelGenerator(index) + ": " + item.text) : labelGenerator(index);
			}
			item.id = labelGenerator(index);
		}, this);
		return values;
	},

	initWithQuestion: function (question) {
		this.callParent(arguments);
		this.isIndexPresent = true;
	}
});
