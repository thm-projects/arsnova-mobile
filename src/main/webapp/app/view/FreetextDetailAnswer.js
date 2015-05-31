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
Ext.define('ARSnova.view.FreetextDetailAnswer', {
	extend: 'Ext.Panel',

	requires: ['ARSnova.view.components.GridImageContainer'],

	config: {
		title: 'FreetextDetailAnswer',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	constructor: function (args) {
		this.callParent(arguments);

		this.answer = args.answer;
		this.sTP = args.sTP;
		var self = this;

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.FREETEXT_DETAIL_HEADER,
			docked: 'top',
			ui: 'light',
			items: [
				Ext.create('Ext.Button', {
					text: Messages.BACK,
					ui: 'back',
					handler: function () {
						self.sTP.items.items.pop(); // Remove this panel from view stack
						self.sTP.animateActiveItem(
							self.sTP.items.items[self.sTP.items.items.length - 1], // Switch back to top of view stack
							{
								type: 'slide',
								direction: 'right',
								duration: 700,
								scope: this,
								listeners: {
									animationend: function () {
										self.answer.deselectItem();
										self.hide();
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
			if (image !== null) {
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

				if (!!image) {
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
				inputCls: 'thm-grey',
				disabled: true
			}, questionPanel]
		});

		this.zoomButton = Ext.create('Ext.Button', {
			ui: 'action',
			hidden: true,
			cls: 'zoomButton',
			docked: 'bottom',
			iconCls: 'icon-text-height',
			handler: this.zoomButtonHandler,
			scope: this
		});

		this.add([this.toolbar,
			this.zoomButton,
			this.formPanel,
			imgContainer, {
			xtype: 'button',
			ui: 'decline',
			cls: 'centerButton',
			text: Messages.DELETE,
			scope: this,
			hidden: !this.answer.deletable,
			handler: function () {
				ARSnova.app.questionModel.deleteAnswer(self.answer.questionId, self.answer._id, {
					success: function () {
						self.sTP.items.items.pop(); // Remove this panel from view stack
						self.sTP.animateActiveItem(
							self.sTP.items.items[self.sTP.items.items.length - 1], // Switch back to top of view stack
							{
								type: 'slide',
								direction: 'right',
								duration: 700,
								scope: this,
								listeners: {
									animationend: function () {
										self.destroy();
									}
								}
							}
						);
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

		var self = this;

		this.zoomSlider = Ext.create('ARSnova.view.CustomSliderField', {
			label: 'Zoom',
			labelWidth: '15%',
			value: 100,
			minValue: 75,
			maxValue: 150,
			increment: 5,
			suffix: '%',
			setZoomLevel: function (sliderField, slider, newValue) {
				newValue = Array.isArray(newValue) ? newValue[0] : newValue;
				if (!sliderField.actualValue || sliderField.actualValue !== newValue) {
					self.setZoomLevel(newValue);
					sliderField.actualValue = newValue;
				}
			}
		});

		this.zoomSlider.setListeners({
			drag: this.zoomSlider.config.setZoomLevel,
			change: this.zoomSlider.config.setZoomLevel
		});

		this.actionSheet = Ext.create('Ext.Sheet', {
			left: 0,
			right: 0,
			bottom: 0,
			hidden: true,
			modal: false,
			centered: false,
			height: 'auto',
			cls: 'zoomActionSheet',
			items: [this.zoomSlider]
		});

		this.add(this.actionSheet);

		this.on('painted', function () {
			ARSnova.app.innerScrollPanel = this;
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

			if (screenWidth > 700 && ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				this.zoomButton.show();
				this.initializeZoomComponents();
			}
		});

		this.on('deactivate', function () {
			ARSnova.app.innerScrollPanel = false;
		});
	},

	initializeZoomComponents: function () {
		this.actionSheet.hide();
		this.getParent().remove(this.actionSheet, false);
		this.zoomButton.setIconCls('icon-text-height');
		this.zoomButton.removeCls('zoomSheetActive');
		this.zoomSlider.setSliderValue(ARSnova.app.globalZoomLevel);
		this.setZoomLevel(ARSnova.app.globalZoomLevel);
		this.zoomButton.isActive = false;
	},

	zoomButtonHandler: function () {
		if (this.zoomButton.isActive) {
			this.initializeZoomComponents();
		} else {
			this.zoomButton.setIconCls('icon-close');
			this.zoomButton.addCls('zoomSheetActive');
			this.zoomButton.isActive = true;
			this.actionSheet.show();
		}
	},

	setZoomLevel: function (size) {
		this.formPanel.setStyle('font-size: ' + size + '%;');
		ARSnova.app.getController('Application').setGlobalZoomLevel(size);
	}
});
