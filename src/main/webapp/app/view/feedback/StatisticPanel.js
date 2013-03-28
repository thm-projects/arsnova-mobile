/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/feedback/statisticPanel.js
 - Beschreibung: Panel zum Anzeigen der Feedback-Statistik.
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
feedbackChartColors = ['url(#v-3)', 'url(#v-2)', 'url(#v-1)', 'url(#v-4)'],

Ext.define('ARSnove.view.feedback.StatisticPanel', {
	extend: 'Ext.Panel',
	
	config: {
		layout: 'fit',
		feedbackChart: null,
		
		/* toolbar items */
		toolbar: null
	},
	
	renewChartDataTask: {
		name: 'renew chart data at feedback panel',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.renewChartData();
		},
		interval: 10000 //10 seconds
	},
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: Messages.HOME,
			ui		: 'back',
			hidden	: true,
			handler : function(){
				ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.userTabPanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    		scope		: this,
		    		after: function() {
		    			this.hide();
		    		}
		    	});
			}
		});
		
		this.feedbackVoteButton = new Ext.Button({
			text	: Messages.FEEDBACK_VOTE,
			ui		: 'confirm',
			scope	: this,
			hidden	: true,
			handler	: function() {
				var fP = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
				fP.setActiveItem(fP.votePanel, {
						type: 'slide',
						direction: 'down',
						duration: 700
					}
				);
			}
		});
		
		this.feedbackCounter = new Ext.Container({
			cls: "x-toolbar-title alignRight",
			html: '0/0',
			getText: function(){
				if(this.rendered)
					return this.el.dom.innerHTML;
				else
					return this.html;
			}
		});
		
		this.toolbar = new Ext.Toolbar({
			title: '0/0',
			items: [
		        this.backButton,
		        {xtype: 'spacer'},
		        this.feedbackVoteButton,
		        {xtype: 'spacer'},
		        this.feedbackCounter
			]
		});
		
		this.feedbackChart = new Ext.chart.Chart({
			cls: 'column1',
		    theme: 'Demo',
		    store: new Ext.data.JsonStore({
		    	fields: ['name', 'value', 'percent'],
		    	data: [
				  {name: 'Kann folgen', 	 displayName: Messages.FEEDBACK_OKAY, value: 0, percent: 0.0},
		          {name: 'Bitte schneller',  displayName: Messages.FEEDBACK_GOOD,  value: 0, percent: 0.0},
		          {name: 'Zu schnell', 		 displayName: Messages.FEEDBACK_BAD, value: 0, percent: 0.0},
		          {name: 'Nicht mehr dabei', displayName: Messages.FEEDBACK_NONE, value: 0, percent: 0.0}
		        ]
		    }),

		    animate: {
		        easing: 'bounceOut',
		        duration: 750
		    },
		    
		    interactions: [{
		        type: 'reset'
		    }, {
		        type: 'panzoom'
		    }],
		    
		    gradients: [{
		    	'id': 'v-1',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(237, 96, 28)' },
		            100: { color: 'rgb(197, 56, 0)' }
		        }
		    },
		    {
		        'id': 'v-2',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(254, 201, 41)'},
		            100: { color: 'rgb(214, 161, 0)' }
		        }
		    },
		    {
		        'id': 'v-3',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(122, 184, 68)' },
		            100: { color: 'rgb(82, 144, 28)' }
		        }
		    },
		    {
		        'id': 'v-4',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(235, 235, 235)' },
		            100: { color: 'rgb(195,195,195)' }
		        }
		    }],
		    
		    axes: [{
		        type: 'Numeric',
		        position: 'left',
		        fields: ['value'],
		        minimum: 0,
		        label: {
		            renderer: function(v) {
		                return v.toFixed(0);
		            }
		        }
		    },
		    {
		        type: 'Category',
		        position: 'bottom',
		        fields: ['displayName'],
		        label: {
		        	rotate: {
		        		degrees: 315
		        	}
		        }
		    }],
		    series: [{
		        type: 'column',
		        axis: 'left',
		        highlight: true,
		        renderer: function(sprite, storeItem, barAttr, i, store) {
		            barAttr.fill = feedbackChartColors[i % feedbackChartColors.length];
		            return barAttr;
		        },
		        label: {
		          field: 'percent',
		          renderer: function(v) {
				return Math.round(v * 100) + "%";
		          }
		        },
		        xField: 'name',
		        yField: 'value'
		    }]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [this.feedbackChart];
		
		this.doLayout();
		
		ARSnova.view.feedback.StatisticPanel.superclass.constructor.call(this);
	},
	
	/**
	 * this function does three things
	 * 1. Adapt the chart data
	 * 2. Adapt the feedback-badge in tab bar
	 * 3. Adapt the feedback icon in tab bar depending on average of feedback
	 */
	renewChartData: function() {
		ARSnova.feedbackModel.getSessionFeedback(localStorage.getItem("keyword"), {
			success: function(response){
				var panel = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel;
				var chart = panel.feedbackChart;
				var store = chart.store;
				
				var values = Ext.decode(response.responseText).values;
				/* Swap values for "can follow" and "faster, please" feedback
				 * TODO: improve implementation, this is a quick hack for MoodleMoot 2013 */
				tmpValue = values[0];
				values[0] = values[1];
				values[1] = tmpValue;
				if (!Ext.isArray(values) || values.length != store.getCount()) return;
				
				var initialMaximum = 10;
				var maximum = Math.max.apply(null, values.concat(initialMaximum));
				
				// Set chart data
				store.each(function(record, index) {
					record.data.value = values[index];
				});
				// Calculate percentages
				var sum = store.sum('value');
				store.each(function(record) {
					record.data.percent = sum > 0 ? (record.data.value / sum) : 0.0;
				});
				chart.axes.items[0].maximum = maximum;
				chart.redraw();
				
				//update feedback-badge in tab bar 
				ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.tab.setBadge(sum);
				
				//update feedback counter
				var counterEl = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.feedbackCounter;
				var title = counterEl.getText().split("/");
				title[0] = sum;
				title = title.join("/");
				counterEl.update(title);
				
				//change the feedback tab bar icon
				var tab = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.tab;
				ARSnova.feedbackModel.getAverageSessionFeedback(localStorage.getItem("keyword"), {
					success: function(response) {
						var avg = parseInt(response.responseText);
						switch (avg){
							case 0:
								tab.setIconClass("feedbackMedium");
								break;
							case 1:
								tab.setIconClass("feedbackGood");
								break;
							case 2:
								tab.setIconClass("feedbackBad");
								break;
							case 3:
								tab.setIconClass("feedbackNone");
								break;	
							default:
								tab.setIconClass("feedbackARSnova");
								break;
						}
					},
					failure: function() {
						tab.setIconClass("feedbackARSnova");
					}
				});
			},
			failure: function() {
				console.log('server-side error feedbackModel.getSessionFeedback');
			}
		});
	},
	
	checkVoteButton: function(){
		if (!ARSnova.isSessionOwner) this.feedbackVoteButton.show();
		else this.feedbackVoteButton.hide();
	},
	
	checkTitle: function(){
		var title = "";
		if (ARSnova.isSessionOwner) title = localStorage.getItem('shortName');
		this.toolbar.setTitle(title);
	}
});
