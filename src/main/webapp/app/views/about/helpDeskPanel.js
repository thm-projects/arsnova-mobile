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
ARSnova.views.about.HelpDeskPanel = Ext.extend(Ext.Panel, {
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
				
				me.helpdeskPanel.on('deactivate', function(panel){
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
			title: Messages.HELPDESK,
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: 	'<p>Der Helpdesk hilft bei allen Fragen zum Einsatz von ARSnova in der Lehre.</p>' +
					'<p>Ihre Ansprechpartner sind Christoph Thelen und Paul-Christian Volkmer, beide Absolventen des Master-Studiengangs Informatik an der THM.</p>' +
					'<br />' +
					'<p>Das Büro des Helpdesks befindet sich im F-Gebäude des Campus Gießen im Raum F112a.</p>' +
					'<p>Der Helpdesk ist auch telefonisch zu erreichen: +49 641 - 309 2381</p>' +
					'<br />' +
					'<p>montags: 13:00 Uhr - 15:00 Uhr</p>' +
					'<p>dienstags: 09:00 Uhr - 14:00 Uhr</p>' +
					'<p>mittwochs: 09:00 Uhr - 14:00 Uhr</p>'
		}];
		
		ARSnova.views.about.HelpDeskPanel.superclass.constructor.call(this);
	},
});