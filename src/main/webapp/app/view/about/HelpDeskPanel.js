/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/helpDeskPanel.js
 - Beschreibung: Panel "Helpdesk".
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
Ext.define('ARSnova.view.about.HelpDeskPanel', {
	extend: 'Ext.Panel',
	
	config: {
		fullscreen: true,
		title:		'HelpDeskPanel',
		scroll: 	'vertical',
	},
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.INFO,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
				
				me.animateActiveItem(me.infoPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.HELPDESK,
			docked: 'top',
			items: [this.backButton]
		});
		
		var helpdesktext = ['<p>Der Helpdesk hilft bei allen Fragen zum Einsatz von ARSnova in der Lehre.</p>' +
					'<p>Ihre Ansprechpartner sind Christoph Thelen und Paul-Christian Volkmer, beide Absolventen des Master-Studiengangs Informatik an der THM.</p>',
					'<p>Das Büro des Helpdesks befindet sich im F-Gebäude des Campus Gießen im Raum F112a.</p>' +
					'<p>Der Helpdesk ist auch telefonisch zu erreichen: +49 641 - 309 2381</p>',
					'<p>montags: 13:00 Uhr - 15:00 Uhr<br/>',
					'dienstags: 09:00 Uhr - 14:00 Uhr<br/>',
					'mittwochs: 09:00 Uhr - 14:00 Uhr</p>'];
		
		this.add([this.toolbar, {
			cls: 'roundedBox fontNormal',
			html: [].concat(!Ext.os.is.Desktop ? [helpdesktext.join("<br/>")] : ['<div id="helpdesk"><p id="helpdesk-start">Es war einmal vor kurzer Zeit in einer nicht weit entfernten Hochschule&hellip;</p>',
				'<h1>ARS NOVA<sub>Helpdesk</sub></h1>',
				'<div id="helpdesk-titles"><div id="helpdesk-titlecontent">',
					'<p class="center">EPISODE IV<br />NEUE HOFFNUNG FÜR DIE LEHRE</p>',
					'<p>Es herrscht Klarheit.</p>',
					helpdesktext.join("\n"),
				'</div></div></div>']).join("\n")
		}].concat(!Ext.os.is.Desktop ? [] : [{
			cls: 'gravure',
			html: '<a href="http://www.sitepoint.com/css3-starwars-scrolling-text/" target="_blank">sitepoint.com/css3-starwars-scrolling-text/</a>'
		}]));
	}
});