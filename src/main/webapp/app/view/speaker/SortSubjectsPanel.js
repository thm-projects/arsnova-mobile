/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2021 The ARSnova Team and Contributors
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
Ext.define('ARSnova.view.speaker.SortSubjectsPanel', {
	extend: 'ARSnova.view.speaker.SortQuestionsPanel',

	requires: [
		'ARSnova.model.Question',
		'ARSnova.view.speaker.SortableListExtended'
	],

	config: {
		title: 'SortSubjectsPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
		},

		controller: null
	},

	initialize: function () {
		this.callParent(arguments);

		this.questionListContainer.setTitle(Messages.SORT_CATEGORIES_TITLE);
		this.saveButtonToolbar.setHandler(function (button) {
			this.saveHandler(button).then(function (response) {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.animateActiveItem(sTP.audienceQuestionPanel, {
					type: 'slide',
					direction: 'right'
				});
			});
		});
		this.toolbar.setTitle(Messages.SORT_CATEGORIES);
	},

	initializeQuestionList: function () {
		this.questionList = Ext.create('ARSnova.view.components.List', {
			activeCls: 'search-item-active',
			cls: 'roundedCorners allCapsHeader',
			plugins: 'sortablelistextended',
			hidden: true,

			style: {
				backgroundColor: 'transparent'
			},

			store: this.questionStore,
			itemCls: 'forwardListButton',
			itemTpl:
				'<div class="icon-drag dragStyle x-list-sortablehandle">&#xf0dc;</div>' +
				'<tpl if="active"><div class="buttontext noOverflow">{subject:htmlEncode}</div></tpl>' +
				'<tpl if="!active"><div class="isInactive buttontext noOverflow">{subject:htmlEncode}</div></tpl>' +
				'<div class="x-button x-hasbadge audiencePanelListBadge"></div>',

			listeners: {
				scope: this,
				itemtap: function (list, index, element) {
					var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
					sTP.sortQuestionsPanel.subject = list.getStore().getAt(index).data.subject;
					sTP.animateActiveItem(sTP.sortQuestionsPanel, 'slide');
				}
			}
		});
	},

	createStore: function () {
		var store = Ext.create('Ext.data.JsonStore', {
			model: 'ARSnova.model.Question'

		});
		return store;
	},

	onActivate: function () {
		if (!this.getController()) {
			return;
		}
		this.getController().getSubjectSort({
			subject: this.subject,
			callbacks: {
				success: Ext.bind(function (response) {
					this.sortType = response.sortType;
					this.sortTypeBackup = response.sortType;
				}, this),
				failure: function (response) {
					console.log('getSubjectSort failed');
				}
			}
		});

		this.questionStore.removeAll();
		this.questionStoreBackup.removeAll();
		this.questionEntries = [];

		this.getController().getQuestions(sessionStorage.getItem('keyword'), {
			success: Ext.bind(function (response) {
				var questions = Ext.decode(response.responseText);
				this.questionStore.sort([]);
				this.questionStore.add(questions);

				var questionRecords = [];
				var questionSubjects = [];

				this.questionStore.each(function (record) {
					var subject = record.get('subject'), time = record.get('timestamp');
					var index = questionSubjects.indexOf(subject);
					if (index < 0) {
						questionRecords.push(record);
						questionSubjects.push(subject);
					} else if (questionRecords[index].get('timestamp') < time) {
						questionRecords[index] = record;
					}
				});

				this.questionStore.removeAll();
				for (var i = 0; i < questionRecords.length; i++) {
					this.questionStore.addData(questionRecords[i]);
					this.questionStoreBackup.addData(questionRecords[i]);
				}

				this.questionListContainer.show();
				this.questionList.show();
			}, this),
			empty: Ext.bind(function () {
				this.questionListContainer.hide();
				this.questionList.show();
			}, this),
			failure: function (response) {
				console.log('server-side error questionModel.getSkillQuestions');
			}
		});
	},

	onDeactivate: function () {
		this.questionList.hide();
	},

	backButtonHandler: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.animateActiveItem(sTP.audienceQuestionPanel, {
			type: 'slide',
			direction: 'right'
		});
	},

	saveHandler: function (button) {
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.sortSubjectsPanel;

		var subjects = [];
		panel.questionStore.each(function (record) {
			subjects.push(record.get('subject'));
		});

		var promise = panel.dispatch(button, panel.sortType, subjects);
		return promise;
	},
	sortAlphabetHandler: function (button) {
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.sortSubjectsPanel;
		panel.sortType = 'alphabet';
		panel.sortQuestions();
	},
	sortTimeHandler: function (button) {
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.sortSubjectsPanel;
		panel.sortType = 'time';
		panel.sortQuestions();
	},
	sortRandomHandler: function (button) {
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.sortSubjectsPanel;
		panel.sortType = 'custom';
		panel.questionStore.sort([{
			sorterFn: function (a, b) {
				return 0.5 - Math.random();
			},
			direction: 'ASC'
		}]);
	},
	sortRevertHandler: function (button) {
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.sortSubjectsPanel;
		panel.sortType = panel.sortTypeBackup;
		panel.questionStore.removeAll();
		panel.questionStore.sort([]);
		panel.questionStoreBackup.each(function (record) {
			panel.questionStore.add(record);
		});
		panel.sortQuestions();
	},

	sortQuestions: function () {
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.sortSubjectsPanel;
		switch (panel.sortType) {
			case 'alphabet':
				panel.questionStore.sort([{
					sorterFn: function (a, b) {
						var as = a.get('subject'), bs = b.get('subject');
						if (as.toLowerCase() < bs.toLowerCase()) { return -1; }
						if (as.toLowerCase() > bs.toLowerCase()) { return 1; }
						return 0;
					},
					direction: 'ASC'
				}]);
				break;
			case 'time':
				panel.questionStore.sort([
					{
						property: 'timestamp',
						direction: 'ASC'
					}
				]);
				break;
		}
	},
	dispatch: function (button, sortType, subjects) {
		button.disable();
		var promise = new RSVP.Promise();
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.sortSubjectsPanel;
		panel.getController().setSubjectSort({
			sortType: sortType,
			subjects: subjects,
			callbacks: {
				success: function (response, opts) {
					promise.resolve(response);
					button.enable();
				},
				failure: function (response, opts) {
					Ext.Msg.alert(Messages.NOTICE, Messages.SORT_TRANSMISSION_ERROR);
					promise.reject(response);
					button.enable();
				}
			}
		});
		return promise;
	}
});
