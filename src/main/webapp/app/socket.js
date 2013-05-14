ARSnova.Socket = Ext.extend(Ext.util.Observable, {
	
	constructor: function(config) {
		this.addEvents({
			"arsnova/session/feedback/update": true,
			"arsnova/session/feedback/count": true,
			"arsnova/session/feedback/average": true,
			"arsnova/session/feedback/remove": true
		});
		
		this.initSocket().then(Ext.createDelegate(function(socketUrl) {
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
			
			socket.on('feedbackData', Ext.createDelegate(function(data) {
				this.fireEvent("arsnova/session/feedback/update", data);
				this.fireEvent("arsnova/session/feedback/count", data.reduce(function(a, b){
					return a + b;
				}, 0));
			}, this));
			
			socket.on('feedbackReset', Ext.createDelegate(function(affectedSessions) {
				//topic.publish("arsnova/session/feedback/remove", affectedSessions);
			}, this));
			
			socket.on('feedbackDataRoundedAverage', Ext.createDelegate(function(average) {
				this.fireEvent("arsnova/session/feedback/average", average);
			}, this));
		}, this));
		
		ARSnova.Socket.superclass.constructor.call(this, config);
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