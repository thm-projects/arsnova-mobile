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
Ext.regController("canteen", {
    vote: function(options){
//    	ARSnova.foodVoteModel.getUserFoodVote(ARSnova.config.day, localStorage.getItem("login"), {
		ARSnova.foodVoteModel.getUserFoodVote(ARSnova.CANTEEN_DAY, localStorage.getItem("login"), {
			success: function(response){
				var responseObj = Ext.decode(response.responseText).rows;
				if (responseObj.length == 0) {
					//create
					var foodVote = Ext.ModelMgr.create({
						type : 'food_vote',
						user : localStorage.getItem('login'), 
						name : options.value,
//						day	 : ARSnova.config.day,
						day	 : ARSnova.CANTEEN_DAY,
					}, 'FoodVote');
				} else {
					//update
					var foodVote = Ext.ModelMgr.create(responseObj[0].value, "FoodVote");
					foodVote.set('name', options.value);
				}
				
				foodVote.save({
					success: function() {
						var cP = ARSnova.mainTabPanel.tabPanel.canteenTabPanel;
						cP.setActiveItem(cP.statisticPanel, {
				    		type		: 'slide',
				    		direction	: 'up',
				    		duration	: 700,
				    		after		: function(){
				    			ARSnova.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel.renewChartData();
				    		}
						});
					},
					failure: function(response, opts) {
						console.log(response);
		    			console.log(opts);
		    	  		console.log('server-side error, foodVote save');
		    	  		Ext.Msg.alert("Hinweis!", "Die Antwort konnte leider nicht gespeichert werden");
		    	  		Ext.Msg.doComponentLayout();
					}
				});
			},
			failure: function(){
    			console.log('server-side error foodVote getUserFoodVote');
    		},
		});
    	
    	return;
    	
    	canteenVote.save({
    		success: function(){
    			ARSnova.mainTabPanel.layout.activeItem.switchBack();
    		}
    	})    	
    },
    
    show: function(){
		ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.canteenPanel, {
			type: 'slide',
		});
    },
    
    showVotePanel: function(){
    	ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.canteenPanel);
    	ARSnova.previousActiveItem = ARSnova.mainTabPanel.tabPanel;
		ARSnova.mainTabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel, {
				type: 'slide',
				direction: 'down',
				duration: 700,
			}
		);
    },
});