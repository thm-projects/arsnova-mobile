/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2016 The ARSnova Team
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
		'ARSnova.view.speaker.MultiVoteStatusButton',
		'ARSnova.view.speaker.MultiQuestionStatusButton',
		'ARSnova.view.speaker.SortQuestionsPanel'
	],

	config: {
		title: 'AudienceQuestionPanel',
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

	monitorOrientation: true,

	/* toolbar items */
	toolbar: null,
	backButton: null,

	questions: null,
	newQuestionButton: null,

	questionStore: null,
	reader: new FileReader(),

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

		var self = this;
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var actionButtonCls = screenWidth < 410 ? 'smallerActionButton' : 'actionButton';
		this.screenWidth = screenWidth;

		this.reader.onload = function (event) {
			ARSnova.app.getController('QuestionImport').importCsvFile(self.reader.result);
			var field = self.loadFilePanel.query('filefield')[0];
			// field.setValue currently has no effect - Sencha bug?
			field.setValue(null);
			// Workaround: Directly reset value on DOM element
			field.element.query('input')[0].value = null;
			field.enable();
		};

		this.questionStore = Ext.create('Ext.data.JsonStore', {
			model: 'ARSnova.model.Question',
			sorters: {
				property: 'text',
				transform: function (value) {
					return value.toLowerCase();
				}
			},
			grouper: {
				groupFn: function (record) {
					return Ext.util.Format.htmlEncode(record.get('subject'));
				},
				sorterFn: function (a, b) {
					//return a.raw.sequenceNo - b.raw.sequenceNo;
					a = a.get('subject').toLowerCase();
					b = b.get('subject').toLowerCase();
					return a === b ? 0 : (a < b ? -1 : 1);
				}
			}
		});

		this.questionList = Ext.create('ARSnova.view.components.List', {
			activeCls: 'search-item-active',
			cls: 'roundedCorners allCapsHeader',
			hidden: true,

			style: {
				backgroundColor: 'transparent'
			},

			loadHandler: this.getQuestions,
			loadScope: this,

			itemCls: 'forwardListButton',
			itemTpl: Ext.create('Ext.XTemplate',
				'<tpl if="!active"><div class="isInactive buttontext noOverflow">{text:htmlEncode}</div>',
				'<tpl else>',
					'<tpl if="votingDisabled"><div class="isVoteInactive buttontext noOverflow">{text:htmlEncode}</div>',
					'<tpl else><div class="buttontext noOverflow">{text:htmlEncode}</div></tpl>',
				'</tpl>',
				'<div class="x-button x-hasbadge audiencePanelListBadge">',
				'<tpl if="this.hasAnswers(values.numAnswers)"><span class="answersBadgeIcon badgefixed">',
					'{[this.getFormattedCount(values)]}</span>',
				'</tpl></div>',
				{
					hasAnswers: function (numAnswers) {
						if (Array.isArray(numAnswers)) {
							return numAnswers.reduce(function (ro, rt) {
								return ro + rt;
							}, 0) > 0;
						}
					},

					getFormattedCount: function (questionObj) {
						if (questionObj.piRound === 2) {
							return questionObj.numAnswers[0] + ' | ' + questionObj.numAnswers[1];
						} else {
							return questionObj.numAnswers[0];
						}
					}
				}
			),
			grouped: true,
			store: this.questionStore,

			listeners: {
				scope: this,
				itemtap: function (list, index, element) {
					this.getController().details({
						index: index,
						question: list.getStore().getAt(index).data
					});
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
			scope: this,
			ui: 'back',
			handler: function () {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;

				this.questionList.resetPagination();
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
			cls: actionButtonCls,
			questionStore: this.questionList.getStore()
		});

		this.voteStatusButton = Ext.create('ARSnova.view.speaker.MultiVoteStatusButton', {
			hidden: true,
			cls: actionButtonCls,
			questionStore: this.questionList.getStore()
		});

		this.showcaseActionButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.SHOWCASE_MODE,
			buttonConfig: 'icon',
			cls: actionButtonCls,
			imageCls: 'icon-presenter',
			handler: this.showcaseHandler,
			hidden: true
		});

		this.newQuestionButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.NEW_QUESTION,
			buttonConfig: 'icon',
			cls: actionButtonCls,
			imageCls: 'icon-question',
			handler: this.newQuestionHandler
		});

		this.questionsImport = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.QUESTIONS_CSV_IMPORT_BUTTON,
			buttonConfig: 'icon',
			imageCls: 'icon-cloud-upload',
			cls: 'actionButton',
			handler: this.questionsImportHandler,
			hidden: screenWidth < 550
		});

		this.loadMask = Ext.create('Ext.LoadMask', {
			message: Messages.LOAD_MASK_QUESTION_IMPORT,
			indicator: true,
			centered: true
		});

		this.loadFilePanel = Ext.create('Ext.Panel', {
			modal: true,
			centered: true,
			ui: 'light',
			items: [
				{
					xtype: 'toolbar',
					docked: 'top',
					title: Messages.QUESTIONS_CSV_IMPORT_MSBOX_TITLE,
					ui: 'light',
					items: [{
							xtype: 'spacer'
						}, {
							xtype: 'button',
							ui: 'plain',
							iconCls: 'delete',
							iconMask: true,
							text: '',
							action: 'hideModal'
						}
					]
				},
				{
					xtype: 'filefield',
					accept: 'text/csv',
					listeners: {
						change: function (element, newValue, oldValue) {
							// Workaround: The change event is triggered twice in Chrome
							if (element.isDisabled()) {
								return;
							}
							element.disable();

							var path = element.getValue();
							var fileType = path.substring(path.lastIndexOf('.'));
							if (fileType === '.csv') {
								var file = element.bodyElement.dom.firstElementChild.firstElementChild.files[0];
								self.reader.readAsText(file);
							}
						}
					}
				}
			]
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
				this.newQuestionButton,
				this.questionsImport
			]
		});

		this.caption = Ext.create('ARSnova.view.Caption', {
			translation: {
				active: Messages.OPEN_QUESTION,
				inactive: Messages.CLOSED_QUESTION,
				disabledVote: Messages.CLOSED_VOTING
			},
			cls: "x-form-fieldset",
			style: "border-radius: 15px",
			hidden: true
		});
		this.caption.connectToStore(this.questionStore);

		this.sortQuestionsButton = Ext.create('ARSnova.view.MatrixButton', {
			hidden: true,
			buttonConfig: 'icon',
			text: Messages.SORT_QUESTIONS,
			imageCls: 'icon-sort',
			cls: 'actionButton',
			scope: this,
			handler: function () {
				var me = this;
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.animateActiveItem(sTP.sortSubjectsPanel, 'slide');
			}
		});

		this.deleteAnswersButton = Ext.create('ARSnova.view.MatrixButton', {
			hidden: true,
			buttonConfig: 'icon',
			text: Messages.DELETE_ANSWERS,
			imageCls: 'icon-close warningIconColor',
			cls: actionButtonCls,
			scope: this,
			handler: function () {
				var me = this;
				Ext.Msg.confirm(Messages.DELETE_ALL_ANSWERS_REQUEST, Messages.ALL_QUESTIONS_REMAIN, function (answer) {
					if (answer === 'yes') {
						me.getController().deleteAllQuestionsAnswers({
							success: Ext.bind(this.handleDeleteAnswers, this),
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
			cls: actionButtonCls,
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

		this.exportCsvQuestionsButton = Ext.create('ARSnova.view.MatrixButton', {
			hidden: true,
			buttonConfig: 'icon',
			text: Messages.QUESTIONS_CSV_EXPORT_BUTTON,
			imageCls: 'icon-cloud-download',
			cls: 'actionButton',
			scope: this,
			handler: function () {
				var msg = Messages.QUESTIONS_CSV_EXPORT_MSBOX_INFO;

				Ext.Msg.confirm(Messages.QUESTIONS_CSV_EXPORT_MSBOX_TITLE, msg, function (answer) {
					if (answer === 'yes') {
						this.getController().getQuestions(sessionStorage.getItem('keyword'), {
							success: function (response) {
								var questions = Ext.decode(response.responseText);
								ARSnova.app.getController('QuestionExport').parseJsonToCsv(questions);
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
				this.voteStatusButton,
				this.deleteAnswersButton,
				this.deleteQuestionsButton,
				this.exportCsvQuestionsButton
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
		this.applyUIChanges();
		this.questionStore.removeAll();
		this.getQuestions();
	},

	onDeactivate: function () {
		this.questionList.hide();
		this.listTotalRange = this.questionList.getTotalRange();
		this.questionList.restoreOffsetState();
		ARSnova.app.taskManager.stop(this.updateAnswerCount);
	},

	getQuestions: function (callback) {
		callback = typeof callback === 'function' ? callback : Ext.emptyFn;
		var features = ARSnova.app.getController('Feature').getActiveFeatures();
		var hideLoadIndicator = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK, 1000);

		this.getController().getQuestions(sessionStorage.getItem('keyword'), {
			success: Ext.bind(function (response, totalRange) {
				var questions = Ext.decode(response.responseText);
				for (var i = 0; i < questions.length; i++) {
					questions[i].sequenceNo = i;
				}
				this.questionStore.add(questions);
				this.caption.show();
				this.caption.explainStatus(questions);
				this.handleAnswerCount();

				if (questions.length === 1) {
					this.showcaseActionButton.setButtonText(
						features.flashcard ? Messages.SHOWCASE_FLASHCARD : Messages.SHOWCASE_MODE);
					this.questionStatusButton.setSingleQuestionMode();
					this.voteStatusButton.setSingleQuestionMode();
				} else {
					this.showcaseActionButton.setButtonText(
						features.flashcard ? Messages.SHOWCASE_FLASHCARDS : Messages.SHOWCASE_MODE_PLURAL);
					this.questionStatusButton.setMultiQuestionMode();
					this.voteStatusButton.setMultiQuestionMode();
				}

				if (features.slides) {
					this.showcaseActionButton.setButtonText(Messages.SHOWCASE_KEYNOTE);
				}

				this.questionList.updatePagination(questions.length, totalRange);
				callback.apply();

				this.showcaseActionButton.show();
				this.questionListContainer.show();
				this.questionList.show();
				this.questionStatusButton.checkInitialStatus();
				this.voteStatusButton.checkInitialStatus();
				this.questionStatusButton.show();
				this.voteStatusButton.show();
				// this.sortQuestionsButton.show();
				this.deleteQuestionsButton.show();
				hideLoadIndicator.apply();

				if (this.screenWidth > 550) {
					this.exportCsvQuestionsButton.show();
				}
			}, this),
			empty: Ext.bind(function () {
				this.showcaseActionButton.hide();
				this.questionListContainer.hide();
				this.questionList.show();
				this.caption.hide();
				this.voteStatusButton.hide();
				this.questionStatusButton.hide();
				this.sortQuestionsButton.hide();
				this.deleteQuestionsButton.hide();
				this.exportCsvQuestionsButton.hide();
				hideLoadIndicator.apply();
			}, this),
			failure: function (response) {
				console.log('server-side error questionModel.getSkillQuestions');
				hideLoadIndicator.apply();
			}
		}, this.questionList.getStartIndex(), this.questionList.getEndIndex());
	},

	newQuestionHandler: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.animateActiveItem(sTP.newQuestionPanel, 'slide');
	},

	showcaseHandler: function () {
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var activateProjectorMode = screenWidth >= 700;

		var showShowcasePanel = Ext.create('Ext.util.DelayedTask', function () {
			sTP.animateActiveItem(sTP.showcaseQuestionPanel, 'slide');
		});

		ARSnova.app.projectorModeActive = activateProjectorMode;
		ARSnova.app.getController('Application').storeGlobalZoomLevel();
		ARSnova.app.mainTabPanel.tabPanel.getTabBar().setHidden(activateProjectorMode);
		ARSnova.app.getController('Application').toggleFullScreen(activateProjectorMode);
		showShowcasePanel.delay(activateProjectorMode ? 1250 : 0);
	},

	openQuestionDetails: function (index, direction) {
		var loadedLimit = this.questionList.getLastOffset();
		var me = this;

		if (index < 0 || index >= this.listTotalRange) {
			return;
		}

		if (index === loadedLimit) {
			this.questionList.updateOffsetState();
			this.getQuestions(function () {
				me.openQuestionDetails(index, direction);
			});

			return;
		}

		this.getController().details({
			index: index,
			direction: direction,
			question: this.questionStore.getAt(index).data
		});
	},

	getQuestionAnswers: function () {
		var me = this;
		var getAnswerCount = function (questionRecord, promise) {
			if (questionRecord.get('questionType') === 'freetext') {
				me.getController().getTotalAnswerCountByQuestion(questionRecord.get('_id'), {
					success: function (response) {
						var numAnswers = Ext.decode(response.responseText);
						questionRecord.set('numAnswers', [numAnswers]);
						promise.resolve({
							hasAnswers: numAnswers > 0
						});
					},
					failure: function () {
						console.log("Could not update answer count");
						promise.reject();
					}
				});
			} else {
				me.getController().getAllRoundAnswerCountByQuestion(questionRecord.get('_id'), {
					success: function (response) {
						var numAnswers = Ext.decode(response.responseText);
						questionRecord.set('numAnswers', numAnswers);
						promise.resolve({
							hasAnswers: numAnswers.reduce(function (ro, rt) {
								return ro + rt;
							}, 0) > 0
						});
					},
					failure: function () {
						console.log("Could not update answer count");
						promise.reject();
					}
				});
			}
		};

		var promises = [];
		this.questionStore.each(function (questionRecord) {
			var promise = new RSVP.Promise();
			getAnswerCount(questionRecord, promise);
			promises.push(promise);
		}, this);

		return promises;
	},

	prepareQuestionList: function () {
		this.questionList.resetPagination();
	},

	handleDeleteAnswers: function () {
		this.handleAnswerCount();

		this.questionStore.each(function (question) {
			question.set("votingDisabled", false);
			question.raw.votingDisabled = false;
		});
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
	},

	questionsImportHandler: function () {
		ARSnova.app.getController('QuestionImport').showModal();
	},

	applyUIChanges: function () {
		var features = ARSnova.app.getController('Feature').getActiveFeatures();
		var lectureButtonText = Messages.NEW_QUESTION;

		if (features.total || features.slides) {
			this.toolbar.setTitle(Messages.SLIDE_LONG);
			this.questionListContainer.setTitle(Messages.CONTENT_MANAGEMENT);
			this.deleteAnswersButton.setButtonText(Messages.DELETE_COMMENTS);
			this.deleteQuestionsButton.setButtonText(Messages.DELETE_CONTENT);
			this.exportCsvQuestionsButton.setButtonText(Messages.EXPORT_CONTENT);
			this.questionsImport.setButtonText(Messages.IMPORT_CONTENT);
			this.questionStatusButton.setKeynoteWording();
			this.voteStatusButton.setKeynoteWording();

			lectureButtonText = Messages.NEW_CONTENT;
			this.newQuestionButton.element.down('.iconBtnImg').replaceCls('icon-question', 'icon-pencil');

			this.caption.setTranslation({
				active: Messages.OPEN_CONTENT,
				inactive: Messages.CLOSED_CONTENT,
				disabledVote: Messages.CLOSED_COMMENTATION
			});

			this.caption.setBadgeTranslation({
				feedback: Messages.QUESTIONS_FROM_STUDENTS,
				unredFeedback: Messages.UNREAD_QUESTIONS_FROM_STUDENTS,
				questions: Messages.QUESTIONS,
				answers: Messages.COMMENTS
			});
		} else {
			this.toolbar.setTitle(this.toolbar.config.title);
			this.questionListContainer.setTitle(this.questionListContainer.config.title);
			this.deleteAnswersButton.setButtonText(this.deleteAnswersButton.config.text);
			this.deleteQuestionsButton.setButtonText(this.deleteQuestionsButton.config.text);
			this.exportCsvQuestionsButton.setButtonText(this.exportCsvQuestionsButton.config.text);
			this.questionsImport.setButtonText(this.questionsImport.config.text);
			this.questionStatusButton.setDefaultWording();
			this.voteStatusButton.setDefaultWording();

			this.caption.setTranslation(this.caption.config.translation);
			this.caption.setBadgeTranslation(this.caption.config.badgeTranslation);
			this.newQuestionButton.element.down('.iconBtnImg').replaceCls('icon-pencil', 'icon-question');
		}

		if (features.flashcard) {
			lectureButtonText = Messages.NEW_FLASHCARD;
		}

		this.newQuestionButton.setButtonText(lectureButtonText);
	}
});
