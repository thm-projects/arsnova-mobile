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
ARSnova.views.feedbackQuestions.TabPanel = Ext.extend(Ext.TabPanel, {
	title	: Messages.QUESTIONS,
	iconCls	: 'tabBarIconQuestion',
	scroll	: 'vertical',

	tabBar: {
    	hidden: true,
    },
	
	constructor: function(){
		this.questionsPanel = new ARSnova.views.feedbackQuestions.QuestionsPanel();
		
		this.items = [
            this.questionsPanel,
        ];
		ARSnova.views.feedbackQuestions.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			taskManager.start(ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestionsTask);
			taskManager.stop(ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestionsTask);
		});
		
		this.on('deactivate', function(){
			taskManager.stop(ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestionsTask);
			taskManager.start(ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestionsTask);
		});
		
		ARSnova.views.feedbackQuestions.TabPanel.superclass.initComponent.call(this);
	}
});