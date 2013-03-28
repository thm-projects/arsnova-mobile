/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/feedback/tabPanel.js
 - Beschreibung: TabPanel für den Feedback-Tab (Zuhörer und Dozenten).
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
ARSnova.views.feedback.TabPanel = Ext.extend(Ext.TabPanel, {
	title: 		Messages.FEEDBACK,
	iconCls: 	'feedbackARSnova',
	
	tabBar: {
    	hidden: true
    },
	
	constructor: function(){
		this.statisticPanel = new ARSnova.views.feedback.StatisticPanel();
		this.votePanel = new ARSnova.views.feedback.VotePanel();
		this.askPanel = new ARSnova.views.feedback.AskPanel();
		
		this.items = [
            this.statisticPanel,
            this.votePanel,
            this.askPanel
        ];
		ARSnova.views.feedback.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			ARSnova.hideLoadMask();
			this.statisticPanel.checkVoteButton();
			this.statisticPanel.checkTitle();
			taskManager.stop(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
			taskManager.start(ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.renewChartDataTask);
			
			if (ARSnova.userRole == ARSnova.USER_ROLE_SPEAKER && this.getActiveItem() == this.votePanel) {
				this.setActiveItem(this.statisticPanel);
			}
		});
		
		this.on('deactivate', function(){
			taskManager.stop(ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.renewChartDataTask);
			taskManager.start(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
		});
		
		ARSnova.views.feedback.TabPanel.superclass.initComponent.call(this);
	},
	
	renew: function(){
		this.tab.setBadge("");
	}
});