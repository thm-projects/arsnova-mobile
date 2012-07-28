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
Ext.regController("feedback", {

	index: function(options){
		var fP = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
		fP.setActiveItem(fP.votePanel, 'slide');
    },
    
    vote: function(options){
    	if (!ARSnova.checkSessionLogin()){
    		Ext.Msg.alert('Hinweis', 'Bitte loggen Sie sich erst in einen Kurs ein, bevor Sie diese Funktion nutzen!');
    		Ext.Msg.doComponentLayout();
    		var fP = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
    		fP.setActiveItem(fP.statisticPanel, {
    			type		: 'slide',
    			direction	: 'right',
    		});
    		return;
    	}
    	
    	ARSnova.feedbackModel.getUserFeedback(localStorage.getItem("sessionId"), localStorage.getItem("login"), {
    		success: function(response){
				var responseObj = Ext.decode(response.responseText).rows;
				var ts = new Date().getTime();
				if (responseObj.length == 0){
					var feedback = Ext.ModelMgr.create({
						type	 : 'understanding',
						user	 : localStorage.getItem("login"),
						sessionId: localStorage.getItem("sessionId"),
						value	 : options.value,
						timestamp: ts,
					}, "Feedback");
				} else {
					var feedback = Ext.ModelMgr.create(responseObj[0].value, "Feedback");
					feedback.set('value', options.value);
					feedback.set('timestamp', ts);
				}
					
				feedback.save({
					success: function(){
						localStorage.setItem('user has voted', 1);
						var feedbackButton = ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.feedbackButton;
						
						feedbackButton.badgeEl ? feedbackButton.badgeEl.remove() : '';
						feedbackButton.badgeEl = null;
						
						switch (options.value){
							case "Bitte schneller":
								feedbackButton.badgeCls = "badgeicon feedbackGood";
								break;
							case "Kann folgen":
								feedbackButton.badgeCls = "badgeicon feedbackMedium";
								break;
							case "Zu schnell":
								feedbackButton.badgeCls = "badgeicon feedbackBad";
								break;
							case "Nicht mehr dabei":
								feedbackButton.badgeCls = "badgeicon feedbackNone";
								break;	
							case "cancel":
								break;
							default:
								break;
						}
						
						feedbackButton.setBadge(".");
						
						var fP = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
						fP.statisticPanel.renewChartData();
						fP.setActiveItem(fP.statisticPanel, {
							type		: 'slide',
							direction	: 'up',
						});
					},
					failure: function(){
						console.log('server-side error feedbackModel save');
					}
				})
    		},
    		failure: function(){
    			console.log('server-side error feedbackModel getUserFeedback');
    		},
    	});
    },
    
    showVotePanel: function(){
    	tP = ARSnova.mainTabPanel.tabPanel;
    	fP = tP.feedbackTabPanel;
    	
    	if(fP.rendered){
    		fP.setActiveItem(fP.votePanel);
    	} else {
    		fP.activeItem = 1;
    	}
    	tP.setActiveItem(fP);
    },
    
    statistic: function(){
    	ARSnova.showLoadMask("Erzeuge die Grafik...");
    	fP = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
    	fP.statisticPanel.backButton.show();
    	ARSnova.mainTabPanel.tabPanel.setActiveItem(fP);
    	
    	ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.addListener('deactivate', function(panel){
    		panel.statisticPanel.backButton.hide();
    	}, this, {single: true});
    },
});