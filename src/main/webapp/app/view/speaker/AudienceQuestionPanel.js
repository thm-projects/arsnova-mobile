/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2018 The ARSnova Team and Contributors
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
		controller: null,
		variant: 'lecture'
	},

	monitorOrientation: true,

	/* toolbar items */
	toolbar: null,
	backButton: null,

	questions: null,
	newQuestionButton: null,
	questionStore: null,
	questionLoadingIndex: null,
	indexedQuestionsWithAnswers: [],

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
					direction: 'right'
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
			text: Messages.QUESTIONS_IMPORT_BUTTON,
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

		this.uploadField = Ext.create('Ext.ux.Fileup', {
			xtype: 'fileupload',
			autoUpload: true,
			loadAsDataUrl: true,
			cls: 'importFileField',
			flex: 0,
			listeners: {
				loadsuccess: function (data) {
					var error = false;
					if (!Ext.os.is.iOS) {
						// remove prefix and decode
						var str = data.substring(data.indexOf("base64,") + 7);
						data = atob(str);
						try {
							data = decodeURIComponent(window.escape(data));
						} catch (e) {
							error = true;
							console.warn("Invalid charset: UTF-8 expected");
						}

						if (self.getVariant() === 'flashcard') {
							self.loadFilePanel.hide();
							ARSnova.app.getController('FlashcardImport')
								.importFile(data, this.importCsv, this.importFlashcards);
						} else {
							ARSnova.app.getController('QuestionImport').importCsvFile(data);
						}

						this.importCsv = false;
						this.importFlashcards = false;
					}

					if (error) {
						Ext.Msg.alert(Messages.NOTIFICATION, Messages.QUESTIONS_IMPORT_INVALID_CHARSET);
					}
				},
				loadfailure: function (message) {}
			}
		});

		this.loadFilePanel = Ext.create('Ext.MessageBox', {
			hideOnMaskTap: true,
			cls: 'importExportFilePanel',
			title: Messages.QUESTIONS_IMPORT_MSBOX_TITLE,
			items: [{
				xtype: 'button',
				iconCls: 'icon-close',
				cls: 'closeButton',
				handler: function () { this.getParent().hide(); }
			}, {
				xtype: 'container',
				layout: 'hbox',
				defaults: {
					xtype: 'button',
					cls: 'overlayButton',
					ui: 'action',
					scope: this,
					flex: 1
				},
				items: [this.uploadField, {
					text: Messages.CSV_FILE,
					handler: function () {
						this.uploadField.importCsv = true;
						this.uploadField.fileElement.dom.accept = 'text/csv';
						this.uploadField.fileElement.dom.click();
					}
				}, {
					text: Messages.ARSNOVA_CARDS,
					itemId: 'flashcardImportButton',
					handler: function () {
						this.uploadField.importFlashcards = true;
						this.uploadField.fileElement.dom.accept = 'application/json';
						this.uploadField.fileElement.dom.click();
					}
				}]
			}]
		});

		this.exportFilePanel = Ext.create('Ext.MessageBox', {
			hideOnMaskTap: true,
			cls: 'importExportFilePanel',
			title: Messages.QUESTIONS_EXPORT_MSBOX_TITLE,
			items: [{
				xtype: 'button',
				iconCls: 'icon-close',
				cls: 'closeButton',
				handler: function () { this.getParent().hide(); }
			}, {
				html: Messages.QUESTIONS_EXPORT_MSBOX_INFO,
				cls: 'x-msgbox-text'
			}, {
				xtype: 'container',
				layout: 'hbox',
				defaults: {
					xtype: 'button',
					ui: 'action',
					scope: this,
					flex: 1
				},
				items: [{
					text: Messages.CSV_FILE,
					handler: function () {
						if (this.getVariant() === 'flashcard') {
							ARSnova.app.getController('FlashcardExport')
								.exportFlashcards(this.getController(), 'csv');
						} else {
							ARSnova.app.getController('QuestionExport')
								.exportQuestions(this.getController());
						}
						this.exportFilePanel.hide();
					}
				}, {
					text: Messages.ARSNOVA_CARDS,
					handler: function () {
						ARSnova.app.getController('FlashcardExport')
							.exportFlashcards(this.getController(), 'json');
						this.exportFilePanel.hide();
					}
				}]
			}]
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
				var title = Messages.DELETE_ALL_ANSWERS_REQUEST;
				var message = Messages.ALL_QUESTIONS_REMAIN;

				if (this.getVariant() === 'flashcard') {
					title = Messages.DELETE_ALL_VIEWS_REQUEST;
					message = Messages.ALL_FLASHCARDS_REMAIN;
				}

				Ext.Msg.confirm(title, message, function (answer) {
					if (answer === 'yes') {
						this.getController().deleteAllQuestionsAnswers({
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
				var title = Messages.DELETE_QUESTIONS_TITLE;

				if (this.getVariant() === 'flashcard') {
					title = Messages.DELETE_FLASHCARDS_TITLE;
				} else {
					msg += "<br>" + Messages.DELETE_ALL_ANSWERS_INFO;
				}

				Ext.Msg.confirm(title, msg, function (answer) {
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
			text: Messages.QUESTIONS_EXPORT_BUTTON,
			imageCls: 'icon-cloud-download',
			cls: 'actionButton',
			scope: this,
			handler: function () {
				var msg = Messages.QUESTIONS_EXPORT_MSBOX_INFO;
				Ext.Viewport.add(this.exportFilePanel);
				this.exportFilePanel.show();
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
		this.flashcardImportButton = Ext.ComponentQuery.query('#flashcardImportButton')[0];
		this.applyUIChanges();
		this.questionStore.removeAll();
		this.getQuestions().then(Ext.bind(function () {
			if (this.getVariant() !== 'flashcard') {
				this.questionLoadingIndex = null;
				this.indexedQuestionsWithAnswers = [];
				ARSnova.app.taskManager.start(this.updateAnswerCount);
			}
		}, this));
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

		var promise = new RSVP.Promise();
		this.getController().getQuestions(sessionStorage.getItem('keyword'), {
			success: Ext.bind(function (response, totalRange) {
				var questions = Ext.decode(response.responseText);
				var showcaseButtonText = Messages.SHOWCASE_MODE_PLURAL;
				for (var i = 0; i < questions.length; i++) {
					questions[i].sequenceNo = i;
				}
				this.questionStore.add(questions);
				this.caption.show();
				this.caption.explainStatus(questions);

				if (this.getVariant() !== 'flashcard') {
					this.handleAnswerCount();
				}

				if (questions.length === 1) {
					this.questionStatusButton.setSingleQuestionMode();
					this.voteStatusButton.setSingleQuestionMode();
					showcaseButtonText = this.getVariant() === 'flashcard' ?
						Messages.SHOWCASE_FLASHCARD :
						Messages.SHOWCASE_MODE;
				} else {
					this.questionStatusButton.setMultiQuestionMode();
					this.voteStatusButton.setMultiQuestionMode();
					showcaseButtonText = this.getVariant() === 'flashcard' ?
						Messages.SHOWCASE_FLASHCARDS :
						Messages.SHOWCASE_MODE_PLURAL;
				}

				if (this.getVariant() !== 'flashcard') {
					this.voteStatusButton.checkInitialStatus();
					this.questionStatusButton.checkInitialStatus();
					this.questionStatusButton.show();
					this.voteStatusButton.show();

					if (features.slides) {
						showcaseButtonText = Messages.SHOWCASE_KEYNOTE;
					}
				}

				this.showcaseActionButton.setButtonText(showcaseButtonText);
				this.questionList.updatePagination(questions.length, totalRange);
				callback.apply();

				this.showcaseActionButton.show();
				this.questionListContainer.show();
				this.questionList.show();

				// this.sortQuestionsButton.show();
				this.deleteQuestionsButton.show();
				hideLoadIndicator.apply();

				if (this.screenWidth > 550) {
					this.exportCsvQuestionsButton.show();
				}
				promise.resolve();
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
				promise.resolve();
			}, this),
			failure: function (response) {
				console.log('server-side error questionModel.getSkillQuestions');
				hideLoadIndicator.apply();
				promise.reject();
			}
		}, this.questionList.getStartIndex(), this.questionList.getEndIndex());

		return promise;
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

	getQuestionAnswers: function (index) {
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
		if (index == null) {
			this.questionStore.each(function (questionRecord) {
				var promise = new RSVP.Promise();
				getAnswerCount(questionRecord, promise);
				promises.push(promise);
			}, this);
		} else {
			var questionRecord = this.questionStore.getAt(index);
			var promise = new RSVP.Promise();
			getAnswerCount(questionRecord, promise);
			promises.push(promise);
		}

		return promises;
	},

	prepareQuestionList: function () {
		this.questionList.resetPagination();
	},

	handleDeleteAnswers: function () {
		this.questionStore.each(function (question) {
			question.set("votingDisabled", false);
			question.raw.votingDisabled = false;
		});
		this.questionLoadingIndex = null;
		this.indexedQuestionsWithAnswers = [];
		this.handleAnswerCount();
	},

	handleAnswerCount: function () {
		console.log("handleAC", "index", this.questionLoadingIndex);
		RSVP.all(this.getQuestionAnswers(this.questionLoadingIndex))
		.then(Ext.bind(function (badgeInfos) {
			console.log("handleAC", "then", badgeInfos);
			badgeInfos.forEach(function (item) {
				console.log("handleAC", "bI forEach", item, "index", this.questionLoadingIndex);
				var value = item.hasAnswers ? item : null;
				if (this.questionLoadingIndex) {
					this.indexedQuestionsWithAnswers[this.questionLoadingIndex] = value;
				} else {
					this.indexedQuestionsWithAnswers.push(value);
				}
			}, this);
			var allQuestionsWithAnswers = this.indexedQuestionsWithAnswers.filter(function (item) {
				console.log("handleAC", "allQuestionsWithAnswers filter", item);
				return !!item;
			});
			console.log("handleAC", "allQuestionsWithAnswers", allQuestionsWithAnswers);
			this.deleteAnswersButton.setHidden(allQuestionsWithAnswers.length === 0);
			this.caption.explainBadges(allQuestionsWithAnswers);

			this.questionLoadingIndex =
				(this.questionLoadingIndex == null || this.questionLoadingIndex >= this.questionStore.getCount() - 1) ?
					0 : this.questionLoadingIndex + 1;
		}, this));
	},

	questionsImportHandler: function () {
		ARSnova.app.getController('QuestionImport').showModal();
	},

	applyUIChanges: function () {
		var features = ARSnova.app.getController('Feature').getActiveFeatures();
		var lectureButtonText = Messages.NEW_QUESTION;
		var questionListText = this.questionListContainer.config.title;
		var deleteAnswersText = this.deleteAnswersButton.config.text;
		var deleteQuestionsText = this.deleteQuestionsButton.config.text;
		var exportText = this.exportCsvQuestionsButton.config.text;
		var importText = this.questionsImport.config.text;
		var toolbarTitle = this.toolbar.config.title;
		var captionTranslation = this.caption.config.translation;
		var badgeTranslation = this.caption.config.badgeTranslation;

		if (features.total || features.slides) {
			toolbarTitle = Messages.SLIDE_LONG;
			exportText = Messages.EXPORT_CONTENT;
			importText = Messages.IMPORT_CONTENT;
			questionListText = Messages.CONTENT_MANAGEMENT;
			deleteAnswersText = Messages.DELETE_COMMENTS;
			deleteQuestionsText = Messages.DELETE_CONTENT;
			lectureButtonText = Messages.NEW_CONTENT;

			this.questionStatusButton.setKeynoteWording();
			this.newQuestionButton.element.down('.iconBtnImg').replaceCls('icon-question', 'icon-pencil');
			this.voteStatusButton.setKeynoteWording();

			captionTranslation = {
				active: Messages.OPEN_CONTENT,
				inactive: Messages.CLOSED_CONTENT,
				disabledVote: Messages.CLOSED_COMMENTATION
			};

			badgeTranslation = {
				feedback: Messages.QUESTIONS_FROM_STUDENTS,
				unreadFeedback: Messages.UNREAD_QUESTIONS_FROM_STUDENTS,
				questions: Messages.QUESTIONS,
				answers: Messages.COMMENTS
			};
		} else {
			this.questionStatusButton.setDefaultWording();
			this.newQuestionButton.element.down('.iconBtnImg').replaceCls('icon-pencil', 'icon-question');
			this.voteStatusButton.setDefaultWording();
		}

		if (this.getVariant() === 'flashcard') {
			lectureButtonText = Messages.NEW_FLASHCARD;
			toolbarTitle = Messages.FLASHCARDS;
			exportText = Messages.EXPORT_FLASHCARDS;
			importText = Messages.IMPORT_FLASHCARDS;
			questionListText = Messages.CONTENT_MANAGEMENT;
			deleteAnswersText = Messages.DELETE_FLASHCARD_VIEWS;
			deleteQuestionsText = Messages.DELETE_ALL_FLASHCARDS;
			this.flashcardImportButton.show();
			this.voteStatusButton.hide();

			this.questionStatusButton.setFlashcardsWording();
			this.newQuestionButton.element.down('.iconBtnImg').replaceCls('icon-question', 'icon-pencil');
			this.actionButtonPanel.remove(this.questionStatusButton, false);

			captionTranslation = {
				active: Messages.FLASHCARDS,
				inactive: "", disabledVote: ""
			};

			badgeTranslation = {
				feedback: "", unreadFeedback: "", questions: "",
				answers: Messages.FLASHCARD_VIEWS
			};
		} else {
			this.flashcardImportButton.hide();
			this.actionButtonPanel.insert(0, this.questionStatusButton);
			this.voteStatusButton.show();
		}

		this.toolbar.setTitle(toolbarTitle);
		this.questionListContainer.setTitle(questionListText);
		this.newQuestionButton.setButtonText(lectureButtonText);
		this.deleteAnswersButton.setButtonText(deleteAnswersText);
		this.deleteQuestionsButton.setButtonText(deleteQuestionsText);
		this.exportCsvQuestionsButton.setButtonText(exportText);
		this.questionsImport.setButtonText(importText);
		this.caption.setTranslation(captionTranslation);
		this.caption.setBadgeTranslation(badgeTranslation);
		this.questionStatusButton.setHidden(this.getVariant() === 'flashcard');
		ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.showcaseQuestionPanel.setMode(this.getVariant());
	}
});
