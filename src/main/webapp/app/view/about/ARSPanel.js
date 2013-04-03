/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/ARSPanel.js
 - Beschreibung: Panel "Was bedeutet ARS?".
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
Ext.define('ARSnova.view.about.ARSPanel', {
	extend: 'Ext.Panel',
	
	config: {
		title: 'ARSPanel',
		scroll: 	'vertical',

		/* toolbar items */
		toolbar		: null,
		backButton	: null		
	},
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.ABOUT,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
				
				me.setActiveItem(me.aboutPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: '"ARS"',
			items: [this.backButton]
		});
		
		this.add([this.toolbar, {
			cls: 'roundedBox fontNormal',
			html: 	'<p>ARS steht für Audience Response System, siehe <a href="http://en.wikipedia.org/wiki/Audience_response" class="external" target="_blank">Wikipedia</a>.</p><br>' +
					'<p>Die didaktischen Probleme von Großveranstaltungen sind hinlänglich bekannt: fehlende Interaktion zwischen Auditorium und Lehrperson, schwierige Aktivierung der Studierenden, ängstliche Studierende melden sich nicht zu Wort. Dennoch kann aus Kapazitätsgründen nicht auf große Vorlesungen verzichtet werden.</p><br>' +
					'<p>Um das Verständnis der Zuhörer/innen einfach und schnell einzuholen, können Fragen anonym auf dem Smartphone oder Laptop beantwortet werden – ähnlich wie bei der Publikumsfrage in der Quizshow von Günther Jauch. Das Ergebnis wird als Balkendiagramm visualisiert und kann direkt von der Lehrperson kommentiert werden. Die Feedback-Funktion von ARSnova erlaubt es, das Tempo der Vorlesung vom Auditorium zeitnah bewerten zu lassen.</p>' 
		}]);
	}
});