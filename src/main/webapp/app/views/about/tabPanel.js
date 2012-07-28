/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/tabPanel.js
 - Beschreibung: TabPanel für den Info-Tab (Zuhörer und Dozenten).
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
ARSnova.views.about.TabPanel = Ext.extend(Ext.TabPanel, {
	title	: Messages.INFO,
	iconCls	: 'tabBarIconInfo',
	
	tabBar: {
    	hidden: true,
    },
	
	constructor: function(){
		this.infoPanel = new ARSnova.views.about.InfoPanel();
		
		this.items = [
		    this.infoPanel,
        ];
		ARSnova.views.about.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('deactivate', function(){
			this.layout.activeItem.fireEvent('deactivate');
		});
		
		this.on('activate', function(){
			this.layout.activeItem.fireEvent('activate');
		});
		
		ARSnova.views.about.TabPanel.superclass.initComponent.call(this);
	},
});