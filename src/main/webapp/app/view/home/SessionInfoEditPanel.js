/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('ARSnova.view.home.SessionInfoEditPanel', {
	extend : 'Ext.Panel',

	config : {
		backRef : null,
		fullscreen : true,
		scrollable : {
			direction : 'vertical',
			directionLock : true
		},
		session : null
	},

	constructor : function (args) {
		this.callParent(arguments);

		var me = this;
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth
		 : screen.width;
		var showShortLabels = screenWidth < 480;

		//
		// Toolbar items
		//

		this.backButton = Ext.create('Ext.Button', {
				text : Messages.BACK,
				ui : 'back',
				scope : this,
				handler : function () {
					// change to session info panel
					var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
					var sessionInfoPanel = Ext.create('ARSnova.view.home.SessionInfoPanel');

					hTP.animateActiveItem(sessionInfoPanel, {
						type: 'slide',
						direction: 'right',
						duration: 700
					});
				}
			});
		
		this.saveButton = Ext.create('Ext.Button', {
			text: Messages.SAVE,
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 89px',
			handler: this.onSubmit
		});
		
		
		
		
		

		this.toolbar = Ext.create('Ext.Toolbar', {
				title : "Session Info",
				docked : 'top',
				ui : 'light',
				items : [this.backButton,
				        {xtype: 'spacer'},
				         this.saveButton]
			});

		this.infoFormCreator = Ext.create('Ext.form.FieldSet', {
			title: 'Verfasserinformationen',
			items: [{
				xtype: 'textfield',
				name: 'ppAuthorName',
				label: "Name des Dozenten",
				value: localStorage.getItem('ppAuthorName')
			},{
				xtype: 'textfield',
				name: 'ppAuthorMail',
				label: "Email",
				value: localStorage.getItem('ppAuthorMail')
			},{
				xtype: 'textfield',
				name: 'ppUniversity',
				label: "Hochschule",
				value: localStorage.getItem('ppUniversity')
			},{
				xtype: 'textfield',
				name: 'ppFaculty',
				label: "Fachbereich",
				value: localStorage.getItem('ppFaculty')
			}]
		});
		
		this.infoFormSession = Ext.create('Ext.form.FieldSet', {
			title: 'Sessioninformationen',
			items: [{
				xtype: 'textfield',
				name: 'name',
				label: "Name",
				value: localStorage.getItem('name')
			},{
				xtype: 'textfield',
				name: 'shortName',
				label: "Kürzel",
				value: localStorage.getItem('shortName')
			},{
				xtype: 'textfield',
				name: 'ppSubject',
				label: "Studiengang",
				value: localStorage.getItem('ppSubject')
			},{
				xtype: 'textfield',
				name: 'ppLevel',
				label: "Niveau",
				value: localStorage.getItem('ppLevel')
			},{
				xtype: 'textareafield',
				name: 'ppDescription',
				label: "Beschreibung",
				value: localStorage.getItem('ppDescription')
			}]
		});
		
		this.contentForm = Ext.create('Ext.form.FormPanel', {
			scrollable : null,
			id: "sessionInfoForm",
			items : [
			         this.infoFormSession,
			         this.infoFormCreator
			        ]
		});
		
		this.add([this.toolbar, this.contentForm]);
	},
	
	onSubmit: function (button) {
		
		var values = Ext.getCmp('sessionInfoForm').getValues();
		
		ARSnova.app.getController('Sessions').updateSession({
			name: values.name,
			shortName: values.shortName,
			ppAuthorName: values.ppAuthorName,
			ppAuthorMail: values.ppAuthorMail,
			ppUniversity: values.ppUniversity,
			ppFaculty: values.ppFaculty,
			ppLicense: values.ppLicense,
			ppSubject: values.ppSubject,
			ppLevel: values.ppLevel,
			ppDescription: values.ppDescription,
			ppLogo: values.ppLogo
		});
		
		console.log("Speichern");
		//Ext.Msg.alert(Messages.NOTIFICATION, "Sessioninformationen geändert");
	}
});
