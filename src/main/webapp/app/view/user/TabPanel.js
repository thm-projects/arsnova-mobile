/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/user/tabPanel.js
 - Beschreibung: TabPanel für Session-Teilnehmer.
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
Ext.define('ARSnove.view.user.TabPanel', {
	extend: 'Ext.tab.Panel',
	
	config: {
		title	: Messages.SESSION,
	
		iconCls	: 'tabBarIconHome',
		scroll	: 'vertical',
		
		tabBar: {
	    	hidden: true
	    }
	},
	
	constructor: function(){
		this.inClassPanel = new ARSnova.views.user.InClass();
		
		this.items = [
	        this.inClassPanel
        ];
		ARSnova.view.user.TabPanel.superclass.constructor.call(this);
	},
	
	initialize: function(){
		this.on('afterlayout', function(){
			setTimeout("ARSnova.hideLoadMask()", 1000); // timeout to compensate the cardswitch animation
		});
		
		ARSnova.view.user.TabPanel.superclass.initialize.call(this);
	},
	
	renew: function(){
		this.remove(this.inClassPanel);
		this.inClassPanel = new ARSnova.views.user.InClass();
		this.insert(0, this.inClassPanel);
		this.setActiveItem(0);
		this.inClassPanel.registerListeners();
	}
});