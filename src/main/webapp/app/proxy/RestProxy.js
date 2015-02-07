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
				} else if (response.status = 403) {
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
	 * Inits websocket
	 * @param socket URL
	 * @param promise
	 */
	initWebSocket: function (socketUrl, promise) {
		this.arsjax.request({
			url: "socket/url",
			success: function (data) {
				promise.resolve(data.responseText);
			},
			failure: function () {
				promise.resolve(socketUrl);
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
			jsonData: {session: socket.io.engine.id},
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
	getMySessions: function (callbacks, sortby) {
		this.arsjax.request({
			url: "session/",
			method: "GET",
			params: {
				statusonly: true,
				sortby: sortby
			},

			success: callbacks.success,
			204: callbacks.empty,

			401: callbacks.unauthenticated,
			404: callbacks.empty,
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

	getMyPublicPoolSessions: function (callbacks) {
		this.arsjax.request({
			url: "session/publicpool/",
			method: "GET",
			params: {
				statusonly: true
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
	getMyVisitedSessions: function (callbacks, sortby) {
		this.arsjax.request({
			url: "session/",
			method: "GET",
			params: {
				visitedonly: true,
				statusonly: true,
				sortby: sortby
			},
			success: function (response) {
				if (response.status === 204) {
					callbacks.success.call(this, []);
				} else {
					callbacks.success.call(this, Ext.decode(response.responseText));
				}
			},
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
	getMyCourses: function (callbacks, sortby) {
		this.arsjax.request({
			url: "mycourses",
			method: "GET",
			params: {
				sortby: sortby
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

	/**
	 * Get lecture questions for this session, sorted by subject and text
	 * @param sessionKeyword
	 * @param object with success-, failure- and empty-callbacks
	 */
	getLectureQuestions: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?lecturequestionsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			204: callbacks.empty,

			failure: callbacks.failure
		});
	},

	getFlashcards: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + encodeURIComponent(sessionKeyword) + "&flashcardsonly=true",
			success: callbacks.success,
			204: callbacks.empty,

			failure: callbacks.failure
		});
	},

	getPreparationQuestions: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + encodeURIComponent(sessionKeyword) + "&preparationquestionsonly=true",
			success: callbacks.success,
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
	getInterposedQuestions: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/interposed",
			method: "GET",
			success: callbacks.success,
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

	countFeedbackQuestions: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/interposedreadingcount",
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

	countAnswersByQuestion: function (sessionKeyword, questionId, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/question/" + questionId + "/answercount",
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

	getAnswerAndAbstentionCount: function (questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answerandabstentioncount",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getAnsweredFreetextQuestions: function (sessionKeyword, questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/freetextanswer/",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	lock: function (sessionKeyword, theLock, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/lock?lock=" + !!theLock,
			method: "POST",
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

	getMyLearningProgress: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/mylearningprogress",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getCourseLearningProgress: function (sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/learningprogress",
			success: callbacks.success,
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
	}
});
