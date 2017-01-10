/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
Ext.define('ARSnova.view.MathJaxField', {
	extend: 'Ext.form.Field',
	alias: 'widget.mathjaxfield',

	/**
	 * @cfg {Object} layoutObject The object to layout after MathJax finished typesetting.
	 */
	layoutObject: null,

	content: "",

	renderTpl: [
		'<tpl if="label">',
			'<div class="x-form-label"><span>{label}</span></div>',
		'</tpl>',
		'<tpl if="fieldEl">',
			'<div class="x-form-field-container"><div id="{inputId}" class="{fieldCls} x-field-slider"',
				'<tpl if="style">style="{style}" </tpl> >{content}</div>',
			'</div>',
		'</tpl>'
	],

	initRenderData: function () {
		ARSnova.view.MathJaxField.superclass.initRenderData.apply(this, arguments);

		Ext.applyIf(this.renderData, {
			content: this.content
		});

		return this.renderData;
	},

	afterRender: function () {
		ARSnova.view.MathJaxField.superclass.afterRender.apply(this, arguments);

		if ("undefined" !== typeof MathJax) {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.renderData.inputId], Ext.createDelegate(function () {
				var containerObject = this.layoutObject || this.up("form");
				containerObject.doComponentLayout();
			}, this));
		}
	}
});
