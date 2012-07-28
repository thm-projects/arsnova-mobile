/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/developmentPanel.js
 - Beschreibung: Panel "Entwicklung".
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
ARSnova.views.about.DevelopmentPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: Messages.INFO,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.developmentPanel.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.infoPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.DEVELOPMENT,
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		/** 
		 * ohloh: factoids and stats 
		 * http://www.ohloh.net/p/596277/widgets/project_factoids_stats.js 
		 */
		this.statsPanel = new Ext.Panel({
			cls: 'statsPanel',
			html: Messages.WIDGET_IS_LOADING,
		}); 
		
		/** 
		 * ohloh: languages
		 * http://www.ohloh.net/p/596277/widgets/project_languages.js 
		 */
		this.languagesPanel = new Ext.Panel({
			cls: 'languagesPanel',
			html: Messages.WIDGET_IS_LOADING,
		});
		
		/** 
		 * ohloh: i use it
		 * http://www.ohloh.net/p/596277/widgets/project_users.js?style=gray
		 */
		this.iUseItPanel = new Ext.Panel({
			cls: 'iUseItPanel',
			html: Messages.WIDGET_IS_LOADING,
		});
		
		this.items = [
            this.statsPanel,
			this.languagesPanel,
			this.iUseItPanel,
		];
		
		ARSnova.views.about.DevelopmentPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			Ext.Ajax.request({
			    url: 'app/webservices/ohloh/factoidsandstats.php',
			    success: function(response, opts) {
			        var panel = ARSnova.mainTabPanel.tabPanel.infoTabPanel.developmentPanel;
			        panel.statsPanel.update(response.responseText);
			    }
			});
			Ext.Ajax.request({
			    url: 'app/webservices/ohloh/languages.php',
			    success: function(response, opts) {
			    	var panel = ARSnova.mainTabPanel.tabPanel.infoTabPanel.developmentPanel;
			        panel.languagesPanel.update(response.responseText);
			    }
			});
			Ext.Ajax.request({
			    url: 'app/webservices/ohloh/iuseit.php',
			    success: function(response, opts) {
			    	var panel = ARSnova.mainTabPanel.tabPanel.infoTabPanel.developmentPanel;
			        panel.iUseItPanel.update(response.responseText);
			    }
			});
		})
		
		ARSnova.views.about.DevelopmentPanel.superclass.initComponent.call(this);
	},
});