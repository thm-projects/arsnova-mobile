/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
 * Copyright (C) 2015 Simeon Perlov
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
		'Ext.plugin.SortableListExtended'
	],

	config: {
		title: 'SortSubjectsPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},

		controller: null
	},

	initialize: function () {
		this.callParent(arguments);

		this.toolbar.setTitle(Messages.SORT_CATEGORIES_TITLE);
	},

	initializeQuestionList: function () {
		this.questionList = Ext.create('Ext.List', {
			activeCls: 'search-item-active',
			cls: 'roundedCorners allCapsHeader',

			scrollable: {disabled: true},
			hidden: true,
			infinite: true,
			plugins: 'sortablelistextended',

			style: {
				backgroundColor: 'transparent'
			},


			itemCls: 'forwardListButton',
			itemTpl:
				'<div class="icon-drag thm-grey dragStyle x-list-sortablehandle">&#xf0dc;</div>' +
				'<tpl if="active"><div class="buttontext noOverflow">{subject:htmlEncode}</div></tpl>' +
				'<tpl if="!active"><div class="isInactive buttontext noOverflow">{subject:htmlEncode}</div></tpl>' +
				'<div class="x-button x-hasbadge audiencePanelListBadge"></div>',
			store: this.questionStore,

			listeners: {
				scope: this,
				itemtap: function (list, index, element) {
					var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
					sTP.sortQuestionsPanel.subject = list.getStore().getAt(index).data;
					sTP.animateActiveItem(sTP.sortQuestionsPanel, 'slide');
				},
				painted: function (list, eOpts) {
					var count = this.questionStore.getCount(),
						height = 42 * count;
					this.questionList.setHeight(height);
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
				this.questionStore.add(questions);
				this.questionStoreBackup.add(questions);

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
			direction: 'right',
			duration: 700
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
				panel.questionStore.sort([
					{
						property : 'subject',
						direction: 'ASC'
					}
				]);
				break;
			case 'time':
				panel.questionStore.sort([
					{
						property : '_id',
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
