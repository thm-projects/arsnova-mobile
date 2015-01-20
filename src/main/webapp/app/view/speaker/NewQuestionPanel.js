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
		'ARSnova.view.speaker.form.ImageUploadPanel'
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
		
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

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
			handler: function (button) {
				this.saveHandler(button).then(function (response) {
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
			placeHolder: Messages.FORMAT_PLACEHOLDER
		});

		// Preview button
		this.previewButton = Ext.create('Ext.Button', {
			text: Ext.os.is.Desktop ? 
				Messages.QUESTION_PREVIEW_BUTTON_TITLE_DESKTOP:
				Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui: 'action',
			cls: Ext.os.is.Desktop ?
				'previewButtonLong':
				'previewButton',
			scope: this,
			handler: function () {
				this.defaultPreviewHandler();
			}
		});

		// Preview panel with integrated button
		this.previewPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,
			hidden: true,
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

		this.abstentionPart = Ext.create('ARSnova.view.speaker.form.AbstentionForm', {
			id: 'abstentionPart'
		});

		this.uploadView = Ext.create('ARSnova.view.speaker.form.ImageUploadPanel', {
			handlerScope: this,
			activateTemplates: false,
			urlUploadHandler: this.setImage,
			fsUploadHandler: this.setImage
		});

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
					html: '<span class="coursemembersonlyicon"></span><span class="coursemembersonlymessage">' + Messages.MEMBERS_ONLY + '</span>'
				}
			],
			hidden: true
		});

		this.yesNoQuestion = Ext.create('ARSnova.view.speaker.form.YesNoQuestion', {
			hidden: true
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
		
		var messageAppendix = screenWidth >= 650 ? "_LONG" : "";

		var formatItems = [
			{text: Messages["MC" + messageAppendix], itemId: Messages.MC},
			{text: Messages["ABCD" + messageAppendix], itemId: Messages.ABCD},
			{text: Messages["YESNO" + messageAppendix], itemId: Messages.YESNO},
			{text: Messages["FREETEXT" + messageAppendix], itemId: Messages.FREETEXT},
			{text: Messages["EVALUATION" + messageAppendix], itemId: Messages.EVALUATION},
			{text: Messages["SCHOOL" + messageAppendix], itemId: Messages.SCHOOL}
		];

		var me = this;
		var config = ARSnova.app.globalConfig;
		if (config.features.flashcard) {
			formatItems.push({
				itemId: Messages.FLASHCARD,
				text: messageAppendix.length ? 
						Messages.FLASHCARD : 
						Messages.FLASHCARD_SHORT
			});
			me.flashcardQuestion = Ext.create('ARSnova.view.speaker.form.FlashcardQuestion', {
				editPanel: false,
				hidden: true
			});
		}
		if (config.features.gridSquare) {
			formatItems.push({
				itemId: Messages.GRID,
				text: Messages["GRID" + messageAppendix]
			});
			me.gridQuestion = Ext.create('ARSnova.view.speaker.form.GridQuestion', {
				id: 'grid',
				hidden: true
			});
		}

		me.questionOptions = Ext.create('Ext.SegmentedButton', {
			allowDepress: false,
			items: formatItems,
		    defaults: {
		    	ui: 'action'
		    },
			listeners: {
				scope: me,
				toggle: function (container, button, pressed) {
					var label = Ext.bind(function (longv, shortv) {
						var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
						return (screenWidth >= 490 || me.backButton.isHidden()) ? longv : shortv;
					}, me);

					var title = '';
					
					me.previewPart.hide();
					me.previewButton.setHandler(this.defaultPreviewHandler);

					switch (button.getText()) {
						case Messages.GRID:
						case Messages.GRID_LONG:
							if (pressed) {
								me.gridQuestion.show();
								me.previewButton.setHandler(me.gridQuestion.previewHandler);
								title = label(Messages.QUESTION_GRID, Messages.QUESTION_GRID_SHORT);
								this.previewPart.show();
								this.uploadView.hide();
								this.grid.hide();
							} else {
								me.gridQuestion.hide();
								
								this.uploadView.show();
								if (this.grid.getImageFile()) {
									this.grid.show();
								}
							}
						break;
						case Messages.EVALUATION:
						case Messages.EVALUATION_LONG:
							if (pressed) {
								me.voteQuestion.show();
								title = label(Messages.QUESTION_RATING, Messages.QUESTION_RATING_SHORT);
							} else {
								me.voteQuestion.hide();
							}
							break;
						case Messages.SCHOOL:
						case Messages.SCHOOL_LONG:
							if (pressed) {
								me.schoolQuestion.show();
								title = label(Messages.QUESTION_GRADE, Messages.QUESTION_GRADE_SHORT);
							} else {
								me.schoolQuestion.hide();
							}
							break;
						case Messages.MC:
						case Messages.MC_LONG:
							if (pressed) {
								me.multipleChoiceQuestion.show();
								title = label(Messages.QUESTION_MC, Messages.QUESTION_MC_SHORT);
							} else {
								me.multipleChoiceQuestion.hide();
							}
							break;
						case Messages.YESNO:
						case Messages.YESNO_LONG:
							if (pressed) {
								me.previewPart.show();
								me.yesNoQuestion.show();
								me.previewButton.setHandler(me.yesNoQuestion.previewHandler);
								title = label(Messages.QUESTION_YESNO, Messages.QUESTION_YESNO_SHORT);
							} else {
								me.yesNoQuestion.hide();
							}
							break;
						case Messages.ABCD:
						case Messages.ABCD_LONG:
							if (pressed) {
								me.abcdQuestion.show();
								title = label(Messages.QUESTION_SINGLE_CHOICE, Messages.QUESTION_SINGLE_CHOICE_SHORT);
							} else {
								me.abcdQuestion.hide();
							}
							break;
						case Messages.FREETEXT:
						case Messages.FREETEXT_LONG:
							if (pressed) {
								me.previewPart.show();
								me.freetextQuestion.show();
								title = label(Messages.QUESTION_FREETEXT, Messages.QUESTION_FREETEXT_SHORT);
							} else {
								me.freetextQuestion.hide();
							}
							break;
						case Messages.FLASHCARD:
						case Messages.FLASHCARD_SHORT:
							if (pressed) {
								me.textarea.setPlaceHolder(Messages.FLASHCARD_FRONT_PAGE);
								me.flashcardQuestion.show();
								me.abstentionPart.hide();
								title = Messages.FLASHCARD;
								
								me.uploadView.setUploadPanelConfig(
									Messages.PICTURE_SOURCE + " - " + 
									Messages.FLASHCARD_BACK_PAGE,
									me.setFcImage, me.setFcImage
								);
							} else {
								me.textarea.setPlaceHolder(Messages.FORMAT_PLACEHOLDER);
								me.flashcardQuestion.hide();
								me.abstentionPart.show();
								
								me.uploadView.setUploadPanelConfig(
									Messages.PICTURE_SOURCE,
									me.setImage, me.setImage
								);
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
			cls: 'speakerTitleText',
			docked: 'top',
			ui: 'light',
			items: [
				me.backButton,
				{xtype:'spacer'},
				me.saveButtonToolbar
			]
		});

		me.saveAndContinueButton = Ext.create('Ext.Button', {
			ui: 'confirm',
			cls: 'saveQuestionButton',
			text: Messages.SAVE_AND_CONTINUE,
			handler: function (button) {
				me.saveHandler(button).then(function () {
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
			me.uploadView,
			me.grid
		]);
		if (me.gridQuestion) {
			me.add(me.gridQuestion);
		}

		me.add([
			me.releasePart,
			me.saveAndContinueButton
		]);

		me.on('activate', me.onActivate);
	},

	onActivate: function () {
		this.questionOptions.setPressedButtons([0]);
		this.releasePart.setHidden(localStorage.getItem('courseId') === null || localStorage.getItem('courseId').length === 0);
	},
	
	defaultPreviewHandler: function() {
		var questionPreview = Ext.create('ARSnova.view.QuestionPreviewBox');
		questionPreview.showPreview(this.subject.getValue(), this.textarea.getValue());
	},

	saveHandler: function (button) {
		/* disable save button in order to avoid multiple question creation */
		button.disable();
		
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
		var values = {};
		/* get text, subject of question from mainPart */
		var mainPartValues = panel.mainPart.getValues();
		values.text = mainPartValues.text;
		values.subject = mainPartValues.subject;
		values.abstention = !panel.abstentionPart.isHidden() && panel.abstentionPart.getAbstention();
		values.questionVariant = panel.getVariant();
		values.image = this.image;
		values.flashcardImage = null;

		if (localStorage.getItem('courseId') != null && localStorage.getItem('courseId').length > 0) {
			values.releasedFor = 'courses';
		} else {
			values.releasedFor = panel.getReleasedFor();
		}

		/* fetch the values */
		switch (panel.questionOptions.getPressedButtons()[0]._text) {
			case Messages.GRID:
			case Messages.GRID_LONG:
				values.questionType = "grid";
				Ext.apply(values, panel.gridQuestion.getQuestionValues());
			break;
			case Messages.EVALUATION:
			case Messages.EVALUATION_LONG:
				values.questionType = "vote";

				Ext.apply(values, panel.voteQuestion.getQuestionValues());
				break;
			case Messages.SCHOOL:
			case Messages.SCHOOL_LONG:
				values.questionType = "school";

				Ext.apply(values, panel.schoolQuestion.getQuestionValues());
				break;
			case Messages.MC:
			case Messages.MC_LONG:
				values.questionType = "mc";

				Ext.apply(values, panel.multipleChoiceQuestion.getQuestionValues());
				break;
			case Messages.YESNO:
			case Messages.YESNO_LONG:
				values.questionType = "yesno";

				Ext.apply(values, panel.yesNoQuestion.getQuestionValues());
				break;
			case Messages.ABCD:
			case Messages.ABCD_LONG:
				values.questionType = "abcd";

				Ext.apply(values, panel.abcdQuestion.getQuestionValues());
				break;

			case Messages.FREETEXT:
			case Messages.FREETEXT_LONG:
				values.questionType = "freetext";
				values.possibleAnswers = [];
				break;

			case Messages.FLASHCARD:
			case Messages.FLASHCARD_SHORT:
				values.questionType = "flashcard";

				values.flashcardImage = this.fcImage;
				Ext.apply(values, panel.flashcardQuestion.getQuestionValues());
				break;

			default:
				break;
		}

		var promise = panel.dispatch(values, button);
		promise.then(function () {
			panel.subject.reset();
			panel.textarea.reset();
			
			if (panel.flashcardQuestion) {
				panel.flashcardQuestion.answer.reset();
				panel.setFcImage(null);
			}

			switch (panel.questionOptions.getPressedButtons()[0]._text) {
				case Messages.GRID:
					panel.gridQuestion.resetView();
				break;
				default:
					panel.setImage(null);
					me.uploadView.setUploadPanelConfig(
						Messages.PICTURE_SOURCE,
						me.setImage, me.setImage
					);
					break;
			}

		});
		return promise;
	},

	dispatch: function (values, button) {
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
			fcImage: values.flashcardImage,
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
			gridType: values.gridType,
			scaleFactor: values.scaleFactor,
			gridScaleFactor: values.gridScaleFactor,
			saveButton: button,
			successFunc: function (response, opts) {
				promise.resolve(response);
				button.enable();
			},
			failureFunc: function (response, opts) {
				Ext.Msg.alert(Messages.NOTICE, Messages.QUESTION_CREATION_ERROR);
				promise.reject(response);
				button.enable();
			}
		});
		return promise;
	},

	setImage: function (image) {
		var title = this.toolbar.getTitle().getTitle(),
			isFlashcard = title === Messages.FLASHCARD;
		
		this.image = image;
			
		!isFlashcard ? this.grid.setImage(image) :
			this.flashcardQuestion.grid.setImage(image);
		
		if (image) {
			!isFlashcard ? this.grid.show() :
				this.flashcardQuestion.grid.show();
		} else {
			!isFlashcard ? this.grid.hide() :
				this.flashcardQuestion.grid.hide();
		}
	},
	
	setFcImage: function (image) {
		this.fcImage = image;
		this.grid.setImage(image);
		if(image) {
			this.grid.show();
		} else {
			this.grid.hide();
		}
	},
	
	/**
	 * Selects a button of the segmentation component with the given name.
	 * 
	 * @param text The text of the button to be selected.
	 */
	activateButtonWithText: function(text) {
		var me = this;
		
		this.questionOptions.innerItems.forEach(function(item, index) {
			if (item.getItemId() == text) {
				me.questionOptions.setPressedButtons([index]);
			}
		});
	}
});
