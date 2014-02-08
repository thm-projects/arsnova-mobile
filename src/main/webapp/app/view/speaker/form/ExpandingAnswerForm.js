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
Ext.define('ARSnova.view.speaker.form.ExpandingAnswerForm', {
	extend: 'Ext.Container',
	
	config: {
		minAnswers: 2,
		maxAnswers: 8,
		start: 4,
		step: 1,
		wording: {
			placeHolder: Messages.OPTION_PLACEHOLDER,
			/** 'arabic' or 'alphabet' **/
			enumeration: 'arabic'
		}
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
					for (var i=0; i < this.getMaxAnswers(); i++) {
						this.answerComponents[i].setHidden(i >= value);
						this.correctComponents[i].setHidden(i >= value);
					}
				}
			}
		});
		
		var previewButton = Ext.create('Ext.Button', {
			text	: Messages.QUESTION_PREVIEW,
			ui		: 'confirm',
			cls		: 'previewQuestionButton',
			style   : 'width:200px;',
			handler: function() {this.previewHandler();},
			scope: this
		});
		
		var answerFieldset = Ext.create('Ext.form.FieldSet', {
			title: Messages.ANSWERS,
			items: [this.selectAnswerCount]
		});
		
		var answerOptions = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			submitOnAction: false,			
			items: [answerFieldset, previewButton]
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
		var labelGenerator = this.getEnumeration();
		
		for (var i=0; i < this.getMaxAnswers(); i++) {
			theComponentId = answerOptionEntryId + "-" + i;
			this.answerComponents[i] = Ext.create('Ext.field.Text', {
				id:				theComponentId,
				name:			theComponentId,
				placeHolder:	Messages.ANSWER,
				hidden:			this.getStart() <= i,
				label:			this.getWording().placeHolder + " " + labelGenerator(i)
			});
			answerFieldset.add(this.answerComponents[i]);
		}
		for (var i=0; i < this.getMaxAnswers(); i++) {
			theComponentId = answerCorrectOptionEntryId + "-" + i;
			this.correctComponents[i] = Ext.create('Ext.field.Toggle', {
				id:		theComponentId,
				name:	theComponentId,
				hidden:	this.getStart() <= i,
				label:	this.getWording().placeHolder + " " + labelGenerator(i)
			});
			correctAnswerFieldset.add(this.correctComponents[i]);
		}
		
		this.add([answerOptions, correctAnswer]);
	},
	
	getEnumeration: function() {
		switch (this.getWording().enumeration.toLowerCase()) {
			case 'alphabet':
				var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
				return function(index) {
					return alphabet[index];
				};
			case 'arabic':
			default:
				return function(index) {
					return index+1;
				};
		}
	},
	
	getValues: function() {
		var values = [], obj;
		for (var i=0; i < this.selectAnswerCount.getValue(); i++) {
			obj = {
				text: this.answerComponents[i].getValue()
			};
			if (this.correctComponents[i].getValue()) {
				obj.correct = true;
			} else {
				obj.correct = false;
			}
			values.push(obj);
		}
		return values;
	},
	
	hasCorrectOptions: function() {
		var hasCorrectOptions = false;
		for (var i=0; i < this.selectAnswerCount.getValue(); i++) {
			hasCorrectOptions = hasCorrectOptions || !!this.correctComponents[i].getValue();
		}
		return hasCorrectOptions;
	},
	
	initWithQuestion: function(question) {
		var possibleAnswers = question.possibleAnswers;
		if (possibleAnswers.length < this.getMinAnswers() || possibleAnswers.length > this.getMaxAnswers()) {
			return;
		}
		this.initSpinnerField(possibleAnswers.length);
		this.initAnswerComponents(possibleAnswers);
	},
	
	initSpinnerField: function(startValue) {
		this.setStart(startValue);
		this.selectAnswerCount.setValue(startValue);
		this.selectAnswerCount.fireEvent('spin', this.selectAnswerCount, this.getStart());
	},
	
	initAnswerComponents: function(possibleAnswers) {
		possibleAnswers.forEach(function(answer, index) {
			this.answerComponents[index].setValue(answer.text);
			this.correctComponents[index].setValue(answer.correct);
		}, this);
	},
	
	getQuestionValues: function() {
		var result = {};
		
		result.possibleAnswers = this.getValues();
		
		if (!this.hasCorrectOptions()) {
			result.noCorrect = 1;
		}
		return result;
	},
	
	previewHandler: function() {
		(new ARSnova.view.MMPanel()).showPreview("Implementierungshinweis", "Anstatt Titel und Inhalt hier alle Antworten, jede in einem eigenen Feld anzeigen");
	}
});
