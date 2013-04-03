/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Panel zum Anzeigen von YouTube-Videos.
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
Ext.define('ARSnova.view.about.HelpVideoPanel', {
	extend: 'Ext.Panel',
	
	config: {
		title:		'HelpVideoPanel',
		scroll: 	'vertical',
		
		/* toolbar items */
		toolbar		: null,
		backButton	: null,
	
		layout: {
			type: 'hbox',
			align: 'center',
			pack: 'center'
		}
	},
	
	constructor: function(arguments) {
		this.callParent(arguments);
		
		this.standalone = false;
		
		// check arguments for standalone
		if(typeof arguments.standalone !== 'undefined') {
			this.standalone = arguments.standalone;
		}
		
		// Find the best video resolution for the available screen size
		var getVideoResolution = function() {
			var width = window.innerWidth;
			if (width < 480) {
				return { width: 420, height: 315 };
			} else if (width < 640) {
				return { width: 480, height: 360 };
			} else if (width < 960) {
				return { width: 640, height: 480 };
			} else if (width < 1280) {
				return { width: 960, height: 720 };
			}
			return { width: 1280, height: 720 };
		};
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.BACK,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
				
				if(this.standalone) {
					me = ARSnova.app.mainTabPanel.tabPanel;
				}
				
				me.setActiveItem(me.helpMainPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		var w = getVideoResolution().width;
		var h = getVideoResolution().height;
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.HELP,
			docked: 'top',
			items: [this.backButton]
		});
		
		this.add([this.toolbar, {
			html:	'<iframe style="display:block" width="'+w+'" height="'+h+'" src="//www.youtube-nocookie.com/embed/'+arguments.videoid+'?rel=0&hd=1" frameborder="0" allowfullscreen></iframe>'
		}]);
	}
});