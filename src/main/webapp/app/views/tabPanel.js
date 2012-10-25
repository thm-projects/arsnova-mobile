/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/tabPanel.js
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
ARSnova.views.TabPanel = Ext.extend(Ext.TabPanel, {
	fullscreen: true,
    tabBar: {
    	dock: 'bottom',
	    layout: {
	    	pack: 'center'
	    },
    },
	scroll: false,
	
    /* items */
	homeTabPanel 	: null,
    settingsPanel 	: null,
    canteenTabPanel : null,

    /* panels will be created in  sessions/reloadData */
    userQuizPanel	  	: null,
    feedbackTabPanel	: null,
    
    /**
     * task for everyone in a session
	 * count every 15 seconds the session feedback and adapt the icon
	 * 
	 */
	updateFeedbackTask: {
		name: 'update the feedback icon and badge in tabbar',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.updateFeedbackBadge();
			ARSnova.mainTabPanel.tabPanel.updateFeedbackIcon();
		},
		interval: 15000, //15 seconds
	},
	
	constructor: function(){
		this.loginPanel		= new ARSnova.views.LoginPanel();
		this.rolePanel 		= new ARSnova.views.RolePanel();
		this.homeTabPanel 	= new ARSnova.views.home.TabPanel();
		this.canteenTabPanel= new ARSnova.views.canteen.TabPanel();
		this.infoTabPanel 	= new ARSnova.views.about.TabPanel();
		this.helpMainPanel = new ARSnova.views.about.HelpMainPanel(true);
		
		this.items = [
			this.rolePanel,
			this.loginPanel,
			this.homeTabPanel,
			this.canteenTabPanel,
			this.infoTabPanel,
			this.helpMainPanel,
		],
		
		ARSnova.views.TabPanel.superclass.constructor.call(this);
	},
	
	/*
	 * override method to be sure that cardswitch-animation has correct animation direction and duration
	 */
	setActiveItem: function(card, animation){
		this.tabBar.activeTab = card.tab; //for correct animation direction
		
		if (typeof(animation) == 'object')
			animation.duration = ARSnova.cardSwitchDuration;
		else {
			animation = {
				type: animation,
				direction: 'left',
				duration: ARSnova.cardSwitchDuration,
			};
		}
		ARSnova.views.TabPanel.superclass.setActiveItem.apply(this, arguments);
	},
	
	initComponent: function(){
		this.on('beforecardswitch', function(panel, newCard, oldCard){
			ARSnova.lastActivePanel = oldCard;
			if(newCard === panel.homeTabPanel) {
				panel.homeTabPanel.tab.show();
				panel.canteenTabPanel.tab.show();
			} else if(newCard === panel.rolePanel || newCard === panel.loginPanel) {
				panel.homeTabPanel.tab.hide();
				panel.canteenTabPanel.tab.hide();
			}
		});
		
		this.on('render', function(){
			this.rolePanel.tab.hide();
			this.loginPanel.tab.hide();
			this.homeTabPanel.tab.hide();
			this.canteenTabPanel.tab.hide();
			this.helpMainPanel.tab.hide();
		});
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
		
		ARSnova.views.TabPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function(){
		if(ARSnova.checkSessionLogin()){
			/* only start task if user/speaker is not(!) on feedbackTabPanel/statisticPanel (feedback chart)
			 * because there is a own function which will check for new feedbacks and update the tab bar icon */
			if(ARSnova.mainTabPanel.tabPanel.layout.activeItem != ARSnova.mainTabPanel.tabPanel.feedbackTabPanel)
				taskManager.start(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
		}
	},

	onDeactivate: function(){
		if(ARSnova.checkSessionLogin()){
			if(ARSnova.mainTabPanel.tabPanel.layout.activeItem != ARSnova.mainTabPanel.tabPanel.feedbackTabPanel)
				taskManager.stop(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
		}
	},
	
	updateFeedbackIcon: function(){
		ARSnova.feedbackModel.getAverageSessionFeedback(localStorage.getItem("keyword"), {
			success: function(response){
				var panel = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
				var value = parseInt(response.responseText);
				
				if (value > 0) {
					switch (value) {
						case 4:
							panel.tab.setIconClass("feedbackGood");
							break;
						case 3:
							panel.tab.setIconClass("feedbackMedium");
							break;
						case 2:
							panel.tab.setIconClass("feedbackBad");
							break;
						case 1:
							panel.tab.setIconClass("feedbackNone");
							break;	
						default:
							break;
					}
				} else {
					panel.tab.setIconClass("feedbackARSnova");
				}
			}, 
			failure: function(){
				console.log('server-side error');
			}
		});
	},
	
	updateFeedbackBadge: function(){
		ARSnova.feedbackModel.countFeedback(localStorage.getItem("sessionId"), {
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				var value = 0;
				
				if (res.length > 0){
					value = res[0].value;
				}
				
				ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.tab.setBadge(value);
			},
			failure: function(){
				console.log('server-side error');
			}
		})
	},
});