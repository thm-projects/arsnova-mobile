/*
* This file is part of ARSnova Mobile.
* Copyright (C) 2011-2012 Christian Thomas Weber
* Copyright (C) 2012-2018 The ARSnova Team
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
Ext.define('ARSnova.view.home.NewMotdPanel', {
	extend: 'Ext.Panel',

	config: {
		title: Messages.CREATE_NEW_MOTD,
		layout: {
			type: 'vbox',
			pack: 'center'
		},
		fullscreen: true,
		scrollable: null,
		scroll: 'vertical',
		mode: null,
		sessionkey: null
	},

	title: null,
	text: null,
	startdate: null,
	enddate: null,

	/* toolbar items */
	toolbar: null,
	backButton: null,

	constructor: function (args) {
		var me = this;
		this.callParent(arguments);

		var htmlEncode = window.innerWidth > 321 ? "{fullname:htmlEncode}" : "{shortname:htmlEncode}";

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.MY_MESSAGES,
			ui: 'back',
			scope: this,
			handler: function () {
				var hTP = null;
				if (this.getMode() === "session") {
					hTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				} else {
					hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				}
				hTP.animateActiveItem(hTP.motdPanel, {
					type: 'slide',
					direction: 'right'
				});
			}
		});

		this.saveButton = Ext.create('Ext.Button', {
			itemId: 'create-motd-button',
			cls: 'centerButton',
			ui: 'confirm',
			text: Messages.CONTINUE,
			scope: this,
			handler: function (button) {
				var me = this;
				this.saveHandler(button).then(function (response) {
					ARSnova.app.getController('Motds').details({
						motd: Ext.decode(response.responseText)
					}, me.getMode());
				});
			}
		});

		this.motdtitle = Ext.create('Ext.field.Text', {
			name: 'title',
			placeHolder: Messages.MOTD_TITLE
		});

		this.motdtext = Ext.create('Ext.plugins.ResizableTextArea', {
			name: 'text',
			placeHolder: Messages.MOTD_TEXT
		});

		this.markdowntextPanel = Ext.create('ARSnova.view.MarkDownEditorPanel', {
			processElement: this.motdtext
		});

		this.audience =  Ext.create('Ext.field.Select', {
			label: Messages.MOTD_AUDIENCE_CHOOSE,
			value: 'all',
			options: [
				{text: Messages.MOTD_AUDIENCE_ALL, value: 'all'},
				{text: Messages.MOTD_AUDIENCE_LOGGEDIN, value: 'loggedIn'},
				{text: Messages.MOTD_AUDIENCE_TUTORS, value: 'tutors'},
				{text: Messages.MOTD_AUDIENCE_STUDENTS, value: 'students'}
			]
		});

		this.startdate = Ext.create('Ext.field.Text', {
			name: 'startdate',
			label: Messages.MOTD_STARTDATE,
			placeHolder: "TT.MM.JJJJ"
		});

		this.enddate = Ext.create('Ext.field.Text', {
			name: 'enddate',
			label: Messages.MOTD_ENDDATE,
			placeHolder: "TT.MM.JJJJ"
		});

		// Preview button
		this.previewButton = Ext.create('Ext.Button', {
			text: Ext.os.is.Desktop ?
				Messages.QUESTION_PREVIEW_BUTTON_TITLE_DESKTOP :
				Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui: 'action',
			cls: 'centerButton previewButton',
			scope: this,
			handler: function () {
				var panel = null;
				if (this.getMode() === "session") {
					panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newSessionMotdPanel;
				} else {
					panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.newMotdPanel;
				}
				var val = panel.mainPart.getValues();
				var messageBox = (Ext.create('ARSnova.view.components.MotdMessageBox', {
					title: val.title,
					content: val.text
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

		this.mainPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newMotd',
			scrollable: null,

			items: [{
				xtype: 'fieldset',
				items: [
					this.motdtitle,
					this.markdowntextPanel,
					this.motdtext,
					this.audience,
					this.startdate,
					this.enddate
				]
			}]
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.NEW_MOTD,
			cls: 'titlePaddingLeft',
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton
			]
		});

		this.add([
			this.toolbar,
			this.mainPart,
			this.previewPart,
			this.saveButton
		]);

		this.onBefore('activate', function () {
			this.setScrollable(true);
		}, this);
		this.on('activate', this.onActivate);
	},

	onActivate: function () {
		if (this.getMode() === "session") {
			this.audience.hide();
		}
		var rightnow = new Date();
		this.startdate.setValue(rightnow.getDate() + "." + (rightnow.getMonth() + 1) + "." + rightnow.getFullYear());
		rightnow.setDate(rightnow.getDate() + 7);
		this.enddate.setValue(rightnow.getDate() + "." + (rightnow.getMonth() + 1) + "." + rightnow.getFullYear());
	},

	enableInputElements: function () {
		this.submitButton.enable();
	},

	disableInputElements: function () {
		this.submitButton.disable();
	},

	saveHandler: function (button) {
		var panel = null;
		var mainPartValues = null;
		var values = {};
		if (this.getMode() === "session") {
			panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newSessionMotdPanel;
			mainPartValues = panel.mainPart.getValues();
			values.audience = "session";
			values.sessionkey = this.getSessionkey();
		} else {
			panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.newMotdPanel;
			mainPartValues = panel.mainPart.getValues();
			values.audience = mainPartValues.picker;
			values.sessionkey = "";
		}
		values.title = mainPartValues.title;
		values.text = mainPartValues.text;
		values.startdate = ARSnova.app.getController('Motds').getTimestampByString(mainPartValues.startdate);
		values.enddate =  ARSnova.app.getController('Motds').getTimestampByString(mainPartValues.enddate);
		var promise = new RSVP.Promise();
		ARSnova.app.getController('Motds').add({
			title: values.title,
			text: values.text,
			startdate: values.startdate,
			enddate: values.enddate,
			audience: values.audience,
			sessionkey: values.sessionkey,
			saveButton: button,
			successFunc: function (response, opts) {
				promise.resolve(response);
				button.enable();
			},
			failureFunc: function (response, opts) {
				Ext.Msg.alert(Messages.NOTICE, Messages.QUESTION_CREATION_ERROR);
				promise.reject(response);
				button.enable();
			}
		});
		panel.motdtitle.setValue("");
		panel.motdtext.setValue("");
		return promise;
	}
});
