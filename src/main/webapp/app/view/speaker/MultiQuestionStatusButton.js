/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Button zum Starten/Stoppen mehrerer Fragen.
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
Ext.define('ARSnova.view.speaker.MultiQuestionStatusButton', {
	extend: 'ARSnova.view.QuestionStatusButton',
	
	config: {
		questionStore: null,
		wording: {
			stop: Messages.STOP_ALL_QUESTIONS,
			release: Messages.RELEASE_ALL_QUESTIONS,
			confirm: Messages.CONFIRM_CLOSE_ALL_QUESTIONS,
			confirmMessage: Messages.CONFIRM_CLOSE_ALL_QUESTIONS_MESSAGE
		}
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		this.checkInitialStatus();
	},
	
	checkInitialStatus: function(){
		// Initial status is always "open" unless all questions are already closed
		var hasActiveQuestions = false;
		this.getQuestionStore().each(function(item) {
			hasActiveQuestions = hasActiveQuestions || item.get("active");
		});
		
		if (hasActiveQuestions) {
			this.isOpen = true;
			this.questionIsClosedButton.hide();
			this.questionIsClosedText.hide();
			this.questionIsOpenButton.show();
			this.questionIsOpenText.show();
		} else {
			this.isOpen = false;
			this.questionIsClosedButton.show();
			this.questionIsClosedText.show();
			this.questionIsOpenButton.hide();
			this.questionIsOpenText.hide();
		}
	},
	
	changeStatus: function() {
		if (!this.getQuestionStore()) {
			return;
		}
		
		var questions = [];
		this.getQuestionStore().each(function(question) {
			questions.push(question);
		});
		
		if (this.isOpen) {
			Ext.Msg.confirm(this.getWording().confirm, this.getWording().confirmMessage, function (buttonId) {
				if (buttonId != "no") {
					/* close all questions */
					ARSnova.app.getController('Questions').setAllActive({
						questions	: questions, 
						active		: false,
						callback	: this.questionClosedSuccessfully,
						scope		: this
					});
				}
			}, this);
		} else {
			/* open all questions */
			ARSnova.app.getController('Questions').setAllActive({
				questions	: questions,
				active		: true,
				callback	: this.questionOpenedSuccessfully,
				scope		: this
			});
		}
	}
});
