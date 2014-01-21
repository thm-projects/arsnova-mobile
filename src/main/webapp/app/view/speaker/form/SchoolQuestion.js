/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
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
Ext.define('ARSnova.view.speaker.form.SchoolQuestion', {
	extend: 'Ext.Container',
	
	config: {
		maxAnswers: 6,
		wording: [Messages.SCHOOL_A, Messages.SCHOOL_B, Messages.SCHOOL_C,
		          Messages.SCHOOL_D, Messages.SCHOOL_E, Messages.SCHOOL_F]
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		this.fields = [];
		for (var i=0; i < this.getMaxAnswers(); i++) {
			this.fields.push(Ext.create('Ext.field.Text', {
				label: (i+1) + '. ',
				labelWidth: '15%',
				value: this.getWording()[i]
			}));
		}
		
		this.add([{
			xtype: 'fieldset',
			title: Messages.ANSWERS,
			items: this.fields
		}]);
	},
	
	initWithQuestion: function(question) {
		var possibleAnswers = question.possibleAnswers;
		
		this.setMaxAnswers(possibleAnswers.length);
		for (var i=0; i < this.fields.length; i++) {
			this.fields[i].setValue(possibleAnswers[i].text);
		}
	},
	
	getQuestionValues: function() {
		var result = {};
		
		result.possibleAnswers = this.fields.map(function(item) {
			return {
				text: item.getValue(),
				correct: false
			};
		});
		return result;
	},
	
	markEmptyFields: function() {
		var field;
		for (var i=0; i < this.fields.length; i++) {
			field = this.fields[i];
			if (field.getValue().trim() === "") {
				field.addCls("required");
			}
		}
	}
});
