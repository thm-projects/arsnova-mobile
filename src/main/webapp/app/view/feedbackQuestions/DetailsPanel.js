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
Ext.define('ARSnova.view.feedbackQuestions.DetailsPanel', {
	extend: 'Ext.Panel',

	config: {
		title: 'DetailsPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		isRendered: false,

		question: null
	},

	/* toolbar items */
	toolbar: null,
	backButton: null,
	questionObj: null,

	constructor: function (args) {
		this.callParent(arguments);
		var me = this;

		this.questionObj = this.getQuestion();

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.QUESTIONS,
			ui: 'back',
			scope: this,
			handler: function () {
				var sQP = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				sQP.animateActiveItem(sQP.questionsPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTION_DETAILS,
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton
			]
		});

		// Setup question title and text to display in the same field; markdown handles HTML encoding
		var questionString = this.questionObj.getFormattedDateTime().replace(/\./, "\\.") + ": " + this.questionObj.get('subject')
			+ '\n\n' // inserts one blank line between subject and text
			+ this.questionObj.get('text');

		// Create standard panel with framework support
		var questionPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			cls: "roundedBox allCapsHeader"
		});
		questionPanel.setContent(questionString, true, true);

		this.add([this.toolbar,

		questionPanel,

		{
			xtype: 'button',
			ui: 'decline',
			cls: 'centerButton',
			text: Messages.DELETE,
			scope: this,
			handler: function () {
				var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;

				ARSnova.app.questionModel.deleteInterposed(this.questionObj, {
					success: function () {
						me.questionObj.destroy();
						panel.animateActiveItem(panel.questionsPanel, {
							type: 'slide',
							direction: 'right',
							duration: 700
						});
					},
					failure: function (response) {
						console.log('server-side error delete question');
					}
				});
			}
		}]);

		this.on('deactivate', this.onDeactivate);
	},

	onDeactivate: function () {
		// reload questions
		ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.getCheckFeedbackQuestionsTask().taskRunTime = 0;
	}
});
