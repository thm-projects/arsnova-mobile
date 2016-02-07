Ext.define("ARSnova.controller.Version", {
	extend: 'Ext.app.Controller',

	info: {},
	promise: null,

	getInfo: function () {
		if (!this.promise) {
			var me = this;
			var backendPromise = new RSVP.Promise();
			var frontendPromise = new RSVP.Promise();
			var headers = {
				"Accept": "application/json"
			};
			this.promise = new RSVP.Promise();

			ARSnova.app.configLoaded.then(function () {
				Ext.Ajax.request({
					url: ARSnova.app.globalConfig.apiPath + "/",
					headers: headers,
					success: function (response) {
						me.info.backend = Ext.decode(response.responseText);
						backendPromise.resolve(me.info.backend);
					}
				});

				/* This request is not sent to the API so the RestProxy is not used  */
				Ext.Ajax.request({
					url: location.pathname + "resources/version.json",
					headers: headers,
					success: function (response) {
						me.info.frontend = Ext.decode(response.responseText);
						frontendPromise.resolve(me.info.frontend);
					}
				});
			});

			RSVP.all([backendPromise, frontendPromise]).then(function (infos) {
				console.log(me.info);
				me.promise.resolve(me.info);
			});
		}

		return this.promise;
	}
});
