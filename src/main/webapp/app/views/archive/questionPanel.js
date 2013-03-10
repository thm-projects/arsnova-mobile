/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/archive/questionPanel.js
 - Beschreibung: Panel zum Anzeigen der Fragen eines Archivs. TODO not yet in use
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
ARSnova.views.archive.QuestionPanel = Ext.extend(Ext.Carousel, {
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	courseId: null,
	questionCounter: 0,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Home',
			ui		: 'back',
			handler	: function() {
				var aTP = ARSnova.mainTabPanel.tabPanel.archiveTabPanel;
				aTP.setActiveItem(aTP.coursePanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700
		    	});
			}
		});
		
		this.listeners = {
			cardswitch: function(panel, newCard, oldCard, index, animated){
				//update toolbar with question number
				var questionNumber = "Archiv-Frage";
				if(newCard.questionObj.number)
					questionNumber += " " + newCard.questionObj.number;
				panel.toolbar.setTitle(questionNumber);
				
				//update question counter in toolbar
				var counterEl = panel.questionCounter;
				var counter = counterEl.el.dom.innerHTML.split("/");
				counter[0] = index + 1;
				counterEl.update(counter.join("/"));
			}				
		};
		
		this.questionCounter = new Ext.Container({
			cls: "x-toolbar-title alignRight",
			html: '0/0'
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Archiv-Frage',
			items: [
		        this.backButton,
		        { xtype: 'spacer' },
		        this.questionCounter
	        ]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [];
		
		ARSnova.views.archive.QuestionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('beforeactivate', this.beforeActivate);
		this.on('activate', this.onActivate);
		
		ARSnova.views.archive.QuestionPanel.superclass.initComponent.call(this);
	},
	
	beforeActivate: function(){
		this.removeAll();
		this.indicator.show();
		this.questionCounter.show();
	},
	
	onActivate: function(){
		ARSnova.showLoadMask("Suche Fragen...");
		this.getCourseQuestions();
	},
	
	getCourseQuestions: function(){
		ARSnova.questionModel.releasedByCourseId(this.courseId, {
			success: function(response){
				var questionPanel = ARSnova.mainTabPanel.tabPanel.archiveTabPanel.questionPanel;
				var questions = Ext.decode(response.responseText).rows;
				var questionsArr = [];
				var questionIds = [];
				
				if (questions.length == 0){
					//no questions found
					questionPanel.questionCounter.hide();
					questionPanel.add({
						cls: 'centerText',
						html: 'Es wurden noch keine Fragen freigegeben.'
					});
					questionPanel.indicator.hide();
					questionPanel.doLayout();
					ARSnova.hideLoadMask();
					return;
				} else {
					//update question counter in toolbar
					var counterEl = questionPanel.questionCounter;
					var counter = counterEl.el.dom.innerHTML.split("/");
					counter[0] = "1";
					counter[1] = questions.length;
					counterEl.update(counter.join("/"));
				}
				
				if (questions.length == 1){
					questionPanel.indicator.hide();
				}
				
				questions.forEach(function(question){
					questionsArr[question.id] = question.value;
					questionsArr[question.id]._id = question.id;
					questionIds.push(question.id);
					questionPanel.addQuestion(question);
				});
				questionPanel.doComponentLayout();
				ARSnova.hideLoadMask();
			},
			failure: function(response){
				console.log('error');
			}
		});
	},
		
	addQuestion: function(question){
		this.add(new ARSnova.views.Question(question.value));
	}
});