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
ARSnova.views.speaker.NewQuestionPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
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
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: Messages.QUESTIONS,
			ui		: 'back',
			handler	: function(){
				var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.setActiveItem(sTP.audienceQuestionPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				});
			},
		});
		
		this.saveButton = new Ext.Button({
			text	: Messages.SAVE,
			ui		: 'confirm',
			handler	: this.saveHandler,
		});
				
		this.textarea = new Ext.plugins.ResizableTextArea({
			name	  	: 'text',
	    	label	  	: Messages.QUESTION,
	    	placeHolder	: Messages.QUESTION_PlACEHOLDER,
	    	maxHeight	: 140,
		});
		
		this.mainPart = new Ext.form.FormPanel({
			cls: 'newQuestion',
			items: [{
				xtype: 'fieldset',
				items: [{
			        xtype	: 'textfield',
			        name	: 'subject',
			    	label	: Messages.CATEGORY,
			    	placeHolder: Messages.CATEGORY_PLACEHOLDER,
			    }],
			},{
				xtype: 'fieldset',
				items: [this.textarea]
			}]
		});
		
		if(window.innerWidth < 600) {
			this.releaseItems = [
                 { text	: Messages.ALL_SHORT, id: 'all', pressed: true}, 
                 { text	: Messages.ONLY_THM_SHORT, id: 'thm',},
//                 { text	: "Kurse", id: 'courses', }
             ]
		} else {
			this.releaseItems = [
                 { text	: Messages.ALL_LONG, id: 'all', pressed: true}, 
                 { text	: Messages.ONLY_THM_LONG, id: 'thm' },
//                 { text	: "Kurse", id: 'courses', }
             ]
		}
		
		this.releasePart = new Ext.form.FormPanel({
			items: [{
				xtype: 'fieldset',
				title: Messages.RELEASE_FOR,
	            items: [{
	            	xtype: 'segmentedbutton',
	        		cls: 'releaseOptions',
	        		allowDepress: false,
	        		allowMultiple: false,
	        		items: this.releaseItems,
	    		    listeners: {
	    		    	toggle: function(container, button, pressed){
	    		    		var nQP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
	    		    		var coursesFieldset = nQP.down('fieldset[title='+Messages.MY_COURSES+']');
	    		    		if(button.id == "course"){
	    		    			if(pressed){
	    		    				if(nQP.userCourses.length == 0){
	        		    				ARSnova.showLoadMask(Messages.LOAD_MASK_SEARCH_COURSES);
	        		    				Ext.Ajax.request({
	        		    					url: ARSnova.WEBSERVICE_URL + 'estudy/getTeacherCourses.php',
	        		    					params: {
	        		    						login: localStorage.getItem('login'),
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
	        		    								value:	course.id,
	        		    							});
	        		    						}
	        		    						nQP.userCourses = obj;
	        		    						nQP.doLayout();
	        		    						coursesFieldset.show();
	        		    						ARSnova.hideLoadMask();
	        		    					},
	        		    					failure: function(response, opts){
	        		    						console.log('getcourses server-side failure with status code ' + response.status);
	        		    						Ext.Msg.alert(Messages.NOTICE, Messages.COULD_NOT_SEARCH);
	        		    						Ext.Msg.doComponentLayout();
	        		    					},
	        		    				});
	    		    				}
	    		    				coursesFieldset.show();
	    		    				nQP.doLayout();
	    		    			} else {
	    		    				coursesFieldset.hide();
	    		    				nQP.doLayout();
	    		    			}
	    		    		}
	    		    	}
	    		    }
	            }, {
	            	xtype: 'fieldset',
	            	title: Messages.MY_COURSES,
	            	hidden: true,
	        	}]
			}],
    	});
		
		this.yesNoQuestion = new Ext.form.FormPanel({
			id: 'yesno',
			hidden: true,
			submitOnAction: false,
			items: [{
				xtype: 'fieldset',
				title: Messages.CORRECT_ANSWER,
	            items: [{
            		xtype: 'segmentedbutton',
            		cls: 'yesnoOptions',
            		items: [
        		        { text	: Messages.YES, pressed: true }, 
        		        { text	: Messages.NO }
            		],
            	}],
			}],
		});
		
		this.multipleChoiceQuestion = new Ext.form.FormPanel({
			id: 'mc',
			hidden: true,
			submitOnAction: false,
			items: [{
            	xtype: 'fieldset',
            	title: Messages.ANSWERS,
            	items: [
        	        {
	            		xtype	: "spinnerfield",
	            		name	: 'countAnswers',
	                	label	: Messages.COUNT,
	            		minValue: 3,
	            		maxValue: 6,
	            		incrementValue: 1,
	            		value: 4,
	            		listeners: {
	                		spin: function(selectField, value){
	                			switch (value){
	    							case 3:
	    								Ext.getCmp("wrongAnswer3").hide();
	    								Ext.getCmp("wrongAnswer4").hide();
	    								Ext.getCmp("wrongAnswer5").hide();
	    								break;
	    							case 4:
	    								Ext.getCmp("wrongAnswer3").show();
	    								Ext.getCmp("wrongAnswer4").hide();
	    								Ext.getCmp("wrongAnswer5").hide();
	    								break;
	    							case 5:
	    								Ext.getCmp("wrongAnswer3").show();
	    								Ext.getCmp("wrongAnswer4").show();
	    								Ext.getCmp("wrongAnswer5").hide();
	    								break;
	    							case 6:
	    								Ext.getCmp("wrongAnswer3").show();
	    								Ext.getCmp("wrongAnswer4").show();
	    								Ext.getCmp("wrongAnswer5").show();
	    								break;
	    							default:
	    								break;
	    						}
	                			ARSnova.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel.doLayout();
	                		}
	                	}
	                }, {
						xtype	: 'textfield',
					    id		: 'correctAnswer',
						label	: Messages.CORRECT,
						placeHolder: Messages.CORRECT_PLACEHOLDER,
					}, {
						xtype	: 'textfield',
					    id		: 'wrongAnswer1',
						label	: Messages.WRONG,
						placeHolder: Messages.WRONG_PLACEHOLDER,
					}, {
						xtype	: 'textfield',
					    id		: 'wrongAnswer2',
					    label	: Messages.WRONG,
					    placeHolder: Messages.WRONG_PLACEHOLDER,
					}, {
						xtype	: 'textfield',
					    id		: 'wrongAnswer3',
					    label	: Messages.WRONG,
					    placeHolder: Messages.WRONG_PLACEHOLDER,
					}, {
						xtype	: 'textfield',
					    id		: 'wrongAnswer4',
					    label	: Messages.WRONG,
					    placeHolder: Messages.WRONG_PLACEHOLDER,
					    hidden	: true,
					}, {
						xtype	: 'textfield',
					    id		: 'wrongAnswer5',
					    label	: Messages.WRONG,
					    placeHolder: Messages.WRONG_PLACEHOLDER,
					    hidden	: true,
					}
    	        ]
			}],
		});

		this.voteQuestion = new Ext.form.FormPanel({
			id: 'vote',
			hidden: false,
			submitOnAction: false,
			items: [{
            	xtype: 'fieldset',
            	title: Messages.ANSWERS,
            	items: [{
						xtype	: 'textfield',
					    id		: 'voteAnswer1',
					    label	: '1.',
					    value	: Messages.EVALUATION_PLUSPLUS,
					}, {
						xtype	: 'textfield',
					    id		: 'voteAnswer2',
					    label	: '2.',
					    value	: Messages.EVALUATION_PLUS,
					}, {
						xtype	: 'textfield',
					    id		: 'voteAnswer3',
					    label	: '3.',
					    value	: Messages.EVALUATION_NEUTRAL,
					}, {
						xtype	: 'textfield',
					    id		: 'voteAnswer4',
					    label	: '4.',
					    value	: Messages.EVALUATION_MINUS,
					}, {
						xtype	: 'textfield',
					    id		: 'voteAnswer5',
					    label	: '5.',
					    value	: Messages.EVALUATION_MINUSMINUS,
					}
    	        ]
			}],
		});
		
		this.schoolQuestion = new Ext.form.FormPanel({
			id: 'school',
			hidden: true,
			submitOnAction: false,
			items: [{
            	xtype: 'fieldset',
            	title: Messages.ANSWERS,
            	items: [{
						xtype	: 'textfield',
					    id		: 'schoolAnswer1',
					    label	: '1.',
					    value	: Messages.SCHOOL_A,
					}, {
						xtype	: 'textfield',
					    id		: 'schoolAnswer2',
					    label	: '2.',
					    value	: Messages.SCHOOL_B,
					}, {
						xtype	: 'textfield',
					    id		: 'schoolAnswer3',
					    label	: '3.',
					    value	: Messages.SCHOOL_C,
					}, {
						xtype	: 'textfield',
					    id		: 'schoolAnswer4',
					    label	: '4.',
					    value	: Messages.SCHOOL_D,
					}, {
						xtype	: 'textfield',
					    id		: 'schoolAnswer5',
					    label	: '5.',
					    value	: Messages.SCHOOL_E,
					}, {
						xtype	: 'textfield',
					    id		: 'schoolAnswer6',
					    label	: '6.',
					    value	: Messages.SCHOOL_NONE,
					}
    	        ]
			}],
		});
		
		this.abcdQuestion = new Ext.form.FormPanel({
			id: 'abcd',
			hidden: true,
			submitOnAction: false,
			items: [
				{
					id: 'abcd_tags',
					xtype: 'fieldset',
					title: Messages.ANSWERS,
					items: [
								{
									xtype: 'textfield', 
									id: 'abcd_textA',
									label: 'A',
									placeHolder: Messages.BUZZWORD_A,
									maxLength: 20,
								},
								{
									xtype: 'textfield', 
									id: 'abcd_textB',
									label: 'B',
									placeHolder: Messages.BUZZWORD_B,
									maxLength: 20,
								},
								{
									xtype: 'textfield', 
									id: 'abcd_textC',
									label: 'C',
									placeHolder: Messages.BUZZWORD_C,
									maxLength: 20,
								},
								{
									xtype: 'textfield', 
									id: 'abcd_textD',
									label: 'D',
									placeHolder: Messages.BUZZWORD_D,
									maxLength: 20,
								},
							]
				},
				{
            	xtype: 'fieldset',
            	title: Messages.CORRECT_ANSWER,
            	items: [{
            		xtype: 'segmentedbutton',
            		allowDepress: true,
            		cls: 'abcdOptions',
            		items: [
        		        { text	: "A" }, 
        		        { text	: "B" },
        		        { text	: "C" },
        		        { text	: "D" },
            		],
            	}]
			}],
		});

		this.freetextQuestion = new Ext.form.FormPanel({
			id: 'freetext',
			hidden: true,
			submitOnAction: false,
			items: [],
		});
		
		this.questionOptions = new Ext.SegmentedButton({
	        allowDepress: false,
	        items: [
                { text: Messages.EVALUATION, pressed: true }, 
                { text: Messages.SCHOOL }, 
                { text: Messages.MC		}, 
                { text: Messages.YESNO 	}, 
                { text: Messages.ABCD	},
				{ text: Messages.FREETEXT },
	        ],
	        listeners: {
	        	toggle: function(container, button, pressed){
	        		var panel = this.up('panel');
	        		switch (button.text) {
						case Messages.EVALUATION:
							if(pressed) panel.voteQuestion.show();
							else panel.voteQuestion.hide();
							break;
						case Messages.SCHOOL:
							if(pressed) panel.schoolQuestion.show();
							else panel.schoolQuestion.hide();
							break;
						case Messages.MC:
							if(pressed) panel.multipleChoiceQuestion.show();
							else panel.multipleChoiceQuestion.hide();
							break;
						case Messages.YESNO:
							if(pressed) panel.yesNoQuestion.show();
							else panel.yesNoQuestion.hide();
							break;
						case Messages.ABCD:
							if(pressed) panel.abcdQuestion.show();
							else panel.abcdQuestion.hide();
							break;
						case Messages.FREETEXT:
							if(pressed) panel.freetextQuestion.show();
							else panel.freetextQuestion.hide();
							break;
						default:
							break;
					}
	        		panel.doLayout();
	        	}
	        }
	    });
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.NEW_QUESTION_TITLE,
			items: [
		        this.backButton,
		        {xtype:'spacer'},
		        this.saveButton,
			]
		});
		
		this.dockedItems = [
            this.toolbar,
            new Ext.Toolbar({
	            ui: 'light',
	            dock: 'top',
	            items: [
                    {xtype: 'spacer'},
                    this.questionOptions,
                    {xtype: 'spacer'}
                ],
	        }),
        ];
		
		this.saveButton = new Ext.form.FormPanel({
			items: [{
				xtype: 'fieldset',
				items: [{
			        xtype	: 'button',
			        ui: 'confirm',
					text: Messages.SAVE,
					handler: this.saveHandler,
			    }],
			}],
		});
		
		this.items = [
            this.mainPart,
            
            /* only one of the question types will be shown at the same time */
		    this.voteQuestion,
            this.multipleChoiceQuestion,
            this.yesNoQuestion,
            this.schoolQuestion,
            this.abcdQuestion,
            
            this.releasePart,
            this.saveButton,
        ];
		
		ARSnova.views.speaker.NewQuestionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', this.onActivate);
		
		ARSnova.views.speaker.NewQuestionPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function(){
		
	},
	
    saveHandler: function(){
    	var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
    	var values = {};
    	
    	/* get text, subject of question from mainPart */
    	var mainPartValues = panel.mainPart.getValues();
    	values.text = mainPartValues.text;
    	values.subject = mainPartValues.subject;
    	
    	/* check if release question button is clicked */
    	var releasePart = panel.releasePart;
    	var button = releasePart.down('segmentedbutton').pressedButton;
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
							id: id,
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
    	switch (panel.questionOptions.getPressed().text) {
			case Messages.EVALUATION:
				values.questionType = "vote";
				var tmpValues = panel.down("#vote").getValues();

				values.possibleAnswers = [
		          { text: tmpValues.voteAnswer1 },
		          { text: tmpValues.voteAnswer2 },
		          { text: tmpValues.voteAnswer3 },
		          { text: tmpValues.voteAnswer4 },
		          { text: tmpValues.voteAnswer5 },
		    	];
				break;
			case Messages.SCHOOL:
				values.questionType = "school";
				var tmpValues = panel.down("#school").getValues();
				
		    	values.possibleAnswers = [
		          { text: tmpValues.schoolAnswer1 },
		          { text: tmpValues.schoolAnswer2 },
		          { text: tmpValues.schoolAnswer3 },
		          { text: tmpValues.schoolAnswer4 },
		          { text: tmpValues.schoolAnswer5 },
		          { text: tmpValues.schoolAnswer6 },
		    	];
				break;
			case Messages.MC:
				values.questionType = "mc";
				
				var tmpValues = panel.down("#mc").getValues();
				
		    	wrongAnswers = [];
		    	wrongAnswers.push(tmpValues.wrongAnswer1);
		    	wrongAnswers.push(tmpValues.wrongAnswer2);
		    	wrongAnswers.push(tmpValues.wrongAnswer3);
		    	wrongAnswers.push(tmpValues.wrongAnswer4);
		    	wrongAnswers.push(tmpValues.wrongAnswer5);
		    	
		    	values.possibleAnswers = [{
		    		correct: 1,
		    		text: tmpValues.correctAnswer,
		    	}];
		    	
		    	for ( var i = 1; i < tmpValues.countAnswers; i++){
		    		values.possibleAnswers.push({
						text: wrongAnswers[i - 1],
					});	
				}
				break;
			case Messages.YESNO:
				values.questionType = "yesno";
				
				var form = panel.down("#yesno");
		    	var yesNoOption = form.down('segmentedbutton');
		    	
		    	var correct = "";
		    	if (yesNoOption.pressedButton)
		    		correct = yesNoOption.pressedButton.text;
		    	else {
		    		return;
		    	}
		    	
		    	switch (correct) {
					case "Ja":
						values.possibleAnswers = [
			              { text: "Ja", correct: 1 },
			              { text: "Nein" },
			            ];
						break;
					case "Nein":
						values.possibleAnswers = [
			              { text: "Ja" },
			              { text: "Nein", correct: 1 },
			            ];	
						break;
				}
				break;
			case Messages.ABCD:
				values.questionType = "abcd";
				
				var form = panel.down("#abcd");
		    	var segmentedButton = form.down('segmentedbutton');
				
		    	var correct = "";
		    	if (segmentedButton.pressedButton) {
		    		correct = segmentedButton.pressedButton.text;
		    	} else {
		    		values.noCorrect = 1;
		    	}
		    	
		    	/**
		    	 * This helper returns an array like this one:
		    	 * [{id: 'A', text: 'A: short answer'},{id: 'B', text: 'B: ..'},...]
		    	 */
		    	var getAnswerDescriptions = function() {
		    		var basetagid = "#abcd_text";
		    		var answers = ["A", "B", "C", "D"];
		    		var result = [];
		    		answers.forEach(function(answer) {
		    			var tag = form.down(basetagid + answer);
		    			var text = answer;
		    			if (tag && tag.getValue().trim().length !== 0) {
		    				text += ": " + tag.getValue().trim();
		    			}
		    			result.push({ id: answer, text: text });
		    		});
		    		return result;
		    	};
		    	
		    	var markCorrectAnswer = function(answers, correctAnswer) {
		    		var result = [];
		    		answers.forEach(function(answer) {
		    			if (correctAnswer === answer.id) {
		    				answer.correct = 1;
		    			}
		    			result.push(answer);
		    		});
		    		return result;
		    	};
		    	
		    	values.possibleAnswers = markCorrectAnswer(getAnswerDescriptions(), correct);
				break;
			
			case Messages.FREETEXT:
				values.questionType = "freetext";
				values.possibleAnswers = [];
				break;
			
			default:
				break;
		}
    	
    	ARSnova.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel.dispatch(values);
    },
    
    dispatch: function(values){
    	Ext.dispatch({
			controller	: 'questions',
			action		: 'add',
			session		: localStorage.getItem('keyword'),
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
			successFunc	: function(response, opts){
				Ext.dispatch({
					controller	: 'questions',
					action		: 'details',
					question	: opts.jsonData,
				});
			},
			failureFunc	: function(response, opts){
    			console.log(response);
    			console.log(opts);
    	  		console.log('server-side failure with status code ' + response.status);
    	  		Ext.Msg.alert(Messages.NOTICE, Messages.QUESTION_CREATION_ERROR);
    	  		Ext.Msg.doComponentLayout();
    		},
		});
    }
});
