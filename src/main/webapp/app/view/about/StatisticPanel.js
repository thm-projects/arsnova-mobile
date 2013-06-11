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
	requires: ['Ext.form.Panel', 'Ext.form.FieldSet'],
	
	config: {
		fullscreen: true,
		scrollable: true,
		title:	'StatisticPanel',
		scroll: 'vertical'
	},
	
	/* panels */
	tablePanel: null,
	testy: null,
	
	/* statistics */
	statistics: null,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
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
	    
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.INFO,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
				
				me.animateActiveItem(me.infoPanel, {
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
			ui: 'light',
			items: [this.backButton]
		});
		
		this.add([this.toolbar,{
			xtype: 'formpanel',
			cls  : 'standardForm topPadding',
			scrollable : null,
			//style	: { margin: '20px'},
			
			defaults: {
				xtype	: 'button',
				ui		: 'normal',
				cls		: 'standardListButton'
			},
			
			items: [{
					id : 'statisticUsersOnline',
					text	: 'Users online'
				},{
					id : 'statisticOpenSessions',
					text	: Messages.OPEN_SESSIONS
				},{
					id : 'statisticClosedSessions',
					text	: Messages.CLOSED_SESSIONS
				},{
					id : 'statisticQuestions',
					text	: Messages.QUESTIONS
				},{
					id : 'statisticAnswers',
					text	: Messages.ANSWERS
				},]
		},]);	
	
		this.on('activate', this.onActivate);
		this.on('activate', this.beforeActivate, this, null, 'before');
		this.on('deactivate', this.onDeactivate);
	},
	
	beforeActivate: function(){
		this.getStatistics();
	},
	
	onActivate: function(){
		taskManager.start(this.updateDataTask);
	},
	
	onDeactivate: function(){
		taskManager.stop(this.updateDataTask);
	},
	setNumbers: function() {
	    if (this.statistics != null) {
			Ext.getCmp('statisticUsersOnline').setText('Users online <div style="float:right">' + this.statistics.activeUsers + '</div>');
			Ext.getCmp('statisticOpenSessions').setText(Messages.OPEN_SESSIONS + '<div style="float:right">' + this.statistics.openSessions + '</div>');
			Ext.getCmp('statisticClosedSessions').setText(Messages.CLOSED_SESSIONS + '<div style="float:right">' + this.statistics.closedSessions + '</div>');
			Ext.getCmp('statisticQuestions').setText(Messages.QUESTIONS + '<div style="float:right">' + this.statistics.questions + '</div>');
			Ext.getCmp('statisticAnswers').setText(Messages.ANSWERS + '<div style="float:right">' + this.statistics.answers + '</div>');
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
					me.setNumbers();
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
