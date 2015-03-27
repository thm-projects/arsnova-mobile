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
Ext.define('ARSnova.view.speaker.AudienceQuestionPanel', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.view.Caption',
		'ARSnova.model.Question',
		'ARSnova.view.speaker.MultiQuestionStatusButton'
	],

	config: {
		title: 'AudienceQuestionPanel',
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

	questions: null,
	newQuestionButton: null,

	questionStore: null,
	questionEntries: [],

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

		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var upperActionButtonCls = screenWidth < 410 ? 'smallerActionButton' : 'actionButton';

		this.questionStore = Ext.create('Ext.data.JsonStore', {
			model: 'ARSnova.model.Question',
			sorters: 'text',
			grouper: {
				groupFn: function (record) {
					return Ext.util.Format.htmlEncode(record.get('subject'));
				}
			}
		});

		this.questionList = Ext.create('Ext.List', {
			activeCls: 'search-item-active',
			cls: 'roundedCorners allCapsHeader',

			scrollable: {disabled: true},
			hidden: true,

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
						parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-bottom"))
					);
				}
			}
		});

		this.questionListContainer = Ext.create('Ext.form.FieldSet', {
			title: Messages.QUESTION_MANAGEMENT,
			hidden: true,
			items: [this.questionList]
		});

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			handler: function () {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.inClassPanel.updateAudienceQuestionBadge();
				sTP.animateActiveItem(sTP.inClassPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.questionStatusButton = Ext.create('ARSnova.view.speaker.MultiQuestionStatusButton', {
			hidden: true,
			cls: upperActionButtonCls,
			questionStore: this.questionList.getStore()
		});

		this.showcaseActionButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.SHOWCASE_MODE,
			buttonConfig: 'icon',
			cls: upperActionButtonCls,
			imageCls: 'icon-presenter thm-grey',
			handler: this.showcaseHandler,
			hidden: true
		});

		this.newQuestionButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.NEW_QUESTION,
			buttonConfig: 'icon',
			cls: upperActionButtonCls,
			imageCls: 'icon-question thm-green',
			handler: this.newQuestionHandler
		});

		this.actionButtonPanel = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			style: 'margin-top: 30px',

			items: [
				this.questionStatusButton,
				this.showcaseActionButton,
				this.newQuestionButton
			]
		});

		this.caption = Ext.create('ARSnova.view.Caption', {
			translation: {
				active: Messages.OPEN_QUESTION,
				inactive: Messages.CLOSED_QUESTION
			},
			cls: "x-form-fieldset",
			style: "border-radius: 15px",
			hidden: true
		});
		this.caption.connectToStore(this.questionStore);

		this.deleteAnswersButton = Ext.create('ARSnova.view.MatrixButton', {
			hidden: true,
			buttonConfig: 'icon',
			text: Messages.DELETE_ANSWERS,
			imageCls: 'icon-renew thm-orange',
			cls: 'actionButton',
			scope: this,
			handler: function () {
				var me = this;
				Ext.Msg.confirm(Messages.DELETE_ALL_ANSWERS_REQUEST, Messages.ALL_QUESTIONS_REMAIN, function (answer) {
					if (answer === 'yes') {
						me.getController().deleteAllQuestionsAnswers({
							success: Ext.bind(this.handleAnswerCount, this),
							failure: Ext.emptyFn
						});
					}
				}, this);
			}
		});

		this.deleteQuestionsButton = Ext.create('ARSnova.view.MatrixButton', {
			hidden: true,
			buttonConfig: 'icon',
			text: Messages.DELETE_ALL_QUESTIONS,
			imageCls: 'icon-close thm-red',
			cls: 'actionButton',
			scope: this,
			handler: function () {
				var msg = Messages.ARE_YOU_SURE;
				msg += "<br>" + Messages.DELETE_ALL_ANSWERS_INFO;
				Ext.Msg.confirm(Messages.DELETE_QUESTIONS_TITLE, msg, function (answer) {
					if (answer === 'yes') {
						this.getController().destroyAll(sessionStorage.getItem("keyword"), {
							success: Ext.bind(this.onActivate, this),
							failure: function () {
								console.log("could not delete the questions.");
							}
						});
					}
				}, this);
			}
		});


		this.inClassActions = Ext.create('Ext.Panel', {
			style: {marginTop: '20px'},
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			items: [
				this.sortQuestionButton,
				this.deleteAnswersButton,
				this.deleteQuestionsButton
			]
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTIONS,
			cls: 'speakerTitleText',
			ui: 'light',
			docked: 'top',
			items: [
				this.backButton
			]
		});

		this.add([
			this.toolbar,
			this.actionButtonPanel, {
				xtype: 'formpanel',
				scrollable: null,
				items: [this.questionListContainer]
			},
			this.caption,
			this.inClassActions
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

				if (questions.length === 1) {
					this.showcaseActionButton.setButtonText(Messages.SHOWCASE_MODE);
					this.questionStatusButton.setSingleQuestionMode();
				} else {
					this.showcaseActionButton.setButtonText(Messages.SHOWCASE_MODE_PLURAL);
					this.questionStatusButton.setMultiQuestionMode();
				}

				this.showcaseActionButton.show();
				this.questionListContainer.show();
				this.questionList.show();
				this.questionStatusButton.checkInitialStatus();
				this.questionStatusButton.show();
				this.deleteQuestionsButton.show();
			}, this),
			empty: Ext.bind(function () {
				this.showcaseActionButton.hide();
				this.questionListContainer.hide();
				this.questionList.show();
				this.caption.hide();
				this.questionStatusButton.hide();
				this.deleteQuestionsButton.hide();
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

	newQuestionHandler: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.animateActiveItem(sTP.newQuestionPanel, 'slide');
	},

	showcaseHandler: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.animateActiveItem(sTP.showcaseQuestionPanel, 'slide');
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
