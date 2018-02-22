/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2018 The ARSnova Team and Contributors
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
Ext.define("ARSnova.controller.QuestionImport", {
	extend: 'Ext.app.Controller',


	requires: [
		'ARSnova.model.Question'
	],

	config: {

		refs: {
			hideModal: 'button[action=hideModal]'

		},
		control: {
			hideModal: {
				tap: 'hideModal'
			}
		}

	},

	hideModal: function () {
		var panel = this.getAudiencePanel();
		panel.loadFilePanel.hide();
	},

	showModal: function () {
		var popup = this.getAudiencePanel().loadFilePanel;
		Ext.Viewport.add(popup);
		popup.show();
	},

	getAudiencePanel: function () {
		return ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.
			audienceQuestionPanel;
	},

	formatQuestions: function (json, variant) {
		var QUESTION_TYPE = 0;
		var QUESTION_SUBJECT = 1;
		var QUESTION_TEXT = 2;
		var ANSWER1 = 3;
		var ANSWER2 = 4;
		var ANSWER3 = 5;
		var ANSWER4 = 6;
		var ANSWER5 = 7;
		var ANSWER6 = 8;
		var ANSWER7 = 9;
		var ANSWER8 = 10;
		var RIGHT_ANSWER = 11;
		var ABSTENTION = 12;
		var HINT = 13;
		var SOLUTION = 14;

		var question, questionModel, type, promise;
		var size = json.length;

		var questionModels = [];

		for (var i = 0; i < json.length; i++) {
			question = json[i];
			type = question[QUESTION_TYPE];

			if (question && type && question[QUESTION_SUBJECT] && question[QUESTION_TEXT]) {
				questionModel = Ext.create('ARSnova.model.Question', {
					abstention: (question[ABSTENTION].toLowerCase() === 'y') ? true : false,
					active: 1,
					imageQuestion: false,
					number: 0,

					possibleAnswers: this.getPossibleAnswers(type, [question[ANSWER1], question[ANSWER2],
						question[ANSWER3], question[ANSWER4], question[ANSWER5], question[ANSWER6],
						question[ANSWER7], question[ANSWER8]], question[RIGHT_ANSWER]),

					questionType: type,
					questionVariant: variant || "lecture",
					releasedFor: "all",
					sessionKeyword: sessionStorage.getItem('keyword'),
					showStatistic: 1,
					subject: question[QUESTION_SUBJECT],
					text: question[QUESTION_TEXT],
					hint: question[HINT],
					solution: question[SOLUTION],
					type: "skill_question",
					timestamp: new Date().getTime()
				});

				if (type === 'yesno') {
					questionModel.set('noCorrect', true);
				} else if (type === 'freetext') {
					questionModel.set('textAnswerEnabled', true);
				}
				questionModel.data._id = undefined;
				questionModels.push(questionModel.getData());
			} else {
				size--;
			}
		}
		return questionModels;
	},

	getPossibleAnswers: function (type, answers, correctAnswers) {
		var answer, answerObj, letter, possibleAnswers = [];

		if (type === 'freetext') {
			return possibleAnswers;
		} else if (type === 'yesno') {
			return this.getYesNoAnswer(correctAnswers);
		}
		for (var i = 0; i < answers.length; i++) {
			answer = answers[i];
			if (answer) {
				answerObj = {};
				answerObj.correct = (correctAnswers.indexOf(i + 1) !== -1);
				if (type === 'abcd') {
					letter = String.fromCharCode(65 + i);
					answerObj.text = letter + ': ' + answer;
				} else {
					answerObj.text = answer;
				}
				possibleAnswers.push(answerObj);
			}
		}
		return possibleAnswers;
	},

	getYesNoAnswer: function (correctAnswers) {
		if (correctAnswers === 'y') {
			return [this.getYesNoAnswerObj(true, Messages.YES),
				this.getYesNoAnswerObj(false, Messages.NO)];
		} else if (correctAnswers === 'n') {
			return [this.getYesNoAnswerObj(true, Messages.NO),
				this.getYesNoAnswerObj(false, Messages.YES)];
		}

		return [this.getYesNoAnswerObj(false, Messages.YES),
			this.getYesNoAnswerObj(false, Messages.NO)];
	},

	getYesNoAnswerObj: function (isCorrect, text) {
		return {correct: isCorrect, text: text};
	},

	importCsvFile: function (csv) {
		var audiencePanel = this.getAudiencePanel();
		var refreshPanel = function () {
			audiencePanel.onActivate();
			audiencePanel.loadMask.hide();
		};
		var variant = this.getAudiencePanel().getController() === ARSnova.app.getController("PreparationQuestions") ?
			"preparation" :
			"lecture";
		audiencePanel.loadFilePanel.hide();
		var mask = audiencePanel.loadMask;
		Ext.Viewport.add(mask);
		mask.show();

		var json = ARSnova.utils.CsvUtil.csvToJson(csv);
		if (json) {
			json = JSON.parse(json);
			// remove header line
			json.splice(0, 1);
			if (!this.hasValidationError(json)) {
				var questionModels = this.formatQuestions(json, variant);
				var promise = new RSVP.Promise();
				ARSnova.app.restProxy.bulkSaveSkillQuestions(questionModels, {
					success: function (response) {
						promise.resolve();
						refreshPanel();
					},
					failure: function (response) {
						promise.reject();
						console.log("error importing questions");
						refreshPanel();
					}
				});
			} else {
				refreshPanel();
			}
		} else {
			refreshPanel();
		}
	},

	hasValidationError: function (parsedQuestions) {
		var MC_ALLOWED_ANSWERS = 2;
		var QUESTION_TYPE = 0;
		var QUESTION_SUBJECT = 1;
		var QUESTION_TEXT = 2;
		var ANSWER1 = 3;
		var ANSWER2 = 4;
		var ANSWER3 = 5;
		var ANSWER4 = 6;
		var ANSWER5 = 7;
		var ANSWER6 = 8;
		var ANSWER7 = 9;
		var ANSWER8 = 10;
		var RIGHT_ANSWER = 11;
		var ABSTENTION = 12;
		var HINT = 13;
		var SOLUTION = 14;

		// Column number is 15 because we have two optional fields
		// HINT and SOLUTION
		var NUM_COLUMS = 15;

		var INDEX_FIRST_ANSWER = 3; // Answer 1
		var INDEX_LAST_ANSWER = 10; // Answer 8

		var error = false;
		var answersError = false;
		var subjectError = false;
		var questionError = false;
		var questionTypeError = false;
		var abstentionError = false;

		var lineCnt = 0;
		var areAttributeNames = true;

		parsedQuestions.forEach(function (row) {
			if (areAttributeNames) {
				areAttributeNames = false;
				return;
			}
			if (!error) {
				if (row.length === NUM_COLUMS) {
					var valuesRightAnswers = row[RIGHT_ANSWER];
					var correctAnswers = [];
					var answers = [];
					var i;
					var questionType = row[QUESTION_TYPE];
					var hasRightAnswers = true;

					// check if subject and text is set.
					// we have to check this for all types questions
					if (!row[QUESTION_TYPE] || row[QUESTION_TYPE].trim() === '') {
						error = true;
						questionTypeError = true;
					}
					if (!row[QUESTION_SUBJECT] || row[QUESTION_SUBJECT].trim() === '') {
						error = true;
						subjectError = true;
					}
					if (!row[QUESTION_TEXT] || row[QUESTION_TEXT].trim() === '') {
						error = true;
						questionError = true;
					}

					if (lineCnt > 0) {
						if (!row[ABSTENTION] || !(row[ABSTENTION] === 'y' || row[ABSTENTION] === 'n')) {
							error = true;
							abstentionError = true;
						}
					}

					switch (questionType) {
						case 'mc' :
							for (i = INDEX_FIRST_ANSWER; i <= INDEX_LAST_ANSWER; i++) {
								if (row[i].trim() !== '') {
									answers.push(row[i]);
								}
								if (valuesRightAnswers.indexOf(i - INDEX_FIRST_ANSWER + 1) > -1) {
									correctAnswers.push(row[i]);
								}
							}

							valuesRightAnswers = valuesRightAnswers.split(',');

							/**
							 * Check if we have at minimum 2 answers
							 * and check if the colums according to a answers numbers exists
							 */
							if (answers.length < 2 || answers.length < correctAnswers.length) {
								error = true;
								answersError = true;
							}
							break;
						case 'abcd' :
							for (i = INDEX_FIRST_ANSWER; i <= INDEX_LAST_ANSWER; i++) {
								if (row[i].trim() !== '') {
									answers.push(row[i]);
								}
								if (valuesRightAnswers.indexOf(i - INDEX_FIRST_ANSWER + 1) > -1) {
									correctAnswers.push(row[i]);
								}
							}

							valuesRightAnswers = valuesRightAnswers.split(',');

							/**
							 * Check if we have exactly 1 answer
							 * and check if the colums according to a answers numbers exists
							 */
							if (answers.length < 2 || correctAnswers.length > 1) {
								error = true;
								answersError = true;
							}
							break;
						case 'yesno' :
							if (row[RIGHT_ANSWER]) {
								if (!(row[RIGHT_ANSWER].toLowerCase() === 'y' || row[RIGHT_ANSWER].toLowerCase() === 'n')) {
									error = true;
									answersError = true;
								}
							}
							break;
						default:
							break;
					}
				} else {
					// ignore empty lines, but count them
					if (row.length > 1) {
						error = true;
					}
				}
				lineCnt++;
			}
		});
		this.showErrMsg(lineCnt, error, answersError, subjectError, questionError, questionTypeError, abstentionError);
		return error;
	},

	showErrMsg: function (lineCnt, error, answersError, subjectError, questionError, questionTypeError, abstentionError) {
		if (error) {
			var message = Messages.QUESTIONS_IMPORT_INVALID_FORMAT + ':<ul class="newQuestionWarning"><br>';

			if (answersError) {
				message += '<li>' + Messages.MISSING_ANSWERS + '</li>';
			}
			if (subjectError) {
				message += '<li>' + Messages.MISSING_SUBJECT + '</li>';
			}
			if (questionError) {
				message += '<li>' + Messages.MISSING_QUESTION + '</li>';
			}
			if (questionTypeError) {
				message += '<li>' + Messages.QUESTIONS_IMPORT_TYPE_ERROR + '</li>';
			}
			if (abstentionError) {
				message += '<li>' + Messages.QUESTIONS_IMPORT_ABSTENTION_ERROR + '</li>';
			}

			Ext.Msg.alert(Messages.NOTIFICATION, message + Messages.QUESTIONS_IMPORT_ERR_IN_ROW + " " + lineCnt + '</ul>');
			return;
		}
	}

});
