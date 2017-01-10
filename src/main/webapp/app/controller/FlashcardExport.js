/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
Ext.define("ARSnova.controller.FlashcardExport", {
	extend: 'Ext.app.Controller',

	suitableTypes: ['mc', 'abcd', 'yesno', 'flashcard'],

	filename: function (format) {
		var filename = 'flashcards' + this.getActualDate() + '.' + format;
		return filename;
	},

	getActualDate: function () {
		return ARSnova.app.getController('QuestionExport').getActualDate();
	},

	exportFlashcards: function (controller, format) {
		var me = this;
		format = format === 'csv' ? 'csv' : 'json';
		controller.getQuestions(sessionStorage.getItem('keyword'), {
			success: function (response) {
				var resp = Ext.decode(response.responseText);
				var flashcards = me.preparseFlashcards(resp, format);
				var data = format !== 'csv' ? me.stringifyJson(flashcards) :
					ARSnova.utils.CsvUtil.jsonToCsv(flashcards);

				me.saveFileOnFileSystem(data, me.filename(format), format);
			}
		});
	},

	stringifyJson: function (flashcards) {
		for (var i = 0, json = ''; i < flashcards.length; i++) {
			json += JSON.stringify(flashcards[i], null, '\t');
			json += i < flashcards.length - 1 ? ', ' : '';
		}
		return json;
	},

	preparseFlashcards: function (records, format) {
		var flashcards = [];
		for (var i = 0, flashcard; i < records.length; i++) {
			if (this.suitableTypes.indexOf(records[i].questionType) !== -1) {
				flashcard = this.formatFlashcard(records[i], format);

				if (flashcard.back && flashcard.front) {
					flashcards.push(flashcard);
				}
			}
		}

		return flashcards;
	},

	formatFlashcard: function (questionData, format) {
		var flashcard = {};

		if (format === 'csv') {
			flashcard.subject = questionData.subject;
		}

		flashcard.front = questionData.text;
		switch (questionData.questionType) {
			case 'mc': case 'abcd': case 'yesno': case 'flashcard':
				flashcard.back = this.parseBackPage(questionData);
				break;
		}

		return flashcard;
	},

	parseBackPage: function (questionData) {
		var possibleAnswers = questionData.possibleAnswers;
		var correctAnswers = [];

		for (var i = 0, answer = ''; i < possibleAnswers.length; i++) {
			if (possibleAnswers[i].correct) {
				answer = possibleAnswers[i].text;
				correctAnswers.push(questionData.questionType !== 'abcd' ?
					answer : answer.slice(3, answer.length));
			}
		}

		return correctAnswers.join(', ');
	},

	saveFileOnFileSystem: function (data, filename, format) {
		var type = format === 'csv' ? "application/csv;charset=utf-8" :
			"application/json;charset=utf-8";

		ARSnova.app.sessionModel.flipFlashcards(false, {
			success: function (response) {},
			failure: function (response) {}
		});

		var blob = new Blob([data], {
			type: Ext.browser.is.Safari ? "text/plain;charset=utf-8" : type
		});
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf("MSIE ");

		if (msie > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) {
			window.navigator.msSaveBlob(blob, filename);
		} else {
			var a = window.document.createElement('a');
			a.href = window.URL.createObjectURL(blob);
			a.className = "session-export";
			a.download = filename;

			// Append anchor to body.
			document.body.appendChild(a);
			a.click();
		}
	}
});
