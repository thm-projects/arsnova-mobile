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
Ext.define('ARSnova.view.diagnosis.AddOnsPanel', {
	extend: 'Ext.Container',

	config: {
		fullscreen: true,
		title: 'AddOnsPanel',
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	initialize: function () {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
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
			title: Messages.FEATURES,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});

		this.featureFormPanel = Ext.create('Ext.form.Panel', {
			cls: 'standardForm topPadding',
			scrollable: null,

			items: [{
				xtype: 'fieldset',
				title: Messages.ACTIVATE_FEATURES,
				defaults: {
					xtype: 'checkboxfield',
					checked: true
				},

				items: [{
					name: 'jitt',
					label: Messages.PREPARATION_QUESTIONS_LONG
				}, {
					name: 'interposed',
					label: Messages.QUESTIONS_FROM_STUDENTS
				}, {
					name: 'feedback',
					label: Messages.LIVE_FEEDBACK
				}, {
					name: 'pi',
					label: Messages.PEER_INSTRUCTION_QUESTIONS
				}, {
					name: 'learningProgress',
					label: Messages.LEARNING_PROGRESS
				}]
			}]
		});

		this.submitButton = Ext.create('Ext.Button', {
			cls: 'centerButton',
			ui: 'confirm',
			text: Messages.SAVE,
			scope: this,
			handler: function (button) {
				button.disable();
				ARSnova.app.sessionModel.changeFeatures(sessionStorage.getItem("keyword"), this.featureFormPanel.getValues(), {
					success: function () {
						button.enable();
						var theNotificationBox = {};
						theNotificationBox = Ext.create('Ext.Panel', {
							cls: 'notificationBox',
							name: 'notificationBox',
							showAnimation: 'pop',
							modal: true,
							centered: true,
							width: 300,
							styleHtmlContent: true,
							styleHtmlCls: 'notificationBoxText',
							html: Messages.SETTINGS_SAVED
						});
						Ext.Viewport.add(theNotificationBox);
						theNotificationBox.show();

						/* Workaround for Chrome 34+ */
						Ext.defer(function () {
							theNotificationBox.destroy();
						}, 3000);
					},
					failure: function () {
						button.enable();
						Ext.Msg.alert("", Messages.SETTINGS_COULD_NOT_BE_SAVED);
					}
				});
			}
		});

		this.formPanel = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			items: [this.featureFormPanel, this.submitButton]
		});

		this.add([this.toolbar, this.formPanel]);

		this.on('activate', function () {
			this.featureFormPanel.setValues(Ext.decode(sessionStorage.getItem("features")));
		}, this);
	}
});
