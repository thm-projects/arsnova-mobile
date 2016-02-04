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

Ext.define('ARSnova.view.home.MotdDetailsPanel', {
	extend: 'Ext.Panel',

	requires: [
	],

	config: {
		title: 'MotdDetailsPanel',
		layout: {
			type: 'vbox',
			pack: 'center'
		},
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	/* toolbar items */
	toolbar: null,
	backButton: null,
	cancelButton: null,
	editButton: null,

	motdObj: null,
	mode: null,
	sessionkey: null,

	initialize: function (args) {
		this.callParent(arguments);

		var me = this;
		this.motdObj = this.config.motd;
		this.mode = this.config.mode;
		/* BEGIN TOOLBAR OBJECTS */

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.MY_MESSAGES,
			ui: 'back',
			scope: this,
			handler: function () {
				var sTP = null;
				if (this.mode === 'session') {
					sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				} else {
					sTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				}
				sTP.animateActiveItem(sTP.motdPanel, {
					type: 'slide',
					direction: 'right'
				});
			}
		});

		this.cancelButton = Ext.create('Ext.Button', {
			text: Messages.CANCEL,
			ui: 'decline',
			hidden: true,
			handler: function () {
				var panel = this.up('panel');
				var eb = panel.editButton;
				eb.setText(Messages.EDIT);
				eb.removeCls('x-button-action');

				panel.contentEditForm.hide();
				panel.contentForm.show();
				this.hide();
				panel.backButton.show();
			}
		});

		this.editButton = Ext.create('Ext.Button', {
			text: Messages.EDIT,
			handler: function () {
				var panel = this.up('panel');

				var contentChanged = function (prevContent, newContent) {
					var changed = false;
					if (newContent.title !== prevContent.get("title")) {
						changed = true;
					}
					if (newContent.text !== prevContent.get("text")) {
						changed = true;
					}
					if (newContent.startdate !== prevContent.get("startdate")) {
						changed = true;
					}
					if (newContent.enddate !== prevContent.get("enddate")) {
						changed = true;
					}
					if (newContent.audience !== prevContent.get("audience")) {
						changed = true;
					}

					return changed;
				};

				var saveMotd = function (motd) {
					afterEdit();
					motd.updateMotd({
						success: function (response) {
							motd.set('_rev', Ext.decode(response.responseText)._rev);
							panel.motdObj = motd.data;
							panel.setContentFormContent(panel.motdObj);
						},
						failure: function (response) {
						}
					});
					finishEdit();
				};
				var finishEdit = Ext.bind(function () {
					this.setText(Messages.EDIT);
					this.removeCls('x-button-action');
					this.config.disableFields(panel);
				}, this);
				if (this.getText() === Messages.EDIT) {
					panel.setContentFormContent(panel.motdObj);
					panel.contentForm.hide();
					panel.contentEditForm.show();
					if (this.up('panel').mode === "session") {
						this.up('panel').audience.hide();
					}
					panel.cancelButton.show();
					panel.backButton.hide();
					panel.deleteMotdButton.show();

					this.setText(Messages.SAVE);
					this.addCls('x-button-action');

					this.config.enableFields(panel);
				} else {
					var values = this.up('panel').down('#contentEditForm').getValues();
					var motd = Ext.create('ARSnova.model.Motd', panel.motdObj);
					var afterEdit = function () {
						panel.contentForm.show();
						panel.contentEditForm.hide();
						panel.deleteMotdButton.hide();
						panel.cancelButton.hide();
						panel.backButton.show();
						motd.set("title", values.motdTitle);
						motd.set("text", values.motdText);
						motd.set("audience", values.picker);
						var start = ARSnova.app.getController('Motds').getTimestampByString(values.startdate);
						motd.set("startdate", start);
						var end = ARSnova.app.getController('Motds').getTimestampByString(values.enddate);
						motd.set("enddate", end);
						panel.motdtitle.resetOriginalValue();
						panel.textarea.resetOriginalValue();
						panel.startdate.resetOriginalValue();
						panel.enddate.resetOriginalValue();
					};
					saveMotd(motd);
				}
			},

			enableFields: function (panel) {
				if (panel.mode === "admin") {
					panel.audience.setDisabled(false);
				}
				panel.motdtitle.setDisabled(false);
				panel.markdowntextPanel.setDisabled(false);
				panel.textarea.setDisabled(false);
				panel.startdate.setDisabled(false);
				panel.enddate.setDisabled(false);
			},

			disableFields: function (panel) {
				if (panel.mode === "admin") {
					panel.audience.setDisabled(true);
				}
				panel.motdtitle.setDisabled(true);
				panel.markdowntextPanel.setDisabled(true);
				panel.textarea.setDisabled(true);
				panel.startdate.setDisabled(true);
				panel.enddate.setDisabled(true);
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.MESSAGEOFTHEDAY,
			cls: 'speakerTitleText',
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				this.cancelButton,
				{xtype: 'spacer'},
				this.editButton
			]
		});

		/* END TOOLBAR OBJECTS */

		this.deleteMotdButton = Ext.create('ARSnova.view.MatrixButton', {
			xtype: 'button',
			buttonConfig: 'icon',
			text: Messages.DELETE_MESSAGE,
			imageCls: 'icon-close',
			scope: this,
			hidden: true,
			handler: function () {
				var me = this;
				var msg = Messages.ARE_YOU_SURE;
				Ext.Msg.confirm(Messages.DELETE_MESSAGE, msg, function (answer) {
					if (answer === 'yes') {
						var sTP = null;
						if (me.mode === 'session') {
							sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
						}	else {
							sTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
						}
						ARSnova.app.motdModel.destroy(sTP.motdDetailsPanel.motdObj, {
							success: function () {
								var self = sTP.motdDetailsPanel;
								sTP.animateActiveItem(sTP.motdPanel, {
									type: 'slide',
									direction: 'right',
									duration: 700,
									listeners: {
										animationend: function () {
											self.destroy();
										}
									}
								});
							},
							failure: function (response) {
								console.log('server-side error delete motd');
							}
						});
					}
				});
			}
		});

		this.deleteRow = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			style: {
				marginTop: '15px'
			},
			items: [
				this.deleteMotdButton
			]
		});

		/* BEGIN MOTD DETAILS */

		this.motdtitle = Ext.create('Ext.field.Text', {
			label: Messages.MOTD_TITLE,
			name: 'motdTitle',
			value: this.motdObj.title,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.textarea = Ext.create('Ext.plugins.ResizableTextArea', {
			label: Messages.MOTD_TEXT,
			name: 'motdText',
			value: this.motdObj.text,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.markdowntextPanel = Ext.create('ARSnova.view.MarkDownEditorPanel', {
			processElement: this.textarea
		});

		this.audience =  Ext.create('Ext.field.Select', {
			label: Messages.MOTD_AUDIENCE_CHOOSE,
			value: this.motdObj.audience,
			disabled: true,
			options: [
				{text: Messages.MOTD_AUDIENCE_ALL, value: 'all'},
				{text: Messages.MOTD_AUDIENCE_LOGGEDIN, value: 'loggedIn'},
				{text: Messages.MOTD_AUDIENCE_TUTORS, value: 'tutors'},
				{text: Messages.MOTD_AUDIENCE_STUDENTS, value: 'students'}
			]
		});

		this.startdate = Ext.create('Ext.field.Text', {
			label: Messages.MOTD_STARTDATE,
			name: 'startdate',
			value: this.motdObj.startdatedate,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.enddate = Ext.create('Ext.field.Text', {
			label: Messages.MOTD_ENDDATE,
			name: 'enddate',
			value: this.motdObj.enddatedate,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.motdtitleshow = Ext.create('Ext.field.Text', {
			label: Messages.MOTD_TITLE,
			name: 'motdTitle',
			value: this.motdObj.title,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.textareashow = Ext.create('Ext.plugins.ResizableTextArea', {
			label: Messages.MOTD_TEXT,
			name: 'motdText',
			value: this.motdObj.text,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.markdowntextshowPanel = Ext.create('ARSnova.view.MarkDownEditorPanel', {
			processElement: this.textareashow
		});

		this.audienceshow = Ext.create('Ext.field.Text', {
			label: Messages.MOTD_AUDIENCE,
			name: 'motdAudience',
			value: this.motdObj.audience,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.startdateshow = Ext.create('Ext.field.Text', {
			label: Messages.MOTD_STARTDATE,
			name: 'startdate',
			value: this.motdObj.startdatedate,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.enddateshow = Ext.create('Ext.field.Text', {
			label: Messages.MOTD_ENDDATE,
			name: 'enddate',
			value: this.motdObj.enddatedate,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.contentFieldset = Ext.create('Ext.form.FieldSet', {
			cls: 'standardFieldset',
			itemId: 'contentFieldset',
			items: [
				this.motdtitleshow,
				this.markdowntextshowPanel,
				this.textareashow,
				this.audienceshow,
				this.startdateshow,
				this.enddateshow
			]
		});

		this.contentEditFieldset = Ext.create('Ext.form.FieldSet', {
			cls: 'standardFieldset',
			itemId: 'contentEditFieldset',
			items: [
				this.motdtitle,
				this.markdowntextPanel,
				this.textarea,
				this.audience,
				this.startdate,
				this.enddate
			]
		});

		this.contentForm = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			itemId: 'contentForm',
			style: {marginTop: '15px', marginBottom: '-15px'},
			items: [this.contentFieldset]
		});

		this.contentEditForm = Ext.create('Ext.form.FormPanel', {
			hidden: true,
			scrollable: null,
			itemId: 'contentEditForm',
			style: {marginTop: '15px', marginLeft: '12px', marginRight: '12px'},
			items: [this.contentEditFieldset]
		});

		// Preview button
		this.previewButton = Ext.create('Ext.Button', {
			text: Ext.os.is.Desktop ?
				Messages.QUESTION_PREVIEW_BUTTON_TITLE_DESKTOP :
				Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui: 'action',
			cls: Ext.os.is.Desktop ?
				'previewButtonLong' :
				'previewButton',
			scope: this,
			handler: function () {
				var values = {};
				if (this.editButton.getText() === Messages.EDIT) {
					values.title = this.motdObj.title;
					values.content = this.motdObj.text;
				} else {
					values.title = this.motdtitle.getValue();
					values.content = this.textarea.getValue();
				}
				var messageBox = (Ext.create('ARSnova.view.components.MotdMessageBox', {
					title: values.title,
					content: values.content
				}));
				messageBox.setButtons([{
					scope: this,
					text: Messages.CONTINUE,
					itemId: 'continue',
					ui: 'action',
					handler: function () {
						messageBox.hide();
					}
				}]);
				messageBox.show();
			}
		});

		// Preview panel with integrated button
		this.previewPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				items: [this.previewButton]
			}]
		});

		this.setContentFormContent(this.motdObj);
		/* END MOTD DETAILS */

		this.add([
			this.toolbar, {
				xtype: 'formpanel',
				scrollable: null,
				items: [
					this.contentForm,
					this.contentEditForm,
					this.previewPart,
					this.deleteRow
				]
			}
		]);
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
	},

	onActivate: function () {
		if (this.mode === "session") {
			this.audienceshow.hide();
		}
		this.contentForm.show();
	},

	setContentFormContent: function (motdObj) {
		if (motdObj && motdObj.title && motdObj.text) {
			this.motdtitleshow.setValue(motdObj.title);
			this.textareashow.setValue(motdObj.text);
			var audience = Messages.MOTD_AUDIENCE_ALL;
			switch (motdObj.audience) {
				case "tutors": audience = Messages.MOTD_AUDIENCE_TUTORS; break;
				case "students": audience = Messages.MOTD_AUDIENCE_STUDENTS; break;
				case "loggedIn": audience = Messages.MOTD_AUDIENCE_LOGGEDIN; break;
				case "session": audience = Messages.MOTD_AUDIENCE_SESSION; break;
			}
			this.audienceshow.setValue(audience);
			var start = new Date();
			start.setTime(motdObj.startdate);
			var startstring = start.getDate() + "." + (start.getMonth() + 1) + "." + start.getFullYear();
			this.startdateshow.setValue(startstring);
			var end = new Date();
			end.setTime(motdObj.enddate);
			var endstring = end.getDate() + "." + (end.getMonth() + 1) + "." + end.getFullYear();
			this.enddateshow.setValue(endstring);
			this.startdate.setValue(startstring);
			this.enddate.setValue(endstring);
		}
	}
});
