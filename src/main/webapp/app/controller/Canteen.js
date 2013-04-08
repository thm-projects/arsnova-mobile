/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/controllers/canteen.js
 - Beschreibung: User-Controller
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
Ext.define("ARSnova.controller.Canteen", {
	extend: 'Ext.app.Controller',
	
	config: {
		routes: {
			'canteen': 'show',
			'canteenVote': 'showVotePanel'
		}
	},
	
    vote: function(options){
		ARSnova.app.foodVoteModel.getUserFoodVote(ARSnova.app.CANTEEN_DAY, localStorage.getItem("login"), {
			success: function(response){
				var responseObj = Ext.decode(response.responseText).rows;
				if (responseObj.length == 0) {
					//create
					var foodVote = Ext.ModelMgr.create({
						type : 'food_vote',
						user : localStorage.getItem('login'), 
						name : options.value,
//						day	 : ARSnova.app.config.day,
						day	 : ARSnova.app.CANTEEN_DAY
					}, 'FoodVote');
				} else {
					//update
					var foodVote = Ext.ModelMgr.create(responseObj[0].value, "FoodVote");
					foodVote.set('name', options.value);
				}
				
				foodVote.save({
					success: function() {
						var cP = ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel;
						cP.setActiveItem(cP.statisticPanel, {
				    		type		: 'slide',
				    		direction	: 'up',
				    		duration	: 700,
				    		after		: function(){
				    			ARSnova.app.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel.renewChartData();
				    		}
						});
					},
					failure: function(response, opts) {
						console.log(response);
		    			console.log(opts);
		    	  		console.log('server-side error, foodVote save');
		    	  		Ext.Msg.alert("Hinweis!", "Die Antwort konnte leider nicht gespeichert werden");
					}
				});
			},
			failure: function(){
    			console.log('server-side error foodVote getUserFoodVote');
    		}
		});
    	
    	return;
    	
    	canteenVote.save({
    		success: function(){
    			ARSnova.app.mainTabPanel.layout.activeItem.switchBack();
    		}
    	});
    },
    
    show: function(){
		ARSnova.app.mainTabPanel.tabPanel.setActiveItem(ARSnova.app.mainTabPanel.tabPanel.canteenPanel, {
			type: 'slide'
		});
    },
    
    showVotePanel: function(){
    	ARSnova.app.mainTabPanel.tabPanel.setActiveItem(ARSnova.app.mainTabPanel.tabPanel.canteenPanel);
    	ARSnova.app.previousActiveItem = ARSnova.app.mainTabPanel.tabPanel;
		ARSnova.app.mainTabPanel.setActiveItem(ARSnova.app.mainTabPanel.tabPanel, {
				type: 'slide',
				direction: 'down',
				duration: 700
			}
		);
    }
});