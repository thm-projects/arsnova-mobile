/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2019 The ARSnova Team and Contributors
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
Ext.define('ARSnova.view.components.CsvExportMessageBox', {
	extend: 'Ext.MessageBox',

	config: {
		exportCallback: Ext.emptyFn,

		hideOnMaskTap: true,
		cls: 'importExportFilePanel',
		title: Messages.QUESTIONS_EXPORT_MSBOX_TITLE
	},

	initialize: function () {
		this.add([{
			xtype: 'button',
			iconCls: 'icon-close',
			cls: 'closeButton',
			handler: function () { this.getParent().hide(); }
		}, {
			html: Messages.QUESTIONS_CSV_EXPORT_DELIMITER_INFO,
			cls: 'x-msgbox-text'
		}, {
			xtype: 'container',
			layout: 'vbox',
			defaults: {
				scope: this
			},
			items: [
				{
					xtype: 'fieldset',
					itemId: 'csvDelimiterField',
					defaults: {
						xtype: 'radiofield',
						labelWidth: '60%'
					},
					items: [{
						name: 'delimiter',
						label: Messages.QUESTIONS_CSV_EXPORT_COMMA,
						value: ',',
						checked: true
					}, {
						name: 'delimiter',
						label: Messages.QUESTIONS_CSV_EXPORT_SEMICOLON,
						value: ';'
					}, {
						name: 'delimiter',
						label: Messages.QUESTIONS_CSV_EXPORT_TABULATOR,
						value: '\t'
					}]
				}, {
					xtype: 'togglefield',
					itemId: 'excelField',
					name: 'excel',
					label: Messages.QUESTIONS_CSV_EXPORT_EXCEL,
					labelWidth: '60%'
				}, {
				xtype: 'button',
				ui: 'action',
				text: Messages.EXPORT_BUTTON_LABEL,
				handler: function () {
					var csvDelimiterField = this.down('#csvDelimiterField');
					var excelField = this.down('#excelField');
					this.getExportCallback()(csvDelimiterField.items.items[0].getGroupValue(), excelField.getValue());
					this.hide();
				}
			}]
		}]);
	}
});
