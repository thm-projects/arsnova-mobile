/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/CheckFullscreenPanel.js
 - Beschreibung: Zeigt dem Benutzer einen Hinweis, dass die Anwendung eine HTML5-Anwendung ist.
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
Ext.define('ARSnova.view.CheckFullscreenPanel', {
	extend: 'Ext.Panel', 

	config: {
		floating: true,
		modal: true,
		centered: true,
		width: 300,
		styleHtmlContent: true,
		
		items: [{
				xtype: 'toolbar',
				docked: 'top',
				title: Messages.BROWSER_NAVIGATION_TITLE
			}, {
			html: Messages.BROWSER_NAVIGATION
		}, {
			xtype: 'button',
			ui: 'confirm',
			style: {
				width: '50%',
				margin: '0pt auto',
				marginTop: '10px'
			},
			text: 'okay',
			handler: function(){
				this.up('panel').hide();
			}
		}],
	},
	
	initialize: function() {
		this.callParent(arguments);
		
		this.on('hide', function(){
			localStorage.setItem('html5 info read', '');
			this.destroy();
		});
	}
});
