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
		pressed: 'free'
	},

	constructor: function () {
		this.callParent(arguments);

		// Freitext oder Fixtext
		var freeButton = Ext.create('Ext.Button', {
			text: Messages.FREETEXT_BUTTON_FREE,
		    handler: function () {
            	mainFormPanel.hide();
            	selectField.hide();
            	ratingField.hide();
            	grammarField.hide();
            },
            pressed: this.getPressed() === 'free'
		});
		
        var fixButton = Ext.create('Ext.Button', {
			text: Messages.FREETEXT_BUTTON_FIX,
			handler: function () {
				mainFormPanel.show();
				selectField.show();
				ratingField.show();
            },
            pressed: this.getPressed() === 'fix'
		});
        
		var ffSegmentedButton = Ext.create('Ext.SegmentedButton', {
			style: 'margin: auto;',
			defaults: {
				ui: 'action',
				style: 'width: 50%'
			},
			items:[freeButton, fixButton],
			/*listeners: {
				scope: this,
				toggle: function (container, button, pressed) {
					if (pressed) {
						if (button === this.fixButton) {
							this.setPressed('fix');
						} else {
							this.setPressed('free');
						} 
					}
				}
			}*/
		});

		var freefixField = Ext.create('Ext.form.FieldSet', {
			xtype: 'fieldset',
			title: Messages.FREETEXT_QUESTION_TYPE,
			items: [ffSegmentedButton]
		});
		
		// ----------------------------------------

		// Groß-, Kleinschreibung, Interpunktion, usw.
		
        var easyButton = Ext.create('Ext.Button', {
			text: Messages.FREETEXT_BUTTON_EASY,
			handler: function () {
            	grammarField.hide();
            },
            pressed: true
		});
        
        var strictButton = Ext.create('Ext.Button', {
			text: Messages.FREETEXT_BUTTON_STRICT,
			handler: function () {
            	grammarField.show();
            },
            pressed: this.getPressed() === 'strict'
		});
        
		var esSegmentedButton = Ext.create('Ext.SegmentedButton', {
			style: 'margin: auto;',
			defaults: {
				ui: 'action',
				style: 'width: 50%'
			},
			items:[easyButton, strictButton],
			/*listeners: {
				scope: this,
				toggle: function (container, button, pressed) {
					if (pressed) {
						if (button === this.easyButton) {
							this.setPressed('easy');
						} else {
							this.setPressed('strict');
						} 
					}
				}
			}*/
		});
		
		var selectField = Ext.create('Ext.form.FieldSet', {
			xtype: 'fieldset',
			title: Messages.FREETEXT_CHECK, 
			items: [esSegmentedButton],
			hidden: true
		});

		/* Selektion der Prüfung */

		var caseSensitiveButton = Ext.create('Ext.Button', {
			text: Messages.GRAMMAR_CASE_SENSITIVE
		});
		
		var spaceButton = Ext.create('Ext.Button', {
			text: Messages.GRAMMAR_SPACE
		});

		var punctuationButton = Ext.create('Ext.Button', {
			text: Messages.GRAMMAR_PUNCTUATION
		});

		var checkSegmentedButton = Ext.create('Ext.SegmentedButton', {
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
			items: [checkSegmentedButton],
			hidden: true
		});
		
		// ----------------------------------------

		// Bewertung der Antwort
		
		var rating = Ext.create("ARSnova.view.CustomSliderField", {
			minValue: 0,
			maxValue: 10,
			value: 0,
			increment: 1
		});

		var ratingField = Ext.create('Ext.form.FieldSet', {
			xtype: 'fieldset',
			title: Messages.ANSWER_POINTS,
			items: [rating],
			hidden: true
		});
		
		// ----------------------------------------

		// Eingabefeld
		
		var textarea = Ext.create('Ext.plugins.ResizableTextArea', {
			name: 'text',
			placeHolder: Messages.FORMAT_PLACEHOLDER
		});

		var sizearea = Ext.create('Ext.field.Text', {
			name: 'size',
			placeHolder: Messages.FREETEXT_SIZE
		});

		var mainFormPanel = Ext.create('Ext.form.FormPanel', {
			cls: 'newTest',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				title: Messages.CORRECT_PLACEHOLDER,
				items: [textarea, sizearea]
			}],
			hidden: true
		});
		
		// ----------------------------------------
		
		this.add([{
			xtype: 'formpanel',
			scrollable: null,
			items: [
				freefixField,
				mainFormPanel,
				selectField,
				grammarField,
				ratingField
			]
		}]);
	}
});