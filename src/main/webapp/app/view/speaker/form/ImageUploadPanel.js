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
Ext.define('ARSnova.view.speaker.form.ImageUploadPanel', {
	extend: 'Ext.Panel',

	requires: [
		'Ext.ux.Fileup',
		'ARSnova.view.speaker.form.GridModerationTemplateCarousel'
	],

	config: {
		xtype: 'upField',
		layout: 'vbox',

		cls: 'centerFormTitle',

		handlerScope: null,
		activateTemplates: true,
		addRemoveButton: false,
		urlUploadHandler: Ext.emptyFn,
		fsUploadHandler: Ext.emptyFn,
		toggleUrl: true,
		gridMod: null,
		templateHandler: Ext.emptyFn
	},

	initialize: function () {
		this.callParent(arguments);

		if (this.config.toggleUrl) {
			this.addCls('hiddenUrl');
		}

		var screenWidth = (window.innerWidth > 0) ?
				window.innerWidth :	screen.width;
		var showShortLabels = screenWidth < 590;
		var showLongLabelsAndTemplate = !showShortLabels && this.config.activateTemplates;

		this.gridMod = Ext.create('ARSnova.view.speaker.form.GridModerationTemplateCarousel', {
			saveHandlerScope: this,
			templateAdoptionHandler: this.adoptTemplate
		});

		this.buttonUploadFromFS = Ext.create('Ext.ux.Fileup', {
			xtype: 'fileupload',
			autoUpload: true,
			loadAsDataUrl: true,
			width: showLongLabelsAndTemplate ? '20%' : '',
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
					var fileSizeCheck = this.checkFilesize(dataurl);
					if (fileSizeCheck) {
						if (fileSizeCheck !== true) {
							//The response of checkFilesize was the compressed base64 encoded String, see doc of checkFilesize
<<<<<<< HEAD
							console.log("Image was compressed to " + fileSizeCheck);
							dataurl = fileSizeCheck;
						}
						else {
							console.log("Image wasn't compressed!");
						}
=======
							dataurl = fileSizeCheck;
						}
>>>>>>> 0241e98... worked on ticket #15221
						if (this.config.addRemoveButton) {
							this.removeButton.show();
							this.segmentButton.hide();
						}
						Ext.bind(this.getFsUploadHandler(), this.getHandlerScope())(dataurl, true);
					}
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
			cls: !this.config.activateTemplates ? 'yesnoOptions' : 'abcOptions',
			style: 'margin-top: 0px; margin-bottom: 0px;',
			defaults: {
				ui: 'action'
			},
			items: [{
				text: showShortLabels ?
				Messages.SELECT_PICTURE_URL_SHORT :
				Messages.SELECT_PICTURE_URL,
				width: showLongLabelsAndTemplate ? '25%' : '',
				handler: this.toggleUploadTextfieldVisibility,
				scope: this
			}, this.buttonUploadFromFS, {
				text: showShortLabels ?
				Messages.TEMPLATE :
				Messages.TEMPLATE_FOR_MODERATION,
				width: showLongLabelsAndTemplate ? '55%' : '',
				hidden: !this.config.activateTemplates,
				scope: this,
				handler: function () {
					var tabPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
					tabPanel.setActiveItem(this.gridMod);
				}
			}]
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
				if (this.config.addRemoveButton) {
					this.removeButton.show();
					this.segmentButton.hide();
				}
				Ext.bind(this.getUrlUploadHandler(), this.getHandlerScope())(url);
			}, this)
		});

		this.removeButton = Ext.create('Ext.Button', {
			ui: 'action',
			hidden: true,
			text: Messages.REMOVE_PICTURE,
			cls: 'yesnoOptions',
			style: 'margin-top: 0px; margin-bottom: 0px;',
			scope: this,
			handler: function () {
				if (this.config.addRemoveButton) {
					this.removeButton.hide();
					this.segmentButton.show();
				}
				Ext.bind(this.getFsUploadHandler(), this.getHandlerScope())(null, true);
			}
		});

		var filesizeString = Math.round((parseInt(ARSnova.app.globalConfig.maxUploadFilesize / 1024))) + "KB";

		this.add([{
			xtype: 'formpanel',
			width: '100%',
			scrollable: null,
			items: [this.containerFieldSet = Ext.create('Ext.form.FieldSet', {
					layout: 'hbox',
					cls: 'fileUploadFieldset',
					title: Messages.PICTURE_SOURCE,
					items: [
						this.uploadTextfield,
						this.sendButton
					]
			}), {
				xtype: 'fieldset',
				cls: showLongLabelsAndTemplate ?
				'fileUploadButtonFieldset longText' :
				'fileUploadButtonFieldset',
				items: [this.segmentButton]
			}, this.removeButton, {
				cls: 'gravure',
				style: 'font-size: 0.9em;',
				hidden: isNaN(ARSnova.app.globalConfig.maxUploadFilesize),
				html: Messages.PICTURE_MAX_FILESIZE.replace(/###/, filesizeString)
			}]
		}]);
	},

	setUploadPanelConfig: function (title, urlHandler, fsUploadHandler) {
		this.containerFieldSet.setTitle(title);

		if (urlHandler) {
			this.setUrlUploadHandler(urlHandler);
		}
		if (fsUploadHandler) {
			this.setFsUploadHandler(fsUploadHandler);
		}
	},

	resetButtons: function () {
		this.removeButton.hide();
		this.segmentButton.show();
	},

	/**
	 * Checks the file size of the given base64 encoded String
	 * @param url The base64 encoded String
	 * @return true if the given base64 encoded String is smaller than the allowed file size, otherwise false
	 * @note This function returns a compressed version of the given base64 encoded String if the file size was greater
<<<<<<< HEAD
	 * than the allowed size and the compression was successfully (On check with less typesafety this will be true)
=======
	 * than the allowed size and the compression was successfully
>>>>>>> 0241e98... worked on ticket #15221
	 */
	checkFilesize: function (url) {
		var head = 'data:image/png;base64,';
		var imgFileSize = Math.round((url.length - head.length) * 3 / 4);
		var compressed = false;

		if (!isNaN(ARSnova.app.globalConfig.maxUploadFilesize)) {
			if (imgFileSize > ARSnova.app.globalConfig.maxUploadFilesize) {
<<<<<<< HEAD
				url = this.compress(url, (Math.max(1.0, Math.min(100.0, 100.0 / (imgFileSize / ARSnova.app.globalConfig.maxUploadFileSize)))).toFixed(2));
				imgFileSize = Math.round((url.length - head.length) * 3 / 4);
				compressed = true;
			}
			//2nd check if the compression didn't succeed (maximal compression = 1% of the original)
=======
				url = jic.compress(url, (Math.max(1.0, Math.min(100.0, 100.0 * (1.0 / (imgFileSize / ARSnova.app.globalConfig.maxUploadFileSize))))).toFixed(2), "png");
				imgFileSize = Math.round((url.length - head.length) * 3 / 4);
				compressed = true;
			}
>>>>>>> 0241e98... worked on ticket #15221
			if (imgFileSize > ARSnova.app.globalConfig.maxUploadFilesize) {
				var msgTemp = Messages.GRID_ERROR_FILE_SIZE.replace(/%%%/, Math.round((imgFileSize / 1024)) + "KB");
				var filesizeString = Math.round(parseInt(ARSnova.app.globalConfig.maxUploadFilesize / 1024)) + "KB";
				Ext.Msg.alert(Messages.GRID_ERROR_IMAGE_NOT_LOADED, msgTemp.replace(/###/, filesizeString));
				return false;
			}
		}

		return compressed ? url : true;
<<<<<<< HEAD
	},

	compress: function(source, quality) {
		var cvs = document.createElement('canvas');
		cvs.width = source.naturalWidth;
		cvs.height = source.naturalHeight;
		cvs.getContext("2d").drawImage(source, 0, 0);
		var result = new Image();
		result.src = cvs.toDataURL("png", quality / 100);
		return result;
=======
>>>>>>> 0241e98... worked on ticket #15221
	},

	toggleUploadTextfieldVisibility: function () {
		this.uploadTextfield.setHidden(this.toggleUrl);
		this.sendButton.setHidden(this.toggleUrl);

		if (this.toggleUrl) {
//			this.toggleUrl = false;
			this.addCls('hiddenUrl');
			console.log('toggleUrl');
		} else {
//			this.toggleUrl = true;
			this.removeCls('hiddenUrl');
		}
	},

	setUrl: function (url) {
		this.uploadTextfield.setValue(url);
	},

	adoptTemplate: function (grid) {
		Ext.bind(this.getTemplateHandler(), this.getHandlerScope())(grid);
	}
});
