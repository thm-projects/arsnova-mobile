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
/**
 * This class serves as an interface to ARSnova Web Socket implementation.
 *
 * The only purpose of this class is to translate raw Web Socket events into
 * events handled by the Model classes. This means that users of Web Socket data
 * should not listen to any of the events listed here. Instead, they should connect
 * their listeners to the events provided by the Model classes.
 *
 * When assigning new events, please adapt the following format:
 * "arsnova/socket/[type-of-data]/[type-of-event]", eg. "arsnova/socket/feedback/update"
 *
 */
Ext.define('ARSnova.WebSocket', {
	extend: 'Ext.util.Observable',

	events: {
		setSessionActive: "arsnova/socket/session/active",
		feedbackReset: "arsnova/socket/feedback/reset",
		feedbackAverage: "arsnova/socket/feedback/average",
		lockVote: "arsnova/socket/lecturer/lockVote",
		lockVotes: "arsnova/socket/lecturer/lockVotes",
		unlockVote: "arsnova/socket/lecturer/unlockVote",
		unlockVotes: "arsnova/socket/lecturer/unlockVotes",
		featureChange: "arsnova/session/features/change",
		endPiRound: "arsnova/question/lecturer/endPiRound",
		resetPiRound: "arsnova/question/lecturer/resetPiRound",
		cancelPiRound: "arsnova/question/lecturer/cancelPiRound",
		startDelayedPiRound: "arsnova/question/lecturer/delayedPiRound",
		lecturerQuestionAvailable: "arsnova/socket/question/lecturer/available",
		lecturerQuestionLocked: "arsnova/socket/question/lecturer/locked",
		audienceQuestionAvailable: "arsnova/socket/question/audience/available",
		unansweredLecturerQuestions: "arsnova/socket/question/lecturer/lecture/unanswered",
		unansweredPreparationQuestions: "arsnova/socket/question/lecturer/preparation/unanswered",
		countQuestionAnswersByQuestionId: "arsnova/socket/question/lecturer/question/answer-and-abstention-count",
		countLectureQuestionAnswers: "arsnova/socket/question/lecturer/lecture/answercount",
		countPreparationQuestionAnswers: "arsnova/socket/question/lecturer/preparation/answercount",
		learningProgressOptions: "arsnova/socket/session/learningprogress/options",
		learningProgressChange: "arsnova/socket/session/learningprogress/change"
	},

	memoization: {},

	socket: null,

	connect: function () {
		this.initSocket().then(Ext.bind(function (socketUrl) {
			/* Upgrade from polling to WebSocket currently does not work
			* reliably so manually set the transport by detecting browser
			* support for WebSocket protocol */
			var hasWs = false;
			if (window.WebSocket) {
				/* Workaround: unfortunately some browsers pretend to support
				* WS protocol although they do not */
				try {
					var wsTestUrl = socketUrl.replace(/^http/, "ws") + "/socket.io/1/";
					var ws = new WebSocket(wsTestUrl);
					ws.close(-1);
				} catch (e) {
					hasWs = true;
				}
			}
			var transports = hasWs ? ["websocket"] : ["polling"];
			console.debug("Socket.IO transports", transports);

			this.socket = io.connect(socketUrl, {
				reconnect: true,
				secure: window.location.protocol === 'http:' ? false : true,
				transports: transports
			});
			// FIXME: Remove once no code relies on a global 'socket' object.
			window.socket = this.socket;

			this.socket.on('connect', Ext.bind(function () {
				console.debug("Socket.IO connection established");
				ARSnova.app.restProxy.connectWebSocket().then(Ext.bind(function () {
					this.fireEvent("arsnova/socket/connect");
				}, this));
			}, this));

			this.socket.on('disconnect', Ext.bind(function () {
				console.debug("Socket.IO connection lost");
				this.fireEvent("arsnova/socket/disconnect");
			}, this));

			this.socket.on('reconnect', Ext.bind(function () {
				console.debug("Socket.IO connection restored");
				this.fireEvent("arsnova/socket/reconnect");
			}, this));

			this.socket.on('activeUserCountData', Ext.bind(function (data) {
				console.debug("Socket.IO: activeUserCountData", data);
				this.fireEvent("arsnova/socket/activeusercount/update", data);
			}, this));

			this.socket.on('feedbackData', Ext.bind(function (data) {
				console.debug("Socket.IO: feedbackData", data);
				this.fireEvent("arsnova/socket/feedback/update", data);
			}, this));

			this.socket.on('feedbackDataRoundedAverage', Ext.bind(function (average) {
				console.debug("Socket.IO: feedbackDataRoundedAverage", average);
				this.fireEvent(this.events.feedbackAverage, average);
			}, this));

			this.socket.on('feedbackReset', Ext.bind(function (affectedSessions) {
				console.debug("Socket.IO: feedbackReset", affectedSessions);
				this.fireEvent(this.events.feedbackReset, affectedSessions);
			}, this));

			this.socket.on('setSessionActive', Ext.bind(function (active) {
				this.memoization[this.events.setSessionActive] = active;
				this.fireEvent(this.events.setSessionActive, active);
			}, this));

			this.socket.on('endPiRound', Ext.bind(function (questionId) {
				console.debug("Socket.IO: endPiRound", questionId);
				this.fireEvent(this.events.endPiRound, questionId);
			}, this));

			this.socket.on('cancelPiRound', Ext.bind(function (questionId) {
				console.debug("Socket.IO: cancelPiRound", questionId);
				this.fireEvent(this.events.cancelPiRound, questionId);
			}, this));

			this.socket.on('resetPiRound', Ext.bind(function (questionId) {
				console.debug("Socket.IO: resetPiRound", questionId);
				this.fireEvent(this.events.resetPiRound, questionId);
			}, this));

			this.socket.on('startDelayedPiRound', Ext.bind(function (object) {
				console.debug("Socket.IO: startDelayedPiRound", object);
				this.fireEvent(this.events.startDelayedPiRound, object);
			}, this));

			this.socket.on('lecturerQuestionAvailable', Ext.bind(function (questions) {
				console.debug("Socket.IO: lecturerQuestionAvailable", questions);
				this.fireEvent(this.events.lecturerQuestionAvailable, questions);
			}, this));

			this.socket.on('lecturerQuestionLocked', Ext.bind(function (questions) {
				console.debug("Socket.IO: lecturerQuestionLocked", questions);
				this.fireEvent(this.events.lecturerQuestionLocked, questions);
			}, this));

			this.socket.on('lockVote', Ext.bind(function (object) {
				console.debug("Socket.IO: lockVote", object);
				this.fireEvent(this.events.lockVote, object);
			}, this));

			this.socket.on('lockVotes', Ext.bind(function (object) {
				console.debug("Socket.IO: lockVotes", object);
				this.fireEvent(this.events.lockVotes, object);
			}, this));

			this.socket.on('unlockVote', Ext.bind(function (object) {
				console.debug("Socket.IO: unlockVote", object);
				this.fireEvent(this.events.unlockVote, object);
			}, this));

			this.socket.on('unlockVotes', Ext.bind(function (object) {
				console.debug("Socket.IO: unlockVotes", object);
				this.fireEvent(this.events.unlockVotes, object);
			}, this));

			this.socket.on('audQuestionAvail', Ext.bind(function (questionId) {
				console.debug("Socket.IO: audQuestionAvail", questionId);
				this.fireEvent(this.events.audienceQuestionAvailable, questionId);
			}, this));

			this.socket.on('unansweredLecturerQuestions', Ext.bind(function (questionIds) {
				console.debug("Socket.IO: unansweredLecturerQuestions", questionIds);
				this.memoization[this.events.unansweredLecturerQuestions] = questionIds;
				this.fireEvent(this.events.unansweredLecturerQuestions, questionIds);
			}, this));

			this.socket.on('unansweredPreparationQuestions', Ext.bind(function (questionIds) {
				console.debug("Socket.IO: unansweredPreparationQuestions", questionIds);
				this.fireEvent(this.events.unansweredPreparationQuestions, questionIds);
			}, this));

			this.socket.on('countQuestionAnswersByQuestionId', Ext.bind(function (object) {
				console.debug("Socket.IO: countQuestionAnswersByQuestionId", object);
				this.fireEvent(this.events.countQuestionAnswersByQuestionId, object);
			}, this));

			this.socket.on('countLectureQuestionAnswers', Ext.bind(function (count) {
				console.debug("Socket.IO: countLectureQuestionAnswers", count);
				this.fireEvent(this.events.countLectureQuestionAnswers, count);
			}, this));

			this.socket.on('countPreparationQuestionAnswers', Ext.bind(function (count) {
				console.debug("Socket.IO: countPreparationQuestionAnswers", count);
				this.fireEvent(this.events.countPreparationQuestionAnswers, count);
			}, this));

			this.socket.on('learningProgressOptions', Ext.bind(function (options) {
				console.debug("Socket.IO: learningProgressOptions", options);
				this.fireEvent(this.events.learningProgressOptions, options);
			}, this));

			this.socket.on('featureChange', Ext.bind(function (features) {
				console.debug("Socket.IO: featureChange", features);
				this.fireEvent(this.events.featureChange, features);
			}, this));

			this.socket.on('learningProgressChange', Ext.Function.createBuffered(function () {
				console.debug("Socket.IO: learningProgressChange");
				this.fireEvent(this.events.learningProgressChange);
			}, 500, this));
		}, this));
	},

	initSocket: function () {
		var socketUrl = window.location.protocol + '//' + window.location.hostname + ':10443';
		var promise = ARSnova.app.restProxy.initWebSocket(socketUrl, new RSVP.Promise());
		return promise;
	},

	setSession: function (sessionKey) {
		var data = {keyword: sessionKey};
		console.debug("Socket.IO.emit: setSession", data);
		this.socket.emit("setSession", data);
	},

	readInterposedQuestion: function (question) {
		console.debug("Socket.IO.emit: readInterposedQuestion", question.getData());
		this.socket.emit("readInterposedQuestion", question.getData());
	},

	readFreetextAnswer: function (answer) {
		console.debug("Socket.IO.emit: readFreetextAnswer", answer._id);
		this.socket.emit("readFreetextAnswer", answer._id);
	},

	setLearningProgressOptions: function (data) {
		console.debug("Socket.IO.emit: setLearningProgressOptions", data);
		this.socket.emit("setLearningProgressOptions", data);
	},

	setFeedback: function (data) {
		console.debug("Socket.IO.emit: setFeedback", data);
		this.socket.emit("setFeedback", data);
	},

	doAddListener: function (name, fn, scope, options, order) {
		var result = this.callParent(arguments);
		if (this.memoization.hasOwnProperty(name)) {
			this.fireEvent(name, this.memoization[name]);
		}
		return result;
	}
});
