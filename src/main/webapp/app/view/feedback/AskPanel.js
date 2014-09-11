/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
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
Ext.define('ARSnova.view.feedback.AskPanel', {
	extend: 'Ext.Panel',

	requires: ['ARSnova.model.Question'],

	config: {
		title: 'AskPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		closePanelHandler: null
	},

	/* toolbar items */
	toolbar: null,
	saveButton: null,
	backButton: null,

	initialize: function () {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			handler: this.getClosePanelHandler() || this.closePanel,
			scope: this
		});

		this.saveButton = Ext.create('Ext.Button', {
			text: Messages.SEND,
			ui: 'confirm',
			handler: this.askQuestion,
			scope: this
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			ui: 'light',
			title: Messages.QUESTION_TO_SPEAKER,
			items: [this.backButton, {xtype: 'spacer'}, this.saveButton]
		}),

		this.subject = Ext.create('Ext.form.Text', {
			label: Messages.QUESTION_SUBJECT,
			name: 'subject',
			maxLength: 140,
			placeHolder: Messages.QUESTION_SUBJECT_PLACEHOLDER
		});

		this.text = Ext.create('Ext.form.TextArea', {
			xtype: 'textareafield',
			label: Messages.QUESTION_TEXT,
			name: 'text',
			maxRows: 7,
			maxLength: 2500,
			placeHolder: Messages.QUESTION_TEXT_PLACEHOLDER
		});

		// Preview button
		this.previewButton = Ext.create('Ext.Button', {
			text: Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui: 'confirm',
			cls: 'previewButton',
			scope: this,
			handler: function () {
					this.previewHandler();
				}
		});

		// Preview panel with integrated button
		this.previewPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			style: 'margin-left: 0',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				items: [this.previewButton]
			}]
		});

		this.add([this.toolbar, {
			cls: 'gravure',
			style: 'margin: 10px',
			html: Messages.QUESTION_INSTRUCTION
		}, {
			xtype: 'formpanel',
			submitOnAction: false,
			scrollable: null,
			cls: 'standardForm',

			items: [{
				xtype: 'fieldset',
				items: [
					this.subject,
					this.text,
					this.previewPart
				]
			}, {
				xtype: 'button',
				ui: 'confirm',
				cls: 'login-button',
				text: Messages.SEND,
				handler: this.askQuestion,
				scope: this
			}]
		}]);
	},

	askQuestion: function () {
		var me = this;
		var question = Ext.create('ARSnova.model.Question', {
			type: "interposed_question",
			sessionId: localStorage.getItem("sessionId"),
			sessionKeyword: localStorage.getItem("keyword"),
			subject: this.subject.getValue().trim(),
			text: this.text.getValue().trim(),
			timestamp: new Date().getTime()
		});
		question.set('_id', undefined);

		var validation = question.validate();
		if (!validation.isValid()) {
			me.down('fieldset').items.items.forEach(function (el) {
				if (el.xtype == 'textfield')
					el.removeCls("required");
			});

			validation.items.forEach(function (el) {
				me.down('textfield[name=' + el.getField() + ']').addCls("required");
			});
			return;
		}

		ARSnova.app.getController('Feedback').ask({
			question: question,
			success: function () {
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
					html: Messages.QUESTION_SAVED
				});
				Ext.Viewport.add(theNotificationBox);
				theNotificationBox.show();

				/* Workaround for Chrome 34+ */
				Ext.defer(function chromeWorkaround() {
					theNotificationBox.destroy();
					// Use back button for closing this panel because we may override the button's behaviour.
					(me.backButton.getHandler())();
					me.subject.setValue('');
					me.text.setValue('');
				}, 3000);
			},
			failure: function (records, operation) {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.TRANSMISSION_ERROR);
			}
		});
	},


	previewHandler: function () {
		var questionPreview = Ext.create('ARSnova.view.QuestionPreviewBox', {
			xtype: 'questionPreview'
		});
		questionPreview.showPreview(this.subject.getValue(), this.text.getValue());
	},

	setClosePanelHandler: function(handler) {
		var me = this;
		var previousHandler = me.backButton.getHandler();
		// Restore previous back button handler after custom handler has been executed.
		me.backButton.setHandler(Ext.Function.createSequence(handler, function restoreHandler() {
			me.backButton.setHandler(previousHandler);
		}));
	},

	closePanel: function () {
		var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
		panel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.votePanel, {
			type: 'slide',
			direction: 'right',
			duration: 700
		});
	}
});
