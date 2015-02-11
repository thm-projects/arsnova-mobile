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
		lecturerQuestionAvailable: "arsnova/socket/question/lecturer/available",
		audienceQuestionAvailable: "arsnova/socket/question/audience/available",
		unansweredLecturerQuestions: "arsnova/socket/question/lecturer/lecture/unanswered",
		unansweredPreparationQuestions: "arsnova/socket/question/lecturer/preparation/unanswered",
		countQuestionAnswersByQuestion: "arsnova/socket/question/lecturer/question/answercount",
		countLectureQuestionAnswers: "arsnova/socket/question/lecturer/lecture/answercount",
		countPreparationQuestionAnswers: "arsnova/socket/question/lecturer/preparation/answercount"
	},

	memoization: {},

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

			socket = io.connect(socketUrl, {
				reconnect: true,
				secure: window.location.protocol === 'http:' ? false : true,
				transports: transports
			});

			socket.on('connect', Ext.bind(function () {
				console.debug("Socket.IO connection established");
				ARSnova.app.restProxy.connectWebSocket().then(Ext.bind(function () {
					this.fireEvent("arsnova/socket/connect");
				}, this));
			}, this));

			socket.on('disconnect', Ext.bind(function () {
				console.debug("Socket.IO connection lost");
				this.fireEvent("arsnova/socket/disconnect");
			}, this));

			socket.on('reconnect', Ext.bind(function () {
				console.debug("Socket.IO connection restored");
				this.fireEvent("arsnova/socket/reconnect");
			}, this));

			socket.on('activeUserCountData', Ext.bind(function (data) {
				console.debug("Socket.IO: activeUserCountData", data);
				this.fireEvent("arsnova/socket/activeusercount/update", data);
			}, this));

			socket.on('feedbackData', Ext.bind(function (data) {
				console.debug("Socket.IO: feedbackData", data);
				this.fireEvent("arsnova/socket/feedback/update", data);
			}, this));

			socket.on('feedbackDataRoundedAverage', Ext.bind(function (average) {
				console.debug("Socket.IO: feedbackDataRoundedAverage", average);
				this.fireEvent(this.events.feedbackAverage, average);
			}, this));

			socket.on('feedbackReset', Ext.bind(function (affectedSessions) {
				console.debug("Socket.IO: feedbackReset", affectedSessions);
				this.fireEvent(this.events.feedbackReset, affectedSessions);
			}, this));

			socket.on('setSessionActive', Ext.bind(function (active) {
				this.memoization[this.events.setSessionActive] = active;
				this.fireEvent(this.events.setSessionActive, active);
			}, this));

			socket.on('lecturerQuestionAvailable', Ext.bind(function (question) {
				console.debug("Socket.IO: lecturerQuestionAvailable", question);
				this.fireEvent(this.events.lecturerQuestionAvailable, question);
			}, this));

			socket.on('audQuestionAvail', Ext.bind(function (questionId) {
				console.debug("Socket.IO: audQuestionAvail", questionId);
				this.fireEvent(this.events.audienceQuestionAvailable, questionId);
			}, this));

			socket.on('unansweredLecturerQuestions', Ext.bind(function (questionIds) {
				console.debug("Socket.IO: unansweredLecturerQuestions", questionIds);
				this.memoization[this.events.unansweredLecturerQuestions] = questionIds;
				this.fireEvent(this.events.unansweredLecturerQuestions, questionIds);
			}, this));

			socket.on('unansweredPreparationQuestions', Ext.bind(function (questionIds) {
				console.debug("Socket.IO: unansweredPreparationQuestions", questionIds);
				this.fireEvent(this.events.unansweredPreparationQuestions, questionIds);
			}, this));

			socket.on('countQuestionAnswersByQuestion', Ext.bind(function (object) {
				console.debug("Socket.IO: countQuestionAnswersByQuestion", object);
				this.fireEvent(this.events.countQuestionAnswersByQuestion, object);
			}, this));

			socket.on('countLectureQuestionAnswers', Ext.bind(function (count) {
				console.debug("Socket.IO: countLectureQuestionAnswers", count);
				this.fireEvent(this.events.countLectureQuestionAnswers, count);
			}, this));

			socket.on('countPreparationQuestionAnswers', Ext.bind(function (count) {
				console.debug("Socket.IO: countPreparationQuestionAnswers", count);
				this.fireEvent(this.events.countPreparationQuestionAnswers, count);
			}, this));
		}, this));
	},

	initSocket: function () {
		var socketUrl = window.location.protocol + '//' + window.location.hostname + ':10443';
		var promise = ARSnova.app.restProxy.initWebSocket(socketUrl, new RSVP.Promise());
		return promise;
	},

	setSession: function (sessionKey) {
		socket.emit("setSession", sessionKey);
	},

	readInterposedQuestion: function (question) {
		console.debug("Socket.IO.emit: readInterposedQuestion", question.getData());
		socket.emit("readInterposedQuestion", question.getData());
	},

	setLearningProgressType: function (data) {
		console.debug("Socket.IO.emit: setLearningProgressType", data);
		socket.emit("setLearningProgressType", data);
	},

	doAddListener: function (name, fn, scope, options, order) {
		var result = this.callParent(arguments);
		if (this.memoization.hasOwnProperty(name)) {
			this.fireEvent(name, this.memoization[name]);
		}
		return result;
	}
});
