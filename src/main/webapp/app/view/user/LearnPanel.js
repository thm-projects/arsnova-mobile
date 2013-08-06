/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Zum Anzeigen der Lernoptionen
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
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
Ext.define('ARSnova.view.user.LearnPanel', {
	extend: 'Ext.Container',
	
	config: {
		title: 'Learn',
		fullscreen: true,
		scrollable: true
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		var toolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			ui: 'light',
			title: "Learn",
			items: [{
				ui: 'back',
				text: Messages.BACK,
				handler: function() {
					var uTP = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;
					uTP.animateActiveItem(uTP.inClassPanel, {
						type: 'slide',
						direction: 'right'
					});
				}
			}]
		});
		
		this.add([toolbar]);
	}
	
});
