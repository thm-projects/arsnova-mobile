/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
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
Ext.define('ARSnova.view.speaker.form.FlashcardQuestion', {
	extend: 'Ext.Container',
	
	config: {
		cls: 'newQuestion'
	},

	constructor: function () {
		this.callParent(arguments);

		this.answer = Ext.create('Ext.plugins.ResizableTextArea', {
			placeHolder: Messages.FLASHCARD_BACK_PAGE
		});

		var previewButton = Ext.create('Ext.Button', {
			text: Messages.ANSWER_PREVIEW_BUTTON_TITLE,
			ui: 'action',
			style: 'width:200px;',
			handler: function () {
				this.previewHandler();
			},
			scope: this
		});

		this.add([{
			xtype: 'fieldset',
			title: ' ',
			items: [this.answer]
		}, {
			xtype: 'fieldset',
			items: [previewButton]
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
