/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/feedbackQuestions/questionsPanel.js
 - Beschreibung: Panel zum Anzeigen aller Zwischenfragen einer Session (für Dozenten).
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
Ext.regModel('FeedbackQuestion', {
    fields: ['fullDate', 'formattedTime', 'timestamp', 'subject', 'type', 'groupDate']
});

ARSnova.views.feedbackQuestions.QuestionsPanel = Ext.extend(Ext.Panel, {
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	layout		: 'fit',
	questionsCounter: 0,
	
	store: new Ext.data.JsonStore({
	    model  : 'FeedbackQuestion',
	    sorters: 'lastName',
	    groupField: 'groupDate',
	}),
	
	/**
	 * task for speakers in a session
	 * check every x seconds new feedback questions
	 */
	checkFeedbackQuestionsTask: {
		name: 'check for new feedback questions',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestions();
		},
		interval: 15000,
	},
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: Messages.HOME,
			ui		: 'back',
			hidden	: true,
			handler : function(){
				ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.speakerTabPanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    		scope		: this,
		    		after: function() {
		    			this.hide();
		    		}
		    	});
			},
		});
		
		this.editButton = new Ext.Button({
			text: Messages.EDIT,
			hidden: true,
			editMode: false,
			
			handler: function(){
				if(this.up('panel').store.getCount() == 0) {
					this.hide();
					return;
				}
				
				if(this.editMode) {
					this.unsetActive();
					this.deactivateAll();
				}
				else {
					this.setActive();
					this.activateAll();
				}
			},
			
			setActive: function(){
				this.addCls('x-button-action');
				this.setText(Messages.CANCEL);
				this.editMode = true;
			},
			
			unsetActive: function(){
				this.removeCls('x-button-action');
				this.setText(Messages.EDIT);
				this.editMode = false;
			},
			
			/**
			 * Adds the 'Delete' button to all search-entries
			 */
			activateAll: function(){
				var activeCls = this.up('panel').list.activeCls;
				Ext.select('div.x-list-item').each(function(element) {
					element.addCls(activeCls);
				});
			},
			
			/**
			 * Removes the 'Delete' button from all search-entries
			 */
			deactivateAll: function(){
				var activeCls = this.up('panel').list.activeCls;
				Ext.select('div.x-list-item').each(function(element) {
					element.removeCls(activeCls);
				});
			},
			
			check: function() {
				var store = this.up('panel').store;
				
				if (store.getCount() == 0) {
					this.hide();
					this.unsetActive();
				} else {
					this.show()
				}
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Auditorium',
			items: [
		        this.backButton,
		        { xtype: 'spacer', },
		        this.editButton
	        ],
		});
		
		this.dockedItems = [this.toolbar];

		this.noQuestionsFound = new Ext.Panel({
			cls: 'centerText',
			html: Messages.NO_QUESTIONS,
		});
		
		this.list = new Ext.List({
			activeCls: 'search-item-active',
			style: {
				backgroundColor: 'transparent',
			},
			
			itemCls: 'forwardListButton',
		    itemTpl: [
		    	'<div class="search-item">',
		    	'<div class="action delete x-button">Delete</div>',
		    	'<span style="color:gray">{formattedTime}</span><span style="padding-left:30px">{subject}</span>',
		    	'</div>'
		    	],
		    grouped: true,
		    store: this.store,
		    listeners: {
		    	itemswipe: function(list, index, node){
		            var el        = Ext.get(node),
		                hasClass  = el.hasCls(this.activeCls);
		            
		            if (hasClass) { el.removeCls(this.activeCls); } 
		            else { el.addCls(this.activeCls);}
		        },
		    	itemtap: function(list, index, item, event){
		    		var editButton = list.up('panel').editButton;
		        	if (event.getTarget('.' + this.activeCls + ' div.delete')) {
		                var store    = this.store;
		                
		                var question = store.getAt(index).data.obj;
		                ARSnova.questionModel.destroy({
		                	_id: question.id,
		                	_rev: question.rev,
		                },{
		                	success: function(){
		                		store.removeAt(index);
		                		var tab = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab;
		                		tab.setBadge(tab.badgeText - 1);
		                		var panel = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel;
		                		panel.questionsCounter--;
		                		if(panel.questionsCounter == 0)
		                			panel.getFeedbackQuestions();
		                		
		                		editButton.check();
				                if(editButton.editMode) {
				                	editButton.activateAll();
				                }
	                		},
		                	failure: function(){console.log('fehler')},
		                })
		            } else {
		            	editButton.deactivateAll();
		            	editButton.unsetActive();
		                
			    		Ext.dispatch({
							controller	: 'questions',
							action		: 'detailsFeedbackQuestion',
							question	: list.store.getAt(index).data.obj,
						})
		            }
		    	}
		    }
		}),
		this.items = [
			this.list,
			this.noQuestionsFound
        ];
		
		ARSnova.views.feedbackQuestions.QuestionsPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('deactivate', function(){
			var selModel = this.list.getSelectionModel();
			selModel.deselect(selModel.lastSelected, true);
		})
		
		ARSnova.views.feedbackQuestions.QuestionsPanel.superclass.initComponent.call(this);
	},
	
	getFeedbackQuestions: function(){
		ARSnova.showLoadMask(Messages.LOADING_NEW_QUESTIONS);
		ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.store.loadData({});
		ARSnova.questionModel.getInterposedQuestions(localStorage.getItem('sessionId'),{
			success: function(response){
				var questions = Ext.decode(response.responseText).rows;
    			var panel = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel;
    			ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab.setBadge(questions.length);
    			panel.questionsCounter = questions.length;
    			
				if(panel.questionsCounter == 0){
					panel.list.hide();
					panel.noQuestionsFound.show();
					panel.editButton.hide();
				} else {
					panel.list.show();
					panel.noQuestionsFound.hide();
					panel.editButton.show();
					for(var i = 0; i < questions.length; i++){
						var question = questions[i].value;
						question.id = questions[i].id;
						var formattedTime = "", fullDate = "", groupDate = "";
						if(question.timestamp){
							var time = new Date(question.timestamp);
							var minutes, hours, day, month, year;
							minutes = time.getMinutes();
							hours 	= time.getHours();
							day   	= time.getDate();
							month 	= time.getMonth() + 1;
							year  	= time.getYear() - 100;
							formattedTime = (hours < 10 ? '0' + hours : hours) + ":" + (minutes < 10 ? '0' + minutes : minutes); 
							groupDate 	  = (day < 10 ? '0' + day : day) + "." + (month < 10 ? '0' + month : month) + "." + year;
							fullDate 	  = formattedTime + " Uhr am " + groupDate;
						} else {
							groupDate = Messages.NO_DATE;
						}
						question.formattedTime = formattedTime;
						question.fullDate = fullDate;
						if(!question.subject)
							question.subject = Messages.NO_SUBJECT;
						panel.store.add({
							formattedTime: formattedTime,
							timestamp: question.timestamp,
							groupDate: groupDate,
							subject: question.subject,
							type: question.type,
							obj: question
						});
					}
					panel.store.sort([{
						property : 'timestamp',
						direction: 'DESC'
					}]);
				}
				panel.doLayout();
				setTimeout("ARSnova.hideLoadMask()", 500);
			},
			failure: function(records, operation){
				console.log('server side error');
			}
		});
	},
	
	checkFeedbackQuestions: function(){
		ARSnova.questionModel.countFeedbackQuestions(localStorage.getItem("sessionId"), {
			success: function(response){
				var feedbackQuestionsPanel = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				var panel = feedbackQuestionsPanel.questionsPanel;
				var responseObj = Ext.decode(response.responseText).rows;
				
				var value = 0;
				if (responseObj.length > 0){
					panel.editButton.show();
					value = responseObj[0].value;
				} else {
					panel.editButton.hide();
				}
				
				ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton.setBadge(value);
				feedbackQuestionsPanel.tab.setBadge(value);
				
				if(panel.questionsCounter != value) {
					panel.questionsCounter = value;
					panel.editButton.unsetActive();
					panel.getFeedbackQuestions();
				}
			}, 
			failure: function(){
				console.log('server-side error');
			}
		})
	},
});