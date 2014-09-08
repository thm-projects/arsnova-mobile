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

Ext.define('ARSnova.view.home.TabPanel', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.view.home.HomePanel',
		'ARSnova.view.home.MySessionsPanel',
		'ARSnova.view.home.NewSessionPanel'
	],

	config: {
		title: Messages.HOME,
		iconCls: 'tabBarIconHome',
		layout: 'card'
	},

	initialize: function () {
		this.callParent(arguments);

		/* out of class */
		this.homePanel = Ext.create('ARSnova.view.home.HomePanel');
		this.mySessionsPanel = Ext.create('ARSnova.view.home.MySessionsPanel');
		this.newSessionPanel = Ext.create('ARSnova.view.home.NewSessionPanel');

		this.add([
			this.homePanel,
			this.mySessionsPanel,
			this.newSessionPanel
		]);
	}
});
