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
Ext.define('ARSnova.view.speaker.form.FlashcardQuestion', {
	extend: 'Ext.Container',

	constructor: function () {
		this.callParent(arguments);

		this.answer = Ext.create('Ext.plugins.ResizableTextArea', {
			placeHolder: Messages.ANSWER
		});

		var previewButton = Ext.create('Ext.Button', {
			text: Messages.ANSWER_PREVIEW_BUTTON_TITLE,
			ui: 'confirm',
			style: 'width:200px; margin-top: 12px;',
			handler: function () {
					this.previewHandler();
				},
			scope: this
		});

		this.add([{
			xtype: 'fieldset',
			title: Messages.ANSWER,
			items: [
				this.answer,
				previewButton
			]
		}]);
	},

	initWithQuestion: function (question) {
		var possibleAnswers = question.possibleAnswers;
		if (possibleAnswers.length === 0) {
			return;
		}
		this.answer.setValue(possibleAnswers[0].text);
	},

	getQuestionValues: function () {
		var result = {};

		result.possibleAnswers = [{text: this.answer.getValue(), correct: true}];

		return result;
	},

	getValue: function () {
		var values = [], obj;
		obj = {
				text: this.answer.getValue(),
				correct: true
			};
		values.push(obj);
		return values;
	},

	previewHandler: function () {
		var answerPreview = Ext.create('ARSnova.view.AnswerPreviewBox', {
			xtype: 'answerPreview'
		});
		answerPreview.showPreview(this.getValue());
	},

	markEmptyFields: function () {
		if (this.answer.getValue().trim() === "") {
			this.answer.addCls("required");
		}
	}
});
