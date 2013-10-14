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
Ext.define('ARSnova.view.feedbackQuestions.QuestionsPanel', {
	extend: 'Ext.Panel',
	
	config: {
		title: 'QuestionsPanel',
		fullscreen: true,
		layout: 'vbox',
		
		store: Ext.create('Ext.data.JsonStore', {
		    model  : 'ARSnova.model.FeedbackQuestion',
		    sorters: [{
		    	property : "timestamp",
                direction: "DESC"
		    }],
		    groupField: 'groupDate',
	        grouper: {
	        	property : "timestamp",
	        	direction: 'DESC'
	        }
		}),
		
		/**
		 * task for speakers in a session
		 * check every x seconds new feedback questions
		 */
		checkFeedbackQuestionsTask: {
			name: 'check for new feedback questions',
			run: function(){
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestions();
			},
			interval: 15000
		}
	},
	
	toolbar		: null,
	backButton	: null,
	questionsCounter: 0,
	
	initialize: function(){
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.HOME,
			ui		: 'back',
			hidden	: true,
			handler : function(){
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    		scope		: this,
		    		listeners: { animationend: function() { 
						this.hide();
		    		}, scope: this }
		    	});
			}
		});
		
		this.editButton = new Ext.Button({
			text: Messages.EDIT,
			hidden: true,
			editMode: false,
			
			handler: function(){
				if(this.up('panel').getStore().getCount() == 0) {
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
				var store = this.up('panel').getStore();
				
				if (store.getCount() == 0) {
					this.hide();
					this.unsetActive();
				} else {
					this.show();
				}
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: 'Auditorium',
			docked: 'top',
			ui: 'light',
			items: [
		        this.backButton,
		        { xtype: 'spacer' },
		        this.editButton
	        ]
		});

		this.noQuestionsFound = Ext.create('Ext.Panel', {
			cls: 'centerText',
			html: Messages.NO_QUESTIONS
		});
		
		this.list = Ext.create('Ext.List', {
			activeCls: 'search-item-active',
			layout: 'fit',
			flex: 1,
			
			style: {
				backgroundColor: 'transparent'
			},
			
			itemCls: 'forwardListButton',
	    	itemTpl: Ext.create('Ext.XTemplate',
  		    	'<div class="search-item noOverflow">',
  		    		'<div class="action delete x-button">Delete</div>',
  			    	'<span style="color:gray;">{formattedTime}</span>',
  			    	'<tpl if="obj.get(\'read\')">',
  				    	'<span style="padding-left:30px;">{subject:htmlEncode}</span>',
  			    	'</tpl>',
  			    	'<tpl if="!obj.get(\'read\')">',
				    	'<span style="padding-left:30px;font-weight:bold;color:red">{subject:htmlEncode}</span>',
			    	'</tpl>',
  		    	'</div>'
	    	),
		    grouped: true,
		    store: this.getStore(),
		    listeners: {
		    	itemswipe: function(list, index, target) {
		            var el        = target.element,
		                hasClass  = el.hasCls(this.activeCls);
		            
		            if (hasClass) { el.removeCls(this.activeCls); } 
		            else { el.addCls(this.activeCls);}
		        },
		    	itemtap: function(list, index, target, record, event){
		    		var editButton = list.up('panel').editButton;
		        	if (event.getTarget('.' + this.activeCls + ' div.delete')) {
		                var store    = this.getStore();
		                
		                var question = store.getAt(index).data.obj;
		                ARSnova.app.questionModel.deleteInterposed(question.data, {
		                	success: function(){
		                		store.removeAt(index);
		                		var tab = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab;
		                		if (parseInt(tab.badgeText) > 0) {
		                			tab.setBadgeText(tab.badgeText - 1);
		                		}
		                		var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel;
		                		panel.questionsCounter--;
		                		if(panel.questionsCounter == 0)
		                			panel.getFeedbackQuestions();
		                		
		          	      		editButton.check();
				                if(editButton.editMode) {
				                	editButton.activateAll();
				                }
	                		},
		                	failure: function(){
		                		console.log('fehler');
		                	}
		                });
		            } else {
		            	editButton.deactivateAll();
		            	editButton.unsetActive();
		                
		            	var details = list.getStore().getAt(index).data;
		            	details.obj.set('read', true);
		            	list.refresh();
		            	
			    		ARSnova.app.getController('Questions').detailsFeedbackQuestion({
							question		: details.obj,
							formattedTime	: details.formattedTime,
							fullDate		: details.fullDate
						});
		            }
		    	}
		    }
		}),
		
		this.add([
		    this.toolbar,
		    this.noQuestionsFound,
			this.list
        ]);
		
		this.on('deactivate', function(){
			this.list.deselect(this.list._lastSelected, true);
		});
	},
	
	getFeedbackQuestions: function(){
		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOADING_NEW_QUESTIONS);
		ARSnova.app.questionModel.getInterposedQuestions(localStorage.getItem('keyword'),{
			success: function(response){
				var questions = Ext.decode(response.responseText);
				var fQP = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;
    			var panel = fQP.questionsPanel;
    			ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab.setBadgeText(questions.length);
    			panel.questionsCounter = questions.length;

				if(panel.questionsCounter == 0){
					panel.list.hide();
					panel.noQuestionsFound.show();
					panel.editButton.hide();
				} else {
					panel.getStore().remove(panel.getStore().getRange());
					panel.list.show();
					panel.noQuestionsFound.hide();
					panel.editButton.show();
					var unread = 0;
					for(var i = 0, question; question = questions[i]; i++){
						var formattedTime = "", fullDate = "", groupDate = "";
						if (question.timestamp) {
							var time = new Date(question.timestamp);
							formattedTime = moment(time).format('LT');
							groupDate 	  = moment(time).format('L');
							fullDate 	  = moment(time).format('LLL');
						} else {
							groupDate = Messages.NO_DATE;
						}
						question.formattedTime = formattedTime;
						question.fullDate = fullDate;
						if(!question.subject)
							question.subject = Messages.NO_SUBJECT;
						
						if (!question.read) {
							unread++;
						}

						panel.getStore().add({
							formattedTime: formattedTime,
							fullDate: fullDate,
							timestamp: question.timestamp,
							groupDate: groupDate,
							subject: question.subject,
							type: question.type,
							read: question.read,
							obj: Ext.create('ARSnova.model.FeedbackQuestion', question)
						});
					}
					
					fQP.tab.setBadgeText(unread);
					ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton.setBadge([{
						badgeText: questions.length, badgeCls: "bluebadgeicon"
					}]);

					panel.getStore().sort([{
						property : 'timestamp',
						direction: 'DESC'
					}]);
				}
				hideLoadMask();
			},
			failure: function(records, operation){
				console.log('server side error');
			}
		});
	},
	
	checkFeedbackQuestions: function(){
		ARSnova.app.questionModel.countFeedbackQuestions(localStorage.getItem("keyword"), {
			success: function(response){
				var feedbackQuestionsPanel = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				var panel = feedbackQuestionsPanel.questionsPanel;
				var questionCount = Ext.decode(response.responseText);
				
				if (questionCount.total > 0){
					panel.editButton.show();
				} else {
					panel.editButton.hide();
				}
				
				feedbackQuestionsPanel.tab.setBadgeText(questionCount.unread);
				ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton.setBadge([{
					badgeText: questionCount.total, badgeCls: "bluebadgeicon"
				}]);

				if(panel.questionsCounter != questionCount.total) {
					panel.questionsCounter = questionCount.total;
					panel.editButton.unsetActive();
					panel.getFeedbackQuestions();
				}
			}, 
			failure: function(){
				console.log('server-side error');
			}
		});
	}
});
