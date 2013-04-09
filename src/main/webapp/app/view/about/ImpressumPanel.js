/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/impressumPanel.js
 - Beschreibung: Panel "Impressum".
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
Ext.define('ARSnova.view.about.ImpressumPanel', {
	extend: 'Ext.Panel',
	
	config: {
		fullscreen: true,
		title:		'ImpressumPanel',
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
					duration	: 700,
					scope		: this,
					after		: function(){
//						this.up('panel').destroy();
					}
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.IMPRESSUM,
			docked: 'top',
			items: [this.backButton]
		});
		
		this.add([this.toolbar, {
			cls: 'roundedBox fontNormal',
			html: 	'<p>ARSnova ist ein Produkt der Fachgruppe WebMedia des Fachbereichs MNI der TH Mittelhessen.</p><br>' + 
					'<p>Die erste Version entwickelte Christian Thomas Weber im Rahmen seiner Masterarbeit.</p><br>' + 
					'<p>ARSnova ist Open Source unter der GNU General Public License v3.<br /><a href="https://scm.thm.de/redmine/projects/arsnova" class="external" target="_blank">Projekt-Site</a></p><br>' + 
					'<p>Projektleiter: Prof. Dr. Klaus Quibeldey-Cirkel <br />THM, Wiesenstr. 14, D-35390 Gießen<br />Tel.: 0641 / 309 - 24 50<br /><a href="mailto:klaus.quibeldey-cirkel@mni.thm.de">E-Mail</a></p>' 
		}]);
	}
});