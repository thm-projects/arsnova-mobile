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
Ext.define('ARSnova.view.CustomSliderField', {
	extend: 'Ext.field.Field',
	xtype: 'sliderField',
	requires: ['Ext.slider.Slider'],

	config: {
		cls: 'sliderField',
		labelWidth: '28%',
		tabIndex: -1,
		suffix: ''
	},

	proxyConfig: {
		value: 0,
		minValue: 0,
		maxValue: 10,
		increment: 1
	},

	constructor: function (config) {
		config = config || {};

		if (config.hasOwnProperty('values')) {
			config.value = config.values;
		}

		this.callParent([config]);
	},

	initialize: function () {
		this.callParent();

		this.getComponent().on({
			scope: this,
			change: 'onSliderChange',
			dragstart: 'onSliderDragStart',
			drag: 'onSliderDrag',
			dragend: 'onSliderDragEnd'
		});
	},

	getElementConfig: function () {
		var self = this;
		var originalConfig = self.callParent();

		originalConfig.children[1].children = [{
			reference: 'inputField',
			tag: 'div',
			cls: 'sliderInputField',
			children: [
				{
					reference: 'inputValue',
					tag: 'input',
					cls: 'sliderInputValue'
				}
			]
		}];

		return originalConfig;
	},

	applyComponent: function (config) {
		this.setInputValue(this.config.value);
		return Ext.factory(config, Ext.slider.Slider);
	},

	onSliderChange: function (me, thumb, newValue, oldValue) {
		this.setInputValue(newValue);
		this.fireEvent('change', this, thumb, newValue, oldValue);
	},

	onSliderDragStart: function (me, thumb, newValue, oldValue) {
		this.fireEvent('dragstart', this, thumb, newValue, oldValue);
	},

	onSliderDrag: function (me, thumb, newValue, oldValue) {
		this.setInputValue(newValue);
		this.fireEvent('drag', this, thumb, newValue, oldValue);
	},

	onSliderDragEnd: function (me, thumb, newValue, oldValue) {
		this.fireEvent('dragend', this, thumb, newValue, oldValue);
	},

	setInputValue: function (value) {
		this.inputValue.dom.value = value + this.getSuffix();
	},

	setSliderValue: function (value) {
		this.setValue(value);
		this.setInputValue(value);
		this.updateMultipleState();
	},

	getSliderValue: function () {
		return this.getValue()[0];
	},

	reset: function () {
		var config = this.config,
		initialValue = (this.config.hasOwnProperty('values')) ? config.values : config.value;

		this.setValue(initialValue);
	},

	doSetDisabled: function (disabled) {
		this.callParent(arguments);

		this.getComponent().setDisabled(disabled);
	},

	updateMultipleState: function () {
		var value = this.getValue();
		if (value && value.length > 1) {
			this.addCls(Ext.baseCSSPrefix + 'slider-multiple');
		}
	}
});
