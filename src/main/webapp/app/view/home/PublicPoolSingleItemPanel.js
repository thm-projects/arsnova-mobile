/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2019 The ARSnova Team and Contributors
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
Ext.define('ARSnova.view.home.PublicPoolSingleItemPanel', {
	extend: 'Ext.Panel',

	config: {
		backRef: null,
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		session: null
	},

	constructor: function () {
		this.callParent(arguments);

		var me = this;
		var screenWidth = (window.innerWidth > 0) ?
				window.innerWidth :	screen.width;
		var showShortLabels = screenWidth < 480;

		//
		// Toolbar items
		//

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			handler: function () {
				me.getBack();
			}
		});

		this.exportButton = Ext.create('Ext.Button', {
			text: Messages.SESSIONPOOL_CLONE,
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 89px',
			handler: function () {
				me.cloneSession();
			},
			scope: this
		});

		this.visitButton = Ext.create('Ext.Button', {
			text: Messages.SESSIONPOOL_VISIT,
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 89px',
			sessionObj: this.getSession(),
			handler: function (options) {
				me.visitSession(options);
			},
			scope: this
		});

		this.visitMatrixButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.SESSIONPOOL_VISIT,
			buttonConfig: 'icon',
			imageCls: 'icon-sign-in',
			scope: this,
			sessionObj: this.getSession(),
			handler: function (options) {
				me.visitSession(options);
			}
		});

		this.visitMatrixButtonPanel = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			items: [this.visitMatrixButton]
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.SESSIONPOOL_INFOS,
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				{xtype: 'spacer'},
				(ARSnova.app.userRole === ARSnova.app.USER_ROLE_STUDENT) ? this.visitButton : this.exportButton
			]
		});


		this.sessionName = Ext.create('Ext.field.Text', {
			label: Messages.SESSION_NAME,
			name: 'sessionName',
			value: this.getSession().name,
			disabledCls: 'disableDefault',
			maxLength: 50,
			disabled: false
		});

		this.sessionShortName = Ext.create('Ext.field.Text', {
			label: Messages.SESSION_SHORT_NAME,
			name: 'sessionShortName',
			value: this.getSession().shortName,
			disabledCls: 'disableDefault',
			maxLength: 8,
			disabled: false
		});

		this.descriptionPanel = Ext.create('Ext.Panel', {
			layout:	{
				type: 'hbox',
				pack: 'center',
				align: 'start'
			},
			style: {
				'margin-top': '30px'
			}
		});

		if (this.getSession().ppLogo) {
			this.logoContainer = Ext.create('Ext.Container', {
				flex: showShortLabels ? 2 : 1,
				layout: {
					pack: 'center',
					align: 'center'
				},
				style: {
					'padding-top': '25px',
					'text-align': 'left'
				},
				html: '<img src="' + this.getSession().ppLogo + '" style="width: 100%; max-width: 100px;"></img>'
			});

			this.descriptionPanel.add(this.logoContainer);
		}

		if (this.getSession().ppDescription) {
			this.markdownPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
				xtype: 'mathJaxMarkDownPanel',
				id: 'questionContent',
				style: 'background-color: transparent; color: black; ',
				flex: 4
			});

			this.markdownPanel.setContent(this.getSession().ppDescription, true, true);

			this.descriptionPanel.add(this.markdownPanel);
		}

		this.sessionNumQuestions = Ext.create('Ext.field.Text', {
			label: Messages.QUESTIONS,
			name: 'sessionNumQuestions',
			value: this.getSession().numQuestions,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.sessionLicense = Ext.create('Ext.field.Text', {
			label: Messages.EXPORT_FIELD_LICENCE,
			name: 'sessionLicense',
			value: this.getSession().ppLicense,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.sessionFieldSet = Ext.create('Ext.form.FieldSet', {
			title: Messages.SESSIONPOOL_SESSIONINFO,
			cls: 'standardFieldset',
			itemId: 'contentFieldset',
			items: [this.sessionName, this.sessionShortName, this.sessionNumQuestions, this.sessionLicense]
		});

		//
		// Create Creator Fieldset
		//

		this.creatorName = Ext.create('Ext.field.Text', {
			label: Messages.EXPORT_FIELD_NAME,
			name: 'creatorName',
			value: this.getSession().ppAuthorName,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.creatorMail = Ext.create('Ext.field.Text', {
			label: Messages.EXPORT_FIELD_EMAIL,
			name: 'creatorMail',
			value: this.getSession().ppAuthorMail,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.creatorUni = Ext.create('Ext.field.Text', {
			label: Messages.EXPORT_FIELD_UNI,
			name: 'creatorUni',
			value: this.getSession().ppUniversity,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.creatorDep = Ext.create('Ext.field.Text', {
			label: Messages.EXPORT_FIELD_SPECIAL_FIELD,
			name: 'creatorDep',
			value: this.getSession().ppFaculty,
			disabledCls: 'disableDefault',
			disabled: true
		});

		this.copyButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.SESSIONPOOL_CLONE,
			buttonConfig: 'icon',
			imageCls: 'icon-copy',
			scope: this,
			handler: function () {
				me.cloneSession();
			}
		});

		this.matrixButtonPanel = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			items: [this.copyButton]
		});

		this.creatorFieldSet = Ext.create('Ext.form.FieldSet', {
			title: Messages.SESSIONPOOL_AUTHORINFO,
			cls: 'standardFieldset',
			itemId: 'contentFieldset',
			items: [this.creatorName, this.creatorMail, this.creatorUni, this.creatorDep]
		});

		this.descriptionFieldSet = Ext.create('Ext.form.FieldSet', {
			cls: 'standardFieldset',
			itemId: 'contentFieldset',
			hidden: !this.getSession().ppLogo,
			items: [this.descriptionPanel]
		});

		this.contentForm = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			itemId: 'contentForm',
			items: [
				this.descriptionFieldSet,
				this.sessionFieldSet,
				this.creatorFieldSet,
				(ARSnova.app.userRole === ARSnova.app.USER_ROLE_STUDENT) ? this.visitMatrixButtonPanel : this.matrixButtonPanel
			]
		});

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_STUDENT) {
			this.matrixButtonPanel.hide();
		} else if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			this.matrixButtonPanel.setHidden(false);
		}

		this.add([
			this.toolbar,
			this.contentForm
		]);
	},

	getBack: function () {
		var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;

		hTP.animateActiveItem(this.getBackRef(), {
			type: 'slide',
			direction: 'right'
		});
	},

	visitSession: function (options) {
		// reset view stack of hometabpanel to ensure session overview will be shown onBack
		var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
		hTP.animateActiveItem(hTP.homePanel, {
			type: 'slide'
		});

		var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_LOGIN);
		ARSnova.app.getController('Auth').roleSelect({
			mode: ARSnova.app.USER_ROLE_STUDENT
		});
		ARSnova.app.getController('Sessions').login({
			keyword: options.config.sessionObj.keyword
		});
		hideLoadMask();
	},

	cloneSession: function () {
		var customSessionAttributes = {};
		customSessionAttributes.name = this.sessionName.getValue();
		customSessionAttributes.shortName = this.sessionShortName.getValue();
		ARSnova.app.getController("SessionExport").cloneSessionFromPublicPool(this.getSession(), customSessionAttributes);
	}
});
