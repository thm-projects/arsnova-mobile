/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/ARSinLessionPanel.js
 - Beschreibung: Panel "ARS in der Lehre".
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
Ext.define('ARSnova.view.about.ARSinLessonPanel', {
	extend: 'Ext.Panel',
	
	config: {
		scroll: 	'vertical',

		/* toolbar items */
		toolbar		: null,
		backButton	: null
	},
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: Messages.ABOUT,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.aboutPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'ARS in der Lehre',
			items: [
		        this.backButton
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: 'Text folgt in Kürze...' 
		}];
		
		ARSnova.view.about.ARSinLessonPanel.superclass.constructor.call(this);
	},
	
	initialize: function(){
		ARSnova.view.about.ARSinLessonPanel.superclass.initialize.call(this);
	}
});