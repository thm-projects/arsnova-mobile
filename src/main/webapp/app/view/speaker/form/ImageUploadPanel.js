/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Panel for skill question image upload
 - Autor(en):    Daniel Gerhardt <daniel.gerhardt@mni.thm.de>, Artjom Siebert <artjom.siebert@mni.thm.de>
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
Ext.define('ARSnova.view.speaker.form.ImageUploadPanel', {
	extend: 'Ext.Panel',

	requires: ['Ext.ux.Fileup'],

	config: {
		xtype: 'upField',
		layout: 'vbox',

		handlerScope: null,
		urlUploadHandler: Ext.emptyFn,
		fsUploadHandler: Ext.emptyFn
	},

	initialize: function () {
		this.callParent(arguments);

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
				itemId: 'fs_upfield',
				xtype: 'fieldset',
				title: Messages.EDIT_PICTURE,
				docked: 'top'
			},
			{
				id: 'pnl_upfield',
				xtype: 'panel',
				layout: 'vbox',
				items: [
					{
						itemId: 'tf_url',
						xtype: 'textfield',
						label: Messages.SELECT_PICTURE_FS,
						name: 'tf_url',
						placeHolder: 'http://',
						docked: 'top'
					},
					{
						xtype: 'spacer',
						height: 50,
						docked: 'top'
					},
					{
						docked: 'bottom',
						xtype: 'panel',
						layout: 'hbox',
						defaults: {
							flex: 1
						},
						items: [
							this.buttonUploadFromFS,
							{
								xtype: 'spacer'
							},
							{
								xtype: 'button',
								text: Messages.SELECT_PICTURE_URL,
								handler: Ext.bind(function () {
									var url = this.getComponent('pnl_upfield').getComponent('tf_url').getValue();
									Ext.bind(this.getUrlUploadHandler(), this.getHandlerScope())(url);
								}, this)
							}
						]
					}
				]
			}
		]);
	},

	setUrl: function (url) {
		this.getComponent('pnl_upfield').getComponent('tf_url').setValue(url);
	}
});
