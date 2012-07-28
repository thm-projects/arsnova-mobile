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
Ext.namespace('ARSnova.views.feedback');

feedbackChartColors = ['url(#v-3)', 'url(#v-2)', 'url(#v-1)', 'url(#v-4)'],

ARSnova.views.feedback.StatisticPanel = Ext.extend(Ext.Panel, {
	layout: 'fit',
	feedbackChart: null,
	
	/* toolbar items */
	toolbar: null,
	
	renewChartDataTask: {
		name: 'renew chart data at feedback panel',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.renewChartData();
		},
		interval: 10000, //10 seconds
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
			},
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
						duration: 700,
					}
				);
			},
		});
		
		this.feedbackCounter = new Ext.Container({
			cls: "x-toolbar-title alignRight",
			html: '0/0',
			getText: function(){
				if(this.rendered)
					return this.el.dom.innerHTML;
				else
					return this.html;
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: '0/0',
			items: [
		        this.backButton,
		        {xtype: 'spacer'},
		        this.feedbackVoteButton,
		        {xtype: 'spacer'},
		        this.feedbackCounter,
			]
		});
		
		this.feedbackChart = new Ext.chart.Chart({
			cls: 'column1',
		    theme: 'Demo',
		    store: new Ext.data.JsonStore({
		    	fields: ['name', 'value', 'percent'],
		    	data: [
		          {name: 'Bitte schneller',  displayName: Messages.FEEDBACK_GOOD,  value: 0, percent: 0.0},
		          {name: 'Kann folgen', 	 displayName: Messages.FEEDBACK_OKAY, value: 0, percent: 0.0},
		          {name: 'Zu schnell', 		 displayName: Messages.FEEDBACK_BAD, value: 0, percent: 0.0},
		          {name: 'Nicht mehr dabei', displayName: Messages.FEEDBACK_NONE, value: 0, percent: 0.0},
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
		        },
		    },
		    {
		        type: 'Category',
		        position: 'bottom',
		        fields: ['displayName'],
		        label: {
		        	rotate: {
		        		degrees: 315,
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
		    }],
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [this.feedbackChart];
		
		this.doLayout();
		
		ARSnova.views.feedback.StatisticPanel.superclass.constructor.call(this);
	},
	
	/**
	 * this function does three things
	 * 1. Adapt the chart data
	 * 2. Adapt the feedback-badge in tab bar
	 * 3. Adapt the feedback icon in tab bar depending on average of feedback
	 */
	renewChartData: function() {
		ARSnova.feedbackModel.getSessionFeedback(localStorage.getItem("sessionId"), {
			success: function(response){
				var panel = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel;
				var chart = panel.feedbackChart;
				var store = chart.store;
				
				var responseObj = Ext.decode(response.responseText).rows;
				
				var maxValue = 10;
				var sum = 0;
				var avg = 0;
				
				var fields = [
				  "Bitte schneller",
				  "Kann folgen",
				  "Zu schnell",
				  "Nicht mehr dabei"
				];
				for ( var i = 0; i < responseObj.length; i++) {
					var el = responseObj[i];
					var answerText = el.key[1];
					var record = store.findRecord('name', answerText);
					record.data.value = el.value;
					
					switch (answerText) {
						case "Bitte schneller":
							avg += el.value * 4;
							break;
						case "Kann folgen":
							avg += el.value * 3;
							break;
						case "Zu schnell":
							avg += el.value * 2;
							break;
						case "Nicht mehr dabei":
							avg += el.value * 1;
							break;
						default:
							break;
					}
					sum = sum + el.value;
					
					if (el.value > maxValue) {
						maxValue = Math.ceil(el.value / 10) * 10;
					}
					
					var idx = fields.indexOf(el.key[1]); // Find the index
					if(idx!=-1) fields.splice(idx, 1); // Remove it if really found!
				}
				for ( var i = 0; i < fields.length; i++) {
					var el = fields[i];
					var record = store.findRecord('name', el);
					record.data.value = 0;
				}
				
				// Calculate percentages
				var totalResults = store.sum('value');
				store.each(function(record) {
					record.data.percent = totalResults > 0 ? (record.data.value / totalResults) : 0.0;
				});
				
				chart.axes.items[0].maximum = maxValue;
				
				// renew the chart-data
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
				avg = Math.round(avg / sum);
				var tab = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.tab;
				switch (avg){
					case 4:
						tab.setIconClass("feedbackGood");
						break;
					case 3:
						tab.setIconClass("feedbackMedium");
						break;
					case 2:
						tab.setIconClass("feedbackBad");
						break;
					case 1:
						tab.setIconClass("feedbackNone");
						break;	
					default:
						tab.setIconClass("feedbackARSnova");
						break;
				}
			},
			failure: function() {
				console.log('server-side error feedbackModel.getSessionFeedback');
			},
		})
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
