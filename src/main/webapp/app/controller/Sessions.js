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
Ext.define("ARSnova.controller.Sessions", {
	extend: 'Ext.app.Controller',

	requires: [
		'ARSnova.model.Session',
		'ARSnova.view.speaker.TabPanel',
		'ARSnova.view.feedback.TabPanel',
		'ARSnova.view.feedbackQuestions.TabPanel',
		'ARSnova.view.user.TabPanel',
		'ARSnova.view.user.QuestionPanel'
	],

	launch: function () {
		/* (Re)join session on Socket.IO connect event */
		ARSnova.app.socket.addListener("arsnova/socket/connect", function () {
			var keyword = sessionStorage.getItem('keyword');

			if (keyword) {
				ARSnova.app.socket.setSession(keyword);
			}
		});
	},

	login: function (options) {
		console.debug("Controller: Sessions.login", options);
		if (options.keyword.length !== 8) {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.SESSION_ID_INVALID_LENGTH);
			return;
		}
		if (options.keyword.match(/[^0-9]/)) {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.SESSION_ID_INVALID);
			return;
		}
		/* do login stuff */
		var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_LOGIN);
		var res = ARSnova.app.sessionModel.checkSessionLogin(options.keyword, {
			success: function (obj) {
				// check if user is creator of this session
				if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
					ARSnova.app.isSessionOwner = true;
				} else {
					// check if session is open
					if (!obj.active) {
						Ext.Msg.alert(Messages.NOTIFICATION, Messages.SESSION_IS_CLOSED.replace(/###/, obj.name));
						sessionStorage.clear();
						return;
					}
					ARSnova.app.userRole = ARSnova.app.USER_ROLE_STUDENT;
					ARSnova.app.isSessionOwner = false;
				}

				// set local variables
				localStorage.setItem('sessionId', obj._id);
				localStorage.setItem('name', obj.name);
				localStorage.setItem('shortName', obj.shortName);
				localStorage.setItem('courseId', obj.courseId || "");
				localStorage.setItem('courseType', obj.courseType || "");
				localStorage.setItem('active', obj.active ? 1 : 0);
				localStorage.setItem('creationTime', obj.creationTime);

				sessionStorage.setItem('keyword', obj.keyword);
				sessionStorage.setItem('features', Ext.encode(obj.features));
				ARSnova.app.feedbackModel.lock = obj.feedbackLock;

				// initialize MathJax
				ARSnova.app.getController('MathJaxMarkdown').initializeMathJax();

				// deactivate several about tabs
				ARSnova.app.mainTabPanel.tabPanel.deactivateAboutTabs();
				ARSnova.app.socket.setSession(obj.keyword);

				// start task to update the feedback tab in tabBar
				ARSnova.app.feedbackModel.on("arsnova/session/feedback/count", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackBadge, ARSnova.app.mainTabPanel.tabPanel);
				ARSnova.app.feedbackModel.on("arsnova/session/feedback/average", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackIcon, ARSnova.app.mainTabPanel.tabPanel);
				ARSnova.app.taskManager.start(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);
				ARSnova.app.mainTabPanel.tabPanel.updateHomeBadge();

				ARSnova.app.getController('Sessions').reloadData(false, hideLoadMask);
			},
			notFound: function () {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.SESSION_NOT_FOUND);
				hideLoadMask();
			},
			forbidden: function () {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.SESSION_LOCKED);
				hideLoadMask();
			},
			failure: function () {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.CONNECTION_PROBLEM);
				hideLoadMask();
			}
		});
	},

	logout: function (prevFeatures) {
		ARSnova.app.socket.setSession(null);
		ARSnova.app.sessionModel.fireEvent(ARSnova.app.sessionModel.events.sessionLeave);

		ARSnova.app.loggedInModel.resetActiveUserCount();

		// stop task to update the feedback tab in tabBar
		ARSnova.app.feedbackModel.un("arsnova/session/feedback/count", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackBadge);
		ARSnova.app.feedbackModel.un("arsnova/session/feedback/average", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackIcon);
		// online counter badge
		ARSnova.app.taskManager.stop(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);

		sessionStorage.removeItem("keyword");
		sessionStorage.removeItem("features");
		sessionStorage.removeItem("answeredCanceledPiQuestions");

		localStorage.removeItem("sessionId");
		localStorage.removeItem("name");
		localStorage.removeItem("shortName");
		localStorage.removeItem("active");
		localStorage.removeItem("session");
		localStorage.removeItem("courseId");
		localStorage.removeItem("courseType");
		localStorage.removeItem("creationTime");
		ARSnova.app.isSessionOwner = false;

		/* show about tab panels */
		ARSnova.app.mainTabPanel.tabPanel.activateAboutTabs();
		ARSnova.app.sessionModel.isLearningProgessOptionsInitialized = false;

		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
		/* show home Panel */
		tabPanel.animateActiveItem(tabPanel.homeTabPanel, {
			type: 'slide',
			direction: 'right',
			duration: 700
		});

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			/* hide speaker tab panel and destroy listeners */
			tabPanel.speakerTabPanel.tab.hide();
			tabPanel.speakerTabPanel.inClassPanel.destroyListeners();

			/* hide feedback questions panel */
			tabPanel.feedbackQuestionsPanel.tab.hide();
		} else {
			/* hide user tab panel and destroy listeners */

			if (tabPanel.userTabPanel) {
				tabPanel.userTabPanel.tab.hide();
				tabPanel.userTabPanel.inClassPanel.destroyListeners();
			}

			if (tabPanel.userQuestionsPanel) {
				tabPanel.userQuestionsPanel.tab.hide();
			}

			if (localStorage.getItem('lastVisitedRole') === ARSnova.app.USER_ROLE_SPEAKER) {
				localStorage.setItem('role', ARSnova.app.USER_ROLE_SPEAKER);
				ARSnova.app.userRole = ARSnova.app.USER_ROLE_SPEAKER;
				localStorage.removeItem('lastVisitedRole');
			}
		}

		/* hide feedback statistic panel */
		tabPanel.feedbackTabPanel.tab.hide();
	},

	liveClickerSessionReload: function (prevFeatures) {
		var keyword = sessionStorage.getItem("keyword");
		Ext.toast('Session wird neu geladen...', 3000);
		ARSnova.app.getController('Sessions').logout(prevFeatures);
		ARSnova.app.getController('Sessions').login({keyword: keyword});
	},

	reloadData: function (animation, hideLoadMask) {
		var features = Ext.decode(sessionStorage.getItem("features"));
		hideLoadMask = hideLoadMask || Ext.emptyFn;

		animation = animation || {
			type: 'slide',
			duration: 700
		};

		if (features.liveClicker && ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER
			&& localStorage.getItem('lastVisitedRole') !== ARSnova.app.USER_ROLE_SPEAKER) {
			this.loadClickerSession(animation, hideLoadMask);
		} else {
			this.loadDefaultSession(animation, hideLoadMask);
		}
	},

	loadClickerSession: function (animation, hideLoadMask) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		/* add feedback statistic panel*/
		if (!tabPanel.feedbackTabPanel) {
			tabPanel.feedbackTabPanel = Ext.create('ARSnova.view.feedback.TabPanel');
			tabPanel.insert(3, tabPanel.feedbackTabPanel);
		} else {
			tabPanel.feedbackTabPanel.tab.show();
			tabPanel.feedbackTabPanel.renew();
		}

		if (tabPanel.userTabPanel) {
			tabPanel.userTabPanel.tab.hide();
		}

		if (tabPanel.userQuestionsPanel) {
			tabPanel.userQuestionsPanel.tab.hide();
		}

		if (ARSnova.app.feedbackModel.lock) {
			tabPanel.feedbackTabPanel.setActiveItem(tabPanel.feedbackTabPanel.statisticPanel);
		} else {
			tabPanel.feedbackTabPanel.setActiveItem(tabPanel.feedbackTabPanel.votePanel);
		}

		tabPanel.animateActiveItem(tabPanel.feedbackTabPanel, animation);
		ARSnova.app.getController('Feature').applyFeatures();
		ARSnova.app.sessionModel.sessionIsActive = true;
		hideLoadMask();
	},

	loadDefaultSession: function (animation, hideLoadMask) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		if (ARSnova.app.isSessionOwner && ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			ARSnova.app.sessionModel.fireEvent(ARSnova.app.sessionModel.events.sessionJoinAsSpeaker);
			/* add speaker in class panel */
			if (!tabPanel.speakerTabPanel) {
				tabPanel.speakerTabPanel = Ext.create('ARSnova.view.speaker.TabPanel');
				tabPanel.insert(1, tabPanel.speakerTabPanel);
			} else {
				tabPanel.speakerTabPanel.tab.show();
				tabPanel.speakerTabPanel.renew();
			}
			tabPanel.animateActiveItem(tabPanel.speakerTabPanel, animation);
			tabPanel.speakerTabPanel.inClassPanel.registerListeners();

			/* add feedback statistic panel*/
			if (!tabPanel.feedbackTabPanel) {
				tabPanel.feedbackTabPanel = Ext.create('ARSnova.view.feedback.TabPanel');
				tabPanel.insert(3, tabPanel.feedbackTabPanel);
			} else {
				tabPanel.feedbackTabPanel.tab.show();
				tabPanel.feedbackTabPanel.renew();
			}
		} else {
			ARSnova.app.sessionModel.fireEvent(ARSnova.app.sessionModel.events.sessionJoinAsStudent);
			/* add user in class panel */
			if (!tabPanel.userTabPanel) {
				tabPanel.userTabPanel = Ext.create('ARSnova.view.user.TabPanel');
				tabPanel.insert(0, tabPanel.userTabPanel);
			} else {
				tabPanel.userTabPanel.tab.show();
				tabPanel.userTabPanel.renew();
			}

			tabPanel.userTabPanel.inClassPanel.registerListeners();

			/* add skill questions panel*/
			if (!tabPanel.userQuestionsPanel) {
				tabPanel.userQuestionsPanel = Ext.create('ARSnova.view.user.QuestionPanel');
				tabPanel.insert(1, tabPanel.userQuestionsPanel);
			} else {
				tabPanel.userQuestionsPanel.tab.show();
			}

			/* add feedback statistic panel*/
			if (!tabPanel.feedbackTabPanel) {
				tabPanel.feedbackTabPanel = Ext.create('ARSnova.view.feedback.TabPanel');
				tabPanel.insert(2, tabPanel.feedbackTabPanel);
			} else {
				tabPanel.feedbackTabPanel.tab.show();
				tabPanel.feedbackTabPanel.renew();
			}

			tabPanel.animateActiveItem(tabPanel.userTabPanel, animation);
		}

		/* add feedback questions panel*/
		if (!tabPanel.feedbackQuestionsPanel) {
			tabPanel.feedbackQuestionsPanel = Ext.create('ARSnova.view.feedbackQuestions.TabPanel');

			if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				tabPanel.insert(2, tabPanel.feedbackQuestionsPanel);
			} else {
				tabPanel.insert(4, tabPanel.feedbackQuestionsPanel);
			}
		}
		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			tabPanel.feedbackQuestionsPanel.tab.show();
		} else {
			tabPanel.feedbackQuestionsPanel.tab.hide();
		}

		ARSnova.app.getController('Feature').applyFeatures();
		ARSnova.app.sessionModel.sessionIsActive = true;
		tabPanel.feedbackQuestionsPanel.questionsPanel.prepareQuestionList();

		hideLoadMask();
	},

	update: function (sessionInfo) {
		var session = ARSnova.app.sessionModel;
		session.setData(sessionInfo);

		session.validate();
		session.update({
			success: function (response) {
				var fullSession = Ext.decode(response.responseText);
				localStorage.setItem('sessionId', fullSession._id);
				localStorage.setItem('name', fullSession.name);
				localStorage.setItem('shortName', fullSession.shortName);
				localStorage.setItem('active', fullSession.active ? 1 : 0);
				localStorage.setItem('courseId', fullSession.courseId || "");
				localStorage.setItem('courseType', fullSession.courseType || "");
				localStorage.setItem('creationTime', fullSession.creationTime);
				localStorage.setItem('keyword', fullSession.keyword);
				ARSnova.app.isSessionOwner = true;
			},
			failure: function (response) {
				Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
			}
		});
	},

	loadFeatureOptions: function (options, sessionCreation) {
		var activePanel = ARSnova.app.mainTabPanel.tabPanel.getActiveItem();
		var useCasePanel = Ext.create('ARSnova.view.diagnosis.UseCasePanel', {
			options: options,
			sessionCreationMode: sessionCreation,
			inClassSessionEntry: !sessionCreation
		});

		activePanel.animateActiveItem(useCasePanel, 'slide');
	},

	validateSessionOptions: function (options) {
		var session = ARSnova.app.sessionModel;

		session.setData({
			type: 'session',
			name: options.name.trim(),
			shortName: options.shortName.trim(),
			creator: localStorage.getItem('login'),
			courseId: options.courseId,
			courseType: options.courseType,
			creationTime: Date.now(),
			ppAuthorName: options.ppAuthorName,
			ppAuthorMail: options.ppAuthorMail,
			ppUniversity: options.ppUniversity,
			ppLogo: options.ppLogo,
			ppSubject: options.ppSubject,
			ppLicense: options.ppLicense,
			ppDescription: options.ppDescription,
			ppFaculty: options.ppFaculty,
			ppLevel: options.ppLevel,
			sessionType: options.sessionType
		});
		session.set('_id', undefined);

		var validation = session.validate();
		if (!validation.isValid()) {
			Ext.Msg.alert('Hinweis', 'Bitte alle markierten Felder ausfüllen.');
			var panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.newSessionPanel;
			panel.down('fieldset').items.items.forEach(function (el) {
				if (el.xtype === 'textfield') {
					el.removeCls("required");
				}
			});
			validation.items.forEach(function (el) {
				panel.down('textfield[name=' + el.getField() + ']').addCls("required");
			});

			/* activate inputElements in newSessionPanel */
			if (options.lastPanel && typeof options.lastPanel.enableInputElements() === 'function') {
				options.lastPanel.enableInputElements();
			}
			return false;
		}

		return session;
	},

	create: function (options) {
		var session = this.validateSessionOptions(options);
		var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_SAVE, 10000);

		if (!session) {
			return;
		}

		session.create({
			success: function (response) {
				var fullSession = Ext.decode(response.responseText);
				var loginName = "";
				var loginMode = localStorage.getItem("loginMode");

				sessionStorage.setItem('keyword', fullSession.keyword);
				localStorage.setItem('sessionId', fullSession._id);

				ARSnova.app.getController('Auth').services.then(function (services) {
					services.forEach(function (service) {
						if (loginMode === service.id) {
							loginName = "guest" === service.id ? Messages.GUEST : service.name;
						}
					});

					var messageBox = Ext.create('Ext.MessageBox', {
						title: Messages.SESSION + ' ID: ' + fullSession.keyword,
						message: Messages.ON_SESSION_CREATION_1.replace(/###/, fullSession.keyword),
						cls: 'newSessionMessageBox',
						listeners: {
							show: hideLoadMask,
							hide: function () {
								ARSnova.app.getController('Sessions').login({keyword: fullSession.keyword});
								var panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;

								panel.setActiveItem(panel.mySessionsPanel);

								/* activate inputElements in newSessionPanel */
								if (options.lastPanel && typeof options.lastPanel.enableInputElements() === 'function') {
									options.lastPanel.enableInputElements();
								}
								this.destroy();
							}
						}
					});

					messageBox.setButtons([{
						text: Messages.CONTINUE,
						itemId: 'continue',
						ui: 'action',
						handler: function () {
							if (!this.readyToClose) {
								messageBox.setMessage('');
								messageBox.setTitle(Messages.SESSION + ' ID: ' + fullSession.keyword);
								messageBox.setHtml("<div class='x-msgbox-text x-layout-box-item' +" +
									" style='margin-top: -10px;'>" + Messages.ON_SESSION_CREATION_2.replace(/###/,
											loginName + "-Login " + "<div style='display: inline-block;'" +
											"class='text-icons login-icon-" + loginMode + "'></div> " +
											(loginMode === "guest" ? Messages.ON_THIS_DEVICE : "")) +
										".</div>");

								this.readyToClose = true;
							} else {
								messageBox.hide();
								if (messageBox.showFeatureError) {
									Ext.Msg.alert("", Messages.FEATURE_SETTINGS_COULD_NOT_BE_SAVED);
								}
							}
						}
					}]);

					if (options.features) {
						ARSnova.app.sessionModel.changeFeatures(sessionStorage.getItem("keyword"), options.features, {
							success: function () {
								messageBox.show();
							},
							failure: function () {
								messageBox.showFeatureError = true;
								messageBox.show();
							}
						});
					} else {
						messageBox.show();
					}
				});
			},
			failure: function (records, operation) {
				Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
				if (options.lastPanel && typeof options.lastPanel.enableInputElements() === 'function') {
					options.lastPanel.enableInputElements();
				}
			}
		});
	},

	changeRole: function () {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
		var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.CHANGE_ROLE + '...', 2000);

		var reloadSession = function (animationDirection, onAnimationEnd) {
			tabPanel.updateHomeBadge();
			ARSnova.app.socket.setSession(null);
			ARSnova.app.socket.setSession(sessionStorage.getItem('keyword'));
			onAnimationEnd = (typeof onAnimationEnd === 'function') ?
				onAnimationEnd : hideLoadMask;

			ARSnova.app.getController('Sessions').reloadData({
				listeners: {animationend: onAnimationEnd},
				direction: animationDirection,
				type: 'flip'
			});
		};

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			localStorage.setItem('lastVisitedRole', ARSnova.app.USER_ROLE_SPEAKER);
			localStorage.setItem('role', ARSnova.app.USER_ROLE_STUDENT);
			ARSnova.app.userRole = ARSnova.app.USER_ROLE_STUDENT;

			/* hide speaker tab panel and destroy listeners */
			tabPanel.speakerTabPanel.tab.hide();
			tabPanel.speakerTabPanel.inClassPanel.destroyListeners();
			reloadSession('right');
		} else {
			if (localStorage.getItem('lastVisitedRole') === ARSnova.app.USER_ROLE_SPEAKER) {
				localStorage.setItem('role', ARSnova.app.USER_ROLE_SPEAKER);
				ARSnova.app.userRole = ARSnova.app.USER_ROLE_SPEAKER;
				localStorage.removeItem('lastVisitedRole');

				/* hide user tab panels and destroy listeners */
				tabPanel.userTabPanel.tab.hide();
				tabPanel.userQuestionsPanel.tab.hide();
				tabPanel.userTabPanel.inClassPanel.destroyListeners();

				reloadSession('left', function () {
					/* remove user tab panel and user questions panel*/
					tabPanel.remove(tabPanel.userQuestionsPanel);
					tabPanel.remove(tabPanel.userTabPanel);
					delete tabPanel.userQuestionsPanel;
					delete tabPanel.userTabPanel;
					hideLoadMask();
				});
			}
		}
	},

	checkExistingSessionLogin: function () {
		if (localStorage.getItem('lastVisitedRole') === ARSnova.app.USER_ROLE_SPEAKER) {
			localStorage.setItem('role', ARSnova.app.USER_ROLE_SPEAKER);
			ARSnova.app.userRole = ARSnova.app.USER_ROLE_SPEAKER;
			localStorage.removeItem('lastVisitedRole');
		}

		if (sessionStorage.getItem("keyword")) {
			return true;
		}

		return false;
	},

	setActive: function (options) {
		ARSnova.app.sessionModel.lock(sessionStorage.getItem("keyword"), options.active, {
			success: function () {
				var sessionStatus = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.inClassActions.sessionStatusButton;

				if (options.active) {
					sessionStatus.sessionOpenedSuccessfully();
				} else {
					sessionStatus.sessionClosedSuccessfully();
				}
			},
			failure: function (records, operation) {
				Ext.Msg.alert("Hinweis!", "Session speichern war nicht erfolgreich");
			}
		});
	},

	setLearningProgressOptions: function (options) {
		ARSnova.app.sessionModel.setLearningProgressOptions(options);
	},

	getLearningProgressOptions: function () {
		return ARSnova.app.sessionModel.getLearningProgress();
	},

	getCourseLearningProgress: function (options) {
		ARSnova.app.sessionModel.getCourseLearningProgressWithOptions(
			sessionStorage.getItem("keyword"),
			options.progress,
			options.callbacks
		);
	},

	getMyLearningProgress: function (options) {
		ARSnova.app.sessionModel.getMyLearningProgressWithOptions(
			sessionStorage.getItem("keyword"),
			options.progress,
			options.callbacks
		);
	}
});
