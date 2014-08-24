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
			/* Upgrade from polling to WebSocket currently does not work
			 * reliably so manually set the transport by detecting browser
			 * support for WebSocket protocol */
			var hasWs = false;
			if (window.WebSocket) {
				/* Workaround: unfortunately some browsers pretend to support
				 * WS protocol although they do not */
				try {
					var ws = new Websocket("wss:" + window.location.hostname + ":10443");
					ws.close(-1);
				} catch (e) {
					hasWs = true;
				}
			}
			var transports = hasWs ? ["websocket"]: ["polling"];
			console.debug("Socket.IO transports", transports);

			socket = io.connect(socketUrl, {
				reconnect: true,
				secure: window.location.protocol === 'http:' ? false: true,
				transports: transports
			});

			socket.on('connect', Ext.bind(function() {
				console.debug("Socket.IO connection established");
				ARSnova.app.restProxy.connectWebSocket().then(Ext.bind(function () {
					this.fireEvent("arsnova/socket/connect");
				}, this));
			}, this));

			socket.on('disconnect', Ext.bind(function() {
				console.debug("Socket.IO connection lost");
				this.fireEvent("arsnova/socket/disconnect");
			}, this));

			socket.on('reconnect', Ext.bind(function() {
				console.debug("Socket.IO connection restored");
				this.fireEvent("arsnova/socket/reconnect");
			}, this));

			socket.on('activeUserCountData', Ext.bind(function(data) {
				console.debug("Socket.IO: activeUserCountData", data);
				this.fireEvent("arsnova/socket/activeusercount/update", data);
			}, this));

			socket.on('feedbackData', Ext.bind(function(data) {
				console.debug("Socket.IO: feedbackData", data);
				this.fireEvent("arsnova/socket/feedback/update", data);
			}, this));

			socket.on('feedbackReset', Ext.bind(function(affectedSessions) {
				console.debug("Socket.IO: feedbackReset", affectedSessions);
				//topic.publish("arsnova/socket/feedback/remove", affectedSessions);
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
