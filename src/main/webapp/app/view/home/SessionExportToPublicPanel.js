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
	
	requires : [ 'Ext.ux.Fileup', 'ARSnova.model.PublicPool' ],

	initialize : function() {
		this.callParent(arguments);
		var SubjectoptionsPP = [];	// save loaded subjects
		var LicenceoptionsPP = [];  // save loaded lincences
		
		var config = ARSnova.app.globalConfig;
				
		var screenWidth = (window.innerWidth > 0) ?
				window.innerWidth :	screen.width;
		var showShortLabels = screenWidth < 480;
				
		var subjects = config.publicPool.subjects.split(',');
		console.log('subjects:', subjects);
		
		subjects.forEach(function(entry){
			SubjectoptionsPP.push({text: entry, value: entry})
		});
	
		var licenses = config.publicPool.licenses.split(',');
		console.log('licenses:', licenses);
		
		licenses.forEach(function(entry){
			LicenceoptionsPP.push({text: entry, value: entry})
		});
		
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

		this.licence = Ext.create('Ext.field.Select', {
			name : 'licence',
			label : Messages.EXPORT_FIELD_LICENCE,
			// placeHolder: Messages.SESSION_NAME_PLACEHOLDER,
			maxLength : 50,
			clearIcon : true
		});
		this.licence.updateOptions(LicenceoptionsPP);
		
		this.email = Ext.create('Ext.field.Text', {
			name : 'email',
			label : Messages.EXPORT_FIELD_EMAIL,
			vtype : 'email',
			// placeHolder: Messages.SESSION_NAME_PLACEHOLDER,
			maxLength : 50,
			clearIcon : true
		});

		this.subject = Ext.create('Ext.field.Select', {
			name : 'subject',
			label : Messages.EXPORT_FIELD_SUBJECT,
			// placeHolder: Messages.SESSION_NAME_PLACEHOLDER,
			maxLength : 50,
			clearIcon : true
		});

		this.subject.updateOptions(SubjectoptionsPP);
	
		this.buttonUploadFromFS = Ext.create('Ext.ux.Fileup', {
			xtype: 'fileupload',
			autoUpload: true,
			loadAsDataUrl: true,
			states: {
				browse: {
					text: showShortLabels ?
							Messages.SEARCH_PICTURE_SHORT :
							Messages.SEARCH_PICTURE
				},
				ready: {
					text: Messages.LOAD
				},
				uploading: {
					text: Messages.LOADING,
					loading: true
				}
			},
			listeners: {
				scope: this,
				loadsuccess: function (dataurl, e) {
					this.drawLogo(dataurl);
				},
				loadfailure: function (message) {
					Ext.Msg.alert(Messages.ERROR, Messages.GRID_ERROR_LOADING_IMAGE_FS);
					console.log("Error while loading image: " + message);
				}
			}
		});
		
		this.uploadTextfield = Ext.create('Ext.form.Text', {
			label: Messages.SELECT_PICTURE_FS,
			placeHolder: 'http://',
			hidden: true,
			flex: 3
		});
		
		this.sendButton = Ext.create('Ext.Button', {
			ui: 'action',
			hidden: true,
			text: Messages.SEND,
			style: {
				'height': '1em',
				'margin-top': '7.5px',
				'margin-left': '10px'
			},
			handler: Ext.bind(function () {
				var url = this.uploadTextfield.getValue();							
				this.drawLogo(url);
			}, this)
		});
		
		this.segmentButton = Ext.create('Ext.SegmentedButton', {
			allowDepress: false,
			cls: this.config.activateTemplates ? 'abcOptions' : 'yesnoOptions',
			style: {
				'margin-top': '0px',
				'margin-bottom': '30px'
			},
			defaults: {
				ui: 'action'
			},
			items: [{text: showShortLabels ?
					Messages.SELECT_PICTURE_URL_SHORT :
					Messages.SELECT_PICTURE_URL,
					handler: this.toggleUploadTextfieldVisibility,
					scope: this
					} ,this.buttonUploadFromFS]
		});
		
		this.exportOptions = Ext.create('Ext.form.FieldSet', {
			title: Messages.SESSIONPOOL_AUTHORINFO,
			text : Messages.EXPORT_MSG,
			items : [ this.teacherName, this.university,
					this.licence, this.subject, this.email  ]
		});
		
		this.exportOptionalOptions = Ext.create('Ext.form.FieldSet',{
			title: 'Logo',
			items: [{
				xtype: 'fieldset',
				layout: 'hbox',
				cls: 'fileUploadFieldset',
				items: [
					this.uploadTextfield,
					this.sendButton
				]
			},{xtype: 'fieldset',
				cls: 'fileUploadButtonFieldset',
				items: [this.segmentButton]
			}
			]
		});
		
		 this.logo = Ext.create('Ext.Img', {
	            id: 'logo',
	            style: {
					'margin': '0px auto',
					'width': '50%'
				},
	            width: 100,
	            height: 100,
	            hidden: true
	        });
		 
		this.mainPart = Ext.create('Ext.form.FormPanel', {
			cls : 'newQuestion',
			scrollable : null,
			items : [ this.exportOptions, 
			          this.exportOptionalOptions, 
			          {
						xtype: 'fieldset',
						layout: 'vbox',
						items: [this.logo ]
			          }]
		});
		
		this.add([ this.toolbar, this.mainPart]);
	},

	ValidateInput : function(button, e, options) {
		var scope = this;
		var me = button.up('SessionExportToPublicPanel');

		var validation = Ext.create('ARSnova.model.PublicPool', {
			name:	    me.teacherName.getValue(),
			hs:		    me.university.getValue(),
			logo:	    me.logo.getSrc(),
			subject:	me.subject.getValue(),
			licence:	me.licence.getValue(),
			email:		me.email.getValue()
		});
		
		
		console.log('get fields',validation.getFields());
		var errs = validation.validate();
		console.log('errors',errs);
		var msg = '';

		if (!errs.isValid()) {
			console.log('errors',errs);
			errs.each(function(err) {
				
				if(err.getField() == 'name')
					msg += Messages.EXPORT_FIELD_NAME; 
				
				else if(err.getField() == 'email')
					msg += Messages.EXPORT_FIELD_EMAIL;
				
				if(err.getField() == 'hs')
					msg += Messages.EXPORT_FIELD_UNI;
				
				if(err.getField() == 'subject')
					msg += Messages.EXPORT_FIELD_SUBJECT;
				
				if(err.getField() == 'licence')
					msg += Messages.EXPORT_FIELD_LICENCE;
				
				msg += ':\t' +err.getMessage();			
				msg += '<br/>';
			});

			Ext.Msg.alert(Messages.SESSIONPOOL_NOTIFICATION, msg);
			
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
	},
	
	toggleUploadTextfieldVisibility: function() {
		this.uploadTextfield.setHidden(this.toggleUrl);
		this.sendButton.setHidden(this.toggleUrl);
			
		if(this.toggleUrl) {
			this.toggleUrl = false;
			this.addCls('hiddenUrl');
		} else {
			this.toggleUrl = true;	
			this.removeCls('hiddenUrl');
		}
	},
	
	drawLogo: function (logoImg) {
		this.logo.setHidden(false);
		this.logo.setSrc(logoImg);
		this.uploadTextfield.setHidden(true);
		this.sendButton.setHidden(true);	
		this.toggleUrl = true;	
	},
});