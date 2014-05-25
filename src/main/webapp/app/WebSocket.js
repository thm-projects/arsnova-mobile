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
/**
 * This class serves as an interface to ARSnova Web Socket implementation.
 * 
 * The only purpose of this class is to translate raw Web Socket events into
 * events handled by the Model classes. This means that users of Web Socket data
 * should not listen to any of the events listed here. Instead, they should connect
 * their listeners to the events provided by the Model classes.
 * 
 * When assigning new events, please adapt the following format:
 * "arsnova/socket/[type-of-data]/[type-of-event]", eg. "arsnova/socket/feedback/update"
 * 
 */
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
				console.debug("WebSocket connection established");
			});
			
			socket.on('reconnect', function() {
				/* TODO: Handle reconnect: rejoin ARSnova session if necessary */
				ARSnova.app.restProxy.connectWebSocket();
			});
			
			socket.on('activeUserCountData', Ext.bind(function(data) {
				this.fireEvent("arsnova/socket/activeusercount/update", data);
			}, this));
			
			socket.on('feedbackData', Ext.bind(function(data) {
				this.fireEvent("arsnova/socket/feedback/update", data);
			}, this));
			
			socket.on('feedbackReset', Ext.bind(function(affectedSessions) {
				//topic.publish("arsnova/socket/feedback/remove", affectedSessions);
			}, this));
			
			socket.on('feedbackDataRoundedAverage', Ext.bind(function(average) {
				this.fireEvent("arsnova/socket/feedback/average", average);
			}, this));
		}, this));
	},
	
	initSocket: function() {
		var socketUrl = window.location.protocol + '//' + window.location.hostname + ':10443';
		var promise = new RSVP.Promise();
		
		promise = ARSnova.app.restProxy.initWebSocket(socketUrl, promise);
		
		return promise;
	},

	setSession: function (sessionKey) {
		socket.emit("setSession", sessionKey);
	}
});