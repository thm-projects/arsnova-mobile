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
Ext.define('ARSnova.proxy.RestProxy', {
	extend: 'Ext.data.proxy.Rest',
	alias: 'proxy.restProxy',

	requires: ['ARSnova.proxy.ARSJax'],

	config: {
		url: '/couchdb/arsnova',

		noCache: false,
		appendId: true
	},

	arsjax: null,

	constructor: function () {
		this.callParent(arguments);

		this.arsjax = Ext.create('ARSnova.proxy.ARSJax');
		this.arsjax.on("arsnova/arsjax/status/401", function () {
			// I know it's bad, but I was not able to relay this event to other objects that would be better
			// places to display an error message. Feel free to refactor this. ;-)
			Ext.Msg.confirm(Messages.BROWSER_SESSION_EXPIRED, Messages.BROWSER_SESSION_EXPIRED_MSG, function (button) {
				if (button === 'yes') {
					window.location.reload();
				}
			});
		}, this, {single: true});
	},

	/**
	 * @param start index
	 * @param end index
	 * @return formatted range header string
	 */
	constructRangeString: function (offset, limit) {
		return 'items=' + offset + '-' + limit;
	},

	getTotalRangeSize: function (response) {
		var header = response.getResponseHeader('content-range');
		return header ? parseInt(header.split("/")[1]) : -1;
	},

	/**
	 * Search for a session with specified keyword
	 * @param keyword of session
	 * @param object with success- and failure-callbacks
	 * @return session-object, if found
	 * @return false, if nothing found
	 */
	checkSessionLogin: function (keyword, callbacks) {
		this.arsjax.request({
			url: "session/" + keyword,
			success: callbacks.success,
			failure: function (response) {
				if (response.status === 404) {
					callbacks.notFound.apply(this, arguments);
				} else if (response.status === 403) {
					callbacks.forbidden.apply(this, arguments);
				} else {
					callbacks.failure.apply(this, arguments);
				}
			}
		});
	},

	absoluteRequest: function (options, callbacks) {
		this.arsjax.request({
			url: options.url,
			method: "GET",
			success: options.success
		});
	},

	/**
	 * Perform server side logout for the current user
	 */
	authLogout: function () {
		this.arsjax.request({
			url: 'auth/logout',
			method: 'GET',
			success: function (response) {}
		});
	},

	/**
	 * Get WebSocket URL
	 */
	getWebSocketUrl: function () {
		var promise = new RSVP.Promise();
		this.arsjax.request({
			url: "socket/url",
			success: function (data) {
				promise.resolve(data.responseText);
			},
			failure: function () {
				promise.reject();
			}
		});

		return promise;
	},

	/**
	 * Connects/reconnects websocket
	 */
	connectWebSocket: function () {
		var promise = new RSVP.Promise();
		this.arsjax.request({
			url: "socket/assign",
			method: "POST",
			jsonData: {session: window.socket.io.engine.id},
			success: function () {
				promise.resolve();
			},
			failure: function () {
				promise.reject();
			}
		});

		return promise;
	},

	/**
	 * Get the sessions where user is creator
	 * @param login from user
	 * @param object with success-, failure-, unauthenticated and empty-callbacks
	 * @return session-objects, if found
	 * @return false, if nothing found
	 */
	getMySessions: function (callbacks, sortby, offset, limit) {
		this.arsjax.request({
			url: "session/",
			method: "GET",
			params: {
				statusonly: true,
				sortby: sortby
			},
			headers: {
				Range: this.constructRangeString(offset, limit)
			},

			success: callbacks.success,
			204: callbacks.empty,

			401: callbacks.unauthenticated,
			404: callbacks.empty,
			failure: callbacks.failure
		});
	},

	getSessionsForCourses: function (callbacks, courses, offset, limit) {
		this.arsjax.request({
			url: "session/relevantFromCourse",
			method: "GET",

			params: {
				courses: courses
			},
			headers: {
				Range: this.constructRangeString(offset, limit)
			},
			success: function (response) {
				if (response.status === 204) {
					callbacks.success.call(this, []);
				} else {
					callbacks.success.call(this, Ext.decode(response.responseText));
				}
			},
			204: callbacks.empty,

			401: callbacks.unauthenticated,
			404: callbacks.notFound,
			failure: callbacks.failure
		});
	},

	getPublicPoolSessions: function (callbacks) {
		this.arsjax.request({
			url: "session/publicpool",
			method: "GET",

			success: function (response) {
				if (response.status === 204) {
					callbacks.success.call(this, []);
				} else {
					callbacks.success.call(this, Ext.decode(response.responseText));
				}
			},
			204: callbacks.empty,

			401: callbacks.unauthenticated,
			404: callbacks.empty,
			failure: callbacks.failure
		});
	},

	getMyPublicPoolSessions: function (callbacks, offset, limit) {
		this.arsjax.request({
			url: "session/publicpool/",
			method: "GET",
			params: {
				statusonly: true
			},
			headers: {
				Range: this.constructRangeString(offset, limit)
			},

			success: callbacks.success,
			204: callbacks.empty,

			401: callbacks.unauthenticated,
			404: callbacks.empty,
			failure: callbacks.failure
		});
	},

	getSessionsByKeyword: function (keyword, callbacks) {
		this.arsjax.request({
			url: "session/" + keyword,
			method: "GET",

			success: function (response) {
				if (response.status === 204) {
					callbacks.success.call(this, []);
				} else {
					callbacks.success.call(this, Ext.decode(response.responseText));
				}
			},
			204: callbacks.empty,

			401: callbacks.unauthenticated,
			404: callbacks.empty,
			failure: callbacks.failure
		});
	},
	/**
	 * Get the sessions where user is visitor
	 * @param login from user
	 * @param object with success-, unauthenticated- and failure-callbacks
	 * @return session-objects, if found
	 * @return false, if nothing found
	 */
	getMyVisitedSessions: function (callbacks, sortby, offset, limit) {
		this.arsjax.request({
			url: "session/",
			method: "GET",
			params: {
				visitedonly: true,
				statusonly: true,
				sortby: sortby
			},
			headers: {
				Range: this.constructRangeString(offset, limit)
			},

			success: callbacks.success,
			204: callbacks.empty,

			failure: function (response) {
				if (response.status === 401) {
					callbacks.unauthenticated.apply(this, arguments);
				} else {
					callbacks.failure.apply(this, arguments);
				}
			}
		});
	},

	/**
	 * Get the courses where user is enlisted in
	 * @param sortby sortby
	 * @param callbacks with success-, failure-, unauthenticated and empty-callbacks
	 * @return session-objects, if found
	 * @return false, if nothing found
	 */
	getMyCourses: function (callbacks, sortby, onlyTeacher) {
		this.arsjax.request({
			url: "mycourses",
			method: "GET",
			params: {
				sortby: sortby,
				onlyTeacher: onlyTeacher
			},
			success: callbacks.success,
			failure: function (response) {
				if (response.status === 401) {
					callbacks.unauthenticated.apply(this, arguments);
				} else if (response.status === 404) {
					callbacks.empty.apply(this, arguments);
				} else {
					callbacks.failure.apply(this, arguments);
				}
			}
		});
	},

	getSkillQuestion: function (id, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + id,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getQuestionImage: function (questionId, callbacks, fcImage) {
		if (!fcImage) {
			fcImage = false;
		}

		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/questionimage?fcImage=" + fcImage,
			success: function (response) {
				callbacks.success.call(this, response.responseText);
			},
			failure: callbacks.failure
		});
	},

	/**
	 * Get lecture questions for this session, sorted by subject and text
	 * @param sessionKeyword
	 * @param object with success-, failure- and empty-callbacks
	 */
	getLectureQuestions: function (sessionKeyword, callbacks, offset, limit, requestImageData) {
		var me = this;
		this.arsjax.request({
			url: "lecturerquestion/?lecturequestionsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword) +
				"&requestImageData=" + !!requestImageData,
			headers: {
				Range: this.constructRangeString(offset, limit)
			},
			success: function (response) {
				callbacks.success(response, me.getTotalRangeSize(response));
			},
			204: callbacks.empty,

			failure: callbacks.failure
		});
	},

	getFlashcards: function (sessionKeyword, callbacks, offset, limit, requestImageData) {
		var me = this;
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + encodeURIComponent(sessionKeyword) +
				"&flashcardsonly=true" + "&requestImageData=" + !!requestImageData,
			headers: {
				Range: this.constructRangeString(offset, limit)
			},
			success: function (response) {
				callbacks.success(response, me.getTotalRangeSize(response));
			},
			204: callbacks.empty,

			failure: callbacks.failure
		});
	},

	getPreparationQuestions: function (sessionKeyword, callbacks, offset, limit, requestImageData) {
		var me = this;
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + encodeURIComponent(sessionKeyword) +
				"&preparationquestionsonly=true" + "&requestImageData=" + !!requestImageData,
			headers: {
				Range: this.constructRangeString(offset, limit)
			},
			success: function (response) {
				callbacks.success(response, me.getTotalRangeSize(response));
			},
			204: callbacks.empty,

			failure: callbacks.failure
		});
	},

	countPreparationQuestions: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/count?preparationquestionsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	countFlashcards: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/count?flashcardsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	countLectureQuestions: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/count?lecturequestionsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	countPreparationQuestionAnswers: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/answercount?preparationquestionsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	countLectureQuestionAnswers: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/answercount?lecturequestionsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	/**
	 * Get interposed questions for this session
	 * @param sessionKeyword
	 * @param object with success- and failure-callbacks
	 * @return session-objects, if found
	 * @return false, if nothing found
	 */
	getInterposedQuestions: function (sessionKeyword, callbacks, offset, limit) {
		var me = this;
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/interposed",
			method: "GET",
			headers: {
				Range: this.constructRangeString(offset, limit)
			},
			success: function (response) {
				callbacks.success(response, me.getTotalRangeSize(response));
			},
			failure: callbacks.failure
		});
	},

	getInterposedQuestion: function (question, callbacks) {
		this.arsjax.request({
			url: "session/" + question.get('sessionId') + "/interposed/" + question.data._id,
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	saveInterposedQuestion: function (subject, text, sessionKeyword, timestamp, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/interposed",
			method: "POST",
			jsonData: {subject: subject, text: text, sessionId: sessionKeyword, timestamp: timestamp},
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	deleteInterposedQuestion: function (question, callbacks) {
		this.arsjax.request({
			url: "audiencequestion/" + question.getId(),
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	deleteAllInterposedQuestions: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + encodeURIComponent(sessionKeyword) + "/interposed/",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	countFeedbackQuestions: function (sessionKeyword, username, callbacks) {
		var queryStr = username ? "?user=" + username : "";
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/interposedreadingcount" + queryStr,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	saveSkillQuestion: function (question, callbacks) {
		this.arsjax.request({
			url: "session/" + question.get('sessionKeyword') + "/question",
			method: "POST",
			jsonData: question.getData(),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	bulkSaveSkillQuestions: function (questions, callbacks) {
		if (questions && questions.length > 0) {
			this.arsjax.request({
				url: "session/" + questions[0].sessionKeyword + "/question/bulk",
				method: "POST",
				jsonData: questions,
				success: callbacks.success,
				failure: callbacks.failure
			});
		}
	},

	updateSkillQuestion: function (question, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + question.get('_id'),
			method: "PUT",
			jsonData: question.getData(),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	publishSkillQuestion: function (question, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + question.get('_id') + "/publish",
			method: "POST",
			jsonData: question.getData(),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	publishAllSkillQuestions: function (sessionKeyword, active, isLecture, isPreparation, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/publish?sessionkey=" + encodeURIComponent(sessionKeyword) +
				"&publish=" + encodeURIComponent(active) +
				"&lecturequestionsonly=" + encodeURIComponent(isLecture) +
				"&preparationquestionsonly=" + encodeURIComponent(isPreparation),
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	publishAllLectureQuestions: function (sessionKeyword, active, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/publish?sessionkey=" + encodeURIComponent(sessionKeyword) +
					"&publish=" + encodeURIComponent(active) + "&lecturequestionsonly=true",
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	publishAllPreparationQuestions: function (sessionKeyword, active, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/publish?sessionkey=" + encodeURIComponent(sessionKeyword) +
					"&publish=" + encodeURIComponent(active) + "&preparationquestionsonly=true",
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	publishSkillQuestionStatistics: function (question, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + question.get('_id') + "/publishstatistics",
			method: "POST",
			jsonData: question.getData(),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	publishCorrectSkillQuestionAnswer: function (question, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + question.get('_id') + "/publishcorrectanswer",
			method: "POST",
			jsonData: question.getData(),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	disableQuestionVoting: function (questionId, disable, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/disablevote?disable=" + encodeURIComponent(disable),
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	disableAllQuestionVotings: function (sessionKeyword, disable, isLecture, isPreparation, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/disablevote?sessionkey=" + encodeURIComponent(sessionKeyword) +
				"&disable=" + encodeURIComponent(disable) +
				"&lecturequestionsonly=" + encodeURIComponent(isLecture) +
				"&preparationquestionsonly=" + encodeURIComponent(isPreparation),
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	disableQuestionVotingForAllLectureQuestions: function (sessionKeyword, disable, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/disablevote?sessionkey=" + encodeURIComponent(sessionKeyword) +
					"&disable=" + encodeURIComponent(disable) + "&lecturequestionsonly=true",
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	disableQuestionVotingForAllPreparationQuestions: function (sessionKeyword, disable, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/disablevote?sessionkey=" + encodeURIComponent(sessionKeyword) +
					"&disable=" + encodeURIComponent(disable) + "&preparationquestionsonly=true",
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	createSession: function (session, callbacks) {
		this.arsjax.request({
			url: "session/",
			method: "POST",
			jsonData: {
				"name": session.get("name"),
				"shortName": session.get("shortName"),
				"courseId": session.get("courseId") ? session.get("courseId") : null,
				"courseType": session.get("courseType") ? session.get("courseType") : null,
				"creationTime": session.get("creationTime"),
				"ppAuthorName": session.get("ppAuthorName"),
				"ppAuthorMail": session.get("ppAuthorMail"),
				"ppUniversity": session.get("ppUniversity"),
				"ppLogo": session.get("ppLogo"),
				"ppSubject": session.get("ppSubject"),
				"ppLicense": session.get("ppLicense"),
				"ppDescription": session.get("ppDescription"),
				"ppFaculty": session.get("ppFaculty"),
				"ppLevel": session.get("ppLevel"),
				"sessionType": session.get("sessionType")
			},
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	updateSession: function (session, callbacks) {
		this.arsjax.request({
				url: "session/" + session.get("keyword"),
				method: "PUT",
				jsonData: session.data,
				success: callbacks.success,
				failure: callbacks.failure
			});
	},

	delQuestion: function (queObj, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + queObj._id,
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	delAllPreparationQuestions: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + sessionKeyword + "&preparationquestionsonly=true",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	delAllFlashcards: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + sessionKeyword + "&flashcardsonly=true",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	delAllLectureQuestions: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + sessionKeyword + "&lecturequestionsonly=true",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	startNewPiRound: function (questionId, time, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/startnewpiround" + "?time=" + time,
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	cancelDelayedPiRound: function (questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/canceldelayedpiround",
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	resetPiRoundState: function (questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/resetpiroundstate",
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	delAnswers: function (questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answer/",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	delSession: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword,
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	delAllQuestionsAnswers: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/answers?sessionkey=" + encodeURIComponent(sessionKeyword) + "&lecturequestionsonly=true",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	delAllPreparationAnswers: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/answers?sessionkey=" + encodeURIComponent(sessionKeyword) + "&preparationquestionsonly=true",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	delAllFlashcardViews: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/answers?sessionkey=" + encodeURIComponent(sessionKeyword) + "&flashcardsonly=true",
			method: "DELETE",
			success: callbacks.succcess,
			failure: callbacks.failure
		});
	},

	getAnswerByUserAndSession: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/myanswers",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getUserAnswer: function (questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/myanswer",
			success: function (response) {
				if (response.status === 204) {
					callbacks.empty.apply(this, arguments);
				} else {
					callbacks.success.apply(this, arguments);
				}
			},
			failure: callbacks.failure
		});
	},

	saveAnswer: function (answer, questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + encodeURIComponent(questionId) + "/answer/",
			method: "POST",
			jsonData: answer.raw,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	updateAnswer: function (answer, questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + encodeURIComponent(questionId) + "/answer/" + answer.get('_id'),
			method: "PUT",
			jsonData: answer.raw,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	deleteAnswer: function (questionId, answerId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answer/" + answerId,
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	countAnswers: function (sessionKeyword, questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answer/",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	countAllAnswers: function (sessionKeyword, questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answer/?all=true",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	countPiAnswers: function (sessionKeyword, questionId, piRound, callbacks) {
		if (!piRound) {
			piRound = 0;
		}

		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answer/?piround=" + piRound,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getAnswerCount: function (questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answercount",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getAllRoundAnswerCountByQuestion: function (questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/allroundanswercount",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getTotalAnswerCountByQuestion: function (questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/totalanswercount",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getAnswerAndAbstentionCount: function (questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answerandabstentioncount",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getAnsweredFreetextQuestions: function (sessionKeyword, questionId, callbacks, offset, limit) {
		var me = this;
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/freetextanswer/",
			headers: {
				Range: this.constructRangeString(offset, limit)
			},
			success: function (response) {
				callbacks.success(response, me.getTotalRangeSize(response));
			},
			failure: callbacks.failure
		});
	},

	getImageAnswerImage: function (questionId, answerId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answer/" + answerId + '/image',
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	lock: function (sessionKeyword, theLock, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/lock?lock=" + theLock,
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	lockFeedbackInput: function (sessionKeyword, lock, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/lockfeedbackinput?lock=" + lock,
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	flipFlashcards: function (sessionKeyword, flip, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/flipflashcards",
			method: "POST",
			params: {
				flip: flip
			},
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getFeedback: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/feedback/",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getStatistics: function (callbacks) {
		this.arsjax.request({
			url: "statistics/",
			method: 'GET',
			disableCaching: false,

			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getLectureQuestionsForUser: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/",
			method: "GET",
			params: {
				sessionkey: sessionKeyword,
				lecturequestionsonly: true
			},
			success: function (response) {
				var json = response.responseText || "[]";
				callbacks.success(Ext.decode(json));
			},
			failure: callbacks.failure
		});
	},

	getPreparationQuestionsForUser: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/",
			method: "GET",
			params: {
				sessionkey: sessionKeyword,
				preparationquestionsonly: true
			},
			success: function (response) {
				var json = response.responseText || "[]";
				callbacks.success(Ext.decode(json));
			},
			failure: callbacks.failure
		});
	},

	getFlashcardsForUser: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/",
			method: "GET",
			params: {
				sessionkey: sessionKeyword,
				flashcardsonly: true
			},
			success: function (response) {
				var json = response.responseText || "[]";
				callbacks.success(Ext.decode(json));
			},
			failure: callbacks.failure
		});
	},

	getMyLearningProgress: function (sessionKeyword, options, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/mylearningprogress",
			method: "GET",
			params: options,
			success: function (response) {
				var progress = Ext.apply({myprogress: 0, courseprogress: 0}, Ext.decode(response.responseText));
				callbacks.success(progress);
			},
			failure: callbacks.failure
		});
	},

	getCourseLearningProgress: function (sessionKeyword, options, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/learningprogress",
			method: "GET",
			params: options,
			success: function (response) {
				var progress = Ext.decode(response.responseText) || 0;
				callbacks.success(progress);
			},
			failure: callbacks.failure
		});
	},

	getAuthServices: function (callbacks) {
		this.arsjax.request({
			url: "auth/services",
			method: "GET",
			success: function (response) {
				var json = response.responseText || "[]";
				callbacks.success(Ext.decode(json));
			}
		});
	},

	getGlobalConfiguration: function (callbacks) {
		var configUrl = "arsnova-config";
		//<debug>
		configUrl = "configuration/";
		//</debug>
		this.arsjax.request({
			url: configUrl,
			method: "GET",
			success: function (response) {
				var json = response.responseText || "[]";
				callbacks.success(Ext.decode(json));
			},
			failure: function (response) {
				callbacks.failure(response);
			}
		});
	},

	importSession: function (jsonData, callbacks) {
		this.arsjax.request({
			url: "session/import",
			method: "POST",
			jsonData: jsonData,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	exportSessions: function (keywords, withAnswerStatistics, withFeedbackQuestions, callbacks) {
		this.arsjax.request({
			url: "session/export?sessionkey=" + keywords +
			"&withAnswerStatistics=" + encodeURIComponent(withAnswerStatistics) +
			"&withFeedbackQuestions=" + encodeURIComponent(withFeedbackQuestions),
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	copySessionToPublicPool: function (keyword, PublicPoolData, callbacks) {
		this.arsjax.request({
			url: "session/" + keyword + "/copytopublicpool",
			method: "POST",
			jsonData: PublicPoolData,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getSubjectSort: function (sessionKeyword, isPreparation, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/subjectsort?sessionkey=" + sessionKeyword +
				"&ispreparation=" + encodeURIComponent(isPreparation),
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	setSubjectSort: function (sessionKeyword, isPreparation, sortType, subjects, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/subjectsort?sessionkey=" + sessionKeyword +
			"&sorttype=" + encodeURIComponent(sortType) +
			"&ispreparation=" + encodeURIComponent(isPreparation),
			method: "POST",
			jsonData: subjects,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	changeFeatures: function (keyword, features, callbacks) {
		this.arsjax.request({
			url: "session/" + encodeURIComponent(keyword) + "/features",
			method: "PUT",
			jsonData: features,
			success: function (response) {
				var json = response.responseText || "{}";
				callbacks.success(Ext.decode(json));
			},
			failure: callbacks.failure
		});
	},

	getQuestionSort: function (sessionKeyword, subject, isPreparation, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/questionsort?sessionkey=" + sessionKeyword +
				"&subject=" + encodeURIComponent(subject) +
				"&ispreparation=" + encodeURIComponent(isPreparation),
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	setQuestionSort: function (sessionKeyword, subject, isPreparation, sortType, questionIDs, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/questionsort?sessionkey=" + sessionKeyword +
			"&subject=" + encodeURIComponent(subject) +
			"&sorttype=" + encodeURIComponent(sortType) +
			"&ispreparation=" + encodeURIComponent(isPreparation),
			method: "POST",
			jsonData: questionIDs,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getFeatures: function (keyword, callbacks) {
		this.arsjax.request({
			url: "session/" + encodeURIComponent(keyword) + "/features",
			method: "GET",
			success: function (response) {
				var json = response.responseText || "{}";
				callbacks.success(Ext.decode(json));
			},
			failure: callbacks.failure
		});
	},

	getVimeoThumbnailUrl: function (videoId, callbacks) {
		Ext.Ajax.request({
			type: 'GET',
			url: '//vimeo.com/api/v2/video/' + videoId + '.json',
			useDefaultXhrHeader: false,
			success: function (response) {
				var json = response.responseText || "{}";
				var data = Ext.decode(json)[0];

				//jscs:disable
				callbacks.success(data.thumbnail_medium);
				//jscs:enable
			},
			failure: callbacks.failure
		});
	},

	checkFrameOptionsHeader: function (url, callbacks) {
		this.arsjax.request({
			url: "checkframeoptionsheader?url=" + encodeURIComponent(url),
			method: "POST",
			success: callbacks.success,
			204: callbacks.failure,
			failure: callbacks.failure
		});
	},

	saveMotd: function (motd, callbacks) {
		this.arsjax.request({
			url: "motd/",
			jsonData: motd.getData(),
			success: callbacks.success,
			failure: callbacks.failure,
			method: "POST"
		});
	},

	updateMotd: function (motd, callbacks) {
		this.arsjax.request({
			url: "motd/" + motd.get('motdkey'),
			method: "PUT",
			jsonData: motd.getData(),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	deleteMotd: function (motd, callbacks) {
		this.arsjax.request({
			url: "motd/" + motd.motdkey,
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getAllMotds: function (callbacks) {
		this.arsjax.request({
			url: "motd/?adminview=true",
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getAllSessionMotds: function (key, callbacks) {
		this.arsjax.request({
			url: "motd/?adminview=true&sessionkey=" + key,
			success: callbacks.success,
			failure: callbacks.failure,
			method: "GET"
		});
	},

	getMotdsForAll: function (callbacks) {
		this.arsjax.request({
			url: "motd/",
			success: callbacks.success,
			failure: callbacks.failure,
			method: "GET"
		});
	},

	getMotdsForLoggedIn: function (callbacks) {
		this.arsjax.request({
			url: "motd/?audience=loggedIn",
			success: callbacks.success,
			failure: callbacks.failure,
			method: "GET"
		});
	},

	getMotdsForTutors: function (callbacks) {
		this.arsjax.request({
			url: "motd/?audience=tutors",
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getMotdsForStudents: function (callbacks) {
		this.arsjax.request({
			url: "motd/?audience=students",
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getMotdsForSession: function (key, callbacks) {
		this.arsjax.request({
			url: "motd/?audience=session&sessionkey=" + key,
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getMotdListForUser: function (username, callbacks) {
		this.arsjax.request({
			url: "motd/userlist?username=" + encodeURIComponent(username),
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	saveMotdList: function (motdlist, callbacks) {
		this.arsjax.request({
			url: "motd/userlist",
			method: "POST",
			jsonData: motdlist,
			success: function (response) {}
		});
	},

	updateMotdList: function (motdlist, callbacks) {
		this.arsjax.request({
			url: "motd/userlist",
			method: "PUT",
			jsonData: motdlist,
			success: function (response) {}
		});
	}
});
