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
ARSnova.views.about.HelpVideoPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	layout: {
		type: 'hbox',
		align: 'center',
		pack: 'center'
	},
	
	constructor: function(videoid) {
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
		
		this.backButton = new Ext.Button({
			text	: Messages.BACK,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				if ((!me.layout.activeItem) || (!me.layout.activeItem.isVisible())) {
					// We're not coming from infoTabPanel, use mainTabPanel directly
					me = ARSnova.mainTabPanel.tabPanel;
				}
				
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
			title: Messages.HELP,
			items: [
				this.backButton,
			]
		});

		this.dockedItems = [this.toolbar];
		
		var w = getVideoResolution().width;
		var h = getVideoResolution().height;
		this.items = [{
			html:	'<iframe width="'+w+'" height="'+h+'" src="//www.youtube-nocookie.com/embed/'+videoid+'?rel=0&hd=1" frameborder="0" allowfullscreen></iframe>',
		}];

		ARSnova.views.about.HelpVideoPanel.superclass.constructor.call(this);
	},
});