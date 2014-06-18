/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/speaker/newQuestionPanel.js
 - Beschreibung: Panel zum Erzeugen einer Publikumsfragen.
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
Ext.define('ARSnova.view.speaker.NewQuestionPanel', {
	extend: 'Ext.Panel',

	requires: ['ARSnova.view.speaker.form.AbstentionForm', 'ARSnova.view.speaker.form.ExpandingAnswerForm',
	           'ARSnova.view.speaker.form.IndexedExpandingAnswerForm',
	           'ARSnova.view.speaker.form.FlashcardQuestion', 'ARSnova.view.speaker.form.SchoolQuestion',
	           'ARSnova.view.speaker.form.VoteQuestion', 'ARSnova.view.speaker.form.YesNoQuestion',
	           'ARSnova.view.speaker.form.NullQuestion', 'ARSnova.view.speaker.form.GridQuestion'],

	config: {
		title: 'NewQuestionPanel',
		fullscreen: true,
		scrollable: true,
		scroll: 'vertical',

		variant: 'lecture',
		releasedFor: 'all'
	},

	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	saveButton	: null,

	/* items */
	text: null,
	subject: null,
	duration: null,

	/* for estudy */
	userCourses: [],

	initialize: function(){
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.QUESTIONS,
			ui		: 'back',
			handler	: function(){
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.animateActiveItem(sTP.audienceQuestionPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});

		this.saveButtonToolbar = Ext.create('Ext.Button', {
			text	: Messages.SAVE,
			ui		: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 89px',
			handler: function() {
				this.saveHandler().then(function(response) {
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
			name	  	: 'text',
	    	placeHolder	: Messages.QUESTIONTEXT_PlACEHOLDER,
	    	maxHeight	: 140
		});

		//Preview button
		this.previewButton = Ext.create('Ext.Button', {
			text	: Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui		: 'confirm',
			cls		: 'previewButton',
			scope   : this,
			handler : function() {
					this.previewHandler();
				}
		});

		//Preview panel with integrated button
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
			},{
				xtype: 'fieldset',
				items: [this.textarea]
			}]
		});

		this.releaseItems = [{
			text: window.innerWidth < 600 ? Messages.ALL_SHORT : Messages.ALL_LONG,
			pressed: true,
			scope: this,
			handler: function() {
				this.setReleasedFor('all');
			}
		}, {
			text: window.innerWidth < 600 ? Messages.ONLY_THM_SHORT : Messages.ONLY_THM_LONG,
			scope: this,
			handler: function() {
				this.setReleasedFor('thm');
			}
		}];

		this.abstentionPart = Ext.create('ARSnova.view.speaker.form.AbstentionForm');

		this.releasePart = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			cls: 'newQuestionOptions',
			items: [{
				xtype: 'fieldset',
				title: Messages.RELEASE_FOR,
	            items: [{
	            	xtype: 'segmentedbutton',
	            	style: 'margin: auto',
	        		allowDepress: false,
	        		allowMultiple: false,
	        		items: this.releaseItems
	            }]
			}]
    	});

		if (
		  localStorage.getItem('courseId') != null
		  && localStorage.getItem('courseId').length > 0
		) {
			this.releasePart = Ext.create('Ext.Panel', {
				items: [
					{
						cls: 'gravure',
						html: '<span class="coursemembersonlymessage">'+Messages.MEMBERS_ONLY+'</span>'
					}
				]
			});
		}

		this.yesNoQuestion = Ext.create('ARSnova.view.speaker.form.YesNoQuestion', {
			cls: 'newQuestionOptions',
			hidden: true,
			scrollable: null
		});

		this.gridQuestion = Ext.create('ARSnova.view.speaker.form.GridQuestion', {
			id: 'grid',
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

		this.flashcardQuestion = Ext.create('ARSnova.view.speaker.form.FlashcardQuestion', {
			hidden: true
		});

		this.questionOptions = Ext.create('Ext.SegmentedButton', {
	        allowDepress: false,
	        items: [
	                { text: Messages.MC },
	                { text: Messages.ABCD	},
	                { text: Messages.YESNO 	},
	                { text: Messages.FREETEXT },
									{ text: Messages.GRID },
	                { text: Messages.EVALUATION },
	                { text: Messages.SCHOOL },
	                { text: Messages.FLASHCARD_SHORT }
	        ],
	        listeners: {
				scope: this,
				toggle: function(container, button, pressed) {
					var label = Ext.bind(function(longv, shortv) {
						var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
						return (screenWidth > 320 || this.backButton.isHidden()) ? longv : shortv;
					}, this);

					var title = '';

					switch (button.getText()) {
						case Messages.GRID:
							if(pressed){
								this.gridQuestion.show();
								title = label(Messages.QUESTION_GRID, Messages.QUESTION_GRID_SHORT);
							}else{
								this.gridQuestion.hide();
							}
						break;
						case Messages.EVALUATION:
							if (pressed) {
								this.voteQuestion.show();
								title =  label(Messages.QUESTION_RATING, Messages.QUESTION_RATING_SHORT);
							} else {
								this.voteQuestion.hide();
							}
							break;
						case Messages.SCHOOL:
							if (pressed) {
								this.schoolQuestion.show();
								title = label(Messages.QUESTION_GRADE, Messages.QUESTION_GRADE_SHORT);
							} else {
								this.schoolQuestion.hide();
							}
							break;
						case Messages.MC:
							if (pressed) {
								this.multipleChoiceQuestion.show();
								title = label(Messages.QUESTION_MC, Messages.QUESTION_MC_SHORT);
							} else {
								this.multipleChoiceQuestion.hide();
							}
							break;
						case Messages.YESNO:
							if (pressed) {
								this.yesNoQuestion.show();
								title = label(Messages.QUESTION_YESNO, Messages.QUESTION_YESNO);
							} else {
								this.yesNoQuestion.hide();
							}
							break;
						case Messages.ABCD:
							if (pressed) {
								this.abcdQuestion.show();
								title = label(Messages.QUESTION_SINGLE_CHOICE, Messages.QUESTION_SINGLE_CHOICE_SHORT);
							} else {
								this.abcdQuestion.hide();
							}
							break;
						case Messages.FREETEXT:
							if (pressed) {
								this.freetextQuestion.show();
								title = label(Messages.QUESTION_FREETEXT, Messages.QUESTION_FREETEXT_SHORT);
							} else {
								this.freetextQuestion.hide();
							}
							break;
						case Messages.FLASHCARD_SHORT:
							if (pressed) {
								this.flashcardQuestion.show();
								this.abstentionPart.hide();
								title = Messages.FLASHCARD;
							} else {
								this.flashcardQuestion.hide();
								this.abstentionPart.show();
							}
							break;
						default:
							title = Messages.NEW_QUESTION_TITLE;
							break;
					}
					this.toolbar.setTitle(title);
	        	}
	        }
	    });

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.NEW_QUESTION_TITLE,
			docked: 'top',
			ui: 'light',
			items: [
		        this.backButton,
		        {xtype:'spacer'},
		        this.saveButtonToolbar
			]
		});

		this.saveButton = Ext.create('Ext.Button', {
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'margin-top: 30px',
			text: Messages.SAVE,
			handler: function() {
				this.saveHandler().then(function(response) {
					ARSnova.app.getController('Questions').details({
						question: Ext.decode(response.responseText)
					});
				});
			},
			scope: this
		});

		this.saveAndContinueButton = Ext.create('Ext.Button', {
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'margin-top: 30px',
			text: Messages.SAVE_AND_CONTINUE,
			handler: function() {
				this.saveHandler().then(function() {
					var theNotificationBox = {};
					theNotificationBox = Ext.create('Ext.MessageBox', {
						width: 300,
						styleHtmlContent: true,
						styleHtmlCls: 'notificationBoxText',
						html: Messages.QUESTION_SAVED,
						listeners: {
							show: function() {
								Ext.defer(function(){
									theNotificationBox.hide();
								}, 3000);
							}
						}
					});
					Ext.Viewport.add(theNotificationBox);
					theNotificationBox.show();
				}).then(Ext.bind(function(response) {
					this.getScrollable().getScroller().scrollTo(0, 0, true);
				}, this));
			},
			scope: this
		});

		this.add([this.toolbar,
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
					this.questionOptions,
					{
						xtype: 'spacer'
					}
				]
			}),
			this.mainPart,
			this.previewPart,
			/* only one of the question types will be shown at the same time */
			this.voteQuestion,
			this.multipleChoiceQuestion,
			this.yesNoQuestion,
			this.schoolQuestion,
			this.abcdQuestion,
			this.freetextQuestion,
			this.flashcardQuestion,
			this.gridQuestion,

			this.abstentionPart,
			this.releasePart,

			this.saveButton,
			this.saveAndContinueButton
		]);

		this.on('activate', this.onActivate);
	},

	onActivate: function() {
		this.questionOptions.setPressedButtons([0]);
	},

	previewHandler: function() {
		var questionPreview = Ext.create('ARSnova.view.QuestionPreviewBox', {
			xtype: 'questionPreview'
		});
		questionPreview.showPreview(this.subject.getValue(), this.textarea.getValue());
	},

	saveHandler: function(){
    	var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
    	var values = {};

		/* get text, subject of question from mainPart */
		var mainPartValues = panel.mainPart.getValues();
		values.text = mainPartValues.text;
		values.subject = mainPartValues.subject;
		values.abstention = !panel.abstentionPart.isHidden() && panel.abstentionPart.getAbstention();
		values.questionVariant = panel.getVariant();

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
		promise.then(function() {
			panel.subject.reset();
			panel.textarea.reset();

			switch (panel.questionOptions.getPressedButtons()[0]._text) {
	    		case Messages.GRID:
	    			panel.gridQuestion.resetView();
	    		break;
	    		default:
					break;
			}

		});
		return promise;
	},

	dispatch: function(values) {
		var promise = new RSVP.Promise();
		ARSnova.app.getController('Questions').add({
			sessionKeyword: localStorage.getItem('keyword'),
			text		: values.text,
			subject		: values.subject,
			type		: "skill_question",
			questionType: values.questionType,
			questionVariant: values.questionVariant,
			duration	: values.duration,
			number		: 0, // unused
			active		: 1,
			possibleAnswers: values.possibleAnswers,
			releasedFor	: values.releasedFor,
			noCorrect	: values.noCorrect,
			abstention	: values.abstention,
			showStatistic: 1,
			gridSize    : values.gridSize,
			offsetX  	: values.offsetX,
			offsetY 	: values.offsetY,
			zoomLvl 	: values.zoomLvl,
			image		: values.image,
			successFunc	: function(response, opts){
				promise.resolve(response);
			},
			failureFunc	: function(response, opts){
				Ext.Msg.alert(Messages.NOTICE, Messages.QUESTION_CREATION_ERROR);
				promise.reject(response);
			}
		});
		return promise;
	}
});
