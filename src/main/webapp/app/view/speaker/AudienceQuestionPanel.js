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
		scrollable: true,
		scroll: 'vertical',

		controller: null
	},

	monitorOrientation: true,

	/* toolbar items */
	toolbar: null,
	backButton: null,

	controls: null,
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

		this.questionStore = Ext.create('Ext.data.JsonStore', {
			model: 'ARSnova.model.Question',
			sorters: 'text',
			grouper: {
				groupFn: function (record) {
					return Ext.util.Format.htmlEncode(record.get('subject'));
				}
			}
		});

		var styling = {
			marginLeft: '12px',
			marginRight: '12px',
			backgroundColor: 'transparent'
		};

		this.questionList = Ext.create('Ext.List', {
			activeCls: 'search-item-active',
			cls: 'roundedCorners allCapsHeader',

			scrollable: {disabled: true},
			hidden: true,

			style: styling,

			itemCls: 'forwardListButton',
			itemTpl: '<tpl if="active"><div class="buttontext noOverflow">{text:htmlEncode}</div></tpl>' +
				'<tpl if="!active"><div class="isInactive buttontext noOverflow">{text:htmlEncode}</div></tpl>' +
				'<div class="x-button x-hasbadge audiencePanelListBadge">' +
				'<tpl if="numAnswers &gt; 0"><span class="redbadgeicon badgefixed">{numAnswers}</span></tpl></div>'
			,
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

		this.controls = Ext.create('Ext.form.FormPanel', {
			cls: 'standardForm topPadding',
			scrollable: null
		});

		this.questionTitle = Ext.create('Ext.Label', {
			html: Messages.QUESTIONS,
			style: {marginTop: '30px'},
			cls: 'standardLabel',
			hidden: true
		});

		this.newQuestionButton = {
			xtype: 'button',
			text: Messages.NEW_QUESTION,
			cls: 'forwardListButton',
			handler: this.newQuestionHandler
		};

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

		this.showcaseButton = Ext.create('Ext.Button', {
			cls: "thm",
			text: Messages.SHOWCASE,
			hidden: true,
			scope: this,
			handler: this.showcaseHandler
		});

		this.showcaseFormButton = {
			xtype: "button",
			text: Messages.SHOWCASE_MODE,
			cls: "forwardListButton",
			handler: this.showcaseHandler
		};

		this.caption = Ext.create('ARSnova.view.Caption', {
			translation: {
				active: Messages.OPEN_QUESTION,
				inactive: Messages.CLOSED_QUESTION
			},
			style: styling,
			hidden: true
		});
		this.caption.connectToStore(this.questionStore);

		this.questionStatusButton = Ext.create('ARSnova.view.speaker.MultiQuestionStatusButton', {
			hidden: true,
			questionStore: this.questionList.getStore()
		});

		this.deleteAnswersButton = Ext.create('ARSnova.view.MatrixButton', {
			hidden: true,
			buttonConfig: 'icon',
			text: Messages.DELETE_ANSWERS,
			imageCls: 'icon-renew',
			imageStyle: {
				'font-size': '1.15em',
				'color': 'steelblue',
				'margin': '16px 0 0 18px'
			},
			scope: this,
			handler: function () {
				var me = this;
				Ext.Msg.confirm(Messages.DELETE_ALL_ANSWERS_REQUEST, Messages.ALL_QUESTIONS_REMAIN, function (answer) {
					if (answer == 'yes') {
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
			imageCls: 'icon-close',
			imageStyle: {
				'color': '#bf0e0e',
				'margin-top': '20px'
			},
			scope: this,
			handler: function () {
				var msg = Messages.ARE_YOU_SURE;
					msg += "<br>" + Messages.DELETE_ALL_ANSWERS_INFO;
				Ext.Msg.confirm(Messages.DELETE_ALL_QUESTIONS, msg, function (answer) {
					if (answer == 'yes') {
						this.getController().destroyAll(localStorage.getItem("keyword"), {
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
			    this.questionStatusButton,
			    this.deleteAnswersButton,
			    this.deleteQuestionsButton
			]

		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTIONS,
			ui: 'light',
			docked: 'top',
			items: [
				this.backButton,
				{xtype: 'spacer'},
				this.showcaseButton
			]
		});

		this.add([
			this.toolbar,
			this.controls,
			this.questionTitle,
			this.questionList,
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
		this.controls.removeAll();
		this.questionStore.removeAll();

		this.controls.add(this.newQuestionButton);

		this.questionEntries = [];

		this.getController().getQuestions(localStorage.getItem('keyword'), {
			success: Ext.bind(function (response) {
				var questions = Ext.decode(response.responseText);
				this.questionStore.add(questions);
				this.caption.show();
				this.caption.explainStatus(questions);
				this.handleAnswerCount();

				this.controls.insert(0, this.showcaseFormButton);
				this.displayShowcaseButton();
				this.questionTitle.show();
				this.questionList.show();
				this.questionStatusButton.checkInitialStatus();
				this.questionStatusButton.show();
				this.deleteQuestionsButton.show();
			}, this),
			empty: Ext.bind(function () {
				this.showcaseButton.hide();
				this.questionTitle.hide();
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

	onOrientationChange: function (panel, orientation, width, height) {
		this.displayShowcaseButton();
	},

	/**
	 * Displays the showcase button if enough screen width is available
	 */
	displayShowcaseButton: function () {
		/* iPad does not swap screen width and height values in landscape orientation */
		if (screen.availWidth >= 980 || screen.availHeight >= 980) {
			this.showcaseButton.hide();
		} else if (window.innerWidth >= 480) {
			this.showcaseButton.show();
		} else {
			this.showcaseButton.hide();
		}
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
			me.getController().countAnswersByQuestion(localStorage.getItem("keyword"), questionRecord.get('_id'), {
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
