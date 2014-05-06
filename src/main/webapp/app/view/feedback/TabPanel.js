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
Ext.define('ARSnova.view.feedback.TabPanel', {
	extend: 'Ext.tab.Panel',
	
	requires: ['ARSnova.view.feedback.StatisticPanel',
	           'ARSnova.view.feedback.VotePanel',
	           'ARSnova.view.feedback.AskPanel'
	],
	
	config: {
		title: 		Messages.FEEDBACK,
		iconCls: 	'feedbackARSnova',
		
		tabBar: {
	    	hidden: true
		}
	},
	
	initialize: function() {
		this.callParent(arguments);
		
		this.statisticPanel = Ext.create('ARSnova.view.feedback.StatisticPanel');
		this.votePanel = Ext.create('ARSnova.view.feedback.VotePanel');
		this.askPanel = Ext.create('ARSnova.view.feedback.AskPanel');
		
		this.add([
            this.statisticPanel,
            this.votePanel,
            this.askPanel
        ]);
		
		this.on('activate', function(){
			this.statisticPanel.checkVoteButton();
			this.statisticPanel.checkTitle();
			ARSnova.app.feedbackModel.un("arsnova/session/feedback/count", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackBadge);
			ARSnova.app.feedbackModel.un("arsnova/session/feedback/average", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackIcon);
			ARSnova.app.feedbackModel.on('arsnova/session/feedback/update', this.statisticPanel.updateChart, this.statisticPanel);
			ARSnova.app.feedbackModel.on('arsnova/session/feedback/average', this.statisticPanel.updateTabBar, this.statisticPanel);
			
			if (ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER && this.getActiveItem() == this.votePanel) {
				this.setActiveItem(this.statisticPanel);
			}
		});
		
		this.on('deactivate', function(){
			ARSnova.app.feedbackModel.un('arsnova/session/feedback/update', this.statisticPanel.updateChart);
			ARSnova.app.feedbackModel.un('arsnova/session/feedback/average', this.statisticPanel.updateTabBar);
			ARSnova.app.feedbackModel.on("arsnova/session/feedback/count", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackBadge, ARSnova.app.mainTabPanel.tabPanel);
			ARSnova.app.feedbackModel.on("arsnova/session/feedback/average", ARSnova.app.mainTabPanel.tabPanel.updateFeedbackIcon, ARSnova.app.mainTabPanel.tabPanel);
		});
	},
	
	renew: function(){
		this.tab.setBadgeText("");
	}
});
