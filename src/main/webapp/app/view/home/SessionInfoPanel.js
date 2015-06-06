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
	extend: 'Ext.Panel',
	alias: 'widget.SessionInfoPanel',

	config: {
		sessionInfo: null,
		backReference: null,
		referencePanel: null,
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	requires: ['Ext.ux.Fileup'],

	initialize: function () {
		this.callParent(arguments);
		var me = this;
		var config = ARSnova.app.globalConfig;

		// Check if this feauture is enabled - if not do not use these fields
		if (config.features.publicPool) {
			var SubjectoptionsPP = [];	// save loaded subjects
			var LicenceoptionsPP = [];  // save loaded lincences
			var levelsPP = [];  // save loaded levels

			var maxFileSize = config.publicPool.logoMaxFilesize / 1024;

			var subjects = config.publicPool.subjects.split(',');

			subjects.forEach(function (entry) {
				SubjectoptionsPP.push({text: entry, value: entry});
			});

			var licenses = config.publicPool.licenses.split(',');

			licenses.forEach(function (entry) {
				LicenceoptionsPP.push({text: entry, value: entry});
			});

			var levels;
			if (moment.lang() === "en") {
				levels = config.publicPool.levelsEn.split(',');
			} else {
				levels = config.publicPool.levelsDe.split(',');
			}

			levels.forEach(function (entry) {
				levelsPP.push({text: entry, value: entry});
			});
		} else {
			var maxFileSize = 100; // Just a placeholder - not final
		}

		var screenWidth = (window.innerWidth > 0) ?
				window.innerWidth :	screen.width;
		var showShortLabels = screenWidth < 480;

		this.matrixButtonPanel = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			}
		});

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			handler: function () {
				var xTP = me.getReferencePanel();
				xTP.animateActiveItem(me.getBackReference(), {
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
			handler: function () {
				var panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.newSessionPanel;
				me.Validate();
				if (me.getSessionInfo().keyword) {
					var sessionInfo = me.getSessionInfo();
					sessionInfo.name = me.sessionName.getValue();
					sessionInfo.shortName = me.sessionShortName.getValue();
					sessionInfo.ppAuthorName = me.creatorName.getValue();
					sessionInfo.ppAuthorMail = me.email.getValue();
					sessionInfo.ppUniversity = me.university.getValue();
					sessionInfo.ppFaculty = me.faculty.getValue();
					sessionInfo.ppDescription = me.description.getValue();
					ARSnova.app.getController('Sessions').update(sessionInfo);

					var xTP = me.getReferencePanel();
					xTP.animateActiveItem(me.getBackReference(), {
						type: 'slide',
						direction: 'right',
						duration: 700
					});
				} else {
					ARSnova.app.getController('Sessions').create({
						name: me.sessionName.getValue(),
						shortName: me.sessionShortName.getValue(),
						ppAuthorName: me.creatorName.getValue(),
						ppAuthorMail: me.email.getValue(),
						ppUniversity: me.university.getValue(),
						ppFaculty: me.faculty.getValue(),
						ppDescription: me.description.getValue(),
						newSessionPanel: panel,
						creationTime: Date.now()
					});
				}
			},
			scope: this
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.SESSION_INFO_TITLE,
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				{
					xtype: 'spacer'
				},
				this.saveButton
			]
		});

		this.creatorName = Ext.create('Ext.field.Text', {
			name: 'name',
			label: Messages.EXPORT_FIELD_NAME,
			maxLength: 50,
			placeHolder: 'max. 50 ' + Messages.SESSIONPOOL_CHARACTERS,
			value: me.getSessionInfo().ppAuthorName,
			clearIcon: true
		});

		this.email = Ext.create('Ext.field.Text', {
			name: 'email',
			label: Messages.EXPORT_FIELD_EMAIL,
			vtype: 'email',
			maxLength: 50,
			placeHolder: 'max. 50 ' + Messages.SESSIONPOOL_CHARACTERS,
			value: me.getSessionInfo().ppAuthorMail,
			clearIcon: true
		});

		this.university = Ext.create('Ext.field.Text', {
			name: 'hs',
			label: Messages.EXPORT_FIELD_UNI,
			maxLength: 50,
			placeHolder: 'max. 50 ' + Messages.SESSIONPOOL_CHARACTERS,
			value: me.getSessionInfo().ppUniversity,
			clearIcon: true
		});

		this.faculty = Ext.create('Ext.field.Text', {
			name: 'faculty',
			label: Messages.EXPORT_FIELD_SPECIAL_FIELD,
			placeHolder: 'max. 50 ' + Messages.SESSIONPOOL_CHARACTERS,
			value: me.getSessionInfo().ppFaculty,
			maxLength: 50,
			clearIcon: true
		});

		this.creatorFieldSet = Ext.create('Ext.form.FieldSet', {
			title: Messages.SESSIONPOOL_AUTHORINFO,
			cls: 'standardFieldset',
			itemId: 'contentFieldset',
			items: [this.creatorName, this.email, this.university, this.faculty]
		});

		this.sessionName = Ext.create('Ext.field.Text', {
			name: 'sessionName',
			label: Messages.SESSION_NAME,
			maxLength: 50,
			placeHolder: 'max. 50 ' + Messages.SESSIONPOOL_CHARACTERS,
			value: localStorage.getItem('name'), //me.getSessionInfo().name,
			clearIcon: true
		});

		this.sessionShortName = Ext.create('Ext.field.Text', {
			name: 'sessionShortName',
			label: Messages.SESSION_SHORT_NAME,
			maxLength: 8,
			placeHolder: 'max. 8 ' + Messages.SESSIONPOOL_CHARACTERS,
			value: localStorage.getItem('shortName'), //me.getSessionInfo().shortName,
			clearIcon: true
		});

		this.description = Ext.create('Ext.plugins.ResizableTextArea', {
			name: 'description',
			label: Messages.SESSIONPOOL_INFO,
			inputCls: 'thm-grey',
			maxLength: 150,
			placeHolder: 'max. 150 ' + Messages.SESSIONPOOL_CHARACTERS,
			value: me.getSessionInfo().ppDescription,
			disabled: false
		});

		this.markdownEditPanel = Ext.create('ARSnova.view.MarkDownEditorPanel', {
			processElement: this.description
		});

		if (config.features.publicPool) {
			this.subject = Ext.create('Ext.field.Select', {
				name: 'subject',
				label: Messages.EXPORT_FIELD_SUBJECT,
				maxLength: 50,
				placeHolder: 'max. 50 ' + Messages.SESSIONPOOL_CHARACTERS
			});
			this.subject.updateOptions(SubjectoptionsPP);


			this.licence = Ext.create('Ext.field.Select', {
				name: 'licence',
				label: Messages.EXPORT_FIELD_LICENCE,
				maxLength: 50,
				placeHolder: 'max. 50 ' + Messages.SESSIONPOOL_CHARACTERS
			});
			this.licence.updateOptions(LicenceoptionsPP);

			this.level = Ext.create('Ext.field.Select', {
				name: 'level',
				label: Messages.EXPORT_FIELD_LEVEL,
				maxLength: 50,
				placeHolder: 'max. 50 ' + Messages.SESSIONPOOL_CHARACTERS
			});
			this.level.updateOptions(levelsPP);

			this.sessionFieldSet = Ext.create('Ext.form.FieldSet', {
				title: Messages.SESSIONPOOL_SESSIONINFO,
				cls: 'standardFieldset',
				itemId: 'contentFieldset',
				items: [this.sessionName, this.sessionShortName, this.markdownEditPanel, this.description, this.subject, this.licence, this.level]
			});
		} else {
			this.sessionFieldSet = Ext.create('Ext.form.FieldSet', {
				title: Messages.SESSIONPOOL_SESSIONINFO,
				cls: 'standardFieldset',
				itemId: 'contentFieldset',
				items: [this.sessionName, this.sessionShortName, this.markdownEditPanel, this.description]
			});
		}

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
				var url = me.uploadTextfield.getValue();
				me.drawLogo(url);
			}, this)
		});

		this.segmentButton = Ext.create('Ext.SegmentedButton', {
			allowDepress: false,
			cls: this.config.activateTemplates ? 'abcOptions' : 'yesnoOptions',
			style: {
				'margin-top': '0px',
				'margin-bottom': '0px'
			},
			defaults: {
				ui: 'action'
			},
			items: [
				{
					text: showShortLabels ?
						Messages.SELECT_PICTURE_URL_SHORT :
						Messages.SELECT_PICTURE_URL,
					handler: this.toggleUploadTextfieldVisibility,
					scope: this
				},
				this.buttonUploadFromFS
			]
		});

		this.exportOptionalOptions = Ext.create('Ext.form.FieldSet', {
			title: 'Logo (max. ' + maxFileSize + ' kb)',
			items: [{
				xtype: 'fieldset',
				layout: 'hbox',
				cls: 'fileUploadFieldset',
				items: [
					this.uploadTextfield,
					this.sendButton
				]
			}, {
				xtype: 'fieldset',
				cls: 'fileUploadButtonFieldset',
				items: [this.segmentButton]
			}
			]
		});

		this.logo = Ext.create('Ext.Img', {
			style: 'margin: 0px auto; width: 100px; height: 100px; background-size: contain',
			src: '',
			width: 100,
			height: 100,
			hidden: true
		});

		this.mainPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,
			items: [
				this.creatorFieldSet,
				this.sessionFieldSet,
				this.exportOptionalOptions,
				{
					xtype: 'fieldset',
					layout: 'vbox',
					items: [this.logo]
				}, {
					xtype: 'fieldset',
					layout: 'vbox',
					items: [this.matrixButtonPanel]
				}
			]
		});

		if (ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER) {
			me.creatorName.disable();
			me.creatorName.setPlaceHolder('');
			me.email.setPlaceHolder('');
			me.sessionName.disable();
			me.sessionName.setPlaceHolder('');
			me.sessionShortName.disable();
			me.sessionShortName.setPlaceHolder('');
			me.description.disable();
			me.description.setPlaceHolder('');
			me.markdownEditPanel.hide();
			me.creatorFieldSet.disable();
			me.university.disable();
			me.university.setPlaceHolder('');
			me.faculty.disable();
			me.faculty.setPlaceHolder('');
			me.subject.disable();
			me.licence.disable();
			me.level.disable();
			me.saveButton.hide();
			me.segmentButton.hide();
			me.exportOptionalOptions.hide();
		}
		this.add([this.toolbar, this.mainPart]);
	},

	Validate: function () {
		if (this.sessionName.getValue() === "") {
			this.sessionName.addCls("required");
		} else {
			this.sessionName.removeCls("required");
		}
		if (this.sessionShortName.getValue() === "") {
			this.sessionShortName.addCls("required");
		} else {
			this.sessionShortName.removeCls("required");
		}
	},

	toggleUploadTextfieldVisibility: function () {
		this.uploadTextfield.setHidden(this.toggleUrl);
		this.sendButton.setHidden(this.toggleUrl);

		if (this.toggleUrl) {
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
	}
});
