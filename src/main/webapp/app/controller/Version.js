Ext.define("ARSnova.controller.Version", {
	extend: 'Ext.app.Controller',

	info: {
		frontend: null,
		backend: null
	},

	getInfo: function () {
		var me = this;
		var backendPromise = new RSVP.Promise();
		var frontendPromise = new RSVP.Promise();
		var resultPromise = new RSVP.Promise();
		var headers = {
			"Accept": "application/json"
		};

		ARSnova.app.configLoaded.then(function () {
			if (!me.info.backend) {
				Ext.Ajax.request({
					url: ARSnova.app.globalConfig.apiPath,
					headers: headers,
					success: function (response) {
						me.info.backend = Ext.decode(response.responseText);
						backendPromise.resolve(me.info.backend);
					}
				});
			}

			if (!me.info.frontend) {
				/* This request is not sent to the API so the RestProxy is not used  */
				Ext.Ajax.request({
					url: location.pathname + "resources/version.json",
					headers: headers,
					success: function (response) {
						me.info.frontend = Ext.decode(response.responseText);
						frontendPromise.resolve(me.info.frontend);
					}
				});
			}
		});

		RSVP.all([backendPromise, frontendPromise]).then(function (infos) {
			console.log(me.info);
			resultPromise.resolve(me.info);
		});

		return resultPromise;
	}
});
