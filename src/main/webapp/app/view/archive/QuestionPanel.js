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
Ext.define('ARSnova.view.archive.QuestionPanel', {
	extend: 'Ext.Carousel',
	
	config: {
		fullscreen: true,
	},

	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	courseId: null,
	questionCounter: 0,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: 'Home',
			ui		: 'back',
			handler	: function() {
				var aTP = ARSnova.app.mainTabPanel.tabPanel.archiveTabPanel;
				aTP.animateActiveItem(aTP.coursePanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    		listeners: { animationend: function() { 
		    		}, scope: this }
		    	});
			}
		});
		
		this.config.listeners = {
			activeitemchange: function(panel, newCard, oldCard){
				//update toolbar with question number
				var questionNumber = "Archiv-Frage";
				if(newCard.questionObj.number)
					questionNumber += " " + newCard.questionObj.number;
				panel.toolbar.setTitle(questionNumber);
				
				//update question counter in toolbar
				var counterEl = panel.questionCounter;
				var counter = counterEl.element.dom.innerText.split("/");

				counter[0] = panel.activeIndex + 1;
				counterEl.setHtml(counter.join("/"));
			}				
		};
		
		this.questionCounter = Ext.create('Ext.Container', {
			cls: "x-toolbar-title alignRight",
			html: '0/0'
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: 'Archiv-Frage',
			docked: 'top',
			items: [
		        this.backButton,
		        { xtype: 'spacer' },
		        this.questionCounter
	        ]
		});
		
		this.add([this.toolbar]);
		
		this.on('activate', this.beforeActivate, this, null, 'before');
		this.on('activate', this.onActivate);
	},
	
	beforeActivate: function(){
		this.removeAll();
		this.indicator.show();
		this.questionCounter.show();
	},
	
	onActivate: function(){
		ARSnova.app.showLoadMask("Suche Fragen...");
		this.getCourseQuestions();
	},
	
	getCourseQuestions: function(){
		ARSnova.app.questionModel.releasedByCourseId(this.courseId, {
			success: function(response){
				var questionPanel = ARSnova.app.mainTabPanel.tabPanel.archiveTabPanel.questionPanel;
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
					questionPanel._indicator.hide();
					ARSnova.app.hideLoadMask();
					return;
				} else {
					//update question counter in toolbar
					var counterEl = questionPanel.questionCounter;
					var counter = counterEl.element.dom.innerText.split("/");
					counter[0] = "1";
					counter[1] = questions.length;
					counterEl.setHtml(counter.join("/"));
				}
				
				if (questions.length == 1){
					questionPanel._indicator.hide();
				}
				
				questions.forEach(function(question){
					questionsArr[question.id] = question.value;
					questionsArr[question.id]._id = question.id;
					questionIds.push(question.id);
					questionPanel.addQuestion(question);
				});
				ARSnova.app.hideLoadMask();
			},
			failure: function(response){
				console.log('error');
			}
		});
	},
		
	addQuestion: function(question){
		this.add(Ext.create('ARSnova.view.Question', { questionObj: question.value }));
	}
});