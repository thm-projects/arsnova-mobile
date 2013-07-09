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
			panel.getQuestionAnswers.call(panel);
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
		        	 return record.get('subject');
		         }
		     }
		});

		this.questionList = Ext.create('Ext.List', {
			activeCls: 'search-item-active',
			cls: 'roundedCorners',

			scrollable: { disabled: true },
			hidden: true,
			
			style: {
				marginLeft:  '12px',
				marginRight: '12px',
				backgroundColor: 'transparent'
			},

			itemCls: 'forwardListButton',
			itemTpl: '<tpl if="active"><div class="buttontext noOverflow">{text}</div></tpl>' +
					 '<tpl if="!active"><div class="isInactive buttontext noOverflow">{text}</div></tpl>' +
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
				updatedata: function(list, newData ) {
					var allJax = MathJax.Hub.getAllJax(list.id);
					if (allJax.length === 0) {
						MathJax.Hub.Queue(["Typeset", MathJax.Hub, list.id]);
					} else {
						for (var i=0, jax; jax = allJax[i]; i++) {
							MathJax.Hub.Queue(["needsUpdate", jax], function() {
								console.log(arguments);
							});
						}
					}
				},
		        initialize: function (list, eOpts){
		            var me = this;
		            if (typeof me.getItemMap == 'function'){
		                me.getScrollable().getScroller().on('refresh',function(scroller,eOpts){
		                	var itemsHeight = me.getItemHeight() * me.itemsCount;
		                	if(me.getGrouped()) {
		                		var groupHeight = typeof me.headerHeight !== 'undefined' ? me.headerHeight : 26;
		                		itemsHeight += me.groups.length * groupHeight;
		                	}
		                	me.setHeight(itemsHeight + 20);
		                });
		            }
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
		
		this.presenterButton = Ext.create('Ext.Button', {
			cls		: "thm",
			text	: Messages.PRESENTER,
			hidden	: true,
			scope	: this,
			handler	: this.presenterHandler
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
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTIONS,
			ui: 'light',
			docked: 'top',
			items: [
		        this.backButton,
		        {xtype: 'spacer'},
		        this.presenterButton,
		        this.showcaseButton
			]
		});
		
		this.add([
		    this.toolbar, 
		    this.controls,
			this.questionTitle,
			this.questionList
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
				this.getQuestionAnswers();
				
				this.controls.insert(0, this.showcaseFormButton);
				this.displayShowcaseButton();
				this.questionTitle.show();
				this.questionList.show();
			}, this),
			empty: Ext.bind(function() {
				this.showcaseButton.hide();
				this.questionTitle.hide();
				this.questionList.show();
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
			this.presenterButton.show();
		} else if (window.innerWidth >= 480) {
			this.showcaseButton.show();
			this.presenterButton.hide();
		} else {
			this.showcaseButton.hide();
			this.presenterButton.hide();
		}
	},
	
	newQuestionHandler: function(){
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.animateActiveItem(sTP.newQuestionPanel, 'slide');
	},
	
	presenterHandler: function() {
		window.open(ARSnova.app.PRESENTER_URL + "#!/" + localStorage.getItem('keyword'), "_self");
	},
	
	showcaseHandler: function() {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.animateActiveItem(sTP.showcaseQuestionPanel, {
			type		: 'slide',
			direction	: 'up'
		});
	},
	
	getQuestionAnswers: function() {
		var getAnswerCount = function(questionRecord) {
			ARSnova.app.questionModel.countAnswersByQuestion(localStorage.getItem("keyword"), questionRecord.get('_id'), {
				success: function(response) {
					questionRecord.set('numAnswers', Ext.decode(response.responseText));
				},
				failure: function() {
					console.log("Could not update answer count");
				}
			});
		};
		
		this.questionStore.each(function(questionRecord) {
			getAnswerCount(questionRecord);
		}, this);
	}
});
