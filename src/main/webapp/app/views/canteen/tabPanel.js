/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/canteen/tabPanel.js
 - Beschreibung: TabPanel für den Mensa-Tab (Zuhörer und Dozenten).
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
ARSnova.views.canteen.TabPanel = Ext.extend(Ext.TabPanel, {
	title	: Messages.CANTEEN,
	iconCls	: 'tabBarIconCanteen',
	layout	: 'fit',
	
	tabBar: {
    	hidden: true
    },
	
	constructor: function(){
		this.statisticPanel = new ARSnova.views.canteen.StatisticPanel();
		this.votePanel = new ARSnova.views.canteen.VotePanel();
		
		this.items = [
            this.statisticPanel,
            this.votePanel
        ];
		ARSnova.views.canteen.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			taskManager.start(this.statisticPanel.renewChartDataTask);
		});
		
		this.on('deactivate', function(){
			this.setActiveItem(this.statisticPanel);
			taskManager.stop(this.statisticPanel.renewChartDataTask);
		});
		
		ARSnova.views.canteen.TabPanel.superclass.initComponent.call(this);
	}
});