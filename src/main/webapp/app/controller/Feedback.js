/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/controllers/feedback.js
 - Beschreibung: Feedback-Controller
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
Ext.define("ARSnova.controller.Feedback", {
	extend: 'Ext.app.Controller',

	index: function(options){
		var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
		fP.animateActiveItem(fP.votePanel, 'slide');
    },
    
    vote: function(options){
    	if (!ARSnova.app.checkSessionLogin()){
    		Ext.Msg.alert('Hinweis', 'Bitte loggen Sie sich erst in einen Kurs ein, bevor Sie diese Funktion nutzen!');
    		var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
    		fP.animateActiveItem(fP.statisticPanel, {
    			type		: 'slide',
    			direction	: 'right'
    		});
    		return;
    	}
    	
    	var feedbackValue;
    	var feedbackCls;
    	switch (options.value){
			case "Kann folgen":
				feedbackCls = "Good";
				feedbackValue = 1;
				break;
			case "Bitte schneller":
				feedbackCls = "Medium";
				feedbackValue = 0;
				break;
			case "Zu schnell":
				feedbackCls = "Bad";
				feedbackValue = 2;
				break;
			case "Nicht mehr dabei":
				feedbackCls = "None";
				feedbackValue = 3;
				break;	
			case "cancel":
				return;
			default:
				return;
		}
		
		ARSnova.app.feedbackModel.postFeedback(localStorage.getItem("keyword"), feedbackValue, {
			success: function(response) {
				localStorage.setItem('user has voted', 1);
				var feedbackButton = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.feedbackButton;
				
				feedbackButton.setBadgeCls("badgeicon badgefixed feedback" + feedbackCls);
				feedbackButton.setBadgeText(".");
				
				var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
				fP.statisticPanel.renewChartData();
				fP.animateActiveItem(fP.statisticPanel, {
					type		: 'slide',
					direction	: 'up'
				});
			},
			failure: function(){
				console.log('server-side error feedback save');
			}
		});
	},
	
	ask: function(options) {
		options.question.saveInterposed({
			success: options.success,
			failure: options.failure
		});
	},
    
    showVotePanel: function(){
    	tP = ARSnova.app.mainTabPanel.tabPanel;
    	fP = tP.feedbackTabPanel;
    	
    	if(fP.rendered){
    		fP.setActiveItem(fP.votePanel);
    	} else {
    		fP.activeItem = 1;
    	}
    	tP.setActiveItem(fP);
    },
    
    statistic: function(){
    	ARSnova.app.showLoadMask("Erzeuge die Grafik...");
    	fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
    	fP.statisticPanel.backButton.show();
    	ARSnova.app.mainTabPanel.tabPanel.setActiveItem(fP);
    	
    	ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.addListener('deactivate', function(panel){
    		panel.statisticPanel.backButton.hide();
    	}, this, {single: true});
    }
});