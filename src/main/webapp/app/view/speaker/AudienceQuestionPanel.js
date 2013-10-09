/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/speaker/audienceQuestionPanel.js
 - Beschreibung: Panel zum Verwalten der Publikumsfragen.
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
Ext.define('ARSnova.view.speaker.AudienceQuestionPanel', {
	extend: 'Ext.Panel',
	
	requires: ['ARSnova.view.speaker.AudienceQuestionListItem', 'ARSnova.view.speaker.MultiQuestionStatusButton'],

	config: {
		title: 'AudienceQuestionPanel',
		fullscreen: true,
		scrollable: true,
		scroll: 'vertical'
	},
	
	monitorOrientation: true,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	controls: null,
	questions: null,
	newQuestionButton: null,
	
	questionStore: null,
	questionEntries: [],
	
	updateAnswerCount: {
		name: 'refresh the number of answers inside the badges',
		run: function() {
			var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.audienceQuestionPanel;
			panel.handleAnswerCount();
		},
		interval: 10000 //10 seconds
	},
	
	initialize: function(){
		this.callParent(arguments);
		
		this.questionStore = Ext.create('Ext.data.JsonStore', {
			model: 'ARSnova.model.Question',
			sorters: 'text',
			grouper: {
		         groupFn: function(record) {
		        	 return Ext.util.Format.htmlEncode(record.get('subject'));
		         }
		     }
		});
		
		var styling = {
			marginLeft:  '12px',
			marginRight: '12px',
			backgroundColor: 'transparent'
		};

		this.questionList = Ext.create('Ext.List', {
			activeCls: 'search-item-active',
			cls: 'roundedCorners',

			scrollable: { disabled: true },
			hidden: true,
			
			style: styling,
			
			useSimpleItems: false,
			defaultType: 'audiencequestionlistitem',

			itemCls: 'forwardListButton',
			itemTpl: '<tpl if="active"><div class="buttontext noOverflow">{text:htmlEncode}</div></tpl>' +
					 '<tpl if="!active"><div class="isInactive buttontext noOverflow">{text:htmlEncode}</div></tpl>' +
					 '<div class="x-list-item x-hasbadge">' +
					 '<tpl if="numAnswers &gt; 0"><span class="redbadgeicon badgefixed">{numAnswers}</span></tpl></div>',
			grouped: true,
			store: this.questionStore,
			
			listeners: {
				itemtap: function(list, index, element) {
					ARSnova.app.getController('Questions').details({
						question	: list.getStore().getAt(index).data
					});
				},
				/**
				 * The following event is used to get the computed height of all list items and 
				 * finally to set this value to the list DataView. In order to ensure correct rendering
				 * it is also necessary to get the properties "padding-top" and "padding-bottom" and 
				 * add them to the height of the list DataView.
				 */
		        resize: function (list, eOpts) {
		        	var listItemsDom = list.select(".x-list .x-inner .x-inner").elements[0];
		        	
		        	this.questionList.setHeight(
		        		parseInt(window.getComputedStyle(listItemsDom, "").getPropertyValue("height"))	+ 
		        		parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-top"))	+
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
			style: { marginTop: '30px' },
			cls: 'standardLabel',
			hidden: true
		});
		
		this.newQuestionButton = {
			xtype	: 'button',
			text	: Messages.NEW_QUESTION,
			cls		: 'forwardListButton',
			handler	: this.newQuestionHandler
		};
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.BACK,
			ui		: 'back',
			handler	: function() {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.inClassPanel.updateAudienceQuestionBadge();
				sTP.animateActiveItem(sTP.inClassPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.showcaseButton = Ext.create('Ext.Button', {
			cls		: "thm",
			text	: Messages.SHOWCASE,
			hidden	: true,
			scope	: this,
			handler	: this.showcaseHandler
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
		
		this.deleteAnswersButton = Ext.create('Ext.Panel', {
			cls: 'threeButtons left',
			hidden: true,
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'recycleIcon',
				scope	: this,
				handler	: function() {
					Ext.Msg.confirm(Messages.DELETE_ALL_ANSWERS_REQUEST, Messages.ALL_QUESTIONS_REMAIN, function(answer) {
						if (answer == 'yes') {
							var promises = [];
							this.questionList.getStore().each(function(item) {
								var promise = new RSVP.Promise();
								ARSnova.app.questionModel.deleteAnswers(item.getId(), {
									success: function() {
										promise.resolve();
									},
									failure: function(response) {
										promise.reject();
									}
								});
								promises.push(promise);
							});
							RSVP.all(promises).then(Ext.bind(this.handleAnswerCount, this));
						}
					}, this);
				}
			}, {
				html: Messages.DELETE_ANSWERS,
				cls	: 'centerTextSmall'
			}]
		});
		
		this.deleteQuestionsButton = Ext.create('Ext.Panel', {
			cls: 'threeButtons left',
			hidden: true,
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'deleteIcon',
				scope	: this,
				handler	: function() {
					var msg = Messages.ARE_YOU_SURE;
						msg += "<br>" + Messages.DELETE_ALL_ANSWERS_INFO;
					Ext.Msg.confirm(Messages.DELETE_ALL_QUESTIONS, msg, function(answer) {
						if (answer == 'yes') {
							ARSnova.app.questionModel.destroyAll(localStorage.getItem("keyword"), {
								success: Ext.bind(this.onActivate, this),
								failure: function() {
									console.log("could not delete the questions.");
								}
							});
						}
					}, this);
				}
			}, {
				html: Messages.DELETE_ALL_QUESTIONS,
				cls	: 'centerTextSmall'
			}]
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
			Ext.create('Ext.Panel', {
				scrollable: null,
				style	: {
					marginTop: '30px'
				},
				items: [this.questionStatusButton, this.deleteAnswersButton, this.deleteQuestionsButton]
			})
		]);
		
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
		this.on('orientationchange', this.onOrientationChange);
	},
	
	onActivate: function() {
		taskManager.start(this.updateAnswerCount);
		this.controls.removeAll();
		this.questionStore.removeAll();
		
		this.controls.add(this.newQuestionButton);
		
		this.questionEntries = [];

		ARSnova.app.questionModel.getSkillQuestionsSortBySubjectAndText(localStorage.getItem('keyword'), {
			success: Ext.bind(function(response) {
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
			empty: Ext.bind(function() {
				this.showcaseButton.hide();
				this.questionTitle.hide();
				this.questionList.show();
				this.caption.hide();
				this.questionStatusButton.hide();
				this.deleteQuestionsButton.hide();
			}, this),
			failure: function(response) {
				console.log('server-side error questionModel.getSkillQuestions');
			}
		});
	},
	
	onDeactivate: function() {
		taskManager.stop(this.updateAnswerCount);
	},
	
	onOrientationChange: function(panel, orientation, width, height) {
		this.displayShowcaseButton();
	},
	
	/**
	 * Displays the showcase button if enough screen width is available
	 */
	displayShowcaseButton: function() {
		/* iPad does not swap screen width and height values in landscape orientation */
		if (screen.availWidth >= 980 || screen.availHeight >= 980) {
			this.showcaseButton.hide();
		} else if (window.innerWidth >= 480) {
			this.showcaseButton.show();
		} else {
			this.showcaseButton.hide();
		}
	},
	
	newQuestionHandler: function(){
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.animateActiveItem(sTP.newQuestionPanel, 'slide');
	},
	
	showcaseHandler: function() {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.animateActiveItem(sTP.showcaseQuestionPanel, {
			type		: 'slide'
		});
	},
	
	getQuestionAnswers: function() {
		var getAnswerCount = function(questionRecord, promise) {
			ARSnova.app.questionModel.countAnswersByQuestion(localStorage.getItem("keyword"), questionRecord.get('_id'), {
				success: function(response) {
					var numAnswers = Ext.decode(response.responseText);
					questionRecord.set('numAnswers', numAnswers);
					promise.resolve({
						hasAnswers: numAnswers > 0
					});
				},
				failure: function() {
					console.log("Could not update answer count");
					promise.reject();
				}
			});
		};
		
		var promises = [];
		this.questionStore.each(function(questionRecord) {
			var promise = new RSVP.Promise();
			getAnswerCount(questionRecord, promise);
			promises.push(promise);
		}, this);
		
		return promises;
	},
	
	handleAnswerCount: function() {
		RSVP.all(this.getQuestionAnswers())
		.then(Ext.bind(this.caption.explainBadges, this.caption))
		.then(Ext.bind(function(badgeInfos) {
			var hasAnswers = badgeInfos.filter(function(item) {
				return item.hasAnswers;
			}, this);
			this.deleteAnswersButton.setHidden(hasAnswers.length === 0);
		}, this));
	}
});
