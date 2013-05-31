/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
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
Ext.define('ARSnova.WebSocket', {
	extend: 'Ext.util.Observable',
	
	constructor: function(config) {
		this.callParent(arguments);
		
		this.initSocket().then(Ext.bind(function(socketUrl) {
			socket = io.connect(socketUrl, {
				reconnect: true,
				secure: window.location.protocol === 'http:' ? false : true
			});
			socket.on('connect', function() {
				Ext.Ajax.request({
					url: "socket/assign",
					method: "POST",
					jsonData: { session: socket.socket.sessionid }
				});
			});
			
			socket.on('reconnect', function() {
				Ext.Ajax.request({
					url: "socket/assign",
					method: "POST",
					jsonData: { session: socket.socket.sessionid }
				});
			});
			
			socket.on('feedbackData', Ext.bind(function(data) {
				this.fireEvent("arsnova/session/feedback/update", data);
				this.fireEvent("arsnova/session/feedback/count", data.reduce(function(a, b){
					return a + b;
				}, 0));
			}, this));
			
			socket.on('feedbackReset', Ext.bind(function(affectedSessions) {
				//topic.publish("arsnova/session/feedback/remove", affectedSessions);
			}, this));
			
			socket.on('feedbackDataRoundedAverage', Ext.bind(function(average) {
				this.fireEvent("arsnova/session/feedback/average", average);
			}, this));
		}, this));
	},
	
	initSocket: function() {
		var socketUrl = window.location.protocol + '//' + window.location.hostname + ':10443';
		
		var promise = new RSVP.Promise();
		
		Ext.Ajax.request({
			url: "socket/url",
			success: function(data) {
				promise.resolve(data.responseText);
			},
			failure: function() {
				promise.resolve(socketUrl);
			}
		});
		
		return promise;
	}
});