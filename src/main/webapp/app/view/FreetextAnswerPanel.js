/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/FreetextAnswerPanel.js
 - Beschreibung: Zeigt Freitext-Antworten an
 - Version:      1.0, 11/06/12
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

Ext.define('ARSnova.view.FreetextAnswerPanel', {
	extend: 'Ext.Panel',
	
	config: {
		scroll: 'vertical',
		layout: 'fit',
		fullscreen: true,
		
		/**
		 * task for speakers in a session
		 * check every x seconds new feedback questions
		 */
		checkFreetextAnswersTask: null,
		
		freetextAnswerStore: null
	},
	
	constructor: function(arguments) {
		this.callParent(arguments);
		
		this.questionObj = arguments.question;
		this.lastPanel = arguments.lastPanel;
		var self = this;
		
		this.checkFreetextAnswersTask = {
			name: 'check for new freetext answers',
			scope: this,
			run: function() {
				this.checkFreetextAnswers();
			},
			interval: 15000
		},
		
		this.freetextAnswerStore = Ext.create('Ext.data.JsonStore', {
			model		: 'FreetextAnswer',
			sorters		: 'timestamp',
			groupField	: 'groupDate'
		});
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.BACK,
			ui		: 'back',
			scope	: this,
			handler	: function() {
				ARSnova.app.mainTabPanel._activeItem.on('deactivate', function() {
					this.destroy();
				}, this, {single:true});
				ARSnova.app.mainTabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTION,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});
		
		this.noFreetextAnswers = Ext.create('Ext.Panel', {
			cls: 'centerText',
			html: Messages.NO_ANSWERS
		});
		
		this.freetextAnswerList = Ext.create('Ext.List', {
			activeCls: 'search-item-active',
			store: this.freetextAnswerStore, 
			
			itemCls: 'forwardGroupedListButton',
			itemTpl: [
				'<div class="search-item">',
				'<span style="color:gray">{formattedTime}</span><span style="padding-left:30px">{answerSubject}</span>',
				'</div>'
			],
			grouped: true,
			scrollable: { disabled: true },
			
			listeners: {
				itemtap: function (list, index, element) {
					var answer = list.getStore().getAt(index).data;
					ARSnova.app.getController('Questions').freetextDetailAnswer({
						answer		: Ext.apply(answer, {
							deselectItem: function() { list.deselect(index); },
							removeItem: function() { list.getStore().remove(list.getStore().getAt(index)); }
						}), panel : self
					});
				},
		        initialize: function (list, eOpts){
		            var me = this;
		            if (typeof me.getItemMap == 'function'){
		                me.getScrollable().getScroller().on('refresh',function(scroller,eOpts){
		                	var itemsHeight = me.getItemHeight() * me.itemsCount;
		                	if(me.getGrouped()) {
		                		var groupHeight = typeof me.headerHeight !== 'undefined' ? me.headerHeight : 26;
		                		itemsHeight += me.groups.length * groupHeight;
		                	}
		                	me.setHeight(itemsHeight + 20);
		                });
		            }
		        }
			}
		});
		
		this.freetextAbstentions = new Ext.Button({
			hidden		: true,
			ui			: 'normal',
			text		: Messages.ABSTENTION,
			disabled	: true,
			cls			: 'answerListButton',
			badgeText	: '0',
			badgeCls	: 'badgeicon'
		});
		
		this.add([this.toolbar,
		    this.freetextAnswerList,
			this.noFreetextAnswers
		]);
		
		this.on('activate', function() {
			taskManager.start(this.checkFreetextAnswersTask);
		}, this);
		
		this.on('deactivate', function() {
			taskManager.stop(this.checkFreetextAnswersTask);
		}, this);
	},
	
	checkFreetextAnswers: function() {	
		ARSnova.app.questionModel.getAnsweredFreetextQuestions(localStorage.getItem("keyword"), this.questionObj._id, {
			success: function(response) {
				var responseObj = Ext.decode(response.responseText);
				var listItems = responseObj.map(function (item) {
					var v = item;
					var date = new Date(v.timestamp);
					return Ext.apply(item, {
						formattedTime	: Ext.Date.format(date, "H:i"),
						groupDate		: Ext.Date.format(date, "d.m.y")
					});
				});
				
				var self = ARSnova.app.mainTabPanel._activeItem;
				var abstentions = listItems.filter(function(item) {
					return item.abstention;
				});
				var answers = listItems.filter(function(item) {
					return !item.abstention;
				});
				// Have the first answers arrived? Then remove the "no answers" message. 
				if (!self.noFreetextAnswers.isHidden() && listItems.length > 0) {
					self.noFreetextAnswers.hide();
				} else if (self.noFreetextAnswers.isHidden() && listItems.length === 0) {
					// The last remaining answer has been deleted. Display message again.
					self.noFreetextAnswers.show();
				}
				
				self.freetextAnswerStore.removeAll();
				self.freetextAnswerStore.add(answers);
				self.freetextAbstentions.setBadge(abstentions.length);
				self.freetextAbstentions.setVisible(abstentions.length > 0);
			},
			failure: function() {
				console.log('server-side error');
			}
		});
	}
});
