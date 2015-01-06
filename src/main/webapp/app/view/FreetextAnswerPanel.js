/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('ARSnova.view.FreetextAnswerPanel', {
	extend: 'Ext.Panel',

	config: {
		layout: 'vbox',
		fullscreen: true,

		/**
		 * task for speakers in a session
		 * check every x seconds new feedback questions
		 */
		checkFreetextAnswersTask: null,

		freetextAnswerStore: null
	},

	constructor: function (args) {
		this.callParent(arguments);

		this.questionObj = args.question;
		this.lastPanel = args.lastPanel;
		var self = this;

		this.checkFreetextAnswersTask = {
			name: 'check for new freetext answers',
			scope: this,
			run: function () {
				this.checkFreetextAnswers();
			},
			interval: 15000
		},

		this.freetextAnswerStore = Ext.create('Ext.data.JsonStore', {
			model: 'FreetextAnswer',
			sorters: [{property: 'timestamp', direction: 'DESC'}],
			groupField: 'groupDate',
			grouper: {property: 'timestamp', direction: 'DESC'}
		});

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			handler: function () {
				ARSnova.app.mainTabPanel._activeItem.on('deactivate', function () {
					this.destroy();
				}, this, {single:true});
				ARSnova.app.mainTabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTION,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});

		this.freetextAnswerList = Ext.create('Ext.List', {
			activeCls: 'search-item-active',
			store: this.freetextAnswerStore,
			layout: 'fit',
			flex: 1,

			itemCls: 'forwardListButton',
			itemTpl: [
				'<div class="search-item noOverflow">',
				'<span style="color:gray">{formattedTime}</span><span style="padding-left:30px">{answerSubject:htmlEncode}</span>',
				'</div>'
			],
			grouped: true,

			deferEmptyText: false,
			emptyText: Messages.NO_ANSWERS,

			listeners: {
				itemtap: function (list, index, element) {
					var answer = list.getStore().getAt(index).data;
					ARSnova.app.getController('Questions').freetextDetailAnswer({
						answer: Ext.apply(answer, {
							deselectItem: function () {list.deselect(index);},
							removeItem: function () {list.getStore().remove(list.getStore().getAt(index));}
						}), panel: self
					});
				}
			}
		});

		this.freetextAbstentions = Ext.create('Ext.Button', {
			hidden: true,
			ui: 'normal',
			text: Messages.ABSTENTION,
			disabled: true,
			cls: 'answerListButton',
			badgeText: '0',
			badgeCls: 'badgeicon'
		});

		this.add([this.toolbar, this.freetextAnswerList]);

		this.on('activate', function () {
			ARSnova.app.innerScrollPanel = this.freetextAnswerList;
			ARSnova.app.taskManager.start(this.checkFreetextAnswersTask);
		}, this);

		this.on('deactivate', function () {
			ARSnova.app.innerScrollPanel = false;
			ARSnova.app.taskManager.stop(this.checkFreetextAnswersTask);
		}, this);
		
		this.on('painted', function() {
			ARSnova.app.innerScrollPanel = this.freetextAnswerList;
		});
	},

	checkFreetextAnswers: function () {
		ARSnova.app.questionModel.getAnsweredFreetextQuestions(localStorage.getItem("keyword"), this.questionObj._id, {
			success: function (response) {
				var responseObj = Ext.decode(response.responseText);
				var listItems = responseObj.map(function (item) {
					var v = item;
					var date = new Date(v.timestamp);
					return Ext.apply(item, {
						formattedTime: Ext.Date.format(date, "H:i"),
						groupDate: Ext.Date.format(date, "d.m.y")
					});
				});

				var self = ARSnova.app.mainTabPanel._activeItem;
				var abstentions = listItems.filter(function (item) {
					return item.abstention;
				});
				var answers = listItems.filter(function (item) {
					return !item.abstention;
				});

				self.freetextAnswerStore.removeAll();
				self.freetextAnswerStore.add(answers);
				self.freetextAnswerStore.sort([{
					property: 'timestamp',
					direction: 'DESC'
				}]);
				self.freetextAbstentions.setBadgeText(abstentions.length);
				self.freetextAbstentions.setHidden(abstentions.length === 0);
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	}
});
