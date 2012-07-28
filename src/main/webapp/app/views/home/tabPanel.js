/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/home/tabPanel.js
 - Beschreibung: TabPanel für den Home-Tab (Zuhörer und Dozenten).
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
ARSnova.views.home.TabPanel = Ext.extend(Ext.Panel, {
	title	: Messages.HOME,
	iconCls	: 'tabBarIconHome',
	
	layout: 'card',
	
	constructor: function(){
		/* out of class */
		this.homePanel 		 = new ARSnova.views.home.HomePanel();
		this.mySessionsPanel = new ARSnova.views.home.MySessionsPanel();
		this.newSessionPanel = new ARSnova.views.home.NewSessionPanel();
		
		this.items = [
		    this.homePanel,
            this.mySessionsPanel,
            this.newSessionPanel,
        ];
		ARSnova.views.home.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			ARSnova.mainTabPanel.tabPanel.doLayout();
		});
		
		ARSnova.views.home.TabPanel.superclass.initComponent.call(this);
	}
});