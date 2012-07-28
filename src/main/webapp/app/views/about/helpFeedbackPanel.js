/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/helpFeedbackPanel.js
 - Beschreibung: Panel "Hilfe zu Feedback".
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
ARSnova.views.about.HelpFeedbackPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: Messages.BACK,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.helpMainPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.HELP_FEEDBACK,
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: 'Eine Hilfe zum Feedback kommt in Kürze...',
		}];
		
		ARSnova.views.about.HelpFeedbackPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.HelpFeedbackPanel.superclass.initComponent.call(this);
	}
});