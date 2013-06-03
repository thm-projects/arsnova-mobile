/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/canteen/votePanel.js
 - Beschreibung: Panel zum Abstimmen für ein Mensa-Gericht.
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
Ext.define('ARSnova.view.canteen.VotePanel', {
	extend: 'Ext.Container',
	
	config: {
		title: 'VotePanel',
		fullscreen: true,
		scrollable: true
	},
	
	VOTE_1: null,
	VOTE_2: null,
	VOTE_3: null,
	VOTE_4: null,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	foodOptions	: false,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.CANTEEN,
			handler : function(){
				ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel, {
		    		type		: 'slide',
		    		direction	: 'up',
		    		duration	: 700,
		    		scope		: this,
		    		listeners: { animationend: function() { 
						ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel.renewChartData();
		    		}, scope: this }
		    	});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.CANTEEN_MENU,
			docked: 'top',
			items: [
		        this.backButton
			]
		});
		
		this.add([this.toolbar, {
			xtype: 'panel',
			cls: 'gravure',
			html: Messages.I_RECOMMEND
		}]);
		
		this.on('activate', function(){
			this.addFoodOptions();
		});
	},
	
	addFoodOptions: function() {
		if(this.foodOptions) return;

		/* Get the store with the meals */
		var meals = Ext.getStore("Food").data.items;

		for ( var i = 0; i < meals.length; i++) {
			var el = meals[i];

			this.add({
				xtype	: 'button',
				handler	: function(button) {
					ARSnova.app.getController('Canteen').vote({
						value		: button.config.value,
						panel		: this
					});
				},
				text	: el.data.name,
				value	: el.data.name,
				cls		: 'login-button menu' + i
			});
		}
		this.foodOptions = true;
	}
});