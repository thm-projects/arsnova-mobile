/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Questions-Controller
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
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
Ext.define("ARSnova.controller.PreparationQuestions", {
	extend: 'ARSnova.controller.Questions',
	
	config: {
		models: ['ARSnova.model.Question']
	},
	
	listQuestions: function(){
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.newQuestionPanel.setVariant('preparation');
		sTP.audienceQuestionPanel.setController(this);
		sTP.showcaseQuestionPanel.setController(this);
		sTP.animateActiveItem(sTP.audienceQuestionPanel, 'slide');
	},
	
	deleteAnswers: function() {
		throw "not implemented";
	},
	
	destroyAll: function() {
		throw "not implemented";
	},
	
	getQuestions: function() {
		var question = Ext.create('ARSnova.model.Question');
		question.getPreparationQuestions.apply(question, arguments);
	}
});
