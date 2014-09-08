/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/feedbackQuestions/tabPanel.js
 - Beschreibung: TabPanel für den Zwischenfragen-Tab (für Dozenten).
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
Ext.define('ARSnova.view.feedbackQuestions.TabPanel', {
	extend: 'Ext.tab.Panel',

	requires: ['ARSnova.view.feedbackQuestions.QuestionsPanel'],

	config: {
		title: Messages.QUESTIONS,
		iconCls: 'tabBarIconQuestion',
		scroll: 'vertical',

		tabBar: {
			hidden: true
		}
	},

	initialize: function () {
		this.callParent(arguments);

		this.questionsPanel = Ext.create('ARSnova.view.feedbackQuestions.QuestionsPanel');

		this.add([
			this.questionsPanel
		]);

		this.on('painted', function () {
			ARSnova.app.taskManager.start(ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.config.checkFeedbackQuestionsTask);
			if (ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel) {
				ARSnova.app.taskManager.stop(ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestionsTask);
			}
		});

		this.on('deactivate', function () {
			ARSnova.app.taskManager.stop(ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.config.checkFeedbackQuestionsTask);
			if (ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel) {
				ARSnova.app.taskManager.start(ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestionsTask);
			}
		});
	}
});
