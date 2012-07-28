/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/questionStatusButton.js
 - Beschreibung: Button zum Starten/Stoppen einer Frage.
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
ARSnova.views.QuestionStatusButton = Ext.extend(Ext.Panel, {
	cls	: 'threeButtons left',
	handler: null,
	isOpen: false,
	
	questionObj: null,
	
	questionIsOpenButton: null,
	questionIsClosedButton: null,
	
	constructor: function(questionObj){
		this.questionObj = questionObj;
		
		this.questionIsClosedButton = new Ext.Button({
			cls			: 'closedSession',
			handler		: function(){
				ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.questionStatusButton.changeStatus();
			},
		});
		
		this.questionIsClosedText = new Ext.Panel({
			cls	: 'centerTextSmall',
			html: Messages.RELEASE_QUESTION,
		});
		
		this.questionIsOpenButton = new Ext.Button({
			cls			: 'openSession',
			handler		: function(){
				ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.questionStatusButton.changeStatus();
			},
		});
		
		this.questionIsOpenText = new Ext.Panel({
			cls	: 'centerTextSmall',
			html: Messages.STOP_QUESTION,
		});

		this.items = [this.questionIsClosedButton, this.questionIsClosedText, this.questionIsOpenButton, this.questionIsOpenText];
		
		if(this.questionObj.active == 1){
			this.isOpen = true;
			this.questionIsClosedButton.hide();
			this.questionIsClosedText.hide();
		} else {
			this.isOpen = false;
			this.questionIsOpenButton.hide();
			this.questionIsOpenText.hide();
		}

		ARSnova.views.QuestionStatusButton.superclass.constructor.call(this);
	},
	
	changeStatus: function(){
		var id = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.questionObj._id;
		
		if(this.isOpen){
			/* close this question */
			Ext.dispatch({
				controller	: 'questions',
				action		: 'setActive',
				questionId	: id, 
				active		: 0,
				callback	: this.questionClosedSuccessfully
			})
		} else {
			/* open this question */
			Ext.dispatch({
				controller	: 'questions',
				action		: 'setActive',
				questionId	: id,
				active		: 1,
				callback	: this.questionOpenedSuccessfully
			})
		}
	},
	
	checkInitialStatus: function(){
		if(this.isRendered) return;
		
		if(localStorage.getItem('active') == 1){
			this.isOpen = true;
		} else {
			this.isOpen = false;
		}
		ARSnova.mainTabPanel.layout.activeItem.doLayout();
		this.isRendered = true;
	},
	
	questionClosedSuccessfully: function(){
		this.isOpen = false;
		this.questionIsClosedButton.show();
		this.questionIsClosedText.show();
		this.questionIsOpenButton.hide();
		this.questionIsOpenText.hide();
		ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.editButton.show();
	},
	
	questionOpenedSuccessfully: function(){
		this.isOpen = true;
		this.questionIsOpenButton.show();
		this.questionIsOpenText.show();
		this.questionIsClosedButton.hide();
		this.questionIsClosedText.hide();
		ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.editButton.hide()
	},
}); 