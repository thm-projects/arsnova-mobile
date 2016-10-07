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
Ext.define('ARSnova.model.Session', {
	extend: 'Ext.data.Model',

	mixin: ['Ext.mixin.Observable'],

	config: {
		proxy: {type: 'restProxy'},
		idProperty: "_id",

		fields: [
			'_rev',
			'type',
			'name',
			'active',
			'shortName',
			'creator',
			'keyword',
			'courseId',
			'courseType',
			'creationTime',
			'learningProgressType',
			'ppAuthorName',
			'ppAuthorMail',
			'ppUniversity',
			'ppLogo',
			'ppSubject',
			'ppLicense',
			'ppDescription',
			'ppFaculty',
			'ppLevel',
			'sessionType',
			'feedbackLock'
		],

		validations: [
			{type: 'presence', field: 'type'},
			{
				type: 'presence',
				field: 'name',
				min: 1,
				max: 50,
				message: Messages.SESSION_NAME + ':\t' + Messages.SESSIONPOOL_NOTIFICATION_SESSION_NAME
			},
			{
				type: 'length',
				field: 'shortName',
				min: 1,
				max: 12,
				message: Messages.SESSION_SHORT_NAME + ':\t' + Messages.SESSIONPOOL_NOTIFICATION_SESSION_SHORTNAME
			},
			{
				type: 'presence',
				field: 'creator',
				message: Messages.EXPORT_FIELD_NAME + ':\t' + Messages.SESSIONPOOL_NOTIFICATION_NAME
			}
		],

		learningProgress: {
			type: "questions",
			questionVariant: ""
		}
	},

	sessionIsActive: true,
	isLearningProgessOptionsInitialized: false,

	events: {
		sessionActive: "arsnova/session/active",
		sessionJoinAsSpeaker: "arsnova/session/join/speaker",
		sessionJoinAsStudent: "arsnova/session/join/student",
		sessionLeave: "arsnova/session/leave",
		learningProgressOptions: "arsnova/session/learningprogress/options",
		learningProgressChange: "arsnova/session/learningprogress/change",
		flipFlashcards: "arsnova/session/flashcards/flip",
		featureChange: "arsnova/session/features/change"
	},

	constructor: function () {
		this.callParent(arguments);

		ARSnova.app.socket.on(ARSnova.app.socket.events.setSessionActive, function (active) {
			this.sessionIsActive = active;

			this.fireEvent(this.events.sessionActive, active);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.learningProgressChange, function () {
			this.fireEvent(this.events.learningProgressChange);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.flipFlashcards, function (flip) {
			ARSnova.app.getController('FlashcardQuestions').flipFlashcards(flip);
			this.fireEvent(this.events.flipFlashcards, flip);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.featureChange, function (features) {
			var prevFeatures = ARSnova.app.getController('Feature').getActiveFeatures();

			sessionStorage.setItem("features", Ext.encode(features));
			ARSnova.app.getController('Feature').applyFeatures(prevFeatures);
			this.fireEvent(this.events.featureChange, features);
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.learningProgressOptions, function () {
			this.isLearningProgessOptionsInitialized = true;
		}, this);

		ARSnova.app.socket.on(ARSnova.app.socket.events.learningProgressOptions, this.setUserBasedProgressOptions, this);
	},

	destroy: function (sessionId, creator, callbacks) {
		return this.getProxy().delSession(sessionId, creator, callbacks);
	},

	create: function (callbacks) {
		return this.getProxy().createSession(this, callbacks);
	},

	update: function (callbacks) {
		return this.getProxy().updateSession(this, callbacks);
	},

	checkSessionLogin: function (keyword, callbacks) {
		var me = this;

		return this.getProxy().checkSessionLogin(keyword, {
			success: function (response) {
				var localTime = new Date().getTime();
				var obj = Ext.decode(response.responseText);
				var serverTime = new Date(response.getResponseHeader("Date")).getTime();

				sessionStorage.setItem("serverTimeDiff", serverTime - localTime);
				me.setUserBasedProgressOptions(obj.learningProgressOptions);
				callbacks.success(obj);
			},
			forbidden: callbacks.forbidden || Ext.emptyFn,
			notFound: callbacks.notFound || Ext.emptyFn,
			failure: callbacks.failure
		});
	},

	getMySessions: function (offset, limit, callbacks, sortby) {
		return this.getProxy().getMySessions(callbacks, sortby, offset, limit);
	},

	getMyPublicPoolSessions: function (offset, limit, callbacks) {
		return this.getProxy().getMyPublicPoolSessions(callbacks, offset, limit);
	},

	getMyVisitedSessions: function (offset, limit, callbacks, sortby) {
		return this.getProxy().getMyVisitedSessions(callbacks, sortby, offset, limit);
	},

	getPublicPoolSessions: function (callbacks) {
		return this.getProxy().getPublicPoolSessions(callbacks);
	},

	lock: function (sessionKeyword, theLock, callbacks) {
		return this.getProxy().lock(sessionKeyword, theLock, callbacks);
	},

	lockFeedbackInput: function (lock, callbacks) {
		return this.getProxy().lockFeedbackInput(sessionStorage.getItem("keyword"), lock, callbacks);
	},

	flipFlashcards: function (flip, callbacks) {
		return this.getProxy().flipFlashcards(sessionStorage.getItem("keyword"), flip, callbacks);
	},

	getMyLearningProgress: function (sessionKeyword, callbacks) {
		var me = this;
		return this.getProxy().getMyLearningProgress(sessionKeyword, this.getLearningProgress(), {
			success: function (progress) {
				var progressDescription = me.progressDescription(progress);
				var myself = progressDescription.myself;
				var course = progressDescription.course;
				callbacks.success.call(callbacks.scope, myself, course, progress, me.getLearningProgress());
			}
		});
	},

	getCourseLearningProgress: function (sessionKeyword, callbacks) {
		return this.getCourseLearningProgressWithOptions(sessionKeyword, this.getLearningProgress(), callbacks);
	},

	getCourseLearningProgressWithOptions: function (sessionKeyword, options, callbacks) {
		var me = this;
		return this.getProxy().getCourseLearningProgress(sessionKeyword, options, {
			success: function (progress) {
				var progressDescription = me.progressDescription(progress);
				var desc = progressDescription.course;
				callbacks.success.call(callbacks.scope, desc.text, desc.color, progress, me.getLearningProgress());
			},
			failure: callbacks.failure
		});
	},

	getMyLearningProgressWithOptions: function (sessionKeyword, options, callbacks) {
		var me = this;
		return this.getProxy().getMyLearningProgress(sessionKeyword, options, {
			success: function (progress) {
				var progressDescription = me.progressDescription(progress);
				var myself = progressDescription.myself;
				var course = progressDescription.course;
				callbacks.success.call(callbacks.scope, myself, course, progress, me.getLearningProgress());
			},
			failure: callbacks.failure
		});
	},

	progressDescription: function (learningProgress) {
		var desc = function (progress) {
			var color;
			var text = progress + "%";
			if (progress >= 75) {
				color = "green";
			} else if (progress >= 50) {
				color = "orange";
			} else if (progress === 0) {
				color = "";
				text = "…";
			} else {
				color = "red";
			}
			return {
				color: color,
				text: text
			};
		};
		var myProgress = desc(learningProgress.myProgress);
		var courseProgress = desc(learningProgress.courseProgress);
		// if the user has some progress, do not deactivate the the course progress if it currently has no value
		if (learningProgress.myProgress > 0 && learningProgress.courseProgress === 0) {
			courseProgress.color = "red";
			courseProgress.text = learningProgress.courseProgress + "%";
		}
		// similarly, do not deactivate my progres if the course has some values
		if (learningProgress.myProgress === 0 && learningProgress.courseProgress > 0) {
			myProgress.color = "red";
			myProgress.text = learningProgress.myProgress + "%";
		}
		// once somebody has answered a question, always show percentages
		if (learningProgress.myProgress === 0 && learningProgress.courseProgress === 0 && learningProgress.numUsers > 0) {
			courseProgress.color = "red";
			courseProgress.text = learningProgress.courseProgress + "%";
			myProgress.color = "red";
			myProgress.text = learningProgress.myProgress + "%";
		}
		return {
			myself: myProgress,
			course: courseProgress
		};
	},

	setLearningProgressOptions: function (options) {
		var current = this.getLearningProgress();
		if (current.type === options.type && current.questionVariant === options.questionVariant) {
			return;
		}
		this.setLearningProgress(options);
		localStorage.setItem("learningProgressOptions-" + sessionStorage.getItem("keyword"), JSON.stringify(options));
		ARSnova.app.socket.setLearningProgressOptions({
			sessionKeyword: sessionStorage.getItem("keyword"),
			type: options.type,
			questionVariant: options.questionVariant
		});
	},

	getUserBasedProgressOptions: function () {
		var data = localStorage.getItem("learningProgressOptions-" + sessionStorage.getItem("keyword"));
		if (data) {
			return JSON.parse(data);
		}
		return this.getLearningProgress();
	},

	setUserBasedProgressOptions: function (options) {
		// for students, progress stored in localStorage will always take priority
		if (ARSnova.app.isSessionOwner) {
			this.setLearningProgressOptions(options);
		} else {
			// overwrite server-based progress type for students with their own selection (if available)
			this.setLearningProgress(this.getUserBasedProgressOptions() || options);
		}
	},

	changeFeatures: function (keyword, features, callbacks) {
		var me = this;
		return this.getProxy().changeFeatures(keyword, features, {
			success: function (features) {
				var prev = ARSnova.app.getController('Feature').getActiveFeatures();
				// Check if the features have actually changed...
				var same = true;
				for (var k in prev) {
					if (prev.hasOwnProperty(k)) {
						same = same && (prev[k] === features[k]);
					}
				}
				if (!same || !prev) {
					sessionStorage.setItem("features", Ext.encode(features));
					me.fireEvent(me.events.featureChange, features);
				}
				callbacks.success.apply(callbacks.scope, arguments);
			},
			failure: callbacks.failure
		});
	},

	getFeatures: function (keyword, callbacks) {
		return this.getProxy().getFeatures(keyword, callbacks);
	}
});
