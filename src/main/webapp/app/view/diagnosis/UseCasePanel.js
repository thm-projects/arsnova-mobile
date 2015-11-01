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
Ext.define('ARSnova.view.diagnosis.UseCasePanel', {
	extend: 'Ext.Container',

	requires: ['ARSnova.view.diagnosis.AddOnsPanel'],

	config: {
		options: {},
		fullscreen: true,
		title: 'UseCasePanel',
		sessionCreationMode: false,
		inClassSessionEntry: false,
		features: {
			lecture: false,
			feedback: false,
			interposed: false,
			learningProgress: false,
			jitt: false,
			pi: false
		},
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	initialize: function () {
		this.callParent(arguments);
		var me = this;

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			handler: function () {
				var me = ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel;

				me.animateActiveItem(me.diagnosisPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700,
					scope: this
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.USECASES,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});

		this.useCaseFieldSet = Ext.create('Ext.form.FieldSet', {
			xtype: 'fieldset',
			title: Messages.USECASES_CHOOSE,
			defaults: {
				name: 'usecase',
				xtype: 'radiofield',
				labelWidth: 'auto'
			},

			items: [{
				value: 'clicker',
				checked: true,
				label: Messages.USECASE_CLICKER
			}, {
				value: 'peerGrading',
				label: Messages.USECASE_PEER_GRADING
			}, {
				value: 'flashcard',
				hidden: !ARSnova.app.globalConfig.features.flashcard,
				label: Messages.USECASE_FLASHCARD
			}, {
				value: 'liveFeedback',
				label: Messages.USECASE_LIVE_FEEDBACK
			}, {
				value: 'total',
				label: Messages.USECASE_ARSNOVA_TOTAL
			}, {
				value: 'custom',
				label: Messages.USECASE_ARSNOVA_CUSTOM,
				listeners: {
					scope: this,
					check: function (field) {
						this.formPanel.remove(this.submitButton, false);
						this.formPanel.add(this.continueButton);
					},
					uncheck: function (field) {
						this.formPanel.remove(this.continueButton, false);
						this.formPanel.add(this.submitButton);
					}
				}
			}]
		});

		if (this.config.sessionCreationMode) {
			this.backButton.setHandler(this.sessionCreationBackHandler);
			this.submitButton = Ext.create('Ext.Button', {
				cls: 'centerButton',
				ui: 'confirm',
				scope: this,
				text: Messages.SESSION_SAVE,
				handler: this.onSessionCreationSubmit
			});
		} else {
			this.submitButton = Ext.create('Ext.Button', {
				cls: 'centerButton',
				ui: 'confirm',
				text: Messages.SAVE,
				scope: this,
				handler: this.onSubmit
			});

			if (this.config.inClassSessionEntry) {
				this.backButton.setHandler(this.inClassPanelBackHandler);
			}
		}

		this.continueButton = Ext.create('Ext.Button', {
			cls: 'centerButton',
			ui: 'confirm',
			scope: this,
			text: Messages.CONTINUE,
			handler: this.onContinue
		});

		this.formPanel = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			items: [this.useCaseFieldSet, this.submitButton]
		});

		this.add([this.toolbar, this.formPanel]);
		this.on('activate', this.onActivate, this);
	},

	onActivate: function () {
		var features = Ext.decode(sessionStorage.getItem("features"));
		var selection = [];

		for (var item in features) {
			if (features[item]) {
				selection.push(item);
			}
		}

		if (selection.length) {
			this.useCaseFieldSet.getInnerItems()[0].setGroupValues(selection);
		}
	},

	getUseCaseValues: function () {
		var items = this.useCaseFieldSet.getInnerItems();
		var name, selection = {};

		items.forEach(function (item) {
			name = item.getValue();
			selection[name] = name === item.getGroupValue();
		});

		return selection;
	},

	sessionCreationBackHandler: function () {
		this.getOptions().lastPanel.enableInputElements();
		var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;

		hTP.animateActiveItem(this.getOptions().lastPanel, {
			type: 'slide',
			direction: 'right',
			duration: 700
		});
	},

	inClassPanelBackHandler: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.animateActiveItem(this.getOptions().lastPanel, {
			type: 'slide',
			direction: 'right',
			duration: 700,
			listeners: {
				scope: this,
				animationend: function () {
					this.destroy();
				}
			}
		});
	},

	validateSelection: function () {
		var selection = this.getUseCaseValues();
		if (!selection.clicker && !selection.peerGrading && !selection.flashcard &&
			!selection.liveFeedback && !selection.total && !selection.custom) {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.FEATURE_SAVE_ERROR);
			return false;
		}
		return true;
	},

	onContinue: function (button) {
		var options = this.config.options;
		button.disable();

		options.useCases = this.getUseCaseValues();
		var activePanel = ARSnova.app.mainTabPanel.tabPanel.getActiveItem();
		var featurePanel = Ext.create('ARSnova.view.diagnosis.AddOnsPanel', {
			lastPanel: this,
			options: this.config.options,
			sessionCreationMode: this.config.sessionCreationMode,
			inClassSessionEntry: !this.config.sessionCreationMode
		});

		activePanel.animateActiveItem(featurePanel, {
			type: 'slide',
			scope: this,
			listeners: {
				animationend: function () {
					button.enable();
				}
			}
		});
	},

	onSessionCreationSubmit: function (button) {
		var options = this.getOptions();
		var selection = ARSnova.app.getController('Feature').getFeatureValues(this.getUseCaseValues());

		button.disable();
		if (this.validateSelection()) {
			options.features = selection;
			ARSnova.app.getController('Sessions').create(options);
			button.enable();
		}
	},

	onSubmit: function (button) {
		var features = this.config.features;
		var selection = ARSnova.app.getController('Feature').getFeatureValues(this.getUseCaseValues());
		button.disable();

		if (this.validateSelection(button)) {
			ARSnova.app.sessionModel.changeFeatures(sessionStorage.getItem("keyword"), selection, {
				success: function () {
					button.enable();
					Ext.toast(Messages.SETTINGS_SAVED, 3000);
				},
				failure: function () {
					button.enable();
					Ext.Msg.alert("", Messages.SETTINGS_COULD_NOT_BE_SAVED);
				}
			});
		}
	}
});
