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
Ext.define('ARSnova.view.home.PublicPoolSingleItemPanel', {
	extend: 'Ext.Panel',

	config: {
		title: 'PublicPoolSingleItemPanel',
		keyword: 0,
		questionCount: 0,
		backRef: null,
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		session: null
	},

	constructor: function (args) {
		this.callParent(arguments);

		var me = this;
		
		//
		// Toolbar items
		//
		
		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			handler: function () {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				
				console.log(this);
				hTP.animateActiveItem(this.getBackRef(), {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});
		
		this.exportButton = Ext.create('Ext.Button', {
			text: Messages.SESSIONPOOL_CLONE,
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 89px',
			handler: function () {},
			scope: this
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: this.getTitle(),
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				{xtype:'spacer'},
				this.exportButton
			]
		});
		
		
		//
		// Create Session Fieldset
		//
		// get public pool sessions from server
		ARSnova.app.restProxy.getSessionsByKeyword(this.keyword, {
			success: function(session) {
				console.log("session");
				console.log(session);
			},
			empty: function() {
				console.log("empty");
				
			},
			failure: function() {
				console.log("failure");
				
			},
			unauthenticated: function() {
				console.log("unauthenticated");
				
			}
			
		});

		this.sessionName = Ext.create('Ext.field.Text', {
			label: Messages.SESSION_NAME,
			name: 'sessionName',
			value: this.getTitle(),
			disabledCls: 'disableDefault',
			inputCls: 'thm-grey',
			disabled: true
		});

		this.sessionDescription = Ext.create('Ext.plugins.ResizableTextArea', {
			label: Messages.SESSIONPOOL_INFO,
			name: 'sessionDescription',
			value: "Dies ist eine generische, hardcodierte Beschreibung dieser Session.",
			disabledCls: 'disableDefault',
			inputCls: 'thm-grey',
			disabled: true
		});
		
		this.sessionQuestionCount = Ext.create('Ext.field.Text', {
			label: Messages.SESSIONPOOL_COUNT_QUESTION,
			name: 'sessionQuestionCount',
			value: this.getQuestionCount(),
			disabledCls: 'disableDefault',
			inputCls: 'thm-grey',
			disabled: true
		});
		
		this.sessionLicense = Ext.create('Ext.field.Text', {
			label: Messages.EXPORT_FIELD_LICENCE,
			name: 'sessionLicense',
			value: "MIT",
			disabledCls: 'disableDefault',
			inputCls: 'thm-grey',
			disabled: true
		});
		
		this.sessionFieldSet = Ext.create('Ext.form.FieldSet', {
			title: Messages.SESSIONPOOL_SESSIONINFO,
			cls: 'standardFieldset',
			itemId: 'contentFieldset',
			items: [this.sessionName, this.sessionDescription, this.sessionQuestionCount, this.sessionLicense]
		});
		
		//
		// Create Creator Fieldset
		//
		
		this.creatorName = Ext.create('Ext.field.Text', {
			label: Messages.EXPORT_FIELD_NAME,
			name: 'creatorName',
			value: "Werner Müller",
			disabledCls: 'disableDefault',
			inputCls: 'thm-grey',
			disabled: true
		});
		
		this.creatorMail = Ext.create('Ext.field.Text', {
			label: Messages.EXPORT_FIELD_EMAIL,
			name: 'creatorMail',
			value: "werner.mueller123@mni.thm.de",
			disabledCls: 'disableDefault',
			inputCls: 'thm-grey',
			disabled: true
		});
		
		this.creatorUni = Ext.create('Ext.field.Text', {
			label: Messages.EXPORT_FIELD_UNI,
			name: 'creatorUni',
			value: "Technische Hochschule Mittelhessen",
			disabledCls: 'disableDefault',
			inputCls: 'thm-grey',
			disabled: true
		});
		
		this.creatorDep = Ext.create('Ext.field.Text', {
			label: Messages.EXPORT_FIELD_SPECIAL_FIELD,
			name: 'creatorDep',
			value: "MNI",
			disabledCls: 'disableDefault',
			inputCls: 'thm-grey',
			disabled: true
		});
		
		this.creatorFieldSet = Ext.create('Ext.form.FieldSet', {
			title: Messages.SESSIONPOOL_AUTHORINFO,
			cls: 'standardFieldset',
			itemId: 'contentFieldset',
			items: [this.creatorName, this.creatorMail, this.creatorUni, this.creatorDep]
		});

		this.contentForm = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			itemId: 'contentForm',
			style: {marginTop: '15px', marginLeft: '12px', marginRight: '12px'},
			items: [
			        this.sessionFieldSet,
			        this.creatorFieldSet]
		});

		this.add([
			this.toolbar,
			this.contentForm
		]);
	}
});