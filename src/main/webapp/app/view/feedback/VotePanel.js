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
		},
		layout: {
			type: 'vbox',
			pack: 'center'
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

	answerValues: {
		A: 1,
		B: 0,
		C: 2,
		D: 3
	},

	initialize: function () {
		this.callParent(arguments);
		this.controller = ARSnova.app.getController('Feedback');
		var features = Ext.decode(sessionStorage.getItem("features"));

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
				handler: this.buttonClicked,
				scope: this
			}
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
				handler: this.buttonClicked,
				scope: this
			},
			style: "margin-top:10px"
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

		this.initializeOptionButtons();

		this.add([
			this.toolbar,
			this.buttonPanelTop,
			this.buttonPanelBottom,
			this.questionRequestButton
		]);

		this.onBefore('painted', function () {
			if (features.liveClicker) {
				ARSnova.app.mainTabPanel.tabPanel.getTabBar().setHidden(true);
			}
		});
	},

	buttonClicked: function (button) {
		var features = Ext.decode(sessionStorage.getItem("features"));

		if (ARSnova.app.feedbackModel.lock) {
			ARSnova.app.getController('Feedback').onLockedFeedback();
		} else {
			if (features.liveClicker) {
				this.releaseButtons();
				button.setPressed(true);
			}

			ARSnova.app.getController('Feedback').vote({
				value: button.config.value
			}, true);
		}
	},

	releaseButtons: function () {
		var buttons = this.buttonPanelTop.getInnerItems().concat(this.buttonPanelBottom.getInnerItems());

		for (var i = 0; i < buttons.length; i++) {
			buttons[i].setPressed(false);
		}
	},

	setToolbarTitle: function (title) {
		this.toolbar.setTitle(Ext.util.Format.htmlEncode(title));
	},

	initializeOptionButtons: function () {
		var buttonConfigurations = this.controller.initializeVoteButtonConfigurations(this);
		this.buttonPanelBottom.removeAll(true);
		this.buttonPanelTop.removeAll(true);

		var margin = buttonConfigurations.clicker ?
			{style: "margin-left:50px"} : {style: "margin-left:10px"};

		buttonConfigurations.option1 = Ext.merge({}, buttonConfigurations.option1, margin);
		buttonConfigurations.option3 = Ext.merge({}, buttonConfigurations.option3, margin);

		this.buttonPanelTop.add([buttonConfigurations.option0, buttonConfigurations.option1]);
		this.buttonPanelBottom.add([buttonConfigurations.option2, buttonConfigurations.option3]);
		this.questionRequestButton.setHidden(buttonConfigurations.clicker);
	},

	setSinglePageMode: function (singlePageMode, tabPanel) {
		var button = singlePageMode ? this.sessionLogoutButton : this.backButton;
		this.toolbar.removeAll(false);
		this.toolbar.add(button);
	}
});
