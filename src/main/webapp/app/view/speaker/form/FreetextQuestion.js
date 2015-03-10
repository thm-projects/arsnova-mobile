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
Ext.define('ARSnova.view.speaker.form.FreetextQuestion', {
	extend: 'Ext.Container',
	config: {
		cls: 'newQuestionOptions centerFormTitle',
		scrollable: null,

		/**
		 * Which button should be pressed initially? 'yes', 'no', or 'none'
		 */
		pressed: 'none'
	},

	constructor: function () {
		this.callParent(arguments);

//-----------

		this.textarea = Ext.create('Ext.plugins.ResizableTextArea', {
			name: 'text',
			placeHolder: Messages.FORMAT_PLACEHOLDER
		});

		//Siehe yesno question
		var caseSensitiveButton = Ext.create('Ext.Button', {
			text: Messages.GRAMMAR_CASE_SENSITIVE
		});

		var spaceButton = Ext.create('Ext.Button', {
			text: Messages.GRAMMAR_SPACE
		});

		var punctuationButton = Ext.create('Ext.Button', {
			text: Messages.GRAMMAR_PUNCTUATION
		});

		this.segmentButton = Ext.create('Ext.SegmentedButton', {
			style: 'margin: auto;',
			defaults: {
				ui: 'action',
				style: 'width: 33.3%'
			},
			allowDepress: true,
			allowMultiple: true,
			items:[caseSensitiveButton, spaceButton, punctuationButton]
		});

		var grammarField = Ext.create('Ext.form.FieldSet', {
			xtype: 'fieldset',
			title: Messages.GRAMMAR_PLACEHOLDER,
			items: [this.segmentButton]
		});

		var sizearea = Ext.create('Ext.field.Text', {
			name: 'size',
			placeHolder: Messages.FREETEXT_SIZE
		});

		var countButton = Ext.create('Ext.Button', {
			ui: 'action',
			text: Messages.FREETEXT_COUNT,
			style: 'margin: auto; width: 69%'
		});

		this.mainPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newTest',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				title: Messages.CORRECT_PLACEHOLDER,
				items: [this.textarea, sizearea]
			}]
		});

		
//-----------

		this.add([{
			xtype: 'formpanel',
			scrollable: null,
			items: [
					this.mainPart,
					countButton,
					grammarField
			]
		}]);
	}
});