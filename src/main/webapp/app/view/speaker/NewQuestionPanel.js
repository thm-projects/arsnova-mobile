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
	
	requires: ['ARSnova.view.speaker.form.ExpandingAnswerForm', 'ARSnova.view.speaker.form.IndexedExpandingAnswerForm',
	           'ARSnova.view.speaker.form.FlashcardQuestion', 'ARSnova.view.speaker.form.SchoolQuestion',
	           'ARSnova.view.speaker.form.VoteQuestion', 'ARSnova.view.speaker.form.YesNoQuestion',
	           'ARSnova.view.speaker.form.NullQuestion'],
	
	config: {
		title: 'NewQuestionPanel',
		fullscreen: true,
		scrollable: true,
		scroll: 'vertical'
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
		
		this.saveButton = Ext.create('Ext.Button', {
			text	: Messages.SAVE,
			ui		: 'confirm',
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
		
		if(window.innerWidth < 600) {
			this.releaseItems = [
                 { text	: Messages.ALL_SHORT, id: 'all', pressed: true},
                 { text	: Messages.ONLY_THM_SHORT, id: 'thm' }
             ]
		} else {
			this.releaseItems = [
                 { text	: Messages.ALL_LONG, id: 'all', pressed: true},
                 { text	: Messages.ONLY_THM_LONG, id: 'thm' }
             ]
		}
		
		this.abstentionPart = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			cls: 'newQuestionOptions',
			items: [{
				xtype: 'fieldset',
				title: Messages.ABSTENTION_POSSIBLE,
				items: [{
					xtype: 'segmentedbutton',
					style: 'margin: auto',
					cls: 'yesnoOptions',
					items: [{
						text: Messages.YES, id: 'withAbstention', pressed: true
					}, {
						text: Messages.NO, id: 'withoutAbstention'
					}]
				}]
			}]
		});
		
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
	        		items: this.releaseItems,
	    		    listeners: {
	    		    	toggle: function(container, button, pressed){
	    		    		var nQP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
	    		    		var coursesFieldset = nQP.down('fieldset[title='+Messages.MY_COURSES+']');
	    		    		if(button.id == "course"){
	    		    			if(pressed){
	    		    				if(nQP.userCourses.length == 0){
	        		    				var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH_COURSES);
	        		    				Ext.Ajax.request({
	        		    					url: ARSnova.app.WEBSERVICE_URL + 'estudy/getTeacherCourses.php',
	        		    					params: {
	        		    						login: localStorage.getItem('login')
	        		    					},
	        		    					success: function(response, opts){
	        		    						var obj = Ext.decode(response.responseText).courselist;
	        		    						
	        		    						/* Build new options array */
	        		    						for ( var i = 0; i < obj.count; i++){
	        		    							var course = obj.course[i];
	        		    							coursesFieldset.add({
	        		    								xtype: 'checkboxfield',
	        		    								name: course.name,
	        		    								label: course.name,
	        		    								value:	course.id
	        		    							});
	        		    						}
	        		    						nQP.userCourses = obj;
	        		    						coursesFieldset.show();
	        		    						hideLoadMask();
	        		    					},
	        		    					failure: function(response, opts){
	        		    						hideLoadMask();
	        		    						console.log('getcourses server-side failure with status code ' + response.status);
	        		    						Ext.Msg.alert(Messages.NOTICE, Messages.COULD_NOT_SEARCH);
	        		    					}
	        		    				});
	    		    				}
	    		    				coursesFieldset.show();
	    		    			} else {
	    		    				coursesFieldset.hide();
	    		    			}
	    		    		}
	    		    	}
	    		    }
	            }, {
	            	xtype: 'fieldset',
	            	title: Messages.MY_COURSES,
	            	hidden: true
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
			id: 'yesno',
			cls: 'newQuestionOptions',
			hidden: true,
			scrollable: null
		});
		
		this.multipleChoiceQuestion = Ext.create('ARSnova.view.speaker.form.ExpandingAnswerForm', {
			id: 'mc',
			hidden: true
		});

		this.voteQuestion = Ext.create('ARSnova.view.speaker.form.VoteQuestion', {
			id: 'vote',
			hidden: true
		});
		
		this.schoolQuestion = Ext.create('ARSnova.view.speaker.form.SchoolQuestion', {
			id: 'school',
			hidden: true
		});
		
		this.abcdQuestion = Ext.create('ARSnova.view.speaker.form.IndexedExpandingAnswerForm', {
			id: 'abcd',
			hidden: true
		});
		
		this.freetextQuestion = Ext.create('Ext.form.FormPanel', {
			id: 'freetext',
			hidden: true,
			scrollable: null,
			submitOnAction: false,
			items: []
		});
		
		this.flashcardQuestion = Ext.create('ARSnova.view.speaker.form.FlashcardQuestion', {
			id: 'flashcard',
			hidden: true
		});
		
		this.questionOptions = Ext.create('Ext.SegmentedButton', {
	        allowDepress: false,
	        items: [
	                { text: Messages.MC },
	                { text: Messages.ABCD	},
	                { text: Messages.YESNO 	},
	                { text: Messages.FREETEXT },
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
						case Messages.EVALUATION:
							if (pressed) {
								this.voteQuestion.show();
								title = label(Messages.QUESTION_RATING, Messages.QUESTION_RATING_SHORT);
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
								//title = label("HALLO???", "HALLO!!!");
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
		        this.saveButton
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
					theNotificationBox = Ext.create('Ext.Panel', {
						cls: 'notificationBox',
						name: 'notificationBox',
						showAnimation: 'pop',
						modal: true,
						centered: true,
						width: 300,
						styleHtmlContent: true,
						styleHtmlCls: 'notificationBoxText',
						html: Messages.QUESTION_SAVED,
						listeners: {
							hide: function() {
								this.destroy();
							},
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
			
			/* only one of the question types will be shown at the same time */
			this.voteQuestion,
			this.multipleChoiceQuestion,
			this.yesNoQuestion,
			this.schoolQuestion,
			this.abcdQuestion,
			this.freetextQuestion,
			this.flashcardQuestion,
			
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
	
	saveHandler: function(){
    	var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
    	var values = {};
		
		/* get text, subject of question from mainPart */
		var mainPartValues = panel.mainPart.getValues();
		values.text = mainPartValues.text;
		values.subject = mainPartValues.subject;
		values.abstention = !panel.abstentionPart.isHidden() && panel.abstentionPart.down('segmentedbutton').getPressedButtons()[0].id === 'withAbstention';
		
		/* check if release question button is clicked */
		var releasePart = panel.releasePart;
		
		var button;
		if (localStorage.getItem('courseId') != null && localStorage.getItem('courseId').length > 0) {
			button = null;
			values.releasedFor = 'courses';
		} else {
			button = releasePart.down('segmentedbutton').getPressedButtons()[0];
		}
		
		if(button){
			switch (button.id) {
				case 'all':
					values.releasedFor = 'all';
					break;
				case 'thm':
					values.releasedFor = 'thm';
					break;
				case 'courses':
					var releasedForValues = releasePart.getValues();
					var tmpArray = [];
					for (name in releasedForValues) {
						var id = releasedForValues[name];
						if(id === null)
							continue;
						tmpArray.push({
							name: name,
							id: id
						});
					}
					if(tmpArray.length > 0){
						values.releasedFor = 'courses';
						values.courses = tmpArray;
					}
					break;	
				default:
					break;
			}
    	}
    	
    	/* fetch the values */
    	switch (panel.questionOptions.getPressedButtons()[0]._text) {
			case Messages.EVALUATION:
				values.questionType = "vote";
				
				Ext.apply(values, panel.voteQuestion.getQuestionValues());
				break;
			case Messages.SCHOOL:
				values.questionType = "school";
				
				Ext.apply(values, panel.schoolQuestion.getQuestionValues());
				break;
				
			/**
			 *  Don't delete this! It's a prototype handle for the new TextCheckfields.
			 *
			 *
			 	case Messages.MC:
				values.questionType = "mc";
				
				var formPanel = panel.down("#mc");
				var tmpValues = formPanel.getFieldsAsArray();
				
				var obj;
				noChecked = true;
				values.possibleAnswers = [];
				
				for(var i = 0, field; field = tmpValues[i], i < tmpValues.length; i++) {
					if(!field.isHidden() && field.config.hasOwnProperty('checked')) {
						obj = {
							text: field.getValue()
						};
						
						if(field.isChecked()) { obj.correct = 1; }
						values.possibleAnswers.push(obj);
						
						// noChecked will be set to false if at least one field is checked
						noChecked = noChecked && !field.isChecked();
					}
				}

				if (noChecked) {
					values.noCorrect = 1;
				}
				break;
			*/
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
			duration	: values.duration,
			number		: 0, // unused
			active		: 1,
			possibleAnswers: values.possibleAnswers,
			releasedFor	: values.releasedFor,
			courses		: values.courses,
			noCorrect	: values.noCorrect,
			abstention	: values.abstention,
			showStatistic: 1,
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
