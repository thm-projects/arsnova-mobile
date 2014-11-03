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
		
		handlerScope: null,
		urlUploadHandler: Ext.emptyFn,
		fsUploadHandler: Ext.emptyFn,
		toggleUrl: true,
		gridMod: null, 
		templateHandler: Ext.emptyFn
	},

	initialize: function () {
		var thiz = this;
		this.callParent(arguments);
		
		this.gridMod = Ext.create('ARSnova.view.speaker.form.GridModerationTemplateCarousel', {
			saveHandlerScope: thiz,
			templateAdoptionHandler: thiz.adoptTemplate
		});
		
		this.buttonTemplate = Ext.create('Ext.Button',
		 {
			text: Messages.TEMPLATE ,
			handler: function () {
				
				var tabPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;	
				tabPanel.setActiveItem(thiz.gridMod);
			}
		 }		
		);
		
		this.buttonUploadFromFS = Ext.create('Ext.ux.Fileup', {
			//itemId: 'buttonUploadFromFS',
			xtype: 'fileupload',
			autoUpload: true,
			loadAsDataUrl: true,
			states: {
				browse: {
					text: Messages.SEARCH_PICTURE
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

		this.add([
			{
				itemId: 'pnl_upfield',
				xtype: 'fieldset',
				cls: 'file-upload-panel',
				layout: 'vbox',
				title: Messages.EDIT_PICTURE,
				items: [
					{
						itemId:	 'pnl_url',
						xtype:	'panel',
						layout: 'hbox',
						hidden: true,
											
					items: [	
					    {
							itemId: 'tf_url',
							xtype: 'textfield',
							label: Messages.SELECT_PICTURE_FS,
							name: 'tf_url',
							placeHolder: 'http://',
							flex:	3
						},
						{
							itemId: 'btn_url',
							xtype:	'button',
							text:	'Send',
							name:	'btn_url',
							handler: Ext.bind(function () {
								var url = this.getComponent('pnl_upfield').getComponent('pnl_url').getComponent('tf_url').getValue();							
								Ext.bind(this.getUrlUploadHandler(), this.getHandlerScope())(url);
							}, this)
						}]
					},
					{
						xtype: 'panel',
						layout: 'hbox',
						defaults: {
							flex: 2
						},
						style: 'margin-top: 0.5em',
						items: [
							{
								xtype: 'button',
								text: Messages.SELECT_PICTURE_URL,
								handler: Ext.bind(function () {
									var url = this.getComponent('pnl_upfield').getComponent('pnl_url');
									url.setHidden(this.toggleUrl);	
									
									if(this.toggleUrl)
										this.toggleUrl = false
									else
										this.toggleUrl = true
							
								}, this)
							},
							{
								xtype: 'spacer',
								flex: 1
							},
							this.buttonTemplate,
							{
								xtype: 'spacer',
								flex: 1
							},
							
							this.buttonUploadFromFS
						]
					}
				]
			}
		]);
	},

	setUrl: function (url) {
		this.getComponent('pnl_upfield').getComponent('pnl_url').getComponent('tf_url').setValue(url);
	},
	
	adoptTemplate: function(grid) {
		Ext.bind(this.getTemplateHandler(), this.getHandlerScope())(grid);
	},
});
