/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
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
Ext.define('ARSnova.view.speaker.form.ImageUploadPanel', {
	extend: 'Ext.Panel',

	requires: ['Ext.ux.Fileup',
	           'ARSnova.view.speaker.form.GridModerationTemplateCarousel'],

	config: {
		xtype: 'upField',
		layout: 'vbox',
		
		cls: 'centerFormTitle',
		
		handlerScope: null,
		activateTemplates: true,
		urlUploadHandler: Ext.emptyFn,
		fsUploadHandler: Ext.emptyFn,
		toggleUrl: true,
		gridMod: null, 
		templateHandler: Ext.emptyFn
	},

	initialize: function () {
		this.callParent(arguments);
		
		if(this.config.toggleUrl) {
			this.addCls('hiddenUrl');
		}
		
		var screenWidth = (window.innerWidth > 0) ?
				window.innerWidth :	screen.width;
		var showShortLabels = screenWidth < 480;
		
		this.gridMod = Ext.create('ARSnova.view.speaker.form.GridModerationTemplateCarousel', {
			saveHandlerScope: this,
			templateAdoptionHandler: this.adoptTemplate
		});
		
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
					Ext.bind(this.getFsUploadHandler(), this.getHandlerScope())(dataurl, true);
				},
				loadfailure: function (message) {
					Ext.Msg.alert(Messages.ERROR, Messages.GRID_ERROR_LOADING_IMAGE_FS);
					console.log("Error while loading image: " + message);
				}
			}
		});

		this.buttonUploadFromFS.on({
			loadsuccess: 'onFileLoadSuccess',
			loadfailure: 'onFileLoadFailure'
		});

		this.segmentButton = Ext.create('Ext.SegmentedButton', {
			allowDepress: false,
			cls: this.config.activateTemplates ? 'abcOptions' : 'yesnoOptions',
			style: {
				'margin-bottom': '30px'
			},
			defaults: {
				ui: 'action'
			},
			items: [{
				text: showShortLabels ?
				Messages.SELECT_PICTURE_URL_SHORT :
				Messages.SELECT_PICTURE_URL,
				handler: this.toggleUploadTextfieldVisibility,
				scope: this
			}, {
				text: Messages.TEMPLATE,
				hidden: !this.config.activateTemplates,
				scope: this,
				handler: function () {
					var tabPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;	
					tabPanel.setActiveItem(this.gridMod);
				}
			}, this.buttonUploadFromFS]
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
				Ext.bind(this.getUrlUploadHandler(), this.getHandlerScope())(url);
			}, this)
		});
		
		this.add([{
			xtype: 'fieldset',
			layout: 'hbox',
			cls: 'fileUploadFieldset',
			title: Messages.EDIT_PICTURE,	
			items: [
				this.uploadTextfield,
				this.sendButton
			]
		}, this.segmentButton]);
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

	setUrl: function (url) {
		this.uploadTextfield.setValue(url);
	},
	
	adoptTemplate: function(grid) {
		Ext.bind(this.getTemplateHandler(), this.getHandlerScope())(grid);
	},
});
