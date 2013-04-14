/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/SessionStatusButton.js
 - Beschreibung: Button zum Starten/Stoppen einer Session.
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
Ext.define('ARSnova.view.SessionStatusButton', {
	extend: 'Ext.Panel',
	
	config: {
		cls	: 'threeButtons left',
	},
	
	handler: null,
	isOpen: false,
	
	sessionIsOpenButton: null,
	sessionIsClosedButton: null,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.sessionIsClosedButton = Ext.create('Ext.Button', {
			cls		: 'closedSession',
			handler	: function(){
				ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.sessionStatusButton.changeStatus();
			}
		});
		
		this.sessionIsClosedText = Ext.create('Ext.Panel', {
			cls	: 'centerTextSmall',
			html: Messages.START_SESSION
		});
		
		this.sessionIsOpenButton = Ext.create('Ext.Button', {
			cls		: 'openSession',
			handler	: function(){
				ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.sessionStatusButton.changeStatus();
			}
		});
		
		this.sessionIsOpenText = Ext.create('Ext.Panel', {
			cls	: 'centerTextSmall',
			html: Messages.STOP_SESSION
		});

		this.add([this.sessionIsClosedButton, this.sessionIsClosedText, this.sessionIsOpenButton, this.sessionIsOpenText]);
		
		if(localStorage.getItem('active') == 1){
			this.isOpen = true;
			this.sessionIsClosedButton.hide();
			this.sessionIsClosedText.hide();
		} else {
			this.isOpen = false;
			this.sessionIsOpenButton.hide();
			this.sessionIsOpenText.hide();
		}
	},
	
	changeStatus: function(){
		if(this.isOpen){
			/* close this session */
			ARSnova.app.getController('Sessions').setActive({
				active		: 0,
				callback	: this.sessionClosedSuccessfully
			});
		} else {
			/* open this session */
			ARSnova.app.getController('Sessions').setActive({
				active		: 1,
				callback	: this.sessionOpenedSuccessfully
			});
		}
	},
	
	checkInitialStatus: function(){
		if(this.isRendered) return;
		
		if(localStorage.getItem('active') == 1){
			this.isOpen = true;
		} else {
			this.isOpen = false;
		}
		ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.inClassActions.doLayout();
		this.isRendered = true;
	},
	
	sessionClosedSuccessfully: function(){
		this.isOpen = false;
		this.sessionIsClosedButton.show();
		this.sessionIsClosedText.show();
		this.sessionIsOpenButton.hide();
		this.sessionIsOpenText.hide();
	},
	
	sessionOpenedSuccessfully: function(){
		this.isOpen = true;
		this.sessionIsOpenButton.show();
		this.sessionIsOpenText.show();
		this.sessionIsClosedButton.hide();
		this.sessionIsClosedText.hide();
	}
}); 