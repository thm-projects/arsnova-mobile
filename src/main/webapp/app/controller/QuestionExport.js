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
Ext.define("ARSnova.controller.QuestionExport", {
	extend: 'Ext.app.Controller',

	filename: function () {
		var filename = 'lectureQuestions' + this.getActualDate() + '.csv';
		return filename;
	},

	exportCsvFile: function (json) {
		var csv = ARSnova.utils.CsvUtil.jsonToCsv(json);
		this.saveFileOnFileSystem(csv, this.filename());
	},

	getActualDate: function () {
		var d = new Date();
		return ('0' + d.getFullYear()).slice(-2) + '-'
			+ ('0' + (d.getMonth() + 1)).slice(-2) + '-'
			+ ('0' + d.getDate()).slice(-2) + '-'
			+ ('0' + d.getHours()).slice(-2) + '-'
			+ ('0' + d.getMinutes()).slice(-2);
	},

	getOption: function (answer, type) {
		if (answer && type !== 'yesno') {
			return	answer.text;
		}
		return '';
	},

	formatQuestion: function (questionModel) {
		var questionTypeModel = questionModel.questionType;
		var correctAnswer = '';
		var options = [];
		var question = {};
		var i;
		question.questionType = questionTypeModel;
		question.questionSubject = questionModel.subject;
		question.question = questionModel.text;
		for (i = 0; i < 8; i++) {
			options[i] = this.getOption(questionModel.possibleAnswers[i], questionTypeModel);
			if (questionModel.possibleAnswers[i] && questionModel.possibleAnswers[i].correct) {
				correctAnswer += (i + 1) + ',';
			}
		}
		if (questionTypeModel === 'abcd') {
			for (i = 0; i < options.length; i++) {
				options[i] = options[i].slice(2);
			}
		}
		question.answer1 = options[0];
		question.answer2 = options[1];
		question.answer3 = options[2];
		question.answer4 = options[3];
		question.answer5 = options[4];
		question.answer6 = options[5];
		question.answer7 = options[6];
		question.answer8 = options[7];
		if (questionTypeModel === 'yesno') {
			correctAnswer = 'n';
			if (questionModel.possibleAnswers[0].correct) {
				correctAnswer = 'y';
			}
			question.correctAnswer = correctAnswer;
		} else if (questionTypeModel === 'freetext') {
			question.correctAnswer = '';
		}	else {
			question.correctAnswer = correctAnswer.slice(0, correctAnswer.length - 1);
		}

		question.abstention = (questionModel.abstention) ? 'y' : 'n';
		question.hint = questionModel.hint;
		question.solution = questionModel.solution;
		return question;
	},

	preparseJsontoCsv: function (records) {
		var questions = [];
		for (var i = 0; i < records.length; i++) {
			if (records[i].questionType !== "grid") {
				questions.push(this.formatQuestion(records[i]));
			}
		}
		return questions;
	},

	saveFileOnFileSystem: function (csv, filename) {
		var blob = new Blob([csv], {type: "application/csv;charset=utf-8"});
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf("MSIE ");

		if (msie > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) {
			window.navigator.msSaveBlob(blob, filename);
		} else {
			var a = window.document.createElement('a');
			a.className = "session-export";
			a.href = window.URL.createObjectURL(blob);
			a.download = filename;

			// Append anchor to body.
			document.body.appendChild(a);
			a.click();
		}
		var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
		hTP.animateActiveItem(hTP.mySessionsPanel, {
			type: 'slide',
			direction: 'right',
			duration: 700
		});
	},

	parseJsonToCsv: function (records) {
		var preparsedQuestion = this.preparseJsontoCsv(records);
		var csv = ARSnova.utils.CsvUtil.jsonToCsv(preparsedQuestion);
		this.saveFileOnFileSystem(csv, this.filename());
	}

});
