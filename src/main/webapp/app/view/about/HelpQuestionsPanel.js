/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/helpQuestionsPanel.js
 - Beschreibung: Panel "Hilfe zu Fragen".
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
Ext.define('ARSnova.view.about.HelpQuestionsPanel', {
	extend: 'Ext.Panel',
	
	config: {
		fullscreen: true,
		scrollable: true,
		title:		'HelpQUestionsPanel',
		scroll: 	'vertical'
	},
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.BACK,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
				
				me.animateActiveItem(me.helpMainPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.HELP_QUESTIONS,
			docked: 'top',
			items: [this.backButton]
		});

		this.add([this.toolbar, {
			cls: 'roundedBox fontNormal',
			html: 'Eine Hilfe zu den Fragen kommt in Kürze...'
		}]);
	}
});