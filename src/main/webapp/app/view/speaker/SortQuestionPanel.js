/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
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
Ext.define('ARSnova.view.speaker.SortQuestionPanel', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.view.Caption',
		'ARSnova.model.Question',
		'ARSnova.view.speaker.MultiQuestionStatusButton',
		'Ext.plugin.SortableList'
	],

	config: {
		title: 'SortQuestionPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},

		controller: null
	},

	monitorOrientation: true,

	/* toolbar items */
	toolbar: null,
	backButton: null,
	sortQuestionButton: null,

	saveButtonToolbar: null,

	questions: null,

	questionStore: null,
	questionEntries: [],

	sortedList: null,

	updateAnswerCount: {
		name: 'refresh the number of answers inside the badges',
		run: function () {
			var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.audienceQuestionPanel;
			panel.handleAnswerCount();
		},
		interval: 10000 // 10 seconds
	},

	initialize: function () {
		this.callParent(arguments);

		var screenWidth = (window.innerWidth > 0) ? window.innerWidth: screen.width;
		var upperActionButtonCls = screenWidth < 410 ? 'smallerActionButton': 'actionButton';

		this.questionStore = Ext.create('Ext.data.JsonStore', {
				model: 'ARSnova.model.Question',
				sorters: 'text',
				grouper: {
					groupFn: function (record) {
						return Ext.util.Format.htmlEncode(record.get('subject'));
					}
				}
			});

		//#######################################
		// Sorted List??


		this.sortedList = Ext.create('Ext.List', {

			plugins: [{
						xclass: 'Ext.plugin.SortableList',
						handleSelector: 'dragfav'

					}
				],
			height: '100%',
			width: '100%',
			activeCls: 'search-item-active',
			cls: 'roundedCorners allCapsHeader',

			scrollable: {
					disabled: true
				},
			hidden: false,

			style: {
					backgroundColor: 'transparent'
				},

			itemCls: 'forwardListButton',
			itemTpl: '<tpl if="active"><div name="dragfav" id="dragfav" class="buttontext noOverflow">{text:htmlEncode}</div></tpl>' +
				'<tpl if="!active"><div name="dragfav" id="dragfav" class="isInactive buttontext noOverflow">{text:htmlEncode}</div></tpl>' +
				'<div class="x-button x-hasbadge audiencePanelListBadge">' +
				'<tpl if="numAnswers &gt; 0"><span class="answersBadgeIcon badgefixed">{numAnswers}</span></tpl></div>',
			grouped: true,
			store: this.questionStore,

			listeners: {
					scope: this,
					itemtap: function (list, index, element) {
						this.getController().details({
							question: list.getStore().getAt(index).data
						});
					},
					/**
					 * The following event is used to get the computed height of all list items and
					 * finally to set this value to the list DataView. In order to ensure correct rendering
					 * it is also necessary to get the properties "padding-top" and "padding-bottom" and
					 * add them to the height of the list DataView.
					 */
					painted: function (list, eOpts) {
						var listItemsDom = list.select(".x-list .x-inner .x-inner").elements[0];

						this.questionList.setHeight(
							parseInt(window.getComputedStyle(listItemsDom, "").getPropertyValue("height")) +
							parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-top")) +
							parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-bottom")));
					}
				}
		});

		//#######################################


		this.questionList = Ext.create('Ext.List', {
				activeCls: 'search-item-active',
				cls: 'roundedCorners allCapsHeader',

				scrollable: {
					disabled: true
				},
				hidden: false,

				style: {
					backgroundColor: 'transparent'
				},

				itemCls: 'forwardListButton',
				itemTpl: '<tpl if="active"><div class="buttontext noOverflow">{text:htmlEncode}</div></tpl>' +
				'<tpl if="!active"><div class="isInactive buttontext noOverflow">{text:htmlEncode}</div></tpl>' +
				'<div class="x-button x-hasbadge audiencePanelListBadge">' +
				'<tpl if="numAnswers &gt; 0"><span class="answersBadgeIcon badgefixed">{numAnswers}</span></tpl></div>',
				grouped: true,
				store: this.questionStore,

				listeners: {
					scope: this,
					itemtap: function (list, index, element) {
						this.getController().details({
							question: list.getStore().getAt(index).data
						});
					},
					/**
					 * The following event is used to get the computed height of all list items and
					 * finally to set this value to the list DataView. In order to ensure correct rendering
					 * it is also necessary to get the properties "padding-top" and "padding-bottom" and
					 * add them to the height of the list DataView.
					 */
					painted: function (list, eOpts) {
						var listItemsDom = list.select(".x-list .x-inner .x-inner").elements[0];

						this.questionList.setHeight(
							parseInt(window.getComputedStyle(listItemsDom, "").getPropertyValue("height")) +
							parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-top")) +
							parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-bottom")));
					}
				}
			});

		this.questionListContainer = Ext.create('Ext.form.FieldSet', {
				title: Messages.QUESTION_MANAGEMENT,
				hidden: false,
				items: [
					this.questionList
					//this.sortedList
				]
			});

		this.backButton = Ext.create('Ext.Button', {
				text: Messages.BACK,
				ui: 'back',
				handler: function () {
					var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
					sTP.inClassPanel.updateAudienceQuestionBadge();
					sTP.animateActiveItem(sTP.audienceQuestionPanel, {
						type: 'slide',
						direction: 'right',
						duration: 700
					});
				}
			});

		this.saveButtonToolbar = Ext.create('Ext.Button', {
				text: Messages.SAVE,
				ui: 'normal',
				cls: 'saveQuestionButton',
				imageCls: 'info thm-grey',
				style: 'width: 150px',
				/*handler: function (button) {
				this.saveHandler(button).then(function (response) {
				ARSnova.app.getController('Questions').details({
				question: Ext.decode(response.responseText)
				});
				});
				},*/
				scope: this
			});

		this.caption = Ext.create('ARSnova.view.Caption', {
				translation: {
					active: Messages.OPEN_QUESTION,
					inactive: Messages.CLOSED_QUESTION
				},
				cls: "x-form-fieldset",
				style: "border-radius: 15px",
				hidden: false
			});
		this.caption.connectToStore(this.questionStore);

		this.toolbar = Ext.create('Ext.Toolbar', {
				title: 'Fragen sortieren', //Messages.SORT_QUESTIONS_TOOLBAR,
				cls: 'speakerTitleText',
				ui: 'light',
				docked: 'top',
				items: [
					this.backButton, {
						xtype: 'spacer'
					}, {
						xtype: 'button',
						iconCls: 'icon-info',
						cls: 'toggleCorrectButton',
						handler: function (button) {
							ARSnova.app.getController('Application').showQRCode();
						}
					}
				]
			});

		this.sortQuestionButton = Ext.create('ARSnova.view.MatrixButton', {
				text: 'Fragen sortieren', //Messages.SORT_QUESTIONS,
				buttonConfig: 'icon',
				cls: upperActionButtonCls,
				imageCls: 'info thm-grey',
				hidden: false,
				handler: this.sortQuestionHandler
			});

		this.add([
				this.toolbar, {
					xtype: 'formpanel',
					scrollable: null,
					items: [this.questionListContainer]
				},
				this.sortQuestionButton
				//this.caption
			]);

		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
		this.on('orientationchange', this.onOrientationChange);
	},

	onActivate: function () {
		if (!this.getController()) {
			/*
			 * Somewhere, in ARSnova's endless depths, this method gets called before this panel is ready.
			 * This happens for a returning user who was logged in previously, and is redirected into his session.
			 */
			return;
		}
		console.log("in on activate trinne");
		ARSnova.app.taskManager.start(this.updateAnswerCount);
		this.questionStore.removeAll();

		this.questionEntries = [];

		this.getController().getQuestions(sessionStorage.getItem('keyword'), {
			success: Ext.bind(function (response) {
				var questions = Ext.decode(response.responseText);

				this.questionStore.add(questions);
				this.caption.show();
				this.caption.explainStatus(questions);
				this.handleAnswerCount();

				this.questionListContainer.show();
				this.questionList.show();
			}, this),
			empty: Ext.bind(function () {
				this.questionListContainer.hide();
				this.questionList.show();
				this.caption.hide();
			}, this),
			failure: function (response) {
				console.log('server-side error questionModel.getSkillQuestions');
			}
		});
	},

	onDeactivate: function () {
		this.questionList.hide();
		ARSnova.app.taskManager.stop(this.updateAnswerCount);
	},

	getQuestionAnswers: function () {
		var me = this;
		var getAnswerCount = function (questionRecord, promise) {
			me.getController().countAnswersByQuestion(sessionStorage.getItem("keyword"), questionRecord.get('_id'), {
				success: function (response) {
					var numAnswers = Ext.decode(response.responseText);
					questionRecord.set('numAnswers', numAnswers);
					promise.resolve({
						hasAnswers: numAnswers > 0
					});
				},
				failure: function () {
					console.log("Could not update answer count");
					promise.reject();
				}
			});
		};

		var promises = [];
		this.questionStore.each(function (questionRecord) {
			var promise = new RSVP.Promise();
			getAnswerCount(questionRecord, promise);
			promises.push(promise);
		}, this);

		return promises;
	},

	handleAnswerCount: function () {
		RSVP.all(this.getQuestionAnswers())
		.then(Ext.bind(this.caption.explainBadges, this.caption))
		.then(Ext.bind(function (badgeInfos) {
				var hasAnswers = badgeInfos.filter(function (item) {
						return item.hasAnswers;
					}, this);
				this.deleteAnswersButton.setHidden(hasAnswers.length === 0);
			}, this));
	}
});
