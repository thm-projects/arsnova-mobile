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
Ext.define('ARSnova.view.TabPanel', {
	extend : 'Ext.tab.Panel',

	requires : [
		'ARSnova.view.LoginPanel',
		'ARSnova.view.RolePanel',
		'ARSnova.view.home.TabPanel',
		'ARSnova.view.diagnosis.TabPanel',
		'ARSnova.view.about.BlogTabPanel',
		'ARSnova.view.about.AboutTabPanel',
		'ARSnova.view.about.ImprintTabPanel',
		'ARSnova.view.about.PrivacyTabPanel',
		'ARSnova.view.about.AboutUniTabPanel'
	],

	config : {
		fullscreen : true,
		scrollable : {
			direction : 'vertical',
			directionLock : true
		},

		tabBar : {
			layout : {
				pack : 'center'
			}
		},

		tabBarPosition : 'bottom',

		/**
		 * task for everyone in a session
		 * displays the number of online users
		 */
		updateHomeTask : {
			name : 'update the home badge in tabbar',
			run : function () {
				ARSnova.app.mainTabPanel.tabPanel.updateHomeBadge();
			},
			interval : 15000 // 15 seconds
		}
	},

	/* items */
	settingsPanel : null,

	/* panels will be created in  sessions/reloadData */
	userQuizPanel : null,
	feedbackTabPanel : null,

	initialize : function () {
		this.callParent(arguments);

		this.loginPanel = Ext.create('ARSnova.view.LoginPanel');
		this.rolePanel = Ext.create('ARSnova.view.RolePanel');
		this.homeTabPanel = Ext.create('ARSnova.view.home.TabPanel');
		this.diagnosisPanel = Ext.create('ARSnova.view.diagnosis.TabPanel');
		this.infoTabPanel = Ext.create('ARSnova.view.about.AboutTabPanel');
		this.blogTabPanel = Ext.create('ARSnova.view.about.BlogTabPanel');
		this.privacyTabPanel = Ext.create('ARSnova.view.about.PrivacyTabPanel');
		this.imprintTabPanel = Ext.create('ARSnova.view.about.ImprintTabPanel');
		this.aboutUniTabPanel = Ext.create('ARSnova.view.about.AboutUniTabPanel');

		this.add([
				this.rolePanel,
				this.loginPanel,
				this.homeTabPanel,
				this.diagnosisPanel,
				this.infoTabPanel,
				this.blogTabPanel,
				this.privacyTabPanel,
				this.imprintTabPanel,
				this.aboutUniTabPanel
			]);

		this.on('activeitemchange', function (panel, newCard, oldCard) {
			ARSnova.app.innerScrollPanel = false;
			ARSnova.app.lastActivePanel = oldCard;

			this.setWindowTitle(newCard);

			switch (oldCard) {
			case this.infoTabPanel:
			case this.privacyTabPanel:
			case this.imprintTabPanel:
			case this.diagnosisPanel:
			case this.blogTabPanel:
			case this.testTabPanel:
			case ARSnova.app.getController('Application').embeddedPage:
				break;

			default:
				ARSnova.app.lastActiveMainTabPanel = oldCard;
			}

			if (newCard === this.rolePanel) {
				this.blogTabPanel.tab.show();
			} else {
				this.blogTabPanel.tab.hide();
			}

			if (ARSnova.app.lastActiveMainTabPanel === this.rolePanel) {
				if (newCard === this.infoTabPanel ||
					newCard === this.privacyTabPanel ||
					newCard === this.imprintTabPanel ||
					newCard === this.blogTabPanel) {
					this.blogTabPanel.tab.show();
					this.infoTabPanel.setHtml("<div class='gravure'>" + Messages.HELP_ROLEPANEL + "</div>");
				}
			}
			if (ARSnova.app.lastActiveMainTabPanel === this.homeTabPanel) {
				if (newCard === this.infoTabPanel) {
					this.infoTabPanel.setHtml("<div class='gravure'>" + Messages.HELP_HOMETABPANEL + "</div>");
				}
			}
			if (ARSnova.app.lastActiveMainTabPanel === this.loginPanel) {
				if (newCard === this.infoTabPanel) {
					this.infoTabPanel.setHtml("<div class='gravure'>" + Messages.HELP_LOGINPANEL + "</div>");
				}
			}
		}, this);

		this.on('initialize', function () {
			this.rolePanel.tab.hide();
			this.loginPanel.tab.hide();
			this.aboutUniTabPanel.tab.hide();
			this.homeTabPanel.tab.hide();
			this.diagnosisPanel.tab.hide();
		});
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
	},

	/*
	 * override method to be sure that cardswitch-animation has correct animation direction and duration
	 */
	setActiveItem : function (card, animation) {
		this.callParent(arguments);

		this.getTabBar().activeTab = card.tab; // for correct animation direction

		if (typeof(animation) === 'object') {
			animation.duration = ARSnova.app.cardSwitchDuration;
		} else {
			animation = {
				type : animation,
				direction : 'left',
				duration : ARSnova.app.cardSwitchDuration
			};
		}
	},

	setWindowTitle : function (newCard) {
		switch (newCard) {
		case this.loginPanel:
			ARSnova.app.setWindowTitle(' - ' + Messages.LOGIN);
			break;
		case this.aboutUniTabPanel:
			ARSnova.app.setWindowTitle(' - ' + Messages.ABOUT);
			break;
		case this.diagnosisPanel:
			ARSnova.app.setWindowTitle(' - ' + Messages.DIAGNOSIS);
			break;
		case this.infoTabPanel:
			ARSnova.app.setWindowTitle(' - ' + Messages.HELP);
			break;
		case this.feedbackTabPanel:
			ARSnova.app.setWindowTitle(' - ' + Messages.FEEDBACK);
			break;
		case this.userQuestionsPanel:
			ARSnova.app.setWindowTitle(' - ' + Messages.LECTURE_QUESTIONS_LONG);
			break;
		case this.feedbackQuestionsPanel:
			ARSnova.app.setWindowTitle(' - ' + Messages.QUESTIONS_FROM_STUDENTS);
			break;
		case this.rolePanel:
			ARSnova.app.setWindowTitle();
			break;
		default:
			ARSnova.app.setWindowTitle(' - ' + Messages.HOME);
		}
	},

	onActivate : function () {
		if (ARSnova.app.checkSessionLogin()) {
			/* only start task if user/speaker is not(!) on feedbackTabPanel/statisticPanel (feedback chart)
			 * because there is a own function which will check for new feedbacks and update the tab bar icon */
			if (ARSnova.app.mainTabPanel.tabPanel._activeItem !== ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel) {
				ARSnova.app.feedbackModel.on("arsnova/session/feedback/average", this.updateFeedbackIcon, this);
				ARSnova.app.feedbackModel.on("arsnova/session/feedback/count", this.updateFeedbackBadge, this);
			}
			ARSnova.app.taskManager.start(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);
		}
	},

	onDeactivate : function () {
		if (ARSnova.app.checkSessionLogin()) {
			if (ARSnova.app.mainTabPanel.tabPanel._activeItem !== ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel) {
				ARSnova.app.feedbackModel.un("arsnova/session/feedback/average", this.updateFeedbackIcon);
				ARSnova.app.feedbackModel.un("arsnova/session/feedback/count", this.updateFeedbackBadge);
			}
			ARSnova.app.taskManager.stop(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);
		}
	},

	activateAboutTabs : function () {
		this.privacyTabPanel.tab.show();
		this.imprintTabPanel.tab.show();
		this.blogTabPanel.tab.show();
	},

	deactivateAboutTabs : function () {
		this.privacyTabPanel.tab.hide();
		this.imprintTabPanel.tab.hide();
		this.blogTabPanel.tab.hide();
		this.infoTabPanel.tab.show();
	},

	addClassToTab : function (addCls, panel) {
		var tabbar = this.getTabBar().element,
		selectCls = '.' + panel.getIconCls();

		tabbar.select(selectCls).addCls(addCls);
	},

	removeClassFromTab : function (removeCls, panel) {
		var tabbar = this.getTabBar().element,
		selectCls = '.' + panel.getIconCls();

		tabbar.select(selectCls).removeCls(removeCls);
	},

	updateFeedbackIcon : function (averageFeedback) {
		var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;

		switch (averageFeedback) {
			/* 0: faster, please!; 1: can follow; 2: to fast!; 3: you have lost me */
		case 0:
			panel.tab.setIconCls("voteIcons icon-wink");
			break;
		case 1:
			panel.tab.setIconCls("voteIcons icon-happy");
			break;
		case 2:
			panel.tab.setIconCls("voteIcons icon-shocked");
			break;
		case 3:
			panel.tab.setIconCls("voteIcons icon-sad");
			break;
		default:
			break;
		}
	},

	updateFeedbackBadge : function (feedbackCount) {
		if (feedbackCount > 0) {
			ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.tab.setBadgeText(feedbackCount);
		}
	},

	updateHomeBadge : function () {
		var count = ARSnova.app.loggedInModel.countActiveUsersBySession();
		var speaker = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var student = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;

		if (count > 0) {
			if (speaker) {
				// Do not count the speaker itself
				speaker.tab.setBadgeText(count - 1);
			}
			if (student) {
				// Students will see all online users
				student.tab.setBadgeText(count);
			}
		}
	}
});
