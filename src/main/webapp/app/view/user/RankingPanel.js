/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/user/rankingPanel.js
 - Beschreibung: Panel zum Anzeigen eines Session-internen Rankings. TODO not yet in use
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
Ext.define('ARSnova.view.user.RankingPanel', {
	extend: 'Ext.Panel',
	
	config: {
		fullscreen: true,
	},
	
	myRanking 	 : null,
	myRankingPos : 0,
	betterCounter: 0,
	worseCounter : 0,
	equalCounter : -1, //have to start at -1 because the result of this user will be also in the resultSet of getSessionRankingStatistic
	overallCounter: 0,
	
	high	: 75,
	medium	: 50,
	low		: 25,
	highCounter	  : 0,
	mediumCounter : 0,
	lowCounter	  : 0,
	veryLowCounter: 0,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,	
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.HOME,
			ui		: 'back',
			scope	: this,
			handler	: function() {
				me = this;
				ARSnova.app.mainTabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					after: function() {
						me.destroy();
					}
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: 'Ranking',
			docked: 'top',
			items: [
		        this.backButton
			]
		});
		
		this.myRankingPanel = Ext.create('Ext.Panel', {
			cls: 'centerText'
		});
		
		this.sessionStatisticPanel = Ext.create('Ext.Panel', {
			cls: 'centerText'
		});
		
		this.add([this.toolbar, {
			cls: 'centerText',
			html: 'Hier sehen Sie die Statistik der Session: <br><br>'
		}, this.myRankingPanel, this.sessionStatisticPanel]);
		
		ARSnova.app.userRankingModel.getUserRankingStatistic(localStorage.getItem("sessionId"), localStorage.getItem("login"), {
			success: function(response){
				var responseObj = Ext.decode(response.responseText).rows;
				if (responseObj.length == 0) return;
				ARSnova.app.mainTabPanel.layout.activeItem.myRanking = responseObj[0].value;
			},
			failure: function() {
				console.log('server-side error');
			}
		});
		
		ARSnova.app.userRankingModel.getSessionRankingStatistic(localStorage.getItem("sessionId"), {
			success: function(response){
				var panel = ARSnova.app.mainTabPanel.layout.activeItem;
				var responseObj = Ext.decode(response.responseText).rows;
				
				for(var i = 0; i < responseObj.length; i++){
					var ur = responseObj[i];
					if (ur.value >  panel.myRanking) panel.betterCounter++;
					if (ur.value <  panel.myRanking) panel.worseCounter++;
					if (ur.value == panel.myRanking) panel.equalCounter++;
					
					if (ur.value >=  panel.high) 		panel.highCounter++;
					else if (ur.value >=  panel.medium) panel.mediumCounter++;
					else if (ur.value >= panel.low)		panel.lowCounter++;
					else panel.veryLowCounter++;
					
					panel.overallCounter++;
				}
				panel.myRankingPos = panel.betterCounter + 1;
			},
			failure: function(){
				console.log('server-side error');
			}
		});
		
		this.on('activate', this.onActivate);
	},
	
	onActivate: function(){
		if(this.myRanking !== null) {
			var rankingText = "Sie haben " + this.myRanking + "% der Fragen korrekt beantwortet <br>";
			rankingText += "und befinden sich damit auf dem " + this.myRankingPos + ". Platz! <br>";
			
			if (this.myRankingPos == 1 && this.overallCounter > 1) 
				rankingText += "Herzlichen Glückwunsch!<br><br>";
			else 
				"<br><br>";

			sessionText = "Insgesamt haben " + this.overallCounter + " Personen an dem Quiz teilgenommen.<br>";
			
			if (this.betterCounter == 0) {
				sessionText += "Niemand ist besser! <br>";
			} else if (this.betterCounter == 1) {
				sessionText += "1 Person hat besser abgeschnitten. <br>";
			} else {
				sessionText += this.betterCounter + " Personen haben besser abgeschnitten. <br>";
			} 
			
			if (this.equalCounter == 0) {
				
			} else if (this.equalCounter == 1) {
				sessionText += "1 Person ist mit Ihnen gleichauf. <br>";
			} else {
				sessionText += this.equalCounter + " Personen sind mit Ihnen gleichauf. <br>";
			} 
			
			if (this.worseCounter == 0) {
				
			} else if (this.worseCounter == 1) {
				sessionText += "1 Person hat schlechter abgeschnitten. <br>";
			} else {
				sessionText += this.worseCounter + " Personen haben schlechter abgeschnitten. <br>";
			}
		} else {
			var rankingText = "Sie haben noch keine Fragen beantwortet! Erst dann können Sie ihr eigenes Ranking einsehen.";
			
			var sessionText = "<table class=\"ranking\"><caption>Session-Übersicht</caption>";
			sessionText += "<thead><tr><th>Ergebnis</th><th>Anzahl</th></tr></thead>";
			sessionText += "<tr><td>100% - " + this.high + "%</td><td>" + this.highCounter + "</td>";
			sessionText += "<tr><td>" + this.high + "% - " + this.medium + "%</td><td>" + this.mediumCounter + "</td>";
			sessionText += "<tr><td>" + this.medium + "% - " + this.low + "%</td><td>" + this.lowCounter + "</td>";
			sessionText += "<tr><td>" + this.low + "% - 0%</td><td>" + this.veryLowCounter + "</td>";
			
			sessionText += "</table>";
		}
		 
		this.myRankingPanel.update(rankingText);
		this.sessionStatisticPanel.update(sessionText);
	}
});



