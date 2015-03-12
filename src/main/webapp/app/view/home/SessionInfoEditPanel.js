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
Ext.define('ARSnova.view.home.SessionInfoEditPanel', {
	extend : 'Ext.Panel',

	config : {
		backRef : null,
		fullscreen : true,
		scrollable : {
			direction : 'vertical',
			directionLock : true
		},
		session : null
	},

	constructor : function (args) {
		this.callParent(arguments);

		var me = this;
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth
		 : screen.width;
		var showShortLabels = screenWidth < 480;

		//
		// Toolbar items
		//

		this.backButton = Ext.create('Ext.Button', {
				text : Messages.BACK,
				ui : 'back',
				scope : this,
				handler : function () {
					var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
					hTP.animateActiveItem(hTP.sessionInfoPanel, {
						type : 'slide',
						direction : 'right',
						duration : 700
					});
				}
			});
		
		this.saveButton = Ext.create('Ext.Button', {
			text: Messages.SAVE,
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 89px',
			handler : function () {
				console.log("Speichern");	
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
				title : "Session Info",
				docked : 'top',
				ui : 'light',
				items : [this.backButton,
				        {xtype: 'spacer'},
				         this.saveButton]
			});

		this.sessionName = Ext.create('Ext.field.Text', {
				label : Messages.SESSION_NAME,
				name : 'sessionName'
			});
		this.sessionShortName = Ext.create('Ext.field.Text', {
				label : Messages.SESSION_SHORT_NAME,
				name : 'sessionShortName'
			});
		this.sessionNumQuestions = Ext.create('Ext.field.Text', {
				label : Messages.QUESTIONS,
				name : 'sessionNumQuestions'
			});
		
		this.sessionFieldSet = Ext.create('Ext.form.FieldSet', {
				title : Messages.SESSIONPOOL_SESSIONINFO,
				items : [this.sessionName, this.sessionShortName,
					this.sessionNumQuestions]
		});

		this.creatorName = Ext.create('Ext.field.Text', {
				label : Messages.EXPORT_FIELD_NAME,
				name : 'creatorName'
			});

		this.creatorMail = Ext.create('Ext.field.Text', {
				label : Messages.EXPORT_FIELD_EMAIL,
				name : 'creatorMail'
			});
		
		this.creatorUni = Ext.create('Ext.field.Text', {
				label : Messages.EXPORT_FIELD_UNI,
				name : 'creatorUni'
			});

		this.creatorDep = Ext.create('Ext.field.Text', {
				label : Messages.EXPORT_FIELD_SPECIAL_FIELD,
				name : 'creatorDep'
			});

		this.creatorFieldSet = Ext.create('Ext.form.FieldSet', {
				title : Messages.SESSIONPOOL_AUTHORINFO,
				items : [this.creatorName, this.creatorMail, this.creatorUni,
					this.creatorDep]
			});
		
		this.descriptionPanel = Ext.create('Ext.Panel', {
				layout : {
					type : 'hbox',
					pack : 'center',
					align : 'start'
				},
				style : {
					'margin-top' : '30px'
				}
			});
		this.descriptionFieldSet = Ext.create('Ext.form.FieldSet', {
				items : [this.descriptionPanel]
			});
		this.contentForm = Ext.create('Ext.form.FormPanel', {
				scrollable : null,
				items : [this.descriptionFieldSet, this.sessionFieldSet,
					this.creatorFieldSet]
			});
		this.add([this.toolbar, this.contentForm]);
	}
});
