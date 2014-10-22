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
Ext.define("ARSnova.controller.Feedback", {
	extend: 'Ext.app.Controller',

	index: function (options) {
		var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
		fP.animateActiveItem(fP.votePanel, 'slide');
	},

	vote: function (options) {
		if (!ARSnova.app.checkSessionLogin()) {
			Ext.Msg.alert('Hinweis', 'Bitte loggen Sie sich erst in einen Kurs ein, bevor Sie diese Funktion nutzen!');
			var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
			fP.animateActiveItem(fP.statisticPanel, {
				type: 'slide',
				direction: 'right'
			});
			return;
		}

		var feedbackValue;
		var feedbackCls;
		switch (options.value) {
			case "Kann folgen":
				feedbackCls = "happy";
				feedbackValue = 1;
				break;
			case "Bitte schneller":
				feedbackCls = "wink";
				feedbackValue = 0;
				break;
			case "Zu schnell":
				feedbackCls = "shocked";
				feedbackValue = 2;
				break;
			case "Nicht mehr dabei":
				feedbackCls = "sad";
				feedbackValue = 3;
				break;
			case "cancel":
				return;
			default:
				return;
		}

		ARSnova.app.feedbackModel.postFeedback(feedbackValue);
		localStorage.setItem('user has voted', 1);
		var feedbackButton = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.feedbackButton;

		feedbackButton.setBadge([{
			badgeText: " ",
			badgeCls: 'x-button-icon x-shown icon-' + feedbackCls
		}]);

		var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
		fP.animateActiveItem(fP.statisticPanel, {
			type: 'slide',
			direction: 'up'
		});
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
		fP.askPanel.setClosePanelHandler(closePanelHandler);

		if (fP.rendered) {
			fP.setActiveItem(fP.askPanel);
		} else {
			fP.activeItem = 1;
		}
		tP.animateActiveItem(fP, animation);
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

	statistic: function () {
		ARSnova.app.showLoadMask("Erzeuge die Grafik...");
		var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
		fP.statisticPanel.backButton.show();
		ARSnova.app.mainTabPanel.tabPanel.setActiveItem(fP);

		ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.addListener('deactivate', function (panel) {
			panel.statisticPanel.backButton.hide();
		}, this, {single: true});
	}
});
