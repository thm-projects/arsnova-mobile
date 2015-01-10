/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2014 The ARSnova Team
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
Ext.define('ARSnova.view.home.SessionExportToPublicPanel', {
	extend : 'Ext.Panel',
	alias : 'widget.SessionExportToPublicPanel',
	
	config: {
		exportSessionMap: null,
	},
	
	requires : [ 'ARSnova.model.PublicPool' ],

	initialize : function() {
		this.callParent(arguments);
		
		var config = ARSnova.app.globalConfig;
		
		var subjects = config.publicPool.subjects.split(',');
		console.log('subjects:', subjects);

		var licenses = config.publicPool.licenses.split(',');
		console.log('licenses:', licenses);
		
		this.backButton = Ext.create('Ext.Button', {
			text : Messages.SESSIONS,
			ui : 'back',
			handler : function() {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(hTP.mySessionsPanel, {
					type : 'slide',
					direction : 'right',
					duration : 700
				});
			}
		});

		this.exportButton = Ext.create('Ext.Button', {
			text : Messages.EXPORT_BUTTON_LABEL,
			ui : 'confirm',
			cls : 'saveQuestionButton',
			style : 'width: 89px',
			listeners : {
				tap : function(button, e, eOpts) {
					var me = button.up('SessionExportToPublicPanel');
					me.ValidateInput(button, e, eOpts);
				}
			},
			scope : this
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title : Messages.EXPORT_SESSION_TO_PUBLIC_TITLE,
			docked : 'top',
			ui : 'light',
			items : [ this.backButton, {
				xtype : 'spacer'
			}, this.exportButton ]
		});

		this.teacherName = Ext.create('Ext.field.Text', {
			name : 'name',
			label : Messages.EXPORT_FIELD_NAME,
			// placeHolder: Messages.SESSION_NAME_PLACEHOLDER,
			maxLength : 50,
			clearIcon : true
		});

		this.university = Ext.create('Ext.field.Text', {
			name : 'hs',
			label : Messages.EXPORT_FIELD_UNI,
			// placeHolder: Messages.SESSION_NAME_PLACEHOLDER,
			maxLength : 50,
			clearIcon : true
		});

		this.logo = Ext.create('Ext.field.Text', {
			name : 'logo',
			label : Messages.EXPORT_FIELD_LOGO,
			// placeHolder: Messages.SESSION_NAME_PLACEHOLDER,
			maxLength : 50,
			clearIcon : true
		});

		this.licence = Ext.create('Ext.field.Text', {
			name : 'licence',
			label : Messages.EXPORT_FIELD_LICENCE,
			// placeHolder: Messages.SESSION_NAME_PLACEHOLDER,
			maxLength : 50,
			clearIcon : true
		});

		this.email = Ext.create('Ext.field.Text', {
			// TODO auf gültige Mail-Adresse prüfen
			// vll gibt es da schon was von Sencha
			name : 'email',
			label : Messages.EXPORT_FIELD_EMAIL,
			vtype : 'email',
			// placeHolder: Messages.SESSION_NAME_PLACEHOLDER,
			maxLength : 50,
			clearIcon : true
		});

		this.subject = Ext.create('Ext.field.Text', {
			name : 'subject',
			label : Messages.EXPORT_FIELD_SUBJECT,
			// placeHolder: Messages.SESSION_NAME_PLACEHOLDER,
			maxLength : 50,
			clearIcon : true
		});

		this.exportOptions = Ext.create('Ext.form.FieldSet', {
			text : Messages.EXPORT_MSG,
			items : [ this.teacherName, this.university, this.logo,
					this.licence, this.subject, this.email ]
		});

		this.mainPart = Ext.create('Ext.form.FormPanel', {
			cls : 'newQuestion',
			scrollable : null,

			items : [ this.exportOptions ]
		});

		this.add([ this.toolbar, this.mainPart ]);
	},

	ValidateInput : function(button, e, options) {
		var scope = this;
		var me = button.up('SessionExportToPublicPanel');

		var validation = Ext.create('ARSnova.model.PublicPool', {
			name:	    me.teacherName.getValue(),
			hs:		    me.university.getValue(),
			logo:	    me.logo.getValue(),
			subject:	me.logo.getValue(),
			licence:	me.licence.getValue(),
			email:		me.email.getValue()
		});
		
		
		console.log('get fields',validation.getFields());
		var errs = validation.validate();
		console.log('errors',errs);
		var msg = '';

		if (!errs.isValid()) {
			errs.each(function(err) {
				msg += err.getField() + ' : ' + err.getMessage() + '\n';
			});

			Ext.Msg.alert('The formular is not complete', msg);
			
		} else {
			console.log(validation);
			var publicPoolAttributes = {};
			publicPoolAttributes['ppAuthorName'] = validation.get('name');
			publicPoolAttributes['ppAuthorMail'] = validation.get('email');
			publicPoolAttributes['ppUniversity'] = validation.get('hs');
			publicPoolAttributes['ppLogo'] 		 = validation.get('logo');
			publicPoolAttributes['ppSubject'] 	 = validation.get('subject');
			publicPoolAttributes['ppLicense'] 	 = validation.get('licence');
			
			console.log('ppAttributes', publicPoolAttributes);
			
			// export to public pool here
			ARSnova.app.getController("SessionExport").exportSessionsToPublicPool(
					me.getExportSessionMap(), publicPoolAttributes);
		}
	}
});