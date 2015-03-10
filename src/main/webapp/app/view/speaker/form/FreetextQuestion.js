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
			placeHolder: Messages.FREETEXT_TEST
		});

		//Siehe yesno question
		this.yesButton = Ext.create('Ext.Button', {
			text: Messages.GRAMMAR_YES//this.getTextYes(),
			//pressed: this.getPressed() === 'yes'
		});

		this.noButton = Ext.create('Ext.Button', {
			text: Messages.GRAMMAR_NO//this.getTextNo(),
			//pressed: this.getPressed() === 'no'
		});

		this.segmentButton = Ext.create('Ext.SegmentedButton', {
			style: 'margin: auto;',
			defaults: {
				ui: 'action',
				style: 'width: 50%'
			},
			allowDepress: false,
			items:[this.yesButton, this.noButton]
		});

		this.mainPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newTest',
			scrollable: null,

			items: [{
				xtype: 'fieldset',
				items: [this.textarea]
			}]
		});
//-----------

		this.add([{
			xtype: 'formpanel',
			scrollable: null,
			items: [
					this.mainPart,
					this.segmentButton
			]
		}]);
	}
});