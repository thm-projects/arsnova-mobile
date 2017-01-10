/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
Ext.define('ARSnova.view.diagnosis.StatisticsPanel', {
	extend: 'Ext.Container',

	requires: ['Ext.form.Panel', 'Ext.form.FieldSet', 'ARSnova.model.Statistics'],

	config: {
		fullscreen: true,
		title: 'StatisticPanel',
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
		}
	},

	/* panels */
	tablePanel: null,
	testy: null,

	/* statistics */
	statistics: null,

	/* toolbar items */
	toolbar: null,
	backButton: null,

	/**
	 * update the statistics table
	 */
	updateDataTask: {
		name: 'update the statistics table',
		run: function () {
			ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel.statisticsPanel.updateData();
		},
		interval: 30000
	},

	initialize: function () {
		this.callParent(arguments);

		var me = this;

		this.statisticsStore = Ext.create('Ext.data.Store', {
			model: 'ARSnova.model.Statistics'
		});

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			handler: function () {
				var me = ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel;

				me.animateActiveItem(me.diagnosisPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700,
					scope: this
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.STATISTIC,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});

		this.formpanel = Ext.create('Ext.form.Panel', {
			cls: 'standardForm topPadding',
			scrollable: null,

			defaults: {
				xtype: 'button',
				ui: 'normal',
				cls: 'standardListButton statisticsButton',
				disabled: true,
				setInnerValue: function (value) {
					var component = me.formpanel.getComponent(this.itemId);

					if (!component.innerValue) {
						component.innerValue = Ext.DomHelper.append(component.element, {
							tag: 'span'
						});
					}

					component.innerValue.innerHTML = value;
				}
			},

			items: [{
					itemId: 'statisticsActiveUsers',
					text: 'Users online'
				}, {
					itemId: 'statisticsCreators',
					text: Messages.SESSION_OWNERS
				}, {
					itemId: 'statisticsSessions',
					text: Messages.SESSIONS
				}, {
					itemId: 'statisticsLectureQuestions',
					text: Messages.LECTURE_QUESTIONS_LONG
				}, {
					itemId: 'statisticsConceptQuestions',
					text: Messages.PEER_INSTRUCTION_QUESTIONS
				}, {
					itemId: 'statisticsPreparationQuestions',
					text: Messages.PREPARATION_QUESTIONS_LONG
				}, {
					itemId: 'statisticsFlashcards',
					text: Messages.FLASHCARDS
				}, {
					itemId: 'statisticsInterposedQuestions',
					text: Messages.QUESTIONS_FROM_STUDENTS
				}, {
					itemId: 'statisticsAnswers',
					text: Messages.VOTINGS
				}, {
					itemId: 'statisticsActiveStudents',
					text: Messages.ACTIVE_STUDENT_USERS
				}]
		});

		this.inClass = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			items: [this.formpanel]
		});

		this.add([this.toolbar, this.inClass]);

		this.on('activate', this.onActivate);
		this.onBefore('activate', this.beforeActivate);
		this.on('deactivate', this.onDeactivate);
	},

	beforeActivate: function () {
		this.getStatistics();
	},

	onActivate: function () {
		ARSnova.app.taskManager.start(this.updateDataTask);
	},

	onDeactivate: function () {
		ARSnova.app.taskManager.stop(this.updateDataTask);
	},

	setNumbers: function () {
		if (this.statistics != null) {
			this.formpanel.getComponent('statisticsSessions').config.setInnerValue(this.formatNumber(this.statistics.sessions));
			this.formpanel.getComponent('statisticsActiveUsers').config.setInnerValue(this.formatNumber(this.statistics.activeUsers));
			this.formpanel.getComponent('statisticsCreators').config.setInnerValue(this.formatNumber(this.statistics.creators));
			this.formpanel.getComponent('statisticsLectureQuestions').config.setInnerValue(this.formatNumber(this.statistics.lectureQuestions));
			this.formpanel.getComponent('statisticsConceptQuestions').config.setInnerValue(this.formatNumber(this.statistics.conceptQuestions));
			this.formpanel.getComponent('statisticsPreparationQuestions').config.setInnerValue(this.formatNumber(this.statistics.preparationQuestions));
			this.formpanel.getComponent('statisticsFlashcards').config.setInnerValue(this.formatNumber(this.statistics.flashcards));
			this.formpanel.getComponent('statisticsInterposedQuestions').config.setInnerValue(this.formatNumber(this.statistics.interposedQuestions));
			this.formpanel.getComponent('statisticsAnswers').config.setInnerValue(this.formatNumber(this.statistics.answers));
			this.formpanel.getComponent('statisticsActiveStudents').config.setInnerValue(this.formatNumber(this.statistics.activeStudents));
		}
	},

	/**
	 * get statistics from proxy
	 */
	getStatistics: function () {
		var promise = new RSVP.Promise();
		ARSnova.app.statisticsModel.getStatistics({
			success: function (response) {
				var statistics = Ext.decode(response.responseText);

				if (statistics != null) {
					var me = ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel.statisticsPanel;
					me.statistics = statistics;
					me.setNumbers();
				}
				promise.resolve(statistics);
			},
			failure: function () {
				console.log('server-side error, getStatistics');
				promise.reject();
			}
		});
		return promise;
	},

	updateData: function () {
		var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK);
		this.statisticsStore.clearData();
		this.getStatistics().then(hideLoadMask, hideLoadMask); // hide mask on success and on error
	},

	// http://stackoverflow.com/a/2901298
	formatNumber: function (x) {
		var separator = moment.locale() === "en" ? "," : ".";
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
	}
});
