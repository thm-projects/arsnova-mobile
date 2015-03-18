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
		var res = ARSnova.app.sessionModel.checkSessionLogin(options.keyword, {
			success: function (obj) {
				// check if user is creator of this session
				if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
					ARSnova.app.isSessionOwner = true;
				} else {
					// check if session is open
					if (!obj.active) {
						Ext.Msg.alert("Hinweis", "Die Session \"" + obj.name + "\Ã¢â‚¬ï¿½ ist momentan geschlossen.");
						return;
					}
					ARSnova.app.userRole = ARSnova.app.USER_ROLE_STUDENT;
					ARSnova.app.isSessionOwner = false;
				}

				// set local variables
				localStorage.setItem('sessionId', obj._id);
				localStorage.setItem('name', obj.name);
				localStorage.setItem('shortName', obj.shortName);
				localStorage.setItem('ppAuthorName', obj.ppAuthorName);
				localStorage.setItem('ppAuthorMail', obj.ppAuthorMail);
				localStorage.setItem('ppUniversity', obj.ppUniversity);
				localStorage.setItem('ppFaculty', obj.ppFaculty);
				localStorage.setItem('ppLicense', obj.ppLicense);
				localStorage.setItem('courseId', obj.courseId === null ? "" : obj.courseId);
				localStorage.setItem('courseType', obj.courseType === null ? "" : obj.courseType);
				localStorage.setItem('active', obj.active ? 1 : 0);
				localStorage.setItem('creationTime', obj.creationTime);

				sessionStorage.setItem('keyword', obj.keyword);

				// initialize MathJax
				ARSnova.app.getController('Application').initializeMathJax();

				// deactivate several about tabs
				ARSnova.app.mainTabPanel.tabPanel.deactivateAboutTabs();

				ARSnova.app.socket.setSession(obj.keyword);

				// start task to update the feedback tab in tabBar
				ARSnova.app.feedbackModel.on("arsnova/session/feedback/count", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackBadge, ARSnova.app.mainTabPanel.tabPanel);
				ARSnova.app.feedbackModel.on("arsnova/session/feedback/average", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackIcon, ARSnova.app.mainTabPanel.tabPanel);
				ARSnova.app.taskManager.start(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);
				ARSnova.app.mainTabPanel.tabPanel.updateHomeBadge();

				ARSnova.app.getController('Sessions').reloadData();
			},
			notFound: function () {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.SESSION_NOT_FOUND);
			},
			forbidden: function () {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.SESSION_LOCKED);
			},
			failure: function () {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.CONNECTION_PROBLEM);
			}
		});
	},

	logout: function () {
		ARSnova.app.socket.setSession(null);

		ARSnova.app.loggedInModel.resetActiveUserCount();

		// stop task to update the feedback tab in tabBar
		ARSnova.app.feedbackModel.un("arsnova/session/feedback/count", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackBadge);
		ARSnova.app.feedbackModel.un("arsnova/session/feedback/average", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackIcon);
		// online counter badge
		ARSnova.app.taskManager.stop(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);

		sessionStorage.removeItem("keyword");

		localStorage.removeItem("sessionId");
		localStorage.removeItem("name");
		localStorage.removeItem("shortName");
		localStorage.removeItem("ppAuthorName");
		localStorage.removeItem("ppAuthorMail");
		localStorage.removeItem("ppUniversity");
		localStorage.removeItem("ppFaculty");
		localStorage.removeItem("ppLicense");
		localStorage.removeItem("active");
		localStorage.removeItem("session");
		localStorage.removeItem("courseId");
		localStorage.removeItem("courseType");
		localStorage.removeItem("creationTime");
		ARSnova.app.isSessionOwner = false;

		/* show about tab panels */
		ARSnova.app.mainTabPanel.tabPanel.activateAboutTabs();

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

			/* refresh mySessionsPanel */
			tabPanel.homeTabPanel.mySessionsPanel.loadCreatedSessions();
		} else {
			/* hide user tab panel and destroy listeners */
			tabPanel.userQuestionsPanel.tab.hide();
			tabPanel.userTabPanel.tab.hide();
			tabPanel.userTabPanel.inClassPanel.destroyListeners();

			if (localStorage.getItem('lastVisitedRole') === ARSnova.app.USER_ROLE_SPEAKER) {
				localStorage.setItem('role', ARSnova.app.USER_ROLE_SPEAKER);
				ARSnova.app.userRole = ARSnova.app.USER_ROLE_SPEAKER;

				/* refresh mySessionsPanel */
				tabPanel.homeTabPanel.mySessionsPanel.loadCreatedSessions();
				localStorage.removeItem('lastVisitedRole');
			}
		}

		/* hide feedback statistic panel */
		tabPanel.feedbackTabPanel.tab.hide();
	},

	reloadData: function () {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
		var hideLoadMask = Ext.emptyFn;

		if (ARSnova.app.isSessionOwner && ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			/* add speaker in class panel */
			if (!tabPanel.speakerTabPanel) {
				tabPanel.speakerTabPanel = Ext.create('ARSnova.view.speaker.TabPanel');
				tabPanel.insert(1, tabPanel.speakerTabPanel);
			} else {
				hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_LOGIN, 3000);
				tabPanel.speakerTabPanel.tab.show();
				tabPanel.speakerTabPanel.renew();
			}
			tabPanel.animateActiveItem(tabPanel.speakerTabPanel, {
				type: 'slide',
				duration: 700
			});
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
				tabPanel.userQuestionsPanel.renew();
			}

			/* add feedback statistic panel*/
			if (!tabPanel.feedbackTabPanel) {
				tabPanel.feedbackTabPanel = Ext.create('ARSnova.view.feedback.TabPanel');
				tabPanel.insert(2, tabPanel.feedbackTabPanel);
			} else {
				tabPanel.feedbackTabPanel.tab.show();
				tabPanel.feedbackTabPanel.renew();
			}

			tabPanel.animateActiveItem(tabPanel.userTabPanel, {
				type: 'slide',
				duration: 700
			});
		}

		/* add feedback questions panel*/
		if (!tabPanel.feedbackQuestionsPanel) {
			tabPanel.feedbackQuestionsPanel = Ext.create('ARSnova.view.feedbackQuestions.TabPanel');
		}
		if (!tabPanel.userTabPanel) {
			tabPanel.insert(2, tabPanel.feedbackQuestionsPanel);
			tabPanel.feedbackQuestionsPanel.tab.show();
		} else {
			tabPanel.insert(4, tabPanel.feedbackQuestionsPanel);
			tabPanel.feedbackQuestionsPanel.tab.hide();
		}

		ARSnova.app.sessionModel.sessionIsActive = true;

		hideLoadMask();
	},

	create: function (options) {
		var session = Ext.create('ARSnova.model.Session', {
			type: 'session',
			name: options.name,
			shortName: options.shortName,
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
			Ext.Msg.alert('Hinweis', 'Bitte alle markierten Felder ausfÃƒÂ¼llen.');
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
			options.newSessionPanel.enableInputElements();

			return;
		}

		session.create({
			success: function (response) {
				var fullSession = Ext.decode(response.responseText);
				localStorage.setItem('sessionId', fullSession._id);
				localStorage.setItem('name', fullSession.name);
				localStorage.setItem('shortName', fullSession.shortName);
				localStorage.setItem('ppAuthorName', fullSession.ppAuthorName);
				localStorage.setItem('ppAuthorMail', fullSession.ppAuthorMail);
				localStorage.setItem('ppUniversity', fullSession.ppUniversity);
				localStorage.setItem('ppFaculty', fullSession.ppFaculty);
				localStorage.setItem('ppLicense', fullSession.ppLicense);
				localStorage.setItem('active', fullSession.active ? 1 : 0);
				localStorage.setItem('courseId', fullSession.courseId === null ? "" : fullSession.courseId);
				localStorage.setItem('courseType', fullSession.courseType === null ? "" : fullSession.courseType);
				localStorage.setItem('creationTime', fullSession.creationTime);
				ARSnova.app.isSessionOwner = true;

				sessionStorage.setItem('keyword', fullSession.keyword);

				// start task to update the feedback tab in tabBar
				ARSnova.app.feedbackModel.on("arsnova/session/feedback/count", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackBadge, ARSnova.app.mainTabPanel.tabPanel);
				ARSnova.app.feedbackModel.on("arsnova/session/feedback/average", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackIcon, ARSnova.app.mainTabPanel.tabPanel);
				ARSnova.app.taskManager.start(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);

				/* deactivate several tab panels */
				ARSnova.app.mainTabPanel.tabPanel.deactivateAboutTabs();

				var loginName = "";
				var loginMode = localStorage.getItem("loginMode");
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
							hide: function () {
								ARSnova.app.getController('Sessions').reloadData();
								var panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;

								panel.setActiveItem(panel.mySessionsPanel);

								/* activate inputElements in newSessionPanel */
								options.newSessionPanel.enableInputElements();

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
							}
						}
					}]);

					messageBox.show();
				});
			},
			failure: function (records, operation) {
				Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
				options.newSessionPanel.enableInputElements();
			}
		});
	},

	setActive: function (options) {
		ARSnova.app.sessionModel.lock(sessionStorage.getItem("keyword"), options.active, {
			success: function () {
				var sessionStatus = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.sessionStatusButton;

				if (options.active === 1) {
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

	setLearningProgressType: function (options) {
		if (this.getLearningProgressType() !== options.progressType) {
			ARSnova.app.sessionModel.setLearningProgressType(sessionStorage.getItem("keyword"), options.progressType);
		}
	},

	getLearningProgressType: function () {
		return ARSnova.app.sessionModel.getLearningProgress();
	},

	getCourseLearningProgressByType: function (options) {
		ARSnova.app.sessionModel.getCourseLearningProgressByType(sessionStorage.getItem("keyword"), options.progressType, options.callbacks);
	}
});