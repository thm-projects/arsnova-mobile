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
ARSnova.views.about.ImpressumPanel = Ext.extend(Ext.Panel, {
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
				me.setActiveItem(me.infoPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this,
					after		: function(){
//						this.up('panel').destroy();
					}
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.IMPRESSUM,
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: 	'<p>ARSnova ist ein Produkt der Fachgruppe WebMedia des Fachbereichs MNI der TH Mittelhessen.</p><br>' + 
					'<p>Die erste Version entwickelte Christian Thomas Weber im Rahmen seiner Masterarbeit.</p><br>' + 
					'<p>ARSnova ist Open Source unter der GNU General Public License v3.<br /><a href="https://scm.thm.de/redmine/projects/arsnova" class="external" target="_blank">Projekt-Site</a></p><br>' + 
					'<p>Projektleiter: Prof. Dr. Klaus Quibeldey-Cirkel <br />THM, Wiesenstr. 14, D-35390 Gießen<br />Tel.: 0641 / 309 - 24 50<br /><a href="mailto:klaus.quibeldey-cirkel@mni.thm.de">E-Mail</a></p>', 
		}];
		
		ARSnova.views.about.ImpressumPanel.superclass.constructor.call(this);
	},
});