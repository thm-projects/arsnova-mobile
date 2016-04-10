/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2016 The ARSnova Team
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
		showProjectorButton: false,
		projectorHandler: Ext.emptyFn,
		projectorHandlerScope: null,
		showHideControlButton: false,
		hideControlHandler: Ext.emptyFn,
		cls: Ext.baseCSSPrefix + 'speaker-utils'
	},

	initialize: function () {
		this.callParent(arguments);

		var me = this;

		this.setShowProjectorButton(
			this.getShowProjectorButton() &&
			typeof this.getProjectorHandler() === 'function'
		);

		this.hideShowcaseControlButton = Ext.create('Ext.Button', {
			ui: 'action',
			docked: 'bottom',
			cls: 'hideControlButton',
			iconCls: 'icon-gear',
			handler: function () {
				this.getHideControlHandler()();
				this.updateActivePanels();
			},
			hidden: !this.getShowHideControlButton(),
			scope: this
		});

		this.feedbackOverlay = Ext.create('Ext.Button', {
			ui: 'action',
			docked: 'bottom',
			cls: 'feedbackOverlay',
			badgeText: '0',
			badgeCls: 'badgeicon',
			iconCls: '',
			callFn: ARSnova.app.getController('Feedback').showFeedbackStatistic,
			handler: this.overlayButtonHandler,
			hidden: true
		});

		this.interposedOverlay = Ext.create('Ext.Button', {
			ui: 'action',
			docked: 'bottom',
			cls: 'interposedOverlay',
			badgeText: '0',
			badgeCls: 'badgeicon',
			iconCls: 'icon-question',
			callFn: ARSnova.app.getController('Questions').listFeedbackQuestions,
			handler: this.overlayButtonHandler,
			hidden: true
		});

		this.projectorButton = Ext.create('Ext.Button', {
			ui: 'action',
			docked: 'bottom',
			cls: 'projectorButton',
			iconCls: 'icon-projector',
			handler: this.projectorHandler,
			hidden: !this.getShowProjectorButton(),
			scope: this
		});

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
				if (sliderField.actualValue !== newValue) {
					panel.setZoomLevel(newValue);
					sliderField.actualValue = newValue;
					me.updateActivePanels();
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

		this.hideShowcaseControlButton.addCls('x-button-pressed');
		this.on('projectorModeActivateChange', function () {
			if (ARSnova.app.projectorModeActive) {
				this.projectorButton.addCls('x-button-pressed');
			} else {
				this.projectorButton.removeCls('x-button-pressed');
			}
		});

		this.add([
			this.interposedOverlay,
			this.feedbackOverlay,
			this.hideShowcaseControlButton,
			this.projectorButton,
			this.zoomButton
		]);
	},

	isZoomElementActive: function () {
		return this.zoomButton.isActive;
	},

	setZoomElementHidden: function (setHidden) {
		this.zoomButton.setHidden(setHidden);
	},

	initializeZoomComponents: function () {
		this.actionSheet.hide();
		this.getParentReference().getParent().remove(this.actionSheet, false);
		this.zoomButton.setIconCls('icon-text-height');
		this.zoomButton.removeCls('zoomSheetActive');
		this.zoomSlider.setSliderValue(ARSnova.app.globalZoomLevel);
		this.zoomButton.isActive = false;

		if (this.getActivePanel()) {
			this.getActivePanel().setZoomLevel(ARSnova.app.globalZoomLevel);
		}

		if (this.getAutoApplyBottomPadding() &&
				this.getParentReference().getActiveItem()) {
			this.getParentReference().getActiveItem().setPadding('0 0 20 0');
		}
	},

	updateShowcaseControlButton: function (isHidden) {
		if (isHidden) {
			this.hideShowcaseControlButton.removeCls('x-button-pressed');
		} else {
			this.hideShowcaseControlButton.addCls('x-button-pressed');
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
					this.getParentReference().getActiveItem()) {
				this.getParentReference().getActiveItem().setPadding('0 0 50 0');
			}
		}
	},

	projectorHandler: function () {
		var projectorHandler = this.getProjectorHandler();

		if (ARSnova.app.projectorModeActive) {
			this.restoreZoomLevel();
		} else {
			ARSnova.app.getController('Application').storeGlobalZoomLevel();
		}

		if (projectorHandler === Ext.emptyFn) {
			projectorHandler = this.setProjectorMode;
		}

		projectorHandler.call(this,
			this.getProjectorHandlerScope() ||
			this.getParentReference()
		);
	},

	updateActivePanels: function () {
		if (this.getPanelConfiguration() === 'carousel') {
			this.getParentReference().updateAllQuestionPanels();
		}
	},

	restoreZoomLevel: function () {
		ARSnova.app.getController('Application').setGlobalZoomLevel(
			ARSnova.app.storedZoomLevel || ARSnova.app.globalZoomLevel);
		ARSnova.app.storedZoomLevel = null;
	},

	setProjectorMode: function (panel, enable, noFullscreen) {
		var activeMode = ARSnova.app.projectorModeActive;
		var activate = !activeMode;

		if (typeof enable === 'boolean') {
			activate = enable;
		}

		if (!ARSnova.app.projectorModeActive && activate) {
			ARSnova.app.getController('Application').setGlobalZoomLevel(130);
		}

		if (activate) {
			panel.addCls('projector-mode');
		} else {
			panel.removeCls('projector-mode');
		}

		ARSnova.app.mainTabPanel.tabPanel.getTabBar().setHidden(activate);
		ARSnova.app.getController('Application').setGlobalZoomLevel(ARSnova.app.globalZoomLevel);
		panel.setZoomLevel(ARSnova.app.globalZoomLevel);

		if (!noFullscreen) {
			ARSnova.app.getController('Application').toggleFullScreen(activate);
		}

		this.updateActivePanels();
		ARSnova.app.projectorModeActive = activate;
		this.fireEvent('projectorModeActivateChange');
		this.setOverlay();
	},

	isShowcaseEditPanelActive: function (scope) {
		return this.hideShowcaseControlButton.element.hasCls('x-button-pressed');
	},

	setOverlay: function () {
		ARSnova.app.activeSpeakerUtility = this;
		ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.updateTabBar();
		ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestionsTask.taskRunTime = 0;
	},

	checkQuestionType: function (panel) {
		this.hideShowcaseControlButton.setHidden(panel.questionObj && panel.questionObj.questionType === 'slide');
	},

	overlayButtonHandler: function () {
		var me = this.getParent(); // speakerUtilities

		me.restoreZoomLevel();
		me.setProjectorMode(me.getParent(), false);
		setTimeout(this.config.callFn, 1000);
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
