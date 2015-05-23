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
			'piRoundActive',
			'piRoundStartTime',
			'piRoundEndTime',
			'piRoundFinished',
			'votingDisabled',
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
			'fcImage',
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
			'gridScaleFactor',
			'imageQuestion',
			'textAnswerEnabled'
		],

		validations: [
			{type: 'presence', field: 'type'},
			{type: 'presence', field: 'text'},
			{type: 'presence', field: 'subject'}
		]
	},

	events: {
		lockVote: "arsnova/question/lecturer/lockVote",
		lockVotes: "arsnova/socket/lecturer/lockVotes",
		unlockVote: "arsnova/socket/lecturer/unlockVote",
		unlockVotes: "arsnova/socket/lecturer/unlockVotes",
		endPiRound: "arsnova/question/lecturer/endPiRound",
		resetPiRound: "arsnova/question/lecturer/resetPiRound",
		cancelPiRound: "arsnova/question/lecturer/cancelPiRound",
		startDelayedPiRound: "arsnova/question/lecturer/delayedPiRound",
		lecturerQuestionAvailable: "arsnova/question/lecturer/available",
		lecturerQuestionLocked: "arsnova/question/lecturer/locked",
		audienceQuestionAvailable: "arsnova/question/audience/available",
		unansweredLecturerQuestions: "arsnova/question/lecturer/lecture/unanswered",
		unansweredPreparationQuestions: "arsnova/question/lecturer/preparation/unanswered",
		countQuestionAnswersByQuestionId: "arsnova/question/lecturer/question/answer-and-abstention-count",
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

		ARSnova.app.socket.on(ARSnova.app.socket.events.lecturerQuestionAvailable, function (questions) {
			this.fireEvent(this.events.lecturerQuestionAvailable, questions);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.lecturerQuestionLocked, function (questions) {
			this.fireEvent(this.events.lecturerQuestionLocked, questions);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.audienceQuestionAvailable, function (question) {
			this.fireEvent(this.events.audienceQuestionAvailable, question);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.unansweredLecturerQuestions, function (questionIds) {
			this.numUnanswerdLectureQuestions = questionIds.length;

			if (ARSnova.app.questionModel === this) {
				ARSnova.app.getController('Questions').saveUnansweredLectureQuestions(questionIds);
			}

			this.fireEvent(this.events.unansweredLecturerQuestions, questionIds);
			this.fireEvent(this.events.internalUpdate);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.unansweredPreparationQuestions, function (questionIds) {
			this.numUnansweredPreparationQuestions = questionIds.length;

			if (ARSnova.app.questionModel === this) {
				ARSnova.app.getController('Questions').saveUnansweredPreparationQuestions(questionIds);
			}

			this.fireEvent(this.events.unansweredPreparationQuestions, questionIds);
			this.fireEvent(this.events.internalUpdate);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.countLectureQuestionAnswers, function (count) {
			this.numLectureQuestionAnswers = count;
			this.fireEvent(this.events.countLectureQuestionAnswers, count);
			this.fireEvent(this.events.internalUpdate);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.endPiRound, function (object) {
			if (ARSnova.app.questionModel === this) {
				ARSnova.app.getController('RoundManagement').handleRoundEnd(object._id, object.variant);
			}
			this.fireEvent(this.events.endPiRound, object);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.startDelayedPiRound, function (object) {
			if (ARSnova.app.questionModel === this) {
				ARSnova.app.getController('RoundManagement').handleRoundStart(
					object._id, object.variant, object.round, object.startTime, object.endTime
				);
			}
			this.fireEvent(this.events.startDelayedPiRound, object);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.cancelPiRound, function (questionId) {
			if (ARSnova.app.questionModel === this) {
				ARSnova.app.getController('RoundManagement').handleRoundCancel(questionId);
			}
			this.fireEvent(this.events.cancelPiRound, questionId);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.resetPiRound, function (object) {
			if (ARSnova.app.questionModel === this) {
				ARSnova.app.getController('RoundManagement').handleQuestionReset(object._id, object.variant);
			}
			this.fireEvent(this.events.resetPiRound, object);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.lockVote, function (object) {
			if (ARSnova.app.questionModel === this) {
				ARSnova.app.getController('Questions').handleVotingLock([object], true);
			}
			this.fireEvent(this.events.lockVote, object);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.lockVotes, function (object) {
			if (ARSnova.app.questionModel === this) {
				ARSnova.app.getController('Questions').handleVotingLock(object, true);
			}
			this.fireEvent(this.events.lockVotes, object);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.unlockVote, function (object) {
			if (ARSnova.app.questionModel === this) {
				ARSnova.app.getController('Questions').handleVotingLock([object], false);
			}
			this.fireEvent(this.events.unlockVote, object);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.unlockVotes, function (object) {
			if (ARSnova.app.questionModel === this) {
				ARSnova.app.getController('Questions').handleVotingLock(object, false);
			}
			this.fireEvent(this.events.unlockVotes, object);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.countQuestionAnswersByQuestionId, function (object) {
			if (ARSnova.app.questionModel === this) {
				ARSnova.app.getController('Questions').handleAnswerCountChange(object._id, object.answers, object.abstentions);
			}
			this.fireEvent(this.events.countQuestionAnswersByQuestionId, object);
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

	getSkillQuestion: function (id, callbacks) {
		return this.getProxy().getSkillQuestion(id, callbacks);
	},

	saveSkillQuestion: function (callbacks) {
		if (this.get('_id') && this.get('_rev')) {
			return this.getProxy().updateSkillQuestion(this, callbacks);
		}
		return this.getProxy().saveSkillQuestion(this, callbacks);
	},

	startNewPiRound: function (questionId, time, callbacks) {
		return this.getProxy().startNewPiRound(questionId, time, callbacks);
	},

	cancelDelayedPiRound: function (questionId, callbacks) {
		return this.getProxy().cancelDelayedPiRound(questionId, callbacks);
	},

	resetPiRoundState: function (questionId, callbacks) {
		return this.getProxy().resetPiRoundState(questionId, callbacks);
	},

	publishSkillQuestion: function (callbacks) {
		return this.getProxy().publishSkillQuestion(this, callbacks);
	},

	publishAllSkillQuestions: function (sessionKeyword, active, isLecture, isPreparation, callbacks) {
		return this.getProxy().publishAllSkillQuestions(sessionKeyword, active, isLecture, isPreparation, callbacks);
	},

	publishSkillQuestionStatistics: function (callbacks) {
		return this.getProxy().publishSkillQuestionStatistics(this, callbacks);
	},

	publishCorrectSkillQuestionAnswer: function (callbacks) {
		return this.getProxy().publishCorrectSkillQuestionAnswer(this, callbacks);
	},

	disableQuestionVoting: function (questionId, disable, callbacks) {
		return this.getProxy().disableQuestionVoting(questionId, disable, callbacks);
	},

	disableAllQuestionVotings: function (sessionKeyword, disable, isLecture, isPreparation, callbacks) {
		return this.getProxy().disableAllQuestionVotings(sessionKeyword, disable, isLecture, isPreparation, callbacks);
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

	countPreparationQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().countPreparationQuestions(sessionKeyword, callbacks);
	},

	countFlashcards: function (sessionKeyword, callbacks) {
		return this.getProxy().countFlashcards(sessionKeyword, callbacks);
	},

	countLectureQuestions: function (sessionKeyword, callbacks) {
		return this.getProxy().countLectureQuestions(sessionKeyword, callbacks);
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
		return this.getProxy().saveInterposedQuestion(this.data.subject, this.data.text, this.data.sessionKeyword, this.data.timestamp, callbacks);
	},

	countFeedbackQuestions: function (sessionKeyword, username, callbacks) {
		return this.getProxy().countFeedbackQuestions(sessionKeyword, username, callbacks);
	},

	changeQuestionType: function (sessionId, callbacks) {
		return this.getProxy().changeQuestionType(sessionId, callbacks);
	},

	countAnswers: function (sessionKeyword, questionId, callbacks) {
		return this.getProxy().countAnswers(sessionKeyword, questionId, callbacks);
	},

	countAllAnswers: function (sessionKeyword, questionId, callbacks) {
		return this.getProxy().countAllAnswers(sessionKeyword, questionId, callbacks);
	},

	countPiAnswers: function (sessionKeyword, questionId, piRound, callbacks) {
		return this.getProxy().countPiAnswers(sessionKeyword, questionId, piRound, callbacks);
	},

	getTotalAnswerCountByQuestion: function (questionId, callbacks) {
		return this.getProxy().getTotalAnswerCountByQuestion(questionId, callbacks);
	},

	getAllRoundAnswerCountByQuestion: function (questionId, callbacks) {
		return this.getProxy().getAllRoundAnswerCountByQuestion(questionId, callbacks);
	},

	getAnsweredFreetextQuestions: function (sessionKeyword, questionId, callbacks) {
		return this.getProxy().getAnsweredFreetextQuestions(sessionKeyword, questionId, callbacks);
	},

	deleteAnswer: function (questionId, answerId, callbacks) {
		return this.getProxy().deleteAnswer(questionId, answerId, callbacks);
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
	},

	getSubjectPreparationSort: function (sessionKeyword, callbacks) {
		return this.getProxy().getSubjectSort(sessionKeyword, true, callbacks);
	},

	setSubjectPreparationSort: function (sessionKeyword, sortType, subjects, callbacks) {
		return this.getProxy().setSubjectSort(sessionKeyword, true, sortType, subjects, callbacks);
	},

	getSubjectLectureSort: function (sessionKeyword, callbacks) {
		return this.getProxy().getSubjectSort(sessionKeyword, false, callbacks);
	},

	setSubjectLectureSort: function (sessionKeyword, sortType, subjects, callbacks) {
		return this.getProxy().setSubjectSort(sessionKeyword, false, sortType, subjects, callbacks);
	},

	getQuestionPreparationSort: function (sessionKeyword, subject, callbacks) {
		return this.getProxy().getQuestionSort(sessionKeyword, subject, true, callbacks);
	},

	setQuestionPreparationSort: function (sessionKeyword, subject, sortType, questionIDs, callbacks) {
		return this.getProxy().setQuestionSort(sessionKeyword, subject, true, sortType, questionIDs, callbacks);
	},

	getQuestionLectureSort: function (sessionKeyword, subject, callbacks) {
		return this.getProxy().getQuestionSort(sessionKeyword, subject, false, callbacks);
	},

	setQuestionLectureSort: function (sessionKeyword, subject, sortType, questionIDs, callbacks) {
		return this.getProxy().setQuestionSort(sessionKeyword, subject, false, sortType, questionIDs, callbacks);
	},

	getImageAnswerImage: function (questionId, answerId, callbacks) {
		return this.getProxy().getImageAnswerImage(questionId, answerId, callbacks);
	}
});
