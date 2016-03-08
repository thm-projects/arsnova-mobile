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
		layout: {
			type: 'vbox',
			pack: 'center'
		},
		closePanelHandler: null
	},

	/* toolbar items */
	toolbar: null,
	backButton: null,

	initialize: function () {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			handler: this.getClosePanelHandler() || this.closePanel,
			scope: this
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			ui: 'light',
			title: Messages.QUESTION_TO_SPEAKER,
			items: [this.backButton]
		});

		this.subject = Ext.create('Ext.form.Text', {
			label: Messages.QUESTION_SUBJECT,
			name: 'subject',
			maxLength: 50,
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

		this.twitterWallInfoLabel = Ext.create('Ext.Label', {
			html: Messages.TWITTER_WALL_PRIVACY_INFO,
			hidden: true
		});

		this.markdownEditPanel = Ext.create('ARSnova.view.MarkDownEditorPanel', {
			processElement: this.text
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
				this.previewHandler();
			}
		});

		// Preview panel with integrated button
		this.buttonPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			style: 'margin-bottom: 15px',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				items: [this.previewButton]
			}, {
				xtype: 'button',
				ui: 'confirm',
				cls: 'login-button',
				text: Messages.SEND,
				handler: this.askQuestion,
				scope: this
			}]
		});

		this.fieldSet = Ext.create('Ext.form.FieldSet', {
			items: [
				this.markdownEditPanel,
				this.subject,
				this.text
			]
		});

		this.on('painted', function () {
			var features = Ext.decode(sessionStorage.getItem("features"));
			var instruction = features.twitterWall ? Messages.TWITTER_WALL_PRIVACY_INFO : '';
			this.fieldSet.setInstructions(instruction);
		});

		this.add([this.toolbar, {
			cls: 'gravure',
			style: 'margin: 10px',
			html: Messages.QUESTION_INSTRUCTION
		}, {
			xtype: 'formpanel',
			submitOnAction: false,
			scrollable: null,
			items: [this.fieldSet]
		}, this.buttonPart]);
	},

	askQuestion: function () {
		var me = this;
		var question = Ext.create('ARSnova.model.Question', {
			type: "interposed_question",
			sessionId: localStorage.getItem("sessionId"),
			sessionKeyword: sessionStorage.getItem("keyword"),
			subject: this.subject.getValue().trim(),
			text: this.text.getValue().trim(),
			timestamp: new Date().getTime()
		});
		question.set('_id', undefined);

		var field;
		var validation = question.validate();
		if (!validation.isValid()) {
			me.down('fieldset').items.items.forEach(function (el) {
				if (el.xtype === 'textfield') {
					el.removeCls("required");
				}
			});

			validation.items.forEach(function (el) {
				field = me.down('textfield[name=' + el.getField() + ']');
				field.addCls("required");
				field.element.select(".x-input-text").addCls('formInvalid');
			});

			Ext.Msg.alert(Messages.NOTIFICATION, Messages.INCOMPLETE_INPUTS);
			return;
		} else {
			me.down('fieldset').items.items.forEach(function (el) {
				el.removeCls("required");
				el.element.select(".x-input-text").removeCls('formInvalid');
			});
		}

		ARSnova.app.getController('Feedback').ask({
			question: question,
			success: function () {
				Ext.toast({
					message: Messages.QUESTION_SAVED,
					timeout: 3000,
					listeners: {
						animationend: function () {
							// Use back button for closing this panel because we may override the button's behaviour.
							(me.backButton.getHandler())();
							me.subject.setValue('');
							me.text.setValue('');
						}
					}
				});
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

	setClosePanelHandler: function (handler) {
		var me = this;
		var previousHandler = me.backButton.getHandler();
		// Restore previous back button handler after custom handler has been executed.
		me.backButton.setHandler(Ext.Function.createSequence(handler, function restoreHandler() {
			me.backButton.setHandler(previousHandler);
		}));
	},

	closePanel: function () {
		var userTabPanel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;
		userTabPanel.animateActiveItem(userTabPanel.inClassPanel, {
			type: 'slide',
			direction: 'right',
			duration: 700
		});
	}
});
