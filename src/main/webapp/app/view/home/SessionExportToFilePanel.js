/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2014 The ARSnova Team
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
Ext.define('ARSnova.view.home.SessionExportToFilePanel', {
	extend: 'Ext.Panel',

	config: {
		exportSessionMap: null,
		backReference: null
	},

	initialize: function () {
		this.callParent(arguments);
		var me = this;

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			handler: function () {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(me.getBackReference(), {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.exportButton = Ext.create('Ext.Button', {
			text: Messages.EXPORT_BUTTON_LABEL,
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 89px',
			handler: function () {
				me.handleExport();
			},
			scope: this
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.EXPORT_SESSION_TITLE,
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				{xtype: 'spacer'},
				this.exportButton
			]
		});

		this.exportAnswerToggle = Ext.create('Ext.field.Toggle', {
			label: Messages.ANSWERS_STATISTICS,
			labelWidth: 'auto',
			labelCls: 'session-toggle-label',
			cls: 'rightAligned',
			value: true
		});

		this.exportStudentsQuestionToggle = Ext.create('Ext.field.Toggle', {
			label: Messages.QUESTIONS_FROM_STUDENTS,
			labelWidth: 'auto',
			labelCls: 'session-toggle-label',
			cls: 'rightAligned',
			value: true
		});

		this.exportOptions = Ext.create('Ext.form.FieldSet', {
			text: Messages.EXPORT_MSG,
			items: [
				this.exportAnswerToggle,
				this.exportStudentsQuestionToggle
			]
		});

		this.contentPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			xtype: 'mathJaxMarkDownPanel',
			id: 'questionContent',
			style: 'background-color: transparent; color: black; '
		});
		this.contentPanel.setContent(Messages.EXPORT_SESSION_INFORMATION, true, true);

		this.singleTemplatePanel = Ext.create('Ext.Panel', {

			layout:	{
				type: 'vbox',
				pack: 'center',
				align: 'center'
			},
			items: [this.contentPanel]
		});

		this.matrixButtonPanel = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			}
		});

		this.exportMatrixButton = Ext.create('ARSnova.view.MatrixButton', {
			text: 'Export',
			buttonConfig: 'icon',
			imageCls: 'icon-cloud-download ',
			scope: this,
			handler: function () {
				me.handleExport();
			}
		});

		this.matrixButtonPanel.add(this.exportMatrixButton);

		this.mainPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,

			items: [
				this.singleTemplatePanel,
				this.exportOptions,
				this.matrixButtonPanel
			]
		});

		this.add([
			this.toolbar,
			this.mainPart
		]);
	},

	handleExport: function () {
		var withAnswerStatistics = this.exportAnswerToggle.getValue();
		var withFeedbackQuestions = this.exportStudentsQuestionToggle.getValue();

		ARSnova.app.getController("SessionExport").exportSessionsToFile(
				this.getExportSessionMap(), withAnswerStatistics, withFeedbackQuestions);
	}
});
