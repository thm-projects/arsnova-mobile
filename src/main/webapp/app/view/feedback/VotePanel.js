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
Ext.define('ARSnova.view.feedback.VotePanel', {
	extend: 'Ext.Panel',

	config: {
		title: 'VotePanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	/* toolbar items */
	toolbar: null,
	backButton: null,
	questionButton: null,

	initialize: function () {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.HOME,
			ui: 'back',
			hidden: false,
			handler: function () {
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userTabPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.FEEDBACK,
			docked: 'top',
			ui: 'light',
			cls: 'titlePaddingLeft',
			items: [
				this.backButton
			]
		});

		if (Ext.os.is.Phone) {
			this.arsLogo = {
				xtype: 'panel',
				style: {marginTop: '35px'}
			};
		}

		this.buttonPanelTop = Ext.create('Ext.Panel', {
			xtype: 'container',
			style: 'margin-top:20px',
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			items: [
				{
					xtype: 'matrixbutton',
					text: Messages.FEEDBACK_OKAY,
					cls: 'noPadding noBackground noBorder feedbackOkBackground',
					value: 'Kann folgen',
					image: "icons/48x48/smiley_happy",
					handler: function (button) {
						ARSnova.app.getController('Feedback').vote({
							value: button.config.value
						});
					}
				},
				{
					xtype: 'matrixbutton',
					text: Messages.FEEDBACK_GOOD,
					cls: 'noPadding noBackground noBorder feedbackGoodBackground',
					value: 'Bitte schneller',
					image: "icons/48x48/smiley_wink",
					handler: function (button) {
						ARSnova.app.getController('Feedback').vote({
							value: button.config.value
						});
					},
					style: "margin-left:10px"
				}
			]
		});

		this.buttonPanelBottom = Ext.create('Ext.Panel', {
			xtype: 'container',
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			style: "margin-top:10px",
			items: [
				{
					xtype: 'matrixbutton',
					text: Messages.FEEDBACK_BAD,
					cls: 'noPadding noBackground noBorder feedbackBadBackground',
					value: 'Zu schnell',
					image: "icons/48x48/smiley_frown",
					handler: function (button) {
						ARSnova.app.getController('Feedback').vote({
							value: button.config.value
						});
					}
				},
				{
					xtype: 'matrixbutton',
					text: Messages.FEEDBACK_NONE,
					cls: 'noPadding noBackground noBorder feedbackNoneBackground',
					value: 'Nicht mehr dabei',
					image: "icons/48x48/smiley_angry",
					handler: function (button) {
						ARSnova.app.getController('Feedback').vote({
							value: button.config.value
						});
					},
					style: "margin-left:10px"
				}
			]
		});

		this.add([
			this.toolbar,
			this.buttonPanelTop,
			this.buttonPanelBottom,
			{
				xtype: 'button',
				text: Messages.QUESTION_REQUEST,
				cls: 'questionRequestButton',
				ui: 'action',
				width: '235px',
				handler: function () {
					var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
					panel.animateActiveItem(panel.askPanel, 'slide');
				}
			}
		]);
	}
});
