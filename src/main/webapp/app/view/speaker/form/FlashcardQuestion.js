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
		
		this.uploadView = Ext.create('ARSnova.view.speaker.form.ImageUploadPanel', {
			handlerScope: this,
			activateTemplates: false,
			urlUploadHandler: this.setImage,
			fsUploadHandler: this.setImage
		});
		
		this.uploadView.setUploadPanelConfig(
			Messages.PICTURE_SOURCE + " " + 
			Messages.FLASHCARD_FRONT_PAGE
		);
		
		this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
			editable: false,
			gridIsHidden: true,
			hidden: true,
			style: "padding-top: 10px;"
		});

		var previewButton = Ext.create('Ext.Button', {
			text: Ext.os.is.Desktop ? 
				Messages.QUESTION_PREVIEW_BUTTON_TITLE_DESKTOP:
				Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui: 'action',
			cls: Ext.os.is.Desktop ?
				'previewButtonLong':
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
				items: [this.answer]
			}, {
				xtype: 'fieldset',
				items: [previewButton]
			}, this.uploadView, this.grid]
		}]);
	},

	initWithQuestion: function (question) {
		var possibleAnswers = question.possibleAnswers;
		if (possibleAnswers.length === 0) {
			return;
		}
		this.answer.setValue(possibleAnswers[0].text);
	},
	
	setImage: function (image) {
		var newQuestionPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
		newQuestionPanel.setImage(image);
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
			answers: this.getValue(),
			image: panel.image
		});
	},

	markEmptyFields: function () {
		if (this.answer.getValue().trim() === "") {
			this.answer.addCls("required");
		}
	}
});
