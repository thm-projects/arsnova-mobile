/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/statisticPanel.js
 - Beschreibung: Panel "Statistik".
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
ARSnova.views.about.StatisticPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	gridPanel: null,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	/**
	 * update the statistics table
	 */
	updateDataTask: {
		name: 'update the statistic table',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.infoTabPanel.statisticPanel.updateData();
		},
		interval: 30000,
	},
	
	constructor: function(){
		this.gridPanel = new Ext.DataView({
	        store: new Ext.data.Store({
	            model: 'Statistic',
	        }),
	        tpl: new Ext.XTemplate(
        		'<table class="statistic">',
	        		'<tr><thead><th>' + Messages.CATEGORY + '</th><th>' + Messages.COUNT + '</th></thead></tr>',
	        	    '<tpl for=".">',
	        	    	'<tr><td>{category}</td><td>{counter}</td></tr>',
		            '</tpl>',
	            '<table></div>'
	        ),
	        itemSelector: 'div',
	        scroll: false,
	    });
		
		this.backButton = new Ext.Button({
			text	: Messages.INFO,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.statisticPanel.on('deactivate', function(panel){
					panel.destroy();
				}, this, {single:true});
				
				me.setActiveItem(me.infoPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.STATISTIC,
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [this.gridPanel];
		
		ARSnova.views.about.StatisticPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
		
		ARSnova.views.about.StatisticPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function(){
		taskManager.start(this.updateDataTask);
	},
	
	onDeactivate: function(){
		taskManager.stop(this.updateDataTask);
	},
	
	countActiveUsers: function(){
		ARSnova.statisticModel.countActiveUsers({
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				var value = 0;		
				if (res.length > 0){
					value = res[0].value;
				}
				var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel.statisticPanel;
				me.gridPanel.store.add({category: "Users online", counter: value})
				me.gridPanel.store.sort([{
					property : 'category',
					direction: 'DESC'
				}]);
			},
			failure: function(response){
				console.log('server-side error, countActiveUsers');
			},
		})
	},
	
	countActiveSessions: function(){
		ARSnova.statisticModel.countActiveSessions({
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				var value = 0;		
				if (res.length > 0){
					value = res[0].value;
					
					ARSnova.statisticModel.countActiveUsersWithSessionId({
						success: function(response){
							var results = Ext.decode(response.responseText).rows;
							var sessionsArr = new Array();
							var activeSessions = 0;
							
							if (results.length > 0){
								for (var i = 0; i < results.length; i++) {
									var el = results[i];
									
									if (sessionsArr[el.value] == undefined) {
										sessionsArr[el.value] = 1;
									} else {
										sessionsArr[el.value]++;
									}
								}
								
								for (var i = 0; i < res.length; i++) {
									var elem = res[i];
									
									if (sessionsArr[elem.id] > 1) {
										activeSessions++;
									}
								}
							}
							
							var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel.statisticPanel;
							me.gridPanel.store.add({category: Messages.ACTIVE_SESSIONS, counter: activeSessions})
							me.gridPanel.store.sort([{
								property : 'category',
								direction: 'DESC'
							}]);
						},
						failure: function(response){
							console.log('server-side error, countActiveUsers');
						},
					});
				}
			},
			failure: function(response){
				console.log('server-side error, countActiveSessions');
			},
		})
	},
	
	countSessions: function(){
		ARSnova.statisticModel.countSessions({
			success: function(response){
				var statistics = Ext.decode(response.responseText);
				
				var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel.statisticPanel;
				me.gridPanel.store.add({category: Messages.OPEN_SESSIONS, counter: statistics.openSessions});
				me.gridPanel.store.add({category: Messages.CLOSED_SESSIONS, counter: statistics.closedSessions});
				me.gridPanel.store.add({category: Messages.QUESTIONS, counter: statistics.questions});
				me.gridPanel.store.add({category: Messages.ANSWERS, counter: statistics.answers});
				me.gridPanel.store.sort([{
					property : 'category',
					direction: 'DESC'
				}]);
				me.doComponentLayout();
				setTimeout("ARSnova.hideLoadMask()", 500);
			},
			failure: function(response){
				console.log('server-side error, countOpenSessions');
			},
		})
	},
	
	updateData: function(){
		ARSnova.showLoadMask(Messages.LOAD_MASK);
		this.gridPanel.store.clearData();
		this.countActiveUsers();
		this.countActiveSessions();
		this.countSessions();
	},
});