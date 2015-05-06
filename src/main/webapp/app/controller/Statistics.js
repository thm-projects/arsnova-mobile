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
Ext.define("ARSnova.controller.Statistics", {
	extend: 'Ext.app.Controller',

	prepareStatistics: function (scope) {
		var panel = ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel || ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;

		if (panel === ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel) {
			ARSnova.app.getController('Statistics').prepareSpeakerStatistics(panel);
		} else {
			ARSnova.app.getController('Statistics').prepareStudentStatistics(panel, scope);
		}
	},

	prepareStudentStatistics: function (panel, scope) {
		panel.questionStatisticChart = Ext.create('ARSnova.view.speaker.QuestionStatisticChart', {
			question: scope.questionObj
		});

		ARSnova.app.mainTabPanel.animateActiveItem(panel.questionStatisticChart, 'slide');
	},

	prepareSpeakerStatistics: function (panel) {
		var target;
		var activePanel = panel.getActiveItem();
		var questionObj = panel.getActiveItem().questionObj;

		var animation = {
			type: 'slide',
			direction: 'left',
			duration: 700,
			listeners: {
				animationend: function () {
					panel.showcaseQuestionPanel.toolbar.statisticsButton.enable();
				}
			}
		};

		switch (activePanel) {
			case panel.showcaseQuestionPanel:
				questionObj = activePanel.getActiveItem().questionObj;
				panel.showcaseQuestionPanel.toolbar.statisticsButton.disable();
				break;

			case panel.questionDetailsPanel:
				questionObj = activePanel.questionObj;
				break;

			default:
		}

		var enableRoundManagement = questionObj.questionType !== 'grid';
		target = panel.questionStatisticChart = Ext.create('ARSnova.view.speaker.QuestionStatisticChart', {
			question: questionObj
		});

		if (enableRoundManagement) {
			if (!panel.statisticTabPanel) {
				panel.statisticTabPanel = Ext.create('ARSnova.view.speaker.StatisticTabPanel');
			}

			panel.statisticTabPanel.insert(0, panel.questionStatisticChart);
			panel.statisticTabPanel.setActiveItem(0);
			target = panel.statisticTabPanel;
		}

		ARSnova.app.mainTabPanel.animateActiveItem(target, animation);
	}
});
