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
Ext.define('ARSnova.view.home.SessionInfoPanel', {
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
					var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
					hTP.animateActiveItem(hTP.mySessionsPanel, {
						type : 'slide',
						direction : 'right',
						duration : 700
					});
					
					// remove session/local storage
					sessionStorage.removeItem("keyword");

					localStorage.removeItem("sessionId");
					localStorage.removeItem("name");
					localStorage.removeItem("shortName");
					localStorage.removeItem("ppAuthorName");
					localStorage.removeItem("ppAuthorMail");
					localStorage.removeItem("ppUniversity");
					localStorage.removeItem("ppFaculty");
					localStorage.removeItem("ppLicense");
					localStorage.removeItem("ppSubject");
					localStorage.removeItem("ppLevel");
					localStorage.removeItem("ppDescription");
					localStorage.removeItem("ppLogo");
					localStorage.removeItem("active");
					localStorage.removeItem("session");
					localStorage.removeItem("courseId");
					localStorage.removeItem("courseType");
					localStorage.removeItem("creationTime");
					ARSnova.app.isSessionOwner = false;
				}
			});
		
		this.editButton = Ext.create('Ext.Button', {
			text: Messages.EDIT,
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 89px',
			handler : function () {
					var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(hTP.sessionInfoEditPanel, {
					type : 'slide',
					direction : 'left',
					duration : 700
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
				title : "Session Info",
				docked : 'top',
				ui : 'light',
				items : [this.backButton,
				         { xtype: 'spacer'},
				         this.editButton]
			});
		
		this.infoFormName = Ext.create('Ext.form.FieldSet', {
			title: 'Allgemein',
			items: [{
				xtype: 'textfield',
				name: 'name',
				label: "Name",
				disabled: true,
				value: localStorage.getItem('name')
			},{
				xtype: 'textfield',
				name: 'shortName',
				label: "Kürzel",
				disabled: true,
				value: localStorage.getItem('shortName')
			}]
		});
		
		this.infoFormCreator = Ext.create('Ext.form.FieldSet', {
			title: 'Verfasserinformationen',
			items: [{
				xtype: 'textfield',
				name: 'ppAuthorName',
				label: "Name des Dozenten",
				disabled: true,
				value: localStorage.getItem('ppAuthorName')
			},{
				xtype: 'textfield',
				name: 'ppAuthorMail',
				label: "Email",
				disabled: true,
				value: localStorage.getItem('ppAuthorMail')
			},{
				xtype: 'textfield',
				name: 'ppUniversity',
				label: "Hochschule",
				disabled: true,
				value: localStorage.getItem('ppUniversity')
			},{
				xtype: 'textfield',
				name: 'ppFaculty',
				label: "Fachbereich",
				disabled: true,
				value: localStorage.getItem('ppFaculty')
			}]
		});
		
		this.infoFormSession = Ext.create('Ext.form.FieldSet', {
			title: 'Sessioninformationen',
			items: [{
				xtype: 'textfield',
				name: 'ppSubject',
				label: "Studiengang",
				disabled: true,
				value: localStorage.getItem('ppSubject')
			},{
				xtype: 'textfield',
				name: 'ppLevel',
				label: "Niveau",
				disabled: true,
				value: localStorage.getItem('ppLevel')
			},{
				xtype: 'textareafield',
				name: 'ppdescription',
				label: "Beschreibung",
				disabled: true,
				value: localStorage.getItem('ppdescription')
			},{
				xtype: 'textfield',
				name: 'ppLogo',
				label: "logo test#",
				disabled: true,
				value: localStorage.getItem('ppLogo')
			}]
		});
		
		
		
		
		
		// #################

		this.sessionName = Ext.create('Ext.field.Text', {
				label : Messages.SESSION_NAME,
				name : 'sessionName',
				disabled: true
			});
		
		this.sessionShortName = Ext.create('Ext.field.Text', {
				label : Messages.SESSION_SHORT_NAME,
				name : 'sessionShortName',
				disabled: true
			});
		this.sessionNumQuestions = Ext.create('Ext.field.Text', {
				label : Messages.QUESTIONS,
				name : 'sessionNumQuestions',
				disabled: true
			});


		
		this.sessionFieldSet = Ext.create('Ext.form.FieldSet', {
				title : Messages.SESSIONPOOL_SESSIONINFO,
				items : [this.sessionName, this.sessionShortName,
					this.sessionNumQuestions]
		});

		this.creatorName = Ext.create('Ext.field.Text', {
				label : Messages.EXPORT_FIELD_NAME,
				name : 'creatorName',
				disabled: true
			});

		this.creatorMail = Ext.create('Ext.field.Text', {
				label : Messages.EXPORT_FIELD_EMAIL,
				name : 'creatorMail',
				disabled: true
			});

		
		
		
		this.creatorUni = Ext.create('Ext.field.Text', {
				label : Messages.EXPORT_FIELD_UNI,
				name : 'creatorUni',
				disabled: true
			});

		this.creatorDep = Ext.create('Ext.field.Text', {
				label : Messages.EXPORT_FIELD_SPECIAL_FIELD,
				name : 'creatorDep',
				disabled: true
			});

		this.creatorFieldSet = Ext.create('Ext.form.FieldSet', {
				title : Messages.SESSIONPOOL_AUTHORINFO,
				items : [this.creatorName, this.creatorMail, this.creatorUni,
					this.creatorDep]
			});
		this.descriptionPanel = Ext.create('Ext.Panel', {
				layout : {
					type : 'hbox',
					pack : 'center',
					align : 'start'
				},
				style : {
					'margin-top' : '30px'
				}
			});
		this.descriptionFieldSet = Ext.create('Ext.form.FieldSet', {
				items : [this.descriptionPanel]
			});
		this.contentForm = Ext.create('Ext.form.FormPanel', {
				scrollable : null,
				items : [
						 this.infoFormName,
				         this.infoFormCreator,
				         this.infoFormSession
				        ]
			});
		this.add([this.toolbar, this.contentForm]);
	}
});
