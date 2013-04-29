/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/speaker/questionStatisticChart.js
 - Beschreibung: Panel zum Anzeigen der Fragen-Statistik (Balkendiagramm).
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
questionChartColors = ['url(#v1)', 'url(#v2)', 'url(#v3)', 'url(#v4)', 'url(#v5)', 'url(#v6)'],

ARSnova.views.QuestionStatisticChart = Ext.extend(Ext.Panel, {
	title	: Messages.STATISTIC,
	iconCls	: 'tabBarIconCanteen',
	layout	: 'fit',
	
	questionObj: null,
	questionChart: null,
	questionStore: null,
	lastPanel: null,
	
	/* toolbar items */
	toolbar				: null,
	canteenVoteButton	: null,
	
	renewChartDataTask: {
		name: 'renew the chart data at question statistics charts',
		run: function(){
			ARSnova.mainTabPanel.layout.activeItem.getQuestionAnswers();
		},
		interval: 10000 //10 seconds
	},
	
	/**
	 * count every 15 seconds all actually logged-in users for this sessions
	 */
	countActiveUsersTask: {
		name: 'count the actually logged in users',
		run: function(){
			ARSnova.mainTabPanel.layout.activeItem.countActiveUsers();
		},
		interval: 15000
	},
	
	constructor: function(question, lastPanel){
		this.questionObj = question;
		this.lastPanel = lastPanel;
		
		this.questionStore = new Ext.data.Store({
			fields: ['text', 'value', 'percent']
		});
		
		for ( var i = 0; i < question.possibleAnswers.length; i++) {
			var pA = question.possibleAnswers[i];
			if(pA.data){
				this.questionStore.add({
					text: pA.data.text,
					value: 0
				});
			} else {
				this.questionStore.add({
					text: pA.text,
					value: 0
				});
			}
		}
		
		this.backButton = new Ext.Button({
			text	: Messages.BACK,
			ui		: 'back',
			scope	: this,
			handler	: function() {
				taskManager.stop(this.renewChartDataTask);
				taskManager.stop(this.countActiveUsersTask);
				ARSnova.mainTabPanel.layout.activeItem.on('deactivate', function(){
					this.destroy();					
				}, this, {single:true});
				ARSnova.mainTabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		var title = this.questionObj.text;
		if(window.innerWidth < 800 && title.length > (window.innerWidth / 10))
			title = title.substring(0, (window.innerWidth) / 10) + "...";
		
		this.toolbar = new Ext.Toolbar({
			items: [this.backButton, {
				xtype: 'spacer'
			}, {
				xtype: 'container',
				cls: "x-toolbar-title",
				html: Messages.QUESTION
			}, {
				xtype: 'spacer'
			}, {
				xtype: 'container',
				cls: "x-toolbar-title",
				html: "0/0",
				style: {paddingRight: '10px'}
			}]
		});
		
		if( this.questionObj.questionType == "yesno" 	|| 
			this.questionObj.questionType == "mc" 		||
			( this.questionObj.questionType == "abcd" && !this.questionObj.noCorrect ) ) {
			
			if(this.questionObj.showAnswer){
				this.gradients = [];
				for ( var i = 0; i < this.questionObj.possibleAnswers.length; i++) {
					var question = this.questionObj.possibleAnswers[i];
					
					if ((question.data && !question.data.correct) || (!question.data && !question.correct)){
						this.gradients.push({
							'id': 'v' + (i+1),
							'angle': 0,
							stops: {
								0:   { color: 'rgb(212, 40, 40)' },
								100: { color: 'rgb(117, 14, 14)' }
							}
						});
					} else {
						this.gradients.push({
							'id': 'v' + (i+1),
							'angle': 0,
							stops: {
								0:   { color: 'rgb(43, 221, 115)' },
								100: { color: 'rgb(14, 117, 56)' }
							}
						});
					}
						
				}
			} else {
				this.gradients = [{
					'id': 'v1',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(22, 64, 128)' },
						100: { color: 'rgb(0, 14, 88)' }
					}
				}, {
					'id': 'v2',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(48, 128, 128)' },
						100: { color: 'rgb(8, 88, 88)' }
					}
				}, {
					'id': 'v3',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(128, 128, 25)' },
						100: { color: 'rgb(88, 88, 0)' }
					}
				}, {
					'id': 'v4',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(128, 28, 128)' },
						100: { color: 'rgb(88, 0, 88)' }
					}
				}, {
					'id': 'v5',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(128, 21, 21)' },
						100: { color: 'rgb(88, 0, 0)' }
					}
				}, {
					'id': 'v6',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(128, 64, 22)' },
						100: { color: 'rgb(88, 24, 0)' }
					}
				}];
			}
		} else {
			this.gradients = [{
				'id': 'v1',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(22, 64, 128)' },
					100: { color: 'rgb(0, 14, 88)' }
				}
			}, {
				'id': 'v2',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(48, 128, 128)' },
					100: { color: 'rgb(8, 88, 88)' }
				}
			}, {
				'id': 'v3',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(128, 128, 25)' },
					100: { color: 'rgb(88, 88, 0)' }
				}
			}, {
				'id': 'v4',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(128, 28, 128)' },
					100: { color: 'rgb(88, 0, 88)' }
				}
			}, {
				'id': 'v5',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(128, 21, 21)' },
					100: { color: 'rgb(88, 0, 0)' }
				}
			}, {
				'id': 'v6',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(128, 64, 22)' },
					100: { color: 'rgb(88, 24, 0)' }
				}
			}];
		}
		
		this.questionChart = new Ext.chart.Chart({
			cls: 'column1',
		    theme: 'Demo',
		    store: this.questionStore,

		    animate: {
		        easing: 'bounceOut',
		        duration: 1000
		    },
		    
		    gradients: this.gradients,
		    
		    axes: [{
		        type: 'Numeric',
		        position: 'left',
		        fields: ['value'],
		        minimum: 0,
		        maximum: this.maxValue,
		        label: {
		            renderer: function(v) {
		                return v.toFixed(0);
		            }
		        }
		    },
		    {
		        type: 'Category',
		        position: 'bottom',
		        fields: ['text'],
		        label: {
		        	rotate: {
		        		degrees: 315
		        	}
		        }
		    }, {
	            type    : 'Category',
	            position: 'top',
	            label   : {
	            	renderer: function(){
	            		return "";
	            	}
            	},
	            title   : title,
	            dashSize: 0
	        } ],
		    series: [{
		        type: 'column',
		        axis: 'left',
		        highlight: true,
		        renderer: function(sprite, storeItem, barAttr, i, store) {
		            barAttr.fill = questionChartColors[i % questionChartColors.length];
		            return barAttr;
		        },
		        label: {
		          field: 'percent',
		          renderer: function(v) {
				return Math.round(v * 100) + "%";
		          }
		        },
		        xField: 'text',
		        yField: 'value'
		    }]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [this.questionChart];
		
		this.doLayout();
		
		ARSnova.views.QuestionStatisticChart.superclass.constructor.call(this);
	},
	
	initComponent: function() {
		this.on('activate', this.onActivate);
		
		ARSnova.views.QuestionStatisticChart.superclass.initComponent.call(this);
	},
	
	getQuestionAnswers: function() {
		ARSnova.questionModel.countAnswers(localStorage.getItem('keyword'), this.questionObj._id, {
			success: function(response) {
				var panel = ARSnova.mainTabPanel.layout.activeItem;
				var chart = panel.questionChart;
				var store = chart.store;
				
				var answers = Ext.decode(response.responseText);
				
				var sum = 0;
				var maxValue = 10;
				
				var tmp_possibleAnswers = [];
				for ( var i = 0; i < tmp_possibleAnswers.length; i++) {
					var el = tmp_possibleAnswers[i];
					var record = store.findRecord('text', el, 0, false, true, true);
					record.data.value = 0;
				}
				
				for ( var i = 0; i < panel.questionObj.possibleAnswers.length; i++) {
					var el = panel.questionObj.possibleAnswers[i];
					if(el.data)
						tmp_possibleAnswers.push(el.data.text);
					else
						tmp_possibleAnswers.push(el.text);
				}
				
				var mcAnswerCount = [];
				for ( var i = 0, el; el = answers[i]; i++) {
					if (panel.questionObj.questionType === "mc") {
						var values = el.answerText.split(",").map(function(answered) {
							return parseInt(answered, 10);
						});
						if (values.length !== panel.questionObj.possibleAnswers.length) {
							return;
						}
						
						for (var j=0; j < el.answerCount; j++) {
							values.forEach(function(selected, index) {
								if (typeof mcAnswerCount[index] === "undefined") {
									mcAnswerCount[index] = 0;
								}
								if (selected === 1) {
									mcAnswerCount[index] += 1;
								}
							});
						}
						store.each(function(record, index) {
							record.set("value", mcAnswerCount[index]);
						});
					} else {
						var record = store.findRecord('text', el.answerText, 0, false, true, true); //exact match
						record.data.value = el.answerCount;
					}
					sum += el.answerCount;
					
					if (el.answerCount > maxValue) {
						maxValue = Math.ceil(el.answerCount / 10) * 10;
					}
					
					var idx = tmp_possibleAnswers.indexOf(el.answerText); // Find the index
					if(idx!=-1) tmp_possibleAnswers.splice(idx, 1); // Remove it if really found!
				}
				
				// Calculate percentages
				var totalResults = store.sum('value');
				store.each(function(record) {
					record.data.percent = totalResults > 0 ? (record.data.value / totalResults) : 0.0;
				});
				
				chart.axes.items[0].maximum = maxValue;
				
				// renew the chart-data
				chart.redraw();
				
				//update quote in toolbar
				var quote = panel.toolbar.items.items[4];
				var users = quote.el.dom.innerHTML.split("/");
				users[0] = sum;
				users = users.join("/");
				quote.update(users);
			},
			failure: function() {
				console.log('server-side error');
			}
		});
	},
	
	onActivate: function() {
		taskManager.start(this.renewChartDataTask);
		taskManager.start(this.countActiveUsersTask);
		
		this.questionChart.axes.items[2].axis.attr.stroke = "#0E0E0E";
		this.questionChart.redraw();
	},
	
	countActiveUsers: function(){
		ARSnova.loggedInModel.countActiveUsersBySession(localStorage.getItem("keyword"), {
			success: function(response){
				var value = parseInt(response.responseText);
				
				//update quote in toolbar
				var quote = ARSnova.mainTabPanel.layout.activeItem.toolbar.items.items[4];
				var users = quote.el.dom.innerHTML.split("/");
				users[1] = value;
				users = users.join("/");
				quote.update(users);
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	}
});
