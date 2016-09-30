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

	importCsvFile: function (csv) {
		var questionImportCtrl = ARSnova.app.getController('QuestionImport');
		var flashcardExportCtrl = ARSnova.app.getController('FlashcardExport');
		var questions = [], json = '';

		try {
			this.showLoadMask();
			json = JSON.parse(ARSnova.utils.CsvUtil.csvToJson(csv));
			json.splice(0, 1);

			if (!questionImportCtrl.hasValidationError(json)) {
				questions = questionImportCtrl.formatQuestions(json, 'flashcard');
				json = flashcardExportCtrl.preparseJson(questions);
				json = flashcardExportCtrl.stringifyFlashcards(json);
				this.importJsonFile(json);
			} else {
				throw true;
			}
		} catch (err) {
			this.refreshPanel(true);
		}
	},

	importJsonFile: function (json) {
		var me = this;

		try {
			this.showLoadMask();
			json = JSON.parse('[' + json + ']');

			if (!this.hasValidationError(json)) {
				var flashcards = this.formatFlashcards(json);
				ARSnova.app.restProxy.bulkSaveSkillQuestions(flashcards, {
					success: function (response) { me.refreshPanel(false); },
					failure: function (response) { throw true; }
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
		subject = 'test';
		for (var i = 0, flashcard = {}; i < flashcards.length; i++) {
			flashcard = Ext.create('ARSnova.model.Question', {
				abstention: false,
				imageQuestion: false,
				showStatistic: 1,
				active: 1,
				number: 0,

				subject: subject,
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

	hasValidationError: function (parsedQuestions) {
		var error = false, answersError = false, questionError = false;
		var question = {};

		for (var i = 0; i < parsedQuestions.length; i++) {
			question = parsedQuestions[i];
			if (typeof question.front !== 'string' || !question.front.length) {
				questionError = error = true;
			}
			if (typeof question.back !== 'string' || !question.back.length) {
				answersError = error = true;
			}
		}
		this.showErrMsg(error, answersError, questionError);
		return error;
	},

	showErrMsg: function (lineCnt, error, answersError, questionError) {
		if (error) {
			var message = Messages.QUESTIONS_IMPORT_INVALID_FORMAT +
				':<ul class="newQuestionWarning"><br>';

			if (answersError) {
				message += '<li>' + Messages.MISSING_ANSWERS + '</li>';
			}
			if (questionError) {
				message += '<li>' + Messages.MISSING_QUESTION + '</li>';
			}

			Ext.Msg.alert(Messages.NOTIFICATION, message + '</ul>');
		}
	}
});
