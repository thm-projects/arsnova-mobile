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

Ext.define('ARSnova.view.feedback.StatisticPanel', {
	extend: 'Ext.Panel',
	
	config: {
		title: 'StatisticPanel',
		style: 'background-color: black',
		layout: 'vbox'
	},
	
	buttonClicked: null,
	feedbackChart: null,
	
	/* toolbar items */
	toolbar: null,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.feedbackVoteButton = Ext.create('Ext.Button', {
			text	: Messages.FEEDBACK_VOTE,
			ui		: 'back',
			scope	: this,
			hidden	: true,
			handler	: function() {
				var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
				fP.animateActiveItem(fP.votePanel, {
						type: 'slide',
						direction: 'down',
						duration: 700
					}
				);
			}
		});
		
		if(ARSnova.app.userRole != ARSnova.app.USER_ROLE_SPEAKER) {
			this.buttonClicked = function(button) {
				ARSnova.app.getController('Feedback').vote({
					value : button.config.value
				});
			}
		}
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			ui: 'light',
			items: [this.feedbackVoteButton]
		});

		this.feedbackOkButton = Ext.create('Ext.Panel', {
			cls: 'voteButtons left',

			items: [{
				xtype		: 'button',
				value		: 'Kann folgen',
				cls			: 'feedbackOkIcon',
				handler		: this.buttonClicked
			}]
		});

		this.feedbackGoodButton = Ext.create('Ext.Panel', {
			cls: 'voteButtons left',
			
			items: [{
				xtype		: 'button',
				value		: 'Bitte schneller',
				cls			: 'feedbackGoodIcon',
				handler		: this.buttonClicked
			}]
		});
		
		this.feedbackBadButton = Ext.create('Ext.Panel', {
			cls: 'voteButtons left',
			
			items: [{
				xtype		: 'button',
				value		: 'Zu schnell',
				cls			: 'feedbackBadIcon',
				handler		: this.buttonClicked
			}]
		});
		
		this.feedbackNoneButton = Ext.create('Ext.Panel', {
			cls: 'voteButtons left',
			
			items: [{
				xtype		: 'button',
				value		: 'Nicht mehr dabei',
				cls			: 'feedbackNoneIcon',
				handler		: this.buttonClicked
			}]
		});

		this.feedbackButtons = Ext.create('Ext.form.FormPanel', {
			cls	 : 'actionsForm voteButtonsPanel',
			scrollable: null,
			layout: 'hbox',
			flex: 1,
			
			items: [
			    this.feedbackOkButton, {xtype: 'spacer'},
			    this.feedbackGoodButton, {xtype: 'spacer'},
			    this.feedbackBadButton, {xtype: 'spacer'},
			    this.feedbackNoneButton
		    ]
		});

		this.feedbackChart = Ext.create('Ext.chart.Chart', {
			theme: 'Demo',
			themeCls: 'column1',
			flex: 20,
			style: { marginTop: '40px' },
		    store: Ext.create('Ext.data.JsonStore', {
			    fields: ['name', 'displayName', 'value', 'percent'],
			    data: [
				  {'name': 'Kann folgen', 	 'displayName': Messages.FEEDBACK_OKAY, 'value': 0, 'percent': 0.0},
		          {'name': 'Bitte schneller',  'displayName': Messages.FEEDBACK_GOOD,  'value': 0, 'percent': 0.0},
		          {'name': 'Zu schnell', 		 'displayName': Messages.FEEDBACK_BAD, 'value': 0, 'percent': 0.0},
		          {'name': 'Nicht mehr dabei', 'displayName': Messages.FEEDBACK_NONE, 'value': 0, 'percent': 0.0}
		        ]
			}),

		    animate: {
		        easing: 'bounceOut',
		        duration: 750
		    },

		    axes: [{
		        type: 'numeric',
		        position: 'left',
		        fields: ['value'],
		        hidden: true,
		        minimum: 0,
		        grid: {
			        opacity: 0
		        }
		    }, {
		        type: 'category',
		        position: 'bottom',
		        fields : ['displayName'],
		        label: {
		            renderer: function(v) {
		                return '';
		            }
		        }
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

		    series: [{
		        type: 'column',
		        axis: 'left',
		        xField: 'name',
		        yField: 'value',
		        highlight: true,
		        renderer: function(sprite, storeItem, barAttr, i, store) {
		            barAttr.fill = feedbackChartColors[i % feedbackChartColors.length];
		            return barAttr;
		        },
		        label: {
		            renderer: function(v) {
		                return '';
		            }
		        },
		        style: {
		            color:0x6238A7, 
		            size:8,
		            fill: 'blue'
		        }
		    }]
		});
		
		this.add([this.toolbar, this.feedbackButtons, this.feedbackChart]);
	},
	
	updateChart: function(feedbackValues) {
		var chart = this.feedbackChart;
		var store = chart.getStore();
		
		/* Swap values for "can follow" and "faster, please" feedback
		 * TODO: improve implementation, this is a quick hack for MoodleMoot 2013 */
		var values = feedbackValues.slice();
		var tmpValue = values[0];
		values[0] = values[1];
		values[1] = tmpValue;
		if (!Ext.isArray(values) || values.length != store.getCount()) return;
		
		// Set chart data
		store.each(function(record, index) {
			record.set('value', values[index]);
		});
		
		// Calculate percentages
		var sum = store.sum('value');
		store.each(function(record) {
			record.set('percent', sum > 0 ? (record.data.value / sum) : 0.0);
		});
		
		chart._axes.items[0]._maximum = Math.max.apply(null, values);
		chart.redraw();
	},
	
	updateTabBar: function(averageFeedback) {
		//update feedback-badge in tab bar 
		ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.tab.setBadgeText(this.feedbackChart.getStore().sum('value'));
		
		//change the feedback tab bar icon
		var tab = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.tab;
		switch (averageFeedback) {
			case 0:
				tab.setIconCls("feedbackMedium");
				break;
			case 1:
				tab.setIconCls("feedbackGood");
				break;
			case 2:
				tab.setIconCls("feedbackBad");
				break;
			case 3:
				tab.setIconCls("feedbackNone");
				break;	
			default:
				tab.setIconCls("feedbackARSnova");
				break;
		}
	},
	
	checkVoteButton: function(){
		if (!ARSnova.app.isSessionOwner) this.feedbackVoteButton.show();
		else this.feedbackVoteButton.hide();
	},
	
	checkTitle: function(){
		var title = Ext.util.Format.htmlEncode(localStorage.getItem('shortName'));
		this.toolbar.setTitle(title);
	}
});
