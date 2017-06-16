/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
Ext.define('ARSnova.view.diagnosis.LmsOptionsPanel', {
	extend: 'Ext.Container',

	config: {
		options: {},
		sessionInfo: {},
		fullscreen: true,
		title: 'LmsOptionsPanel',
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
		}
	},

	courseSelect: null,
	courses: null,
	course: null,

	initialize: function () {
		this.callParent(arguments);
		var me = this;

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			handler: this.transitionBackToInClassPanel
		});

		this.toolbar = Ext.create('Ext.TitleBar', {
			title: Messages.LMS_OPTIONS,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});


		this.submitButton = Ext.create('Ext.Button', {
			cls: 'saveButton centered',
			ui: 'confirm',
			text: Messages.SAVE,
			scope: this,
			handler: function () {
				var sessionInfo = me.getSessionInfo();
				if (me.course === null) {
					sessionInfo.courseType = null;
					sessionInfo.courseId = null;
					sessionInfo.courseSession = false;
				} else {
					sessionInfo.courseType = me.course.type;
					sessionInfo.courseId = me.course.id;
					sessionInfo.courseSession = true;
				}
				ARSnova.app.getController('Sessions').update(sessionInfo);
				me.transitionBackToInClassPanel();
			}
		});

		this.courseSelect = Ext.create('Ext.field.Select', {
			label: Messages.LMS_SELECT_COURSE,
			placeHolder: 'Course',
			hidden: this.getSessionInfo().courseType === null,
			listeners: {
				change: function (field, newValue) {
					me.course = me.courses[newValue];
				}
			}
		});

		this.mainPart = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				title: Messages.LMS_ENABLE_TEXT,
				style: {
					textAlign: 'center'
				},
				items: [{
					xtype: 'segmentedbutton',
					style: 'margin: auto',
					cls: 'yesnoOptions',
					defaults: {
						ui: 'action'
					},
					items: [{
						text: Messages.YES,
						pressed: me.getSessionInfo().courseType !== null,
						scope: this,
						handler: function () {
							me.courseSelect.show();
							if (me.courses.length !== 0) {
								me.course = me.courses[0];
							}
						}
					}, {
						text: Messages.NO,
						pressed: me.getSessionInfo().courseType === null,
						scope: this,
						handler: function () {
							me.courseSelect.hide();
							me.course = null;
						}
					}]
				}]
			},
			this.courseSelect,
			this.submitButton]
		});

		this.add([this.mainPart, this.toolbar]);
	},

	onShow: function () {
		var me = this;
		ARSnova.app.courseModel.getMyCourses({
			success: function (response) {
				me.courses = Ext.decode(response.responseText);
				var courseArray = [];
				var currSelected = -1;
				me.courses.forEach(function (element, index, array) {
					if (element.membership.userrole === "TEACHER") {
						if (element.id === me.getSessionInfo().courseId) {
							currSelected = index;
						}
						courseArray.push({
							text: element.shortname + ": " + element.fullname,
							value: index
						});
					}
				});
				me.courseSelect.setOptions(courseArray);
				if (currSelected !== -1) {
					me.course = me.courses[currSelected];
					me.courseSelect.setValue(currSelected);
				} else {
					me.course = null;
				}
			},
			empty: function () {
				me.courseSelect.setOptions([]);
			},
			unauthenticated: function () {
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
			},
			failure: function () {
				console.log("my courses request failure");
			}
		}, (window.innerWidth > 321 ? 'name' : 'shortname'));
	},

	transitionBackToInClassPanel: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.animateActiveItem(this.getOptions().lastPanel, {
			type: 'slide',
			direction: 'right',
			duration: 700,
			listeners: {
				scope: this,
				animationend: function () {
					this.destroy();
				}
			}
		});
	}
});
