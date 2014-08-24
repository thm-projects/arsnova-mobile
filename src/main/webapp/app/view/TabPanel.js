/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/TabPanel.js
 - Beschreibung: Das TabPanel für ARSnova.
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
Ext.define('ARSnova.view.TabPanel', {
	extend: 'Ext.tab.Panel',

	requires: [
		'ARSnova.view.LoginPanel',
		'ARSnova.view.RolePanel',
		'ARSnova.view.home.TabPanel',
		'ARSnova.view.diagnosis.TabPanel',
		'ARSnova.view.about.TabPanel'
	],

	config: {
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},

		tabBar: {
			layout: {
				pack: 'center'
			}
		},

		tabBarPosition: 'bottom',

		/**
		 * task for everyone in a session
		 * displays the number of online users
		 */
		updateHomeTask: {
			name: 'update the home badge in tabbar',
			run: function() {
				ARSnova.app.mainTabPanel.tabPanel.updateHomeBadge();
			},
			interval: 15000 // 15 seconds
		}
	},

	/* items */
	settingsPanel	: null,

	/* panels will be created in  sessions/reloadData */
	userQuizPanel		: null,
	feedbackTabPanel	: null,

	initialize: function() {
		this.callParent(arguments);

		this.loginPanel		= Ext.create('ARSnova.view.LoginPanel');
		this.rolePanel		= Ext.create('ARSnova.view.RolePanel');
		this.homeTabPanel	= Ext.create('ARSnova.view.home.TabPanel');
		this.diagnosisPanel	= Ext.create('ARSnova.view.diagnosis.TabPanel');
		this.infoTabPanel	= Ext.create('ARSnova.view.about.TabPanel');

		this.add([
			this.rolePanel,
			this.loginPanel,
			this.homeTabPanel,
			this.diagnosisPanel,
			this.infoTabPanel
		]);

		this.on('activeitemchange', function(panel, newCard, oldCard){
			ARSnova.app.lastActivePanel = oldCard;
			if (newCard === this.infoTabPanel) {
				// The "Info" panel is just a stub button that opens the ARSnova manual
				ARSnova.app.mainTabPanel.tabPanel.setActiveItem(ARSnova.app.lastActivePanel);
				return false;
			}
		}, this);

		this.on('initialize', function(){
			this.rolePanel.tab.hide();
			this.loginPanel.tab.hide();
			this.homeTabPanel.tab.hide();
			this.diagnosisPanel.tab.hide();
		});
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
	},

	/*
	 * override method to be sure that cardswitch-animation has correct animation direction and duration
	 */
	setActiveItem: function(card, animation){
		this.callParent(arguments);

		this.getTabBar().activeTab = card.tab; //for correct animation direction

		if (typeof(animation) == 'object')
			animation.duration = ARSnova.app.cardSwitchDuration;
		else {
			animation = {
				type: animation,
				direction: 'left',
				duration: ARSnova.app.cardSwitchDuration
			};
		}
	},

	onActivate: function(){
		if (ARSnova.app.checkSessionLogin()) {
			/* only start task if user/speaker is not(!) on feedbackTabPanel/statisticPanel (feedback chart)
			 * because there is a own function which will check for new feedbacks and update the tab bar icon */
			if(ARSnova.app.mainTabPanel.tabPanel._activeItem != ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel) {
				ARSnova.app.feedbackModel.on("arsnova/session/feedback/average", this.updateFeedbackIcon, this);
				ARSnova.app.feedbackModel.on("arsnova/session/feedback/count", this.updateFeedbackBadge, this);
			}
			taskManager.start(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);
		}
	},

	onDeactivate: function(){
		if(ARSnova.app.checkSessionLogin()){
			if(ARSnova.app.mainTabPanel.tabPanel._activeItem != ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel) {
				ARSnova.app.feedbackModel.un("arsnova/session/feedback/average", this.updateFeedbackIcon);
				ARSnova.app.feedbackModel.un("arsnova/session/feedback/count", this.updateFeedbackBadge);
			}
			taskManager.stop(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);
		}
	},

	updateFeedbackIcon: function(averageFeedback) {
		var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;

		switch (averageFeedback) {
			/* 0: faster, please!; 1: can follow; 2: to fast!; 3: you have lost me */
			case 0:
				panel.tab.setIconCls("feedbackMedium");
				break;
			case 1:
				panel.tab.setIconCls("feedbackGood");
				break;
			case 2:
				panel.tab.setIconCls("feedbackBad");
				break;
			case 3:
				panel.tab.setIconCls("feedbackNone");
				break;
			default:
				break;
		}
	},

	updateFeedbackBadge: function(feedbackCount) {
		if (feedbackCount > 0) {
			ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.tab.setBadgeText(feedbackCount);
		}
	},

	updateHomeBadge: function() {
		var count = ARSnova.app.loggedInModel.countActiveUsersBySession();
		var speaker = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var student = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;

		if (count > 0) {
			speaker && speaker.tab.setBadgeText(count-1); // Do not count the speaker itself
			student && student.tab.setBadgeText(count); // Students will see all online users
		}
	}
});
