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
Ext.define('ARSnova.model.Question', {
	extend: 'Ext.data.Model',

	mixin: ['Ext.mixin.Observable'],

	config: {
		idProperty: '_id',
		proxy: {type: 'restProxy'},
		useCache: false,

		fields: [
			'_rev',
			'abstention',
			'active',
			'duration',
			'noCorrect',
			'type',
			'number',
			'piRound',
			'possibleAnswers',
			'questionType',
			'questionVariant',
			'releasedFor',
			'session',
			'sessionId',
			'sessionKeyword',
			'showAnswer',
			'showStatistic',
			'subject',
			'text',
			'timestamp',
			'type',
			'gridSize',
			'offsetX',
			'offsetY',
			'zoomLvl',
			'image',
			'gridOffsetX',
			'gridOffsetY',
			'gridZoomLvl',
			'gridSizeX',
			'gridSizeY',
			'gridIsHidden',
			'imgRotation',
			'toggleFieldsLeft',
			'numClickableFields',
			'thresholdCorrectAnswers',
			'cvIsColored',
			'gridLineColor',
			'numberOfDots',
			'gridType',
			'scaleFactor',
			'gridScaleFactor'
		],

		validations: [
			{type: 'presence', field: 'type'},
			{type: 'presence', field: 'text'},
			{type: 'presence', field: 'subject'}
		]
	},

	events: {
		lecturerQuestionAvailable: "arsnova/question/lecturer/available",
		audienceQuestionAvailable: "arsnova/question/audience/available",
		unansweredLecturerQuestions: "arsnova/question/lecturer/lecture/unanswered",
		unansweredPreparationQuestions: "arsnova/question/lecturer/preparation/unanswered",
		countLectureQuestionAnswers: "arsnova/question/lecturer/lecture/answercount",
		countPreparationQuestionAnswers: "arsnova/question/lecturer/preparation/answercount",
		countQuestionsAndAnswers: "arsnova/question/unanswered-question-and-answer-count",
		internalUpdate: "arsnova/question/internal/update"
	},

	numUnanswerdLectureQuestions: 0,
	numUnansweredPreparationQuestions: 0,
	numLectureQuestionAnswers: 0,
	numPreparationQuestionAnswers: 0,

	constructor: function () {
		this.callParent(arguments);

		ARSnova.app.socket.on(ARSnova.app.socket.events.lecturerQuestionAvailable, function (question) {
			this.fireEvent(this.events.lecturerQuestionAvailable, question);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.audienceQuestionAvailable, function (question) {
			this.fireEvent(this.events.audienceQuestionAvailable, question);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.unansweredLecturerQuestions, function (questionIds) {
			this.numUnanswerdLectureQuestions = questionIds.length;
			this.fireEvent(this.events.unansweredLecturerQuestions, questionIds);
			this.fireEvent(this.events.internalUpdate);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.unansweredPreparationQuestions, function (questionIds) {
			this.numUnansweredPreparationQuestions = questionIds.length;
			this.fireEvent(this.events.unansweredPreparationQuestions, questionIds);
			this.fireEvent(this.events.internalUpdate);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.countLectureQuestionAnswers, function (count) {
			this.numLectureQuestionAnswers = count;
			this.fireEvent(this.events.countLectureQuestionAnswers, count);
			this.fireEvent(this.events.internalUpdate);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.countPreparationQuestionAnswers, function (count) {
			this.numPreparationQuestionAnswers = count;
			this.fireEvent(this.events.countPreparationQuestionAnswers, count);
			this.fireEvent(this.events.internalUpdate);
		}, this);

		this.on(this.events.internalUpdate, function () {
			this.fireEvent(this.events.countQuestionsAndAnswers, {
				unansweredLectureQuestions: this.numUnanswerdLectureQuestions,
				unansweredPreparationQuestions: this.numUnansweredPreparationQuestions,
				lectureQuestionAnswers: this.numLectureQuestionAnswers,
				preparationQuestionAnswers: this.numPreparationQuestionAnswers
			});
		}, this);
	},

	destroy: function (queObj, callbacks) {
		return this.getProxy().delQuestion(queObj, callbacks);
	},

	destroyAll: function (sessionKeyword, callbacks) {
		return this.getProxy().delAllQuestions(sessionKeyword, callbacks);
	},

	deleteAllPreparationQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().delAllPreparationQuestions(sessionKeyword, callbacks);
	},

	deleteAllFlashcards: function (sessionKeyword, callbacks) {
		return this.getProxy().delAllFlashcards(sessionKeyword, callbacks);
	},

	deleteAllLectureQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().delAllLectureQuestions(sessionKeyword, callbacks);
	},

	deleteInterposed: function (question, callbacks) {
		return this.getProxy().deleteInterposedQuestion(question, callbacks);
	},

	deleteAnswers: function (questionId, callbacks) {
		return this.getProxy().delAnswers(questionId, callbacks);
	},

	getQuestionById: function (id, callbacks) {
		return this.getProxy().getQuestionById(id, callbacks);
	},

	getSkillQuestion: function (id, callbacks) {
		return this.getProxy().getSkillQuestion(id, callbacks);
	},

	saveSkillQuestion: function (callbacks) {
		if (this.get('_id') && this.get('_rev')) {
			return this.getProxy().updateSkillQuestion(this, callbacks);
		}
		return this.getProxy().saveSkillQuestion(this, callbacks);
	},

	publishSkillQuestion: function (callbacks) {
		return this.getProxy().publishSkillQuestion(this, callbacks);
	},

	publishAllSkillQuestions: function (sessionKeyword, active, callbacks) {
		return this.getProxy().publishAllSkillQuestions(sessionKeyword, active, callbacks);
	},

	publishSkillQuestionStatistics: function (callbacks) {
		return this.getProxy().publishSkillQuestionStatistics(this, callbacks);
	},

	publishCorrectSkillQuestionAnswer: function (callbacks) {
		return this.getProxy().publishCorrectSkillQuestionAnswer(this, callbacks);
	},

	getLectureQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().getLectureQuestions(sessionKeyword, callbacks);
	},

	getFlashcards: function (sessionKeyword, callbacks) {
		return this.getProxy().getFlashcards(sessionKeyword, callbacks);
	},

	getPreparationQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().getPreparationQuestions(sessionKeyword, callbacks);
	},

	getSkillQuestionsForDelete: function (sessionId, callbacks) {
		return this.getProxy().getSkillQuestionsForDelete(sessionId, callbacks);
	},

	countSkillQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().countSkillQuestions(sessionKeyword, callbacks);
	},

	countPreparationQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().countPreparationQuestions(sessionKeyword, callbacks);
	},

	countFlashcards: function (sessionKeyword, callbacks) {
		return this.getProxy().countFlashcards(sessionKeyword, callbacks);
	},

	countLectureQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().countLectureQuestions(sessionKeyword, callbacks);
	},

	countTotalAnswers: function (sessionKeyword, callbacks) {
		return this.getProxy().countTotalAnswers(sessionKeyword, callbacks);
	},

	countPreparationQuestionAnswers: function (sessionKeyword, callbacks) {
		return this.getProxy().countPreparationQuestionAnswers(sessionKeyword, callbacks);
	},

	countLectureQuestionAnswers: function (sessionKeyword, callbacks) {
		return this.getProxy().countLectureQuestionAnswers(sessionKeyword, callbacks);
	},

	getInterposedQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().getInterposedQuestions(sessionKeyword, callbacks);
	},

	getInterposed: function (callbacks) {
		return this.getProxy().getInterposedQuestion(this, callbacks);
	},

	saveInterposed: function (callbacks) {
		
		console.log("data");
		console.log(this.data);
		
		return this.getProxy().saveInterposedQuestion(this.data.subject, this.data.text, this.data.sessionKeyword, callbacks);
	},

	countFeedbackQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().countFeedbackQuestions(sessionKeyword, callbacks);
	},

	changeQuestionType: function (sessionId, callbacks) {
		return this.getProxy().changeQuestionType(sessionId, callbacks);
	},

	countAnswers: function (sessionKeyword, questionId, callbacks) {
		return this.getProxy().countAnswers(sessionKeyword, questionId, callbacks);
	},

	countAnswersByQuestion: function (sessionKeyword, questionId, callbacks) {
		return this.getProxy().countAnswersByQuestion(sessionKeyword, questionId, callbacks);
	},

	getAnsweredFreetextQuestions: function (sessionKeyword, questionId, callbacks) {
		return this.getProxy().getAnsweredFreetextQuestions(sessionKeyword, questionId, callbacks);
	},

	deleteAnswer: function (questionId, answerId, callbacks) {
		return this.getProxy().deleteAnswer(questionId, answerId, callbacks);
	},

	getSkillQuestionsForUser: function (sessionKeyword, callbacks) {
		return this.getProxy().getSkillQuestionsForUser(sessionKeyword, callbacks);
	},

	getLectureQuestionsForUser: function (sessionKeyword, callbacks) {
		return this.getProxy().getLectureQuestionsForUser(sessionKeyword, callbacks);
	},

	getPreparationQuestionsForUser: function (sessionKeyword, callbacks) {
		return this.getProxy().getPreparationQuestionsForUser(sessionKeyword, callbacks);
	},

	releasedByCourseId: function (courseId, callbacks) {
		return this.getProxy().releasedByCourseId(courseId, callbacks);
	},

	deleteAllInterposedQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().deleteAllInterposedQuestions(sessionKeyword, callbacks);
	},

	deleteAllQuestionsAnswers: function (sessionKeyword, callbacks) {
		return this.getProxy().delAllQuestionsAnswers(sessionKeyword, callbacks);
	},

	deleteAllPreparationAnswers: function (sessionKeyword, callbacks) {
		return this.getProxy().delAllPreparationAnswers(sessionKeyword, callbacks);
	}
});
