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
	feedbackValues: {
		GOOD: 0,
		OK: 1,
		BAD: 2,
		GONE: 3
	},

	initialize: function () {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
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

		this.sessionLogoutButton = {
			xtype: 'button',
			ui: 'back',
			text: Messages.SESSIONS,
			cls: ARSnova.app.loginMode === ARSnova.app.LOGIN_THM ? "thm" : "",
			handler: function () {
				ARSnova.app.getController('Sessions').logout();
			}
		};

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
			defaults: {
				xtype: 'matrixbutton',
				buttonConfig: 'icon',
				cls: 'noPadding noBackground voteButton',
				handler: this.buttonClicked
			},
			items: [
				{
					text: Messages.FEEDBACK_OKAY,
					value: this.feedbackValues.OK,
					cls: 'feedbackOkBackground',
					imageCls: 'icon-happy',
				}, {
					text: Messages.FEEDBACK_GOOD,
					value: this.feedbackValues.GOOD,
					cls: 'feedbackGoodBackground',
					imageCls: "icon-wink",
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
			defaults: {
				xtype: 'matrixbutton',
				buttonConfig: 'icon',
				cls: 'noPadding noBackground voteButton',
				handler: this.buttonClicked
			},
			style: "margin-top:10px",
			items: [
				{
					text: Messages.FEEDBACK_BAD,
					value: this.feedbackValues.BAD,
					cls: 'feedbackBadBackground',
					imageCls: "icon-shocked"
				}, {
					text: Messages.FEEDBACK_NONE,
					value: this.feedbackValues.GONE,
					cls: 'feedbackNoneBackground',
					imageCls: "icon-sad",
					style: "margin-left:10px"
				}

			]
		});

		this.questionRequestButton = Ext.create('Ext.Button', {
			text: Messages.QUESTION_REQUEST,
			cls: 'questionRequestButton',
			ui: 'action',
			width: '235px',
			handler: function () {
				ARSnova.app.getController('Feedback').showAskPanel('slide', function () {
					var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
					fP.animateActiveItem(fP.votePanel, {
						type: 'slide',
						direction: 'right',
						duration: 700
					});
				});
			}
		});

		this.add([
			this.toolbar,
			this.buttonPanelTop,
			this.buttonPanelBottom,
			this.questionRequestButton
		]);
	},

	buttonClicked: function (button) {
		ARSnova.app.getController('Feedback').vote({
			value: button.config.value
		});
	},

	setSinglePageMode: function (singlePageMode, tabPanel) {
		var button = singlePageMode ? this.sessionLogoutButton : this.backButton;
		this.toolbar.removeAll(false);
		this.toolbar.add(button);
	}
});
