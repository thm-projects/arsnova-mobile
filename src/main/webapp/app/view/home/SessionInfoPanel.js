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
	config: {
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
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var showShortLabels = screenWidth < 480;
		// show or hide edit button
		if (localStorage.getItem('role') === "1") {
			var hideEdit = false;
			var backBtn = this.backSpeaker;
		} else {
			var hideEdit = true;
			var backBtn = this.backUser;
		}
		//
		// Toolbar items
		//
		this.backButton = Ext.create('Ext.Button', {
				text: Messages.BACK,
				ui: 'back',
				scope: this,
				handler: backBtn
			});
		this.editButton = Ext.create('Ext.Button', {
				text: Messages.EDIT,
				hidden: hideEdit,
				ui: 'confirm',
				cls: 'saveQuestionButton',
				style: 'width: 89px',
				handler: function () {
					// change to session info panel
					var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
					var sessionInfoPanel = Ext.create('ARSnova.view.home.SessionInfoEditPanel');
					hTP.animateActiveItem(sessionInfoPanel, {
						type: 'slide',
						direction: 'left',
						duration: 700
					});
				}
			});
		this.toolbar = Ext.create('Ext.Toolbar', {
				title: "Session Info",
				docked: 'top',
				ui: 'light',
				items: [this.backButton, {
						xtype: 'spacer'
					},
					this.editButton]
			});
		this.infoFormCreator = Ext.create('Ext.form.FieldSet', {
				title: 'Verfasserinformationen',
				items: [{
						xtype: 'textfield',
						name: 'ppAuthorName',
						label: "Name des Dozenten",
						disabled: true,
						value: localStorage.getItem('ppAuthorName')
					}, {
						xtype: 'textfield',
						name: 'ppAuthorMail',
						label: "Email",
						disabled: true,
						value: localStorage.getItem('ppAuthorMail')
					}, {
						xtype: 'textfield',
						name: 'ppUniversity',
						label: "Hochschule",
						disabled: true,
						value: localStorage.getItem('ppUniversity')
					}, {
						xtype: 'textfield',
						name: 'ppFaculty',
						label: "Fachbereich",
						disabled: true,
						value: localStorage.getItem('ppFaculty')
					}
				]
			});
		this.infoFormSession = Ext.create('Ext.form.FieldSet', {
				title: 'Sessioninformationen',
				items: [{
						xtype: 'textfield',
						name: 'name',
						label: Messages.SESSION_NAME,
						disabled: true,
						value: localStorage.getItem('name')
					}, {
						xtype: 'textfield',
						name: 'shortName',
						label: Messages.SESSION_SHORT_NAME,
						disabled: true,
						value: localStorage.getItem('shortName')
					}, {
						xtype: 'textfield',
						name: 'ppSubject',
						label: "Studiengang",
						disabled: true,
						value: localStorage.getItem('ppSubject')
					}, {
						xtype: 'textfield',
						name: 'ppLevel',
						label: "Niveau",
						disabled: true,
						value: localStorage.getItem('ppLevel')
					}
				]
			});
		this.descriptionPanel = Ext.create('Ext.Panel', {
				layout: {
					type: 'hbox',
					pack: 'center',
					align: 'center'
				},
				style: {
					'margin-top': '30px'
				}
			});
		if (localStorage.getItem('ppLogo') !== "" && localStorage.getItem('ppLogo') != null) {
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
					html: '<img src="' + localStorage.getItem('ppLogo') + '" style="width: 100%; max-width: 100px;"></img>'
				});
			this.descriptionPanel.add(this.logoContainer);
		}
		if (localStorage.getItem('ppDescription') !== "" && localStorage.getItem('ppDescription') != null) {
			this.markdownPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
					xtype: 'mathJaxMarkDownPanel',
					id: 'questionContent',
					style: 'background-color: transparent; color: black; ',
					flex: 4
				});
			this.markdownPanel.setContent(localStorage.getItem('ppDescription'), true, true);
			this.descriptionPanel.add(this.markdownPanel);
		}
		this.contentForm = Ext.create('Ext.form.FormPanel', {
				scrollable: null,
				items: [
					this.descriptionPanel,
					this.infoFormSession,
					this.infoFormCreator
				]
			});
		this.add([this.toolbar, this.contentForm]);
	},
	backSpeaker: function () {
		var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
		hTP.animateActiveItem(hTP.mySessionsPanel, {
			type: 'slide',
			direction: 'right',
			duration: 700
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
	},
	backUser: function () {
		var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
		hTP.animateActiveItem(hTP.homePanel, {
			type: 'slide',
			direction: 'right',
			duration: 700
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
