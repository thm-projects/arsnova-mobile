/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Panel zum Angeben der exakten Fragenanzahl
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
Ext.define('ARSnova.view.ExpandingAnswerForm', {
	extend: 'Ext.Panel',
	
	config: {
		minAnswers: 2,
		maxAnswers: 8,
		start: 4,
		step: 1
	},

	constructor: function() {
		this.callParent(arguments);
		
		this.answerComponents = [];
		this.correctComponents = [];
		
		this.selectAnswerCount = Ext.create('Ext.field.Spinner', {
			label	: Messages.COUNT,
			minValue: this.getMinAnswers(),
			maxValue: this.getMaxAnswers(),
			stepValue: this.getStep(),
			value: this.getStart(),
			listeners: {
				scope: this,
				spin: function(selectField, value) {
					for (var i=1; i <= this.getMaxAnswers(); i++) {
						this.answerComponents[i].setHidden(i > value);
						this.correctComponents[i].setHidden(i > value);
					}
				}
			}
		});
		
		var answerFieldset = Ext.create('Ext.form.FieldSet', {
			title: Messages.ANSWERS,
			items: [this.selectAnswerCount]
		});
		
		var answerOptions = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			submitOnAction: false,
			
			items: [answerFieldset]
		});
		
		var correctAnswerFieldset = Ext.create('Ext.form.FieldSet', {
			xtype: 'fieldset',
			title: Messages.CORRECT_ANSWER
		});
		
		var correctAnswer = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			submitOnAction: false,
			items: [correctAnswerFieldset]
		});
		
		var answerOptionEntryId = Ext.id();
		var answerCorrectOptionEntryId = Ext.id();
		var theComponentId;
		
		for (var i=1; i <= this.getMaxAnswers(); i++) {
			theComponentId = answerOptionEntryId + "-" + i;
			this.answerComponents[i] = Ext.create('Ext.field.Text', {
				id:				theComponentId,
				name:			theComponentId,
				placeHolder:	Messages.OPTION_PLACEHOLDER + " " + i,
				hidden:			this.getStart() < i,
				label:			Messages.ANSWER
			});
			answerFieldset.add(this.answerComponents[i]);
		}
		for (var i=1; i <= this.getMaxAnswers(); i++) {
			theComponentId = answerCorrectOptionEntryId + "-" + i;
			this.correctComponents[i] = Ext.create('Ext.field.Toggle', {
				id:		theComponentId,
				name:	theComponentId,
				hidden:	this.getStart() < i,
				label:	Messages.OPTION_PLACEHOLDER + " " + i
			});
			correctAnswerFieldset.add(this.correctComponents[i]);
		}
		
		this.add([answerOptions, correctAnswer]);
	},
	
	getValues: function() {
		var values = [], obj;
		for (var i=1; i <= this.selectAnswerCount.getValue(); i++) {
			obj = {
				text: this.answerComponents[i].getValue()
			};
			if (this.correctComponents[i].getValue()) {
				obj.correct = 1;
			}
			values.push(obj);
		}
		return values;
	},
	
	hasCorrectOptions: function() {
		var hasCorrectOptions = false;
		for (var i=1; i <= this.selectAnswerCount.getValue(); i++) {
			hasCorrectOptions = hasCorrectOptions || !!this.correctComponents[i].getValue();
		}
		return hasCorrectOptions;
	}
});
