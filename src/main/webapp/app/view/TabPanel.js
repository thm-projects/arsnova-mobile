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
	
	config: {
		fullscreen: true,
		scroll: false,
		
		tabBar: {
			layout: {
				pack: 'center'
			}
		},
		
		tabBarPosition: 'bottom',
		
		/**
		 * task for everyone in a session
		 * count every 15 seconds the session feedback and adapt the icon
		 * 
		 */
		updateFeedbackTask: {
			name: 'update the feedback icon and badge in tabbar',
			run: function(){
				ARSnova.app.mainTabPanel.tabPanel.updateFeedbackBadge();
				ARSnova.app.mainTabPanel.tabPanel.updateFeedbackIcon();
			},
			interval: 15000 // 15 seconds
		},
		
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
	settingsPanel 	: null,
	canteenTabPanel : null,
	
	/* panels will be created in  sessions/reloadData */
	userQuizPanel	  	: null,
	feedbackTabPanel	: null,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.loginPanel		= Ext.create('ARSnova.view.LoginPanel');
		this.rolePanel 		= Ext.create('ARSnova.view.RolePanel');
		this.homeTabPanel 	= Ext.create('ARSnova.view.home.TabPanel');
		this.canteenTabPanel= Ext.create('ARSnova.view.canteen.TabPanel');
		this.infoTabPanel 	= Ext.create('ARSnova.view.about.TabPanel');
		this.helpMainPanel  = Ext.create('ARSnova.view.about.HelpMainPanel', { standalone : true});
		
		this.add([
			this.rolePanel,
			this.loginPanel,
			this.homeTabPanel,
			this.canteenTabPanel,
			this.infoTabPanel,
			this.helpMainPanel
		]);
		
		this.on('activeitemchange', function(panel, newCard, oldCard){
			ARSnova.app.lastActivePanel = oldCard;
			if(newCard === panel.homeTabPanel) {
				panel.homeTabPanel.tab.show();
				panel.canteenTabPanel.tab.show();
			} else if(newCard === panel.rolePanel || newCard === panel.loginPanel) {
				panel.homeTabPanel.tab.hide();
				panel.canteenTabPanel.tab.hide();
			}
		});
		
		this.on('initialize', function(){
			this.rolePanel.tab.hide();
			this.loginPanel.tab.hide();
			this.homeTabPanel.tab.hide();
			this.canteenTabPanel.tab.hide();
			this.helpMainPanel.tab.hide();
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
			if(ARSnova.app.mainTabPanel.tabPanel.layout.activeItem != ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel) {
				taskManager.start(ARSnova.app.mainTabPanel.tabPanel.updateFeedbackTask);
			}
			taskManager.start(ARSnova.app.mainTabPanel.tabPanel.updateHomeTask);
		}
	},

	onDeactivate: function(){
		if(ARSnova.app.checkSessionLogin()){
			if(ARSnova.app.mainTabPanel.tabPanel.layout.activeItem != ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel) {
				taskManager.stop(ARSnova.app.mainTabPanel.tabPanel.updateFeedbackTask);
			}
			taskManager.stop(ARSnova.app.mainTabPanel.tabPanel.updateHomeTask);
		}
	},
	
	updateFeedbackIcon: function(){
		ARSnova.app.feedbackModel.getAverageSessionFeedback(localStorage.getItem("keyword"), {
			success: function(response){
				var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
				var value = parseInt(response.responseText);
				
				switch (value) {
					/* 0: faster, please!; 1: can follow; 2: to fast!; 3: you have lost me */
					case 0:
						panel.tab.setIconClass("feedbackMedium");
						break;
					case 1:
						panel.tab.setIconClass("feedbackGood");
						break;
					case 2:
						panel.tab.setIconClass("feedbackBad");
						break;
					case 3:
						panel.tab.setIconClass("feedbackNone");
						break;	
					default:
						break;
				}
			}, 
			failure: function(){
				console.log('server-side error');
				var tab = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.tab;
				tab.setIconClass("feedbackARSnova");
			}
		});
	},
	
	updateFeedbackBadge: function(){
		ARSnova.app.feedbackModel.countFeedback(localStorage.getItem("keyword"), {
			success: function(response){
				var value = parseInt(Ext.decode(response.responseText));
				if (value > 0) {
					ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.tab.setBadgeText(value);
				}
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	},
	
	updateHomeBadge: function() {
		ARSnova.app.loggedInModel.countActiveUsersBySession(localStorage.getItem("keyword"), {
			success: function(response){
				var speaker = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				var student = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;
				
				var value = parseInt(response.responseText);
				if (value > 0) {
					speaker && speaker.tab.setBadgeText(value-1); // Do not count the speaker itself
					student && student.tab.setBadgeText(value); // Students will see all online users
				}
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	}
});