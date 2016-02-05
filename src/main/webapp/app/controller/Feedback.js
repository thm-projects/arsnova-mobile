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
Ext.define("ARSnova.controller.Feedback", {
	extend: 'Ext.app.Controller',

	index: function (options) {
		var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
		fP.animateActiveItem(fP.votePanel, 'slide');
	},

	vote: function (options, voteReference) {
		var fP;
		var features = Ext.decode(sessionStorage.getItem("features"));

		if (!ARSnova.app.checkSessionLogin()) {
			Ext.Msg.alert('Hinweis', 'Bitte loggen Sie sich erst in einen Kurs ein, bevor Sie diese Funktion nutzen!');
			fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
			fP.animateActiveItem(fP.statisticPanel, {
				type: 'slide',
				direction: 'right'
			});
			return;
		}

		if (options.value < 0 || options.value > 3) {
			return;
		}

		ARSnova.app.feedbackModel.postFeedback(options.value);

		if (voteReference && !ARSnova.app.feedbackModel.lock && features.liveClicker) {
			return;
		}

		fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
		fP.animateActiveItem(fP.statisticPanel, {
			type: 'slide',
			direction: 'up'
		});
	},

	onLockedFeedback: function () {
		var features = Ext.decode(sessionStorage.getItem("features"));

		if (ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER) {
			var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
			fP.animateActiveItem(fP.statisticPanel, {
				type: 'slide',
				direction: 'up'
			});

			if (features.liveClicker) {
				Ext.toast(Messages.VOTING_CLOSED, 2000);
			}
		}
	},

	onReleasedFeedback: function () {
		var features = Ext.decode(sessionStorage.getItem("features"));

		if (ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER) {
			var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;

			fP.votePanel.releaseButtons();
			fP.animateActiveItem(fP.votePanel, {
				type: 'slide',
				direction: 'down'
			});

			if (features.liveClicker) {
				Ext.toast(Messages.VOTING_OPENED, 2000);
			}
		}
	},

	ask: function (options) {
		options.question.saveInterposed({
			success: options.success,
			failure: options.failure
		});
	},

	showAskPanel: function (animation, closePanelHandler) {
		var tP = ARSnova.app.mainTabPanel.tabPanel;
		var fP = tP.feedbackTabPanel;

		if (closePanelHandler) {
			fP.askPanel.setClosePanelHandler(closePanelHandler);
		}

		animation = animation || 'slide';

		if (tP.getActiveItem() === tP.userTabPanel) {
			tP.userTabPanel.animateActiveItem(fP.askPanel, animation);
		} else if (tP.getActiveItem() === fP) {
			fP.animateActiveItem(fP.askPanel, animation);
		} else {
			tP.userTabPanel.setActiveItem(fP.askPanel);
			tP.animateActiveItem(tP.userTabPanel, animation);
		}
	},

	showVotePanel: function () {
		var tP = ARSnova.app.mainTabPanel.tabPanel;
		var fP = tP.feedbackTabPanel;

		if (fP.rendered) {
			fP.setActiveItem(fP.votePanel);
		} else {
			fP.activeItem = 1;
		}
		tP.setActiveItem(fP);
	},

	initializeVoteButtonConfigurations: function (panel) {
		var features = Ext.decode(sessionStorage.getItem("features"));
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var buttonWidthCls = screenWidth < 400 ? 'smallerMatrixButtons' : '';
		var buttonCls, buttonConfigurations = {};
		var buttonTexts = new Array("", "", "", "");
		var options = [];

		if (panel.getTitle() === 'StatisticPanel') {
			buttonCls = 'feedbackStatisticButton voteButton ' + buttonWidthCls;
		} else {
			buttonCls = 'noPadding noBackground voteButton';
			buttonTexts = features.liveClicker ? buttonTexts : [
				Messages.FEEDBACK_OKAY, Messages.FEEDBACK_GOOD,
				Messages.FEEDBACK_BAD, Messages.FEEDBACK_NONE
			];
		}

		if (features.liveClicker) {
			options[0] = [panel.answerValues.A, 'liveClickerOption ' + buttonCls, 'option-a'];
			options[1] = [panel.answerValues.B, 'liveClickerOption ' + buttonCls, 'option-b'];
			options[2] = [panel.answerValues.C, 'liveClickerOption ' + buttonCls, 'option-c'];
			options[3] = [panel.answerValues.D, 'liveClickerOption ' + buttonCls, 'option-d'];
		} else {
			options[0] = [panel.feedbackValues.OK, 'feedbackOkBackground ' + buttonCls, 'icon-happy'];
			options[1] = [panel.feedbackValues.GOOD, 'feedbackGoodBackground ' + buttonCls, 'icon-wink'];
			options[2] = [panel.feedbackValues.BAD, 'feedbackBadBackground ' + buttonCls, 'icon-shocked'];
			options[3] = [panel.feedbackValues.GONE, 'feedbackNoneBackground ' + buttonCls, 'icon-sad'];
		}

		for (var i = 0; i < options.length; i++) {
			buttonConfigurations['option' + i] = {
				cls: options[i][1],
				value: options[i][0],
				imageCls: options[i][2],
				handler: panel.buttonClicked,
				text: buttonTexts[i],
				xtype: 'matrixbutton'
			};
		}

		buttonConfigurations.clicker = features.liveClicker;
		return buttonConfigurations;
	},

	initializeChartStore: function (panel) {
		var chartData = [];
		var features = Ext.decode(sessionStorage.getItem("features"));

		if (features.liveClicker) {
			chartData = [
				{'name': panel.answerValues.A, 'displayName': 'A', 'value': 0, 'percent': 0.0},
				{'name': panel.answerValues.B, 'displayName': 'B', 'value': 0, 'percent': 0.0},
				{'name': panel.answerValues.C, 'displayName': 'C', 'value': 0, 'percent': 0.0},
				{'name': panel.answerValues.D, 'displayName': 'D', 'value': 0, 'percent': 0.0}
			];
		} else {
			chartData = [
				{'name': panel.feedbackValues.OK, 'displayName': Messages.FEEDBACK_OKAY, 'value': 0, 'percent': 0.0},
				{'name': panel.feedbackValues.GOOD, 'displayName': Messages.FEEDBACK_GOOD, 'value': 0, 'percent': 0.0},
				{'name': panel.feedbackValues.BAD, 'displayName': Messages.FEEDBACK_BAD, 'value': 0, 'percent': 0.0},
				{'name': panel.feedbackValues.GONE, 'displayName': Messages.FEEDBACK_NONE, 'value': 0, 'percent': 0.0}
			];
		}

		return Ext.create('Ext.data.Store', {
			showPercentage: features.liveClicker,
			fields: ['name', 'displayName', 'value', 'percent'],
			data: chartData
		});
	}
});
