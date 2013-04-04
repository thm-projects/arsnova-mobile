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
Ext.define('ARSnova.view.about.StatisticPanel', {
	extend: 'Ext.Container',
	
	config: {
		title:	'StatisticPanel',
		scroll: 'vertical',
		
		/* panels */
		tablePanel: null,
		
		/* statistics */
		statistics: null,
		
		/* toolbar items */
		toolbar		: null,
		backButton	: null
	},
	
	/**
	 * update the statistics table
	 */
	updateDataTask: {
		name: 'update the statistic table',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.infoTabPanel.statisticPanel.updateData();
		},
		interval: 30000
	},
	
	initialize: function() {
		this.callParent(arguments);
		
	    this.statisticsStore = Ext.create('Ext.data.Store', {
	    	model: 'ARSnova.model.Statistic'
	    }),
		
	    this.tablePanel = Ext.create('Ext.Panel', {
	    	html: ''
	    }),
	    
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.INFO,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
				
				me.setActiveItem(me.infoPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.STATISTIC,
			docked: 'top',
			items: [this.backButton]
		});

		this.add([this.toolbar, this.tablePanel]);	
	
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
	},
	
	onActivate: function(){
		taskManager.start(this.updateDataTask);
	},
	
	onDeactivate: function(){
		taskManager.stop(this.updateDataTask);
	},
	
	buildTable: function() {
	    if (this.statisticsStore != null) {
	    	var htmlTemplate = '<div><table class="statistic"><tr><thead><th>' + Messages.CATEGORY + '</th>' +
				'<th>' + Messages.COUNT + '</th></thead></tr>';
	    	
	    	this.statisticsStore.data.each(function(item) {
	    		htmlTemplate += '<tr><td>' + item.data.category + '</td><td>' + item.data.counter + '</td></tr>';
	        });
	    	
	        htmlTemplate += '</table></div>';
	        this.tablePanel.setHtml(htmlTemplate);
	    }
	},
	
	/**
	 * add statistics to store 'statisticsStore'
	 */
	addStatistics: function() {
		if(this.statistics != null) {
			this.statisticsStore.add({category: Messages.OPEN_SESSIONS, counter: this.statistics.openSessions});
			this.statisticsStore.add({category: Messages.CLOSED_SESSIONS, counter: this.statistics.closedSessions});
			this.statisticsStore.add({category: Messages.QUESTIONS, counter: this.statistics.questions});
			this.statisticsStore.add({category: Messages.ANSWERS, counter: this.statistics.answers});
			this.statisticsStore.add({category: "Users online", counter: this.statistics.activeUsers});
	
			this.statisticsStore.sort([{
				property : 'category',
				direction: 'DESC'
			}]);
		}
	},
	
	/**
	 * get statistics from proxy
	 */
	getStatistics: function() {
		ARSnova.app.statisticModel.countSessions({
			success: function(response){
				var statistics = Ext.decode(response.responseText);
				
				if(statistics != null) {
					var me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel.statisticPanel;
					me.statistics = statistics;
					me.addStatistics();
					me.buildTable();
				}
				
				setTimeout("ARSnova.app.hideLoadMask()", 500);
			},
			failure: function(response){
				console.log('server-side error, countOpenSessions');
			}
		});
	},
	
	updateData: function(){
		ARSnova.app.showLoadMask(Messages.LOAD_MASK);
		this.statisticsStore.clearData();
		this.getStatistics();
	}
});
