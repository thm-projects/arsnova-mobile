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
Ext.define('ARSnova.view.speaker.PeerInstructionPanel', {
	extend: 'Ext.Panel',

	config: {
		fullscreen: true,
		title: Messages.PI,
		iconCls: 'icon-timer'
	},

	initialize: function (arguments) {
		this.callParent(arguments);

		this.toolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			title: this.getTitle(),
			ui: 'light',
			items: [{
				xtype: 'button',
				text: Messages.STATISTIC,
				ui: 'back',
				scope: this,
				handler: function () {
					ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.statisticTabPanel.setActiveItem(0);
				}
			}]
		});

		this.countdownTimer = Ext.create('ARSnova.view.components.CountdownTimer', {
			sliderDefaultValue: 1,
		});

		this.add([this.toolbar, this.countdownTimer]);

		this.on('activate', this.onActivate);
		this.onBefore('activate', this.beforeActivate);
	},

	beforeActivate: function () {
		var statisticChart = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionStatisticChart;

		if(!this.editButtons) {
			this.editButtons = Ext.create('ARSnova.view.speaker.ShowcaseEditButtons', {
				style: 'margin: 30px',
				speakerStatistics: true,
				questionObj: this.cleanupQuestionObj(statisticChart.questionObj)
			});

			this.add(this.editButtons);
		} else {
			this.editButtons.questionObj = statisticChart.questionObj;
			this.editButtons.updateData(statisticChart.questionObj);
		}
	},

	cleanupQuestionObj: function(questionObj) {
		if(questionObj) {
			questionObj.possibleAnswers.forEach(function(answer) {
				delete answer.formattedText;
			});
		}

		return questionObj;
	}
});
