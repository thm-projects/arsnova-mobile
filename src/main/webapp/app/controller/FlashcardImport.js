/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2016 The ARSnova Team
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
Ext.define("ARSnova.controller.FlashcardImport", {
	extend: 'Ext.app.Controller',

	requires: [
		'ARSnova.model.Question'
	],

	showLoadMask: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var audiencePanel = sTP.audienceQuestionPanel;
		audiencePanel.loadFilePanel.hide();
		Ext.Viewport.add(audiencePanel.loadMask);
		audiencePanel.loadMask.show();
	},

	refreshPanel: function (error) {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var audiencePanel = sTP.audienceQuestionPanel;
		audiencePanel.onActivate();
		audiencePanel.loadMask.hide();

		if (error) {
			console.log("error importing questions");
		}
	},

	isFlashcardCsvFile: function (json) {
		return json.length && json[0].length === 3;
	},

	importFile: function (data, isCsvFile, isFlashcardJson) {
		if (isCsvFile) {
			this.importCsvFile(data);
		} else if (isFlashcardJson) {
			this.showPromptAndImportJsonFile(data);
		}
	},

	importJsonFile: function (json, subject) {
		var me = this;
		var checkSubject = typeof subject === 'undefined';

		if (!this.hasValidationError(json, checkSubject)) {
			this.showLoadMask();
			var flashcards = this.formatFlashcards(json, subject);
			ARSnova.app.restProxy.bulkSaveSkillQuestions(flashcards, {
				success: function (response) { me.refreshPanel(false); },
				failure: function (response) { me.refreshPanel(true); }
			});
		}
	},

	importCsvFile: function (csv) {
		var questionImportCtrl = ARSnova.app.getController('QuestionImport');
		var flashcardExportCtrl = ARSnova.app.getController('FlashcardExport');
		var flashcards = [], json = '';

		try {
			json = JSON.parse(ARSnova.utils.CsvUtil.csvToJson(csv));
			json.splice(0, 1);

			if (this.isFlashcardCsvFile(json)) {
				this.importJsonFile(this.parseCsvToJson(json));
			} else if (!questionImportCtrl.hasValidationError(json, true)) {
				flashcards = questionImportCtrl.formatQuestions(json, 'flashcard');
				json = flashcardExportCtrl.preparseFlashcards(flashcards, 'csv');
				this.importJsonFile(json);
			} else {
				throw true;
			}
		} catch (err) {
			this.refreshPanel(true);
		}
	},

	showPromptAndImportJsonFile: function (json) {
		var me = this;
		var flashcards = [];

		try {
			json = JSON.parse('[' + json + ']');
			if (!this.hasValidationError(json, false)) {
				Ext.Msg.show({
					message: Messages.FLASHCARDS_CHOOSE_SUBJECT,
					cls: 'importSubjectPrompt',
					buttons: [
						{text: Messages.CANCEL, itemId: 'cancel', ui: 'action'},
						{text: Messages.SAVE, itemId: 'save', ui: 'action'}
					],
					prompt: {xtype: 'textfield', placeHolder: Messages.FLASHCARDS},
					fn: function (buttonId, subject) {
						if (buttonId === 'save') {
							me.importJsonFile(json, subject);
						} else {
							me.refreshPanel(false);
						}
					}
				});
			} else {
				throw true;
			}
		} catch (err) {
			this.refreshPanel(true);
		}
	},

	formatFlashcards: function (flashcards, subject) {
		var flashcardSet = [];
		subject = !subject || subject === '' ? Messages.FLASHCARDS : subject;

		for (var i = 0, flashcard = {}; i < flashcards.length; i++) {
			flashcard = Ext.create('ARSnova.model.Question', {
				abstention: false,
				imageQuestion: false,
				showStatistic: 1,
				active: 1,
				number: 0,

				subject: flashcards[i].subject || subject,
				text: flashcards[i].front,
				possibleAnswers: [{
					text: flashcards[i].back,
					correct: true
				}],

				releasedFor: 'all',
				questionType: 'flashcard',
				questionVariant: 'flashcard',
				sessionKeyword: sessionStorage.getItem('keyword'),
				timestamp: new Date().getTime(),
				type: 'skill_question'
			});

			flashcard.data._id = undefined;
			flashcardSet.push(flashcard.getData());
		}

		return flashcardSet;
	},

	parseCsvToJson: function (flashcards) {
		var json = [];
		for (var i = 0; i < flashcards.length; i++) {
			if (!flashcards[i][0] || !flashcards[i][1] || !flashcards[i][2]) {
				continue;
			}
			json.push({
				subject: flashcards[i][0],
				front: flashcards[i][1],
				back: flashcards[i][2]
			});
		}
		return json;
	},

	hasValidationError: function (parsedFlashcards, isCsv) {
		var error = false, answersError = false, questionError = false, subjectError = false;

		for (var i = 0, flashcard = {}; i < parsedFlashcards.length; i++) {
			flashcard = parsedFlashcards[i];

			if (typeof flashcard.front !== 'string' || !flashcard.front.length) {
				questionError = error = true;
			}
			if (typeof flashcard.back !== 'string' || !flashcard.back.length) {
				answersError = error = true;
			}
			if (isCsv && (!flashcard.subject || typeof flashcard.subject !== 'string' ||
				!flashcard.subject.length)) {
				subjectError = error = true;
			}
		}
		this.showErrMsg(error, answersError, questionError, subjectError);
		return error;
	},

	showErrMsg: function (error, answersError, questionError, subjectError) {
		if (error) {
			var message = Messages.QUESTIONS_IMPORT_INVALID_FORMAT +
				':<ul class="newQuestionWarning"><br>';

			if (answersError) {
				message += '<li>' + Messages.MISSING_ANSWERS + '</li>';
			}
			if (questionError) {
				message += '<li>' + Messages.MISSING_QUESTION + '</li>';
			}
			if (subjectError) {
				message += '<li>' + Messages.MISSING_SUBJECT + '</li>';
			}

			Ext.Msg.alert(Messages.NOTIFICATION, message + '</ul>');
		}
	}
});
