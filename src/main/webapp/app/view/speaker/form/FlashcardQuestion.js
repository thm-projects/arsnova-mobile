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

		this.markdownEditPanel = Ext.create('ARSnova.view.MarkDownEditorPanel', {
			processElement: this.answer
		});

		var previewButton = Ext.create('Ext.Button', {
			text: Ext.os.is.Desktop ?
				Messages.QUESTION_PREVIEW_BUTTON_TITLE_DESKTOP :
				Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui: 'action',
			cls: Ext.os.is.Desktop ?
				'previewButtonLong' :
				'previewButton',
			handler: function () {
				this.previewHandler();
			},
			scope: this
		});

		this.add([{
			xtype: 'formpanel',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				items: [this.markdownEditPanel, this.answer]
			}, {
				xtype: 'fieldset',
				items: [previewButton]
			}]
		}]);

		this.on('painted', function () {
		});
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
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;

		var answerPreview = Ext.create('ARSnova.view.AnswerPreviewBox', {
			xtype: 'answerPreview'
		});

		answerPreview.showPreview({
			title: panel.subject.getValue(),
			content: panel.textarea.getValue(),
			questionType: 'flashcard',
			answers: this.getValue()
		});
	},

	isEmpty: function () {
		return this.answer.getValue().trim() === "";
	},

	markEmptyFields: function () {
		if (this.isEmpty()) {
			this.answer.addCls("required");
		}
	}
});
