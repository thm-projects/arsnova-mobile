/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/helpHomePanel.js
 - Beschreibung: Panel "Hilfe zu Home".
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
ARSnova.views.about.HelpHomePanel = Ext.extend(Ext.Panel, {
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
			title: Messages.HELP_HOME,
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: 	'<p>Nach der Anmeldung als Gast oder Mitglied der THM wird die Startseite von ARSnova angezeigt. Hier gibt es zwei Möglichkeiten, eine Session zu besuchen:</p><br>' +
					'<ol class="standardList">' +
						'<li>Man tritt einer Session durch Eingabe der 8-stelligen Session-ID bei oder</li>' +
						'<li>man tippt auf den \u201eSessions\u201f-Button, um eine kürzlich besuchte Session ohne Eingabe der Session-ID erneut zu besuchen.</li>' +
					'</ol><br>' +
					'<p>Will man eine neue Session anlegen, tippt man auf den \u201eSessions\u201f-Button, um auf der folgenden Seite über das \u201ePlus\u201f-Icon oben rechts oder den gleichnamigen Button eine neue Session anzulegen. Eigene Sessions können dort direkt angesprungen werden.</p><br>' +
					'<p>Eine Session in grüner Schrift ist geöffnet, sonst gesperrt.</p>',
		}];
		
		ARSnova.views.about.HelpHomePanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.HelpHomePanel.superclass.initComponent.call(this);
	}
});