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
Ext.define('ARSnova.view.diagnosis.AddOnsPanel', {
	extend: 'Ext.Container',

	config: {
		options: {},
		lastPanel: null,
		fullscreen: true,
		title: 'FeaturePanel',
		sessionCreationMode: false,
		inClassSessionEntry: false,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
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
				var tP = ARSnova.app.mainTabPanel.tabPanel.getActiveItem();

				tP.animateActiveItem(me.config.lastPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700,
					scope: this
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.FEATURES,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});

		this.optionalFieldSet = Ext.create('Ext.form.FieldSet', {
			title: Messages.OPTIONAL_FEATURES,
			defaults: {
				xtype: 'checkboxfield',
				checked: true
			},

			items: [{
				name: 'pi',
				label: Messages.PEER_INSTRUCTION_QUESTIONS
			}, {
				name: 'learningProgress',
				label: Messages.LEARNING_PROGRESS
			}]
		});

		this.featureFormPanel = Ext.create('Ext.form.Panel', {
			cls: 'standardForm topPadding',
			scrollable: null,

			listeners: {
				selectionChange: function (field) {
					var selections = this.getValues();
					me.optionalFieldSet.setHidden(!selections.lecture && !selections.jitt);
				}
			},

			items: [{
				xtype: 'fieldset',
				title: Messages.ACTIVATE_FEATURES,
				defaults: {
					xtype: 'checkboxfield',
					labelWidth: 'auto',
					checked: true,
					listeners: {
						change: function (field) {
							me.featureFormPanel.fireEvent('selectionChange', field);
						}
					}
				},

				items: [{
					name: 'lecture',
					label: Messages.LECTURE_QUESTIONS_LONG
				}, {
					name: 'jitt',
					label: Messages.PREPARATION_QUESTIONS_LONG
				}, {
					name: 'interposed',
					label: Messages.QUESTIONS_FROM_STUDENTS
				}, {
					name: 'feedback',
					label: Messages.LIVE_FEEDBACK
				}]
			}, this.optionalFieldSet]
		});

		if (this.config.sessionCreationMode) {
			this.submitButton = Ext.create('Ext.Button', {
				cls: 'saveButton centered',
				ui: 'confirm',
				scope: this,
				text: Messages.SESSION_SAVE,
				handler: this.onSessionCreationSubmit
			});
		} else {
			this.submitButton = Ext.create('Ext.Button', {
				cls: 'saveButton centered',
				ui: 'confirm',
				text: Messages.SAVE,
				scope: this,
				handler: this.onSubmit
			});
		}

		this.formPanel = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			style: 'margin-bottom: 20px',
			items: [this.featureFormPanel, this.submitButton]
		});

		this.add([this.toolbar, this.formPanel]);

		this.on('activate', function () {
			var features = Ext.decode(sessionStorage.getItem("features"));

			if (features && features.custom) {
				this.featureFormPanel.setValues(features);
			}
		}, this);
	},

	getFeatureValues: function () {
		var selection = this.featureFormPanel.getValues();
		if (this.optionalFieldSet.isHidden()) {
			selection.learningProgress = null;
			selection.pi = null;
		}

		return selection;
	},

	validateSelection: function (button) {
		var selection = this.getFeatureValues();
		if (!selection.lecture && !selection.interposed && !selection.jitt && !selection.feedback) {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.FEATURE_SAVE_ERROR, function () {
				button.enable();
			});
			return false;
		}
		return true;
	},

	onSessionCreationSubmit: function (button) {
		var selection = this.getFeatureValues();
		var options = this.getOptions();

		button.disable();
		if (this.validateSelection(button)) {
			options.features = selection;
			ARSnova.app.getController('Sessions').create(options);
		}
	},

	onSubmit: function (button) {
		var me = this;
		button.disable();

		if (this.validateSelection(button)) {
			ARSnova.app.sessionModel.changeFeatures(sessionStorage.getItem("keyword"), this.getFeatureValues(), {
				success: function () {
					button.enable();
					Ext.toast(Messages.SETTINGS_SAVED, 3000);
					me.config.lastPanel.inClassPanelBackHandler();
				},
				failure: function () {
					button.enable();
					Ext.Msg.alert("", Messages.SETTINGS_COULD_NOT_BE_SAVED);
				}
			});
		}
	}
});
