/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2014 The ARSnova Team
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
		this.getAudiencePanel().loadFilePanel.hide();
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
	saveQuestions: function (json) {
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
		var question, questionModel, type, promise;
		var size = json.length - 1;
		for (var i = 0; i < json.length; i++) {
			question = json[i];
			type = this.getModelQuestionType(question[QUESTION_TYPE]);
			if (question && type && question[QUESTION_SUBJECT] && question[QUESTION_TEXT]) {
				promise = new RSVP.Promise();
				questionModel = Ext.create('ARSnova.model.Question', {
					abstention: true,
					active: 1,
					imageQuestion: false,
					number: 0,
					possibleAnswers: this.getPossibleAnswers(type, [question[ANSWER1], question[ANSWER2],
						question[ANSWER3], question[ANSWER4], question[ANSWER5], question[ANSWER6],
						question[ANSWER7], question[ANSWER8]], question[RIGHT_ANSWER]),
					questionType: type,
					questionVariant: "lecture",
					releasedFor: "all",
					sessionKeyword: sessionStorage.getItem('keyword'),
					showStatistic: 1,
					subject: question[QUESTION_SUBJECT],
					text: question[QUESTION_TEXT],
					type: "skill_question"

				});
				if (type === 'yesno') {
					questionModel.set('noCorrect', true);
				} else if (type === 'freetext') {
					questionModel.set('textAnswerEnabled', true);
				}
				questionModel.saveSkillQuestion({
					success: Ext.bind(function (response) {
						promise.resolve(response);
						size--;
						if (size == 0) {
							this.refreshPanel();
						}

					}, this),
					failure: function (response) {
						Ext.Msg.alert(Messages.NOTICE, Messages.QUESTION_CREATION_ERROR);
						promise.reject(response);
					}
				});

			} else {
				size--;
			}
		}
	},

	refreshPanel: function () {
		var audiencePanel = this.getAudiencePanel();
		audiencePanel.onActivate();
		audiencePanel.loadMask.hide();
	},


	getPossibleAnswers: function (type, answers, rightAnswers) {
		var answer, answerObj, letter, posibleAnswers = [];
		if (type === 'freetext') {
			return posibleAnswers;
		} else if (type === 'yesno') {
			return this.getYesNoAnswer(rightAnswers);
		}
		for (var i = 0; i < answers.length; i++) {
			answer = answers[i];
			if (answer) {
				answerObj = {};
				answerObj.correct = (rightAnswers.indexOf(i + 1) != -1);
				if (type === 'mc') {
					answerObj.text = answer;
				} else if (type === 'abcd') {
					letter = String.fromCharCode(65 + i);
					answerObj.id = letter;
					answerObj.text = letter + ': ' + answer;
				}
				posibleAnswers.push(answerObj);
			}
		}

		return posibleAnswers;
	},

	getYesNoAnswer: function (rightAnswers) {
		if (rightAnswers === 'y') {
			return [this.getYesNoAnswerObj(true, 'Ja'),
				this.getYesNoAnswerObj(false, 'Nein')];
		} else {
			return [this.getYesNoAnswerObj(true, 'Nein'),
				this.getYesNoAnswerObj(false, 'Ja')];
		}
	},

	getYesNoAnswerObj: function (isCorrect, text) {
		return {correct: isCorrect, text: text};
	},

	getModelQuestionType: function (typeModel) {
		if (!typeModel) {
			return null;
		}
		switch (typeModel) {
			case 'MC' :
				return 'mc';
			case 'SC' :
				return 'abcd';
			case 'TXT' :
				return 'freetext';
			case 'YN' :
				return 'yesno';
			default :
				Ext.Msg.alert(Messages.NOTICE, typeModel + ' ' + Messages.QUESTIONTYPE_NOT_SUPPORTED);
		}
		return null;
	},

	importCvsFile: function (cvs) {
		var audiencePanel = this.getAudiencePanel();
		audiencePanel.loadFilePanel.hide();
		var mask = audiencePanel.loadMask;
		Ext.Viewport.add(mask);
		mask.show();

		// todo
		var json = JSON.parse(ARSnova.utils.CsvUtil.csvToJson(cvs));
		var error_message = validate(json);
		this.saveQuestions(json);
	},

	validate: function(parsedQuestions){
		var MC_ALLOWED_ANSWERS = 2
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
		var error = false;
		var answersError = false;
		var subjectError = false;
		var checkedError = false;
		var questionError = false;

		parsedQuestions.forEach(function(row){
			switch (row[QUESTION_TYPE]){
				case 'MC' :
					var rightAnswersCount = row[QUESTION_TYPE].split(',').length;
					var answersCount =

					if(rightAnswersCount < 2) {
						error = true;
						answersError = true;
					}

					break;
				case 'SC' :
				case 'TXT' :
				case 'YN' :
			}
		});
	},

	getAnswersCount: function(row){
		//for (var i = 3 ; r)
 }

});
