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
Ext.define("ARSnova.controller.SessionImport", {
	extend: 'Ext.app.Controller',

	requires: [
		'ARSnova.model.Session',
		'ARSnova.model.Answer',
		'ARSnova.model.Question'
	],

	/**
	 * Import a single session from a JSON file.
	 */
	importSession: function (jsonContent) {
		var me = this;

		var promise = new RSVP.Promise();

		if (typeof jsonContent === "undefined" || typeof jsonContent.session === "undefined") {
			Ext.Msg.alert(Messages.IMP_ERROR, Messages.IMP_ERROR_FORMAT);
			console.log("Error while loading session json: content or session-attribute malformed or missing.");
			return;
		}

		// extract session and save it to the database
		var storeSessions = this.getElements(jsonContent.session, "ARSnova.model.Session");

		var i = 0;

		ARSnova.utils.AsyncUtils.promiseWhile(
				function () {
					// condition for stopping while loop
					return i < storeSessions.length;
				},
				function () {
					var s = storeSessions[i++];
					return me.saveSession(s, jsonContent);
				},
				null // no action on result
		).then(function () {
			promise.resolve();
		}, function () {
			promise.reject(Messages.IMP_ERROR_SAVE);
		});
		return promise;
	},

	saveSession: function (s, jsonContent) {
		var me = this;
		var promise = new RSVP.Promise();

		s._id = undefined;
		s.creator = localStorage.getItem('login');
		s.data.creationTime = Date.now();

		s.create({
			success: function (response) {
				var session = Ext.decode(response.responseText);
				me.saveSessionAttachment(session, jsonContent)
					.then(function () {
						promise.resolve();
					});
			},
			failure: function (response, operation) {
				if (response.status === 413) {
					Ext.Msg.alert(Messages.IMP_ERROR, Messages.IMP_ERROR_IMAGE);
				} else {
					Ext.Msg.alert(Messages.IMP_ERROR, Messages.IMP_ERROR_SAVE);
				}
				promise.reject();
			}
		});

		return promise;
	},

	/**
	 * Saves the answers, questions, etc. from a session.
	 *
	 * @param The
	 *            session retrieved after saving to the db e.g. for id
	 *            reference.
	 * @param The
	 *            content of the JSON file.
	 */
	saveSessionAttachment: function (session, jsonContent) {
		var me = this;

		var promise = new RSVP.Promise();

		var storeQuestions = [];
		var storeFeedbackQuestions = [];

		if (jsonContent.questions !== undefined) {
			storeQuestions = this.getElements(jsonContent.questions, "ARSnova.model.Question");
		}

		if (jsonContent.feedbackQuestions !== undefined) {
			storeFeedbackQuestions = this.getElements(jsonContent.feedbackQuestions, "ARSnova.model.Question");
		}

		var j = 0;
		var p1 = ARSnova.utils.AsyncUtils.promiseWhile(
			function () {
				// condition for stopping while loop
				return j < storeQuestions.length;
			},
			function () {
				var q = storeQuestions[j++];
				return me.saveQuestion(q, session);
			},
			null // no action on result
		);

		var k = 0;
		var p2 = ARSnova.utils.AsyncUtils.promiseWhile(
			function () {
				// condition for stopping while loop
				return k < storeFeedbackQuestions.length;
			},
			function () {
				var q = storeFeedbackQuestions[k++];
				return me.saveFeedbackQuestion(q, session);
			},
			null // no action on result
		);

		RSVP.all([p1, p2]).then(function () {
			promise.resolve();
		});

		return promise;
	},

	saveFeedbackQuestion: function (q, session) {
		var promise = new RSVP.Promise();
		q._data._id = undefined;
		q._data._rev = undefined;
		q._data.sessionId = session._id;
		q._data.sessionKeyword = session.keyword;
		q.sessionId = session._id;
		q.sessionKeyword = session.keyword;

		q.saveInterposed({
			success: function (response) {
				console.log("Successfully wrote interposed question.");
				promise.resolve();
			},
			failure: function () {
				console.log("Error while saving interposed question to database.");
				promise.reject();
			}
		});
		return promise;
	},

	saveQuestion: function (q, session) {
		var me = this;
		var promise = new RSVP.Promise();

		q._data._id = undefined;
		q._data._rev = undefined;
		q._data.sessionId = session._id;
		q._data.sessionKeyword = session.keyword;
		q.sessionId = session._id;
		q.sessionKeyword = session.keyword;

		q.saveSkillQuestion({
			success: function (response) {
				var respQuestion = Ext.decode(response.responseText);
				if (typeof q.raw.answers !== undefined) {
					var answers = q.raw.answers;
					var storeAnswers = me.getElements(q.raw.answers, "ARSnova.model.Answer");

					var l = 0;

					ARSnova.utils.AsyncUtils.promiseWhile(
						function () {
							// condition for stopping while loop
							return l < storeAnswers.length;
						},
						function () {
							var a = storeAnswers[l++];
							return me.saveAnswer(a, respQuestion, session);
						},
						null // no action on result
					).then(function () {
						// all answers imported, resolve promise
						promise.resolve();
					});
				} else {
					console.log("No answers to import");
					promise.resolve();
				}
			},
			failure: function () {
				console.log("Error while saving question to database.");
				promise.reject();
			}
		});

		return promise;
	},

	saveAnswer: function (a, respQuestion, session) {
		var promise = new RSVP.Promise();

		if (a.get('answerSubject') === null && a.get('answerText') === null && a.get('abstention') === false) {
			// This is an empty answer! Nothing to import...
			// However, we need to resolve the promise to keep things going.
			promise.resolve();
			return promise;
		}

		var theAnswer = Ext.create('ARSnova.model.Answer', {
			answerSubject: a.get('answerSubject'),
			answerText: a.get('answerText'),
			abstention: a.get('abstention')
		});

		theAnswer.saveAnswer(respQuestion._id, {
			success: function () {
				console.log("Answer saved successfully.");
				promise.resolve();
			},
			failure: function (response, request) {
				console.log("Could not save answer");
				promise.reject();
			}
		});
		return promise;
	},

	/**
	 * Gets the ARSnova class objects from the json file.
	 */
	getElements: function (json, className) {
		var store = new Ext.data.Store({
			model: className,
			data: json
			});

		// return store data as array for use in promise-while-loops
		var arrayStore = [];

		store.each(function (q) {
			arrayStore.push(q);
		});

		return arrayStore;
	}
});
