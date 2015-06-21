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
Ext.define('ARSnova.view.speaker.SpeakerUtilities', {
	extend: 'Ext.Toolbar',

	config: {
		docked: 'bottom',
		parentReference: null,
		panelConfiguration: 'default',
		autoApplyBottomPadding: true,
		cls: Ext.baseCSSPrefix + 'speaker-utils'
	},

	initialize: function () {
		this.callParent(arguments);

		var me = this;

		this.zoomButton = Ext.create('Ext.Button', {
			ui: 'action',
			hidden: false,
			cls: 'zoomButton',
			docked: 'bottom',
			iconCls: 'icon-text-height',
			handler: this.zoomButtonHandler,
			scope: this
		});

		this.zoomSlider = Ext.create('ARSnova.view.CustomSliderField', {
			label: 'Zoom',
			labelWidth: '15%',
			value: 100,
			minValue: 75,
			maxValue: 150,
			increment: 5,
			suffix: '%',
			setZoomLevel: function (sliderField, slider, newValue) {
				var panel = me.getActivePanel();
				newValue = Array.isArray(newValue) ? newValue[0] : newValue;
				if (!sliderField.actualValue || sliderField.actualValue !== newValue) {
					panel.setZoomLevel(newValue);
					sliderField.actualValue = newValue;
				}
			}
		});

		this.actionSheet = Ext.create('Ext.Sheet', {
			left: 0,
			right: 0,
			bottom: 0,
			modal: false,
			centered: false,
			height: 'auto',
			cls: 'zoomActionSheet',
			items: [this.zoomSlider]
		});

		this.zoomSlider.setListeners({
			drag: this.zoomSlider.config.setZoomLevel,
			change: this.zoomSlider.config.setZoomLevel
		});

		this.add(this.zoomButton);
	},

	isZoomElementActive: function () {
		return !!this.zoomButton.isActive;
	},

	setZoomElementHidden: function (setHidden) {
		this.zoomButton.setHidden(!!setHidden);
	},

	initializeZoomComponents: function () {
		this.actionSheet.hide();
		this.getParentReference().getParent().remove(this.actionSheet, false);
		this.zoomButton.setIconCls('icon-text-height');
		this.zoomButton.removeCls('zoomSheetActive');
		this.zoomSlider.setSliderValue(ARSnova.app.globalZoomLevel);
		this.zoomButton.isActive = false;

		if (!!this.getActivePanel()) {
			this.getActivePanel().setZoomLevel(ARSnova.app.globalZoomLevel);
		}

		if (this.getAutoApplyBottomPadding() &&
			!!this.getParentReference().getActiveItem()) {
			this.getParentReference().getActiveItem().setPadding('0 0 20 0');
		}
	},

	zoomButtonHandler: function () {
		if (this.zoomButton.isActive) {
			this.initializeZoomComponents();
		} else {
			this.getParentReference().getParent().add(this.actionSheet);
			this.zoomButton.setIconCls('icon-close');
			this.zoomButton.addCls('zoomSheetActive');
			this.zoomSlider.setSliderValue(ARSnova.app.globalZoomLevel);
			this.zoomButton.isActive = true;
			this.actionSheet.show();

			if (this.getAutoApplyBottomPadding() &&
				!!this.getParentReference().getActiveItem()) {
				this.getParentReference().getActiveItem().setPadding('0 0 50 0');
			}
		}
	},

	getActivePanel: function () {
		var activePanel;
		switch (this.getPanelConfiguration()) {
			case 'carousel':
				activePanel = this.getParentReference().getActiveItem();
				break;
			default:
				activePanel = this.getParentReference();
		}

		return activePanel;
	}
});
