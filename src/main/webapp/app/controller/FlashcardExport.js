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
Ext.define("ARSnova.controller.FlashcardExport", {
	extend: 'Ext.app.Controller',

	suitableTypes: ['mc', 'abcd', 'yesno', 'flashcard'],

	filename: function () {
		var filename = 'flashcards' + this.getActualDate() + '.json';
		return filename;
	},

	exportJsonFile: function (json) {
		this.saveFileOnFileSystem(json, this.filename());
	},

	getActualDate: function () {
		return ARSnova.app.getController('QuestionExport').getActualDate();
	},

	exportFlashcards: function (controller) {
		var me = this;
		controller.getQuestions(sessionStorage.getItem('keyword'), {
			success: function (response) {
				var flashcards = me.preparseJson(Ext.decode(response.responseText));

				for (var i = 0, json = ''; i < flashcards.length; i++) {
					json += JSON.stringify(flashcards[i], null, '\t');
					json += i < flashcards.length - 1 ? ', ' : '';
				}

				me.exportJsonFile(json);
			}
		});
	},

	parseBackPage: function (questionData) {
		var correctAnswers = [];
		var answer = '';

		for (var i = 0, back = null; i < questionData.possibleAnswers.length; i++) {
			if (questionData.possibleAnswers[i].correct) {
				answer = questionData.possibleAnswers[i].text;
				if (questionData.questionType === 'abcd') {
					answer = answer.slice(3, answer.length);
				}
				correctAnswers.push(answer);
			}
		}

		if (correctAnswers.length) {
			back = correctAnswers.join(', ');
		}

		return back;
 	},

	formatFlashcard: function (questionData) {
		var flashcard = {};
		var questionType = questionData.questionType;

		if (this.suitableTypes.indexOf(questionData.questionType) === -1) {
			return null;
		}

		switch(questionType) {
			case 'mc': case 'abcd': case 'yesno': case 'flashcard':
				flashcard.back = this.parseBackPage(questionData);
				break;
		}

		flashcard.front = questionData.text;
		return flashcard;
	},

	preparseJson: function (records) {
		var flashcards = [];
		for (var i = 0, flashcard; i < records.length; i++) {
			if (this.suitableTypes.indexOf(records[i].questionType) !== -1) {
				flashcard = this.formatFlashcard(records[i]);

				if (flashcard.back && flashcard.front) {
					flashcards.push(flashcard);
				}
			}
		}

		return flashcards;
	},

	saveFileOnFileSystem: function (data, filename) {
		var blob = new Blob([data], {type: "application/json;charset=utf-8"});
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
