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
Ext.define('ARSnova.view.speaker.NewQuestionPanel', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.view.speaker.form.AbstentionForm',
		'ARSnova.view.speaker.form.ExpandingAnswerForm',
		'ARSnova.view.speaker.form.IndexedExpandingAnswerForm',
		'ARSnova.view.speaker.form.FlashcardQuestion',
		'ARSnova.view.speaker.form.SchoolQuestion',
		'ARSnova.view.speaker.form.VoteQuestion',
		'ARSnova.view.speaker.form.YesNoQuestion',
		'ARSnova.view.speaker.form.NullQuestion',
		'ARSnova.view.speaker.form.GridQuestion',
//		'ARSnova.view.speaker.form.ImageUploadPanel'
	],

	config: {
		title: 'NewQuestionPanel',
		fullscreen: true,
		scrollable: true,
		scroll: 'vertical',

		variant: 'lecture',
		releasedFor: 'all'
	},

	/* toolbar items */
	toolbar: null,
	backButton: null,
	saveButton: null,

	/* items */
	text: null,
	subject: null,
	duration: null,
	image: null,

	/* for estudy */
	userCourses: [],

	initialize: function () {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.QUESTIONS,
			ui: 'back',
			handler: function () {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.animateActiveItem(sTP.audienceQuestionPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.saveButtonToolbar = Ext.create('Ext.Button', {
			text: Messages.SAVE,
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 89px',
			handler: function () {
				this.saveHandler().then(function (response) {
					ARSnova.app.getController('Questions').details({
						question: Ext.decode(response.responseText)
					});
				});
			},
			scope: this
		});

		this.subject = Ext.create('Ext.field.Text', {
			name: 'subject',
			placeHolder: Messages.CATEGORY_PLACEHOLDER
		});

		this.textarea = Ext.create('Ext.plugins.ResizableTextArea', {
			name: 'text',
			placeHolder: Messages.QUESTIONTEXT_PLACEHOLDER,
			maxHeight: 140
		});

		// Preview button
		this.previewButton = Ext.create('Ext.Button', {
			text: Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui: 'confirm',
			cls: 'previewButton',
			scope: this,
			handler: function () {
					this.previewHandler();
				}
		});

		// Preview panel with integrated button
		this.previewPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				items: [this.previewButton]
			}]
		});

		this.mainPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,

			items: [{
				xtype: 'fieldset',
				items: [this.subject]
			}, {
				xtype: 'fieldset',
				items: [this.textarea]
			}]
		});

		this.abstentionPart = Ext.create('ARSnova.view.speaker.form.AbstentionForm');

//		this.uploadView = Ext.create('ARSnova.view.speaker.form.ImageUploadPanel', {
//			handlerScope: this,
//			urlUploadHandler: this.setImage,
//			fsUploadHandler: this.setImage
//		});

		this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
			editable: false,
			gridIsHidden: true,
			hidden: true,
			style: "padding-top: 10px;"
		});

		this.releasePart = Ext.create('Ext.Panel', {
			items: [
				{
					cls: 'gravure',
					html: '<span class="coursemembersonlymessage">' + Messages.MEMBERS_ONLY + '</span>'
				}
			],
			hidden: true
		});

		this.yesNoQuestion = Ext.create('ARSnova.view.speaker.form.YesNoQuestion', {
			cls: 'newQuestionOptions',
			hidden: true,
			scrollable: null
		});

		this.multipleChoiceQuestion = Ext.create('ARSnova.view.speaker.form.ExpandingAnswerForm', {
			hidden: true
		});

		this.voteQuestion = Ext.create('ARSnova.view.speaker.form.VoteQuestion', {
			hidden: true
		});

		this.schoolQuestion = Ext.create('ARSnova.view.speaker.form.SchoolQuestion', {
			hidden: true
		});

		this.abcdQuestion = Ext.create('ARSnova.view.speaker.form.IndexedExpandingAnswerForm', {
			hidden: true
		});

		this.freetextQuestion = Ext.create('Ext.form.FormPanel', {
			hidden: true,
			scrollable: null,
			submitOnAction: false,
			items: []
		});

		var formatItems = [
			{text: Messages.MC},
			{text: Messages.ABCD},
			{text: Messages.YESNO},
			{text: Messages.FREETEXT},
			{text: Messages.EVALUATION},
			{text: Messages.SCHOOL}
		];

		var me = this;
		var config = ARSnova.app.globalConfig;
		if (config.features.flashcard) {
			formatItems.push({text: Messages.FLASHCARD_SHORT});
			me.flashcardQuestion = Ext.create('ARSnova.view.speaker.form.FlashcardQuestion', {
				hidden: true
			});
		}
		if (config.features.gridSquare) {
			formatItems.push({text: Messages.GRID});
			me.gridQuestion = Ext.create('ARSnova.view.speaker.form.GridQuestion', {
				id: 'grid',
				hidden: true
			});
		}

		me.questionOptions = Ext.create('Ext.SegmentedButton', {
			allowDepress: false,
			items: formatItems,
			listeners: {
				scope: me,
				toggle: function (container, button, pressed) {
					var label = Ext.bind(function (longv, shortv) {
						var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
						return (screenWidth > 320 || me.backButton.isHidden()) ? longv : shortv;
					}, me);

					var title = '';

					switch (button.getText()) {
						case Messages.GRID:
							if (pressed) {
								me.gridQuestion.show();
								title = label(Messages.QUESTION_GRID, Messages.QUESTION_GRID_SHORT);
//								this.uploadView.show();
								this.grid.hide();
							} else {
								me.gridQuestion.hide();
								
//								this.uploadView.hide();
								if (this.grid.getImageFile()) {
									this.grid.show();
								}
							}
						break;
						case Messages.EVALUATION:
							if (pressed) {
								me.voteQuestion.show();
								title = label(Messages.QUESTION_RATING, Messages.QUESTION_RATING_SHORT);
							} else {
								me.voteQuestion.hide();
							}
							break;
						case Messages.SCHOOL:
							if (pressed) {
								me.schoolQuestion.show();
								title = label(Messages.QUESTION_GRADE, Messages.QUESTION_GRADE_SHORT);
							} else {
								me.schoolQuestion.hide();
							}
							break;
						case Messages.MC:
							if (pressed) {
								me.multipleChoiceQuestion.show();
								title = label(Messages.QUESTION_MC, Messages.QUESTION_MC_SHORT);
							} else {
								me.multipleChoiceQuestion.hide();
							}
							break;
						case Messages.YESNO:
							if (pressed) {
								me.yesNoQuestion.show();
								title = label(Messages.QUESTION_YESNO, Messages.QUESTION_YESNO);
							} else {
								me.yesNoQuestion.hide();
							}
							break;
						case Messages.ABCD:
							if (pressed) {
								me.abcdQuestion.show();
								title = label(Messages.QUESTION_SINGLE_CHOICE, Messages.QUESTION_SINGLE_CHOICE_SHORT);
							} else {
								me.abcdQuestion.hide();
							}
							break;
						case Messages.FREETEXT:
							if (pressed) {
								me.freetextQuestion.show();
								title = label(Messages.QUESTION_FREETEXT, Messages.QUESTION_FREETEXT_SHORT);
							} else {
								me.freetextQuestion.hide();
							}
							break;
						case Messages.FLASHCARD_SHORT:
							if (pressed) {
								me.flashcardQuestion.show();
								me.abstentionPart.hide();
								title = Messages.FLASHCARD;
							} else {
								me.flashcardQuestion.hide();
								me.abstentionPart.show();
							}
							break;
						default:
							title = Messages.NEW_QUESTION_TITLE;
							break;
					}
					me.toolbar.setTitle(title);
				}
			}
		});

		me.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.NEW_QUESTION_TITLE,
			docked: 'top',
			ui: 'light',
			items: [
				me.backButton,
				{xtype:'spacer'},
				me.saveButtonToolbar
			]
		});

		me.saveButton = Ext.create('Ext.Button', {
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'margin-top: 30px',
			text: Messages.SAVE,
			handler: function () {
				me.saveHandler().then(function (response) {
					ARSnova.app.getController('Questions').details({
						question: Ext.decode(response.responseText)
					});
				});
			},
			scope: me
		});

		me.saveAndContinueButton = Ext.create('Ext.Button', {
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'margin-top: 30px',
			text: Messages.SAVE_AND_CONTINUE,
			handler: function () {
				me.saveHandler().then(function () {
					var theNotificationBox = {};
					theNotificationBox = Ext.create('Ext.Panel', {
						cls: 'notificationBox',
						name: 'notificationBox',
						showAnimation: 'pop',
						modal: true,
						centered: true,
						width: 300,
						styleHtmlContent: true,
						styleHtmlCls: 'notificationBoxText',
						html: Messages.QUESTION_SAVED
//						listeners: {
//							hide: function () {
//								me.destroy();
//							},
//							show: function () {
//								Ext.defer(function () {
//									theNotificationBox.hide();
//								}, 3000);
//							}
//						}
					});
					Ext.Viewport.add(theNotificationBox);
					theNotificationBox.show();

					/* Workaround for Chrome 34+ */
					Ext.defer(function () {
						theNotificationBox.destroy();
					}, 3000);
				}).then(Ext.bind(function (response) {
					me.getScrollable().getScroller().scrollTo(0, 0, true);
				}, me));
			},
			scope: me
		});

		me.add([me.toolbar,
			Ext.create('Ext.Toolbar', {
				cls: 'noBackground noBorder',
				docked: 'top',
				scrollable: {
					direction: 'horizontal',
					directionLock: true
				},
				items: [{
						xtype: 'spacer'
					},
					me.questionOptions,
					{
						xtype: 'spacer'
					}
				]
			}),
			me.mainPart,
			me.previewPart,
			/* only one of the question types will be shown at the same time */
			me.voteQuestion,
			me.multipleChoiceQuestion,
			me.yesNoQuestion,
			me.schoolQuestion,
			me.abcdQuestion,
			me.freetextQuestion
		]);
		if (me.flashcardQuestion) {
			me.add(me.flashcardQuestion);
		}
		me.add([
			me.abstentionPart,
//			me.uploadView,
			me.grid,
			me.releasePart
		]);
		if (me.gridQuestion) {
			me.add(me.gridQuestion);
		}

		me.add([
			me.saveButton,
			me.saveAndContinueButton
		]);

		me.on('activate', me.onActivate);
	},

	onActivate: function () {
		this.questionOptions.setPressedButtons([0]);
		this.releasePart.setHidden(localStorage.getItem('courseId') === null || localStorage.getItem('courseId').length === 0);
	},

	previewHandler: function () {
		var questionPreview = Ext.create('ARSnova.view.QuestionPreviewBox', {
			xtype: 'questionPreview'
		});
		questionPreview.showPreview(this.subject.getValue(), this.textarea.getValue());
	},

	saveHandler: function () {
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
		var values = {};

		/* get text, subject of question from mainPart */
		var mainPartValues = panel.mainPart.getValues();
		values.text = mainPartValues.text;
		values.subject = mainPartValues.subject;
		values.abstention = !panel.abstentionPart.isHidden() && panel.abstentionPart.getAbstention();
		values.questionVariant = panel.getVariant();
		values.image = this.image;

		if (localStorage.getItem('courseId') != null && localStorage.getItem('courseId').length > 0) {
			values.releasedFor = 'courses';
		} else {
			values.releasedFor = panel.getReleasedFor();
		}

		/* fetch the values */
		switch (panel.questionOptions.getPressedButtons()[0]._text) {
			case Messages.GRID:
				values.questionType = "grid";
				Ext.apply(values, panel.gridQuestion.getQuestionValues());
			break;
			case Messages.EVALUATION:
				values.questionType = "vote";

				Ext.apply(values, panel.voteQuestion.getQuestionValues());
				break;
			case Messages.SCHOOL:
				values.questionType = "school";

				Ext.apply(values, panel.schoolQuestion.getQuestionValues());
				break;
			case Messages.MC:
				values.questionType = "mc";

				Ext.apply(values, panel.multipleChoiceQuestion.getQuestionValues());
				break;
			case Messages.YESNO:
				values.questionType = "yesno";

				Ext.apply(values, panel.yesNoQuestion.getQuestionValues());
				break;
			case Messages.ABCD:
				values.questionType = "abcd";

				Ext.apply(values, panel.abcdQuestion.getQuestionValues());
				break;

			case Messages.FREETEXT:
				values.questionType = "freetext";
				values.possibleAnswers = [];
				break;

			case Messages.FLASHCARD_SHORT:
				values.questionType = "flashcard";

				Ext.apply(values, panel.flashcardQuestion.getQuestionValues());
				break;

			default:
				break;
		}

		var promise = panel.dispatch(values);
		promise.then(function () {
			panel.subject.reset();
			panel.textarea.reset();

			switch (panel.questionOptions.getPressedButtons()[0]._text) {
				case Messages.GRID:
					panel.gridQuestion.resetView();
				break;
				default:
					panel.setImage(null);
					break;
			}

		});
		return promise;
	},

	dispatch: function (values) {
		var promise = new RSVP.Promise();
		ARSnova.app.getController('Questions').add({
			sessionKeyword: localStorage.getItem('keyword'),
			text: values.text,
			subject: values.subject,
			type: "skill_question",
			questionType: values.questionType,
			questionVariant: values.questionVariant,
			duration: values.duration,
			number: 0, // unused
			active: 1,
			possibleAnswers: values.possibleAnswers,
			releasedFor: values.releasedFor,
			noCorrect: values.noCorrect,
			abstention: values.abstention,
			showStatistic: 1,
			gridSize: values.gridSize,
			offsetX: values.offsetX,
			offsetY: values.offsetY,
			zoomLvl: values.zoomLvl,
			image: values.image,
			gridOffsetX: values.gridOffsetX,
			gridOffsetY: values.gridOffsetY,
			gridZoomLvl: values.gridZoomLvl,
			gridSizeX: values.gridSizeX,
			gridSizeY: values.gridSizeY,
			gridIsHidden: values.gridIsHidden,
			imgRotation: values.imgRotation,
			toggleFieldsLeft: values.toggleFieldsLeft,
			numClickableFields: values.numClickableFields,
			thresholdCorrectAnswers: values.thresholdCorrectAnswers,
			cvIsColored: values.cvIsColored,
			gridLineColor: values.gridLineColor,
			numberOfDots: values.numberOfDots,
			successFunc: function (response, opts) {
				promise.resolve(response);
			},
			failureFunc: function (response, opts) {
				Ext.Msg.alert(Messages.NOTICE, Messages.QUESTION_CREATION_ERROR);
				promise.reject(response);
			}
		});
		return promise;
	},

	setImage: function (image) {
		this.image = image;
		this.grid.setImage(image);
		if (image) {
			this.grid.show();
		} else {
			this.grid.hide();
		}
	}
});
