/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2016 The ARSnova Team
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
Ext.define('ARSnova.view.FreetextDetailAnswer', {
	extend: 'Ext.Panel',

	requires: ['ARSnova.view.components.GridImageContainer'],

	config: {
		title: 'FreetextDetailAnswer',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
		}
	},

	constructor: function (args) {
		this.callParent(arguments);

		this.answer = args.answer;
		this.questionObj = args.questionObj;
		this.sTP = args.sTP;
		var self = this;

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: this.questionObj.questionType === 'slide' ? Messages.COMMENT : Messages.FREETEXT_DETAIL_HEADER,
			docked: 'top',
			ui: 'light',
			items: [
				Ext.create('Ext.Button', {
					text: Messages.BACK,
					ui: 'back',
					handler: function () {
						var me = self;
						var panel = me.sTP.items.items[me.sTP.items.items.length - 1];
						me.speakerUtilities.initializeZoomComponents();

						if (panel.xtype === 'sheet') {
							me.sTP.items.items.pop();
						}

						me.sTP.items.items.pop(); // Remove this panel from view stack
						me.sTP.animateActiveItem(
							me.sTP.items.items[me.sTP.items.items.length - 1], // Switch back to top of view stack
							{
								type: 'slide',
								direction: 'right',
								duration: 700,
								scope: this,
								listeners: {
									animationend: function () {
										me.answer.deselectItem();
										me.destroy();
									},
									scope: this
								}
							}
						);
					}
				})
			]
		});

		// Setup question title and text to disply in the same field; markdown handles HTML encoding
		var questionString = this.answer.answerSubject
			+ '\n\n' // inserts one blank line between subject and text
			+ this.answer.answerText;

		// Create standard panel with framework support
		var questionPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel');
		questionPanel.setContent(questionString, true, true);

		var image = null;

		function switchToFullScreen() {
			if (image) {
				var img = document.getElementById("img").querySelector("canvas");
				if (img.requestFullscreen) {
					img.requestFullscreen();
				} else if (img.msRequestFullscreen) {
					img.msRequestFullscreen();
				} else if (img.mozRequestFullScreen) {
					img.mozRequestFullScreen();
				} else if (img.webkitRequestFullscreen) {
					img.webkitRequestFullscreen();
				}
			}
		}

		var imgContainer = Ext.create('ARSnova.view.components.GridImageContainer', {
			id: 'img',
			hidden: true,
			gridIsHidden: true,
			editable: false,
			listeners: {
				tap: {
					fn: switchToFullScreen,
					element: 'element'
				},
				click: {
					fn: switchToFullScreen,
					element: 'element'
				}
			}
		});

		ARSnova.app.questionModel.getImageAnswerImage(self.answer.questionId, self.answer._id, {
			success: function (response) {
				image = response.responseText;

				if (image) {
					imgContainer.setImage(image);
					imgContainer.show();
				} else {
					image = null;
					imgContainer.hide();
				}
			},
			failure: function () {
				image = null;
				imgContainer.hide();
			}
		});

		this.formPanel = Ext.create('Ext.form.Panel', {
			scrollable: null,
			items: [{
				xtype: 'textfield',
				cls: 'roundedBox',
				label: Messages.QUESTION_DATE,
				value: this.answer.formattedTime + " Uhr am " + this.answer.groupDate,
				disabledCls: 'disableDefault',
				disabled: true
			}, questionPanel]
		});

		this.add([this.toolbar,
			this.formPanel,
			imgContainer, {
			xtype: 'button',
			ui: 'decline',
			cls: 'centerButton',
			text: Messages.DELETE,
			scope: this,
			hidden: !this.answer.deletable,
			style: 'margin-bottom: 30px;',
			handler: function () {
				ARSnova.app.questionModel.deleteAnswer(self.answer.questionId, self.answer._id, {
					success: function () {
						var me = self;
						var panel = me.sTP.items.items[me.sTP.items.items.length - 1];
						me.speakerUtilities.initializeZoomComponents();

						if (panel.xtype === 'sheet') {
							me.sTP.items.items.pop();
						}

						self.sTP.items.items.pop(); // Remove this panel from view stack
						var prevTabPanel = self.sTP.items.items[self.sTP.items.items.length - 1];
						self.sTP.animateActiveItem(prevTabPanel, { // Switch back to top of view stack
							type: 'slide',
							direction: 'right',
							duration: 700,
							scope: this,
							listeners: {
								animationend: function () {
									self.destroy();
									prevTabPanel.getActiveItem().checkFreetextAnswersTask.taskRunTime = 0;
								}
							}
						});
					},
					failure: function () {
						console.log('server-side error: deletion of freetext answer failed');
					}
				});
			}
		}]);
	},

	initialize: function () {
		this.callParent(arguments);

		this.speakerUtilities = Ext.create('ARSnova.view.speaker.SpeakerUtilities', {
			parentReference: this,
			autoApplyBottomPadding: false,
			showProjectorButton: true,
			hidden: true
		});

		this.add(this.speakerUtilities);

		this.on('painted', function () {
			ARSnova.app.innerScrollPanel = this;
			if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				this.speakerUtilities.setProjectorMode(this, ARSnova.app.projectorModeActive);
			}
		});

		this.on('activate', function () {
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
			if (screenWidth > 700 && ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				this.speakerUtilities.initializeZoomComponents();
				this.speakerUtilities.show();
			}
		});

		this.on('deactivate', function () {
			ARSnova.app.innerScrollPanel = false;
		});
	},

	setZoomLevel: function (size) {
		this.formPanel.setStyle('font-size: ' + size + '%;');
		ARSnova.app.getController('Application').setGlobalZoomLevel(size);
	}
});
