/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/canteen/statisticPanel.js
 - Beschreibung: Panel zum Anzeigen der Mensa-Statistik.
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
canteenChartColors = ['url(#v1)', 'url(#v2)', 'url(#v3)', 'url(#v4)', 'url(#v5)'],

Ext.define('ARSnova.view.canteen.StatisticPanel', {
	extend: 'Ext.Panel',
	
	config: {
		title	: Messages.CANTEEN,
		
		style: 'background-color: black',
		iconCls	: 'tabBarIconCanteen',
		layout	: 'fit'
	},
	
	location: ARSnova.app.CANTEEN_LOCATION,
	day: ARSnova.app.CANTEEN_DAY,
	
	canteenChart: null,
	
	/* toolbar items */
	toolbar				: null,
	canteenVoteButton	: null,
	
	renewChartDataTask: {
		name: 'renew chart data at canteen panel',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel.renewChartData();
		},
		interval: 10000
	},
	
	updateCanteenBadgeIconTask: {
		name: 'update the badge of the canteen tab',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel.updateCanteenBadgeIcon();
		},
		interval: 30000
	},
	
	initialize: function() {
		this.callParent(arguments);
		
		this.canteenVoteButton = Ext.create('Ext.Button', {
			text	: Messages.I_RECOMMEND,
			ui		: 'confirm',
			scope	: this,
			handler	: function() {
				taskManager.stop(this.renewChartDataTask);
				ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel.votePanel, {
						type: 'slide',
						direction: 'down',
						duration: 700
					}
				);
			}
		});
		
		this.casLoginButton = Ext.create('Ext.Button', {
			text	: Messages.LOGIN,
			ui		: 'action',
			scope	: this,
			hidden	: true
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			items: [
	            {xtype: 'spacer'},
	            this.canteenVoteButton,
	            {xtype: 'spacer'}
			]
		});
		
		this.canteenChart = Ext.create('Ext.chart.Chart', {
			theme: 'Demo',
			themeCls: 'column1',
		    
		    store: Ext.getStore('Food'),

		    animate: {
		        easing: 'bounceOut',
		        duration: 1000
		    },
		    
		    label: {
		    	color: '#fff'
		    },

		    interactions: [{
		        type: 'reset'
		    }, {
		        type: 'panzoom'
		    }],
		    
		    gradients: [{
		    	'id': 'v1',
		        'angle': 0,
		        stops: {
		            0:   { color: '#660099' },
		            100: { color: '#9932CC' }
		        }
		    },
		    {
		        'id': 'v2',
		        'angle': 0,
		        stops: {
		            0:   { color: '#BB4B20' },
		            100: { color: '#FF7F50' }
		        }
		    },
		    {
		        'id': 'v3',
		        'angle': 0,
		        stops: {
		            0:   { color: '#786332' },
		            100: { color: '#AB9665' }
		        }
		    },
		    {
		        'id': 'v4',
		        'angle': 0,
		        stops: {
		            0:   { color: '#855308' },
		            100: { color: '#B8860B' }
		        }
		    }, 
		    {
				'id': 'v5',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(128, 64, 22)' },
					100: { color: 'rgb(88, 24, 0)' }
				}
			}],
		    
		    axes: [{
		        type: 'Numeric',
		        position: 'left',
		        fields: ['value'],
		        title: this.day,
		        minimum: 0,
		        maximum: 100,
		        label: {
		            renderer: function(v) {
		                return v.toFixed(0);
		            }
		        }
		    },
		    {
		        type: 'Category',
		        position: 'bottom',
		        fields: ['name'],
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
	            title   : "THM Mensa Gießen",  
	            dashSize: 0
	        }],
		    series: [{
		        type: 'Column',
		        axis: 'left',
		        highlight: true,
		        renderer: function(sprite, storeItem, barAttr, i, store) {
		            barAttr.fill = canteenChartColors[i % canteenChartColors.length];
		            return barAttr;
		        },
		        label: {
	                field: ['percent'],
	                renderer: function(v) {
			        	  return Math.round(v * 100) + "%";
			        }
	            },
		        xField: 'name',
		        yField: 'value'
		    }]
		});
		
		this.add([this.toolbar, this.canteenChart]);
	
		this.on('painted', this.onActivate);
	},
	
	onActivate: function() {
		this.canteenChart.getAxes().items[2].style.stroke = "#0E0E0E";
		this.canteenChart.redraw();
	},
	
	renewChartData: function() {
		ARSnova.app.foodVoteModel.countFoodVoteGrouped(this.day, {
			success: function(response){
				var responseObj = Ext.decode(response.responseText).rows;
				var panel = ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel;
				var chart = panel.canteenChart;
				var store = chart.getStore();
				
				var maxValue = 10;
				var tmp = [];
				var sum = 0;

				for (var i = 0; i < store.data.items.length; i++) {
					var el = store.data.items[i];
					tmp.push(el.data.name);
				}
				
				for (var i = 0; i < responseObj.length; i++) {
					var el = responseObj[i];
					var record = store.findRecord('name', el.key[1]);
					record.data.value = el.value;
					sum += el.value;
					
					if (el.value > maxValue) {
						maxValue = Math.ceil(el.value / 10) * 10;
					}
					
					var idx = tmp.indexOf(el.key[1]); // Find the index
					if(idx!=-1) tmp.splice(idx, 1); // Remove it if really found!
				}
				for ( var i = 0; i < tmp.length; i++) {
					var el = tmp[i];
					var record = store.findRecord('name', el);
					record.data.value = 0;
				}
				
				// Calculate percentages
				var totalResults = store.sum('value');
				store.each(function(record) {
					record.data.percent = totalResults > 0 ? (record.data.value / totalResults) : 0.0;
				});
				
				ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel.tab.setBadgeText(sum);
				
				chart._axes.items[0]._maximum = maxValue;
				// renew the chart-data
				chart.redraw();
			},
			failure: function() {
				console.log('server-side error');
			}
		});
	},
	
	updateCanteenBadgeIcon: function(){
		ARSnova.app.foodVoteModel.countFoodVote(this.day, {
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				var value = 0;
				
				if (res.length > 0){
					value = res[0].value;
				}
				
				ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel.tab.setBadgeText(value);
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	}
});
