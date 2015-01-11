Ext.define('ARSnova.utils.AsyncUtils', {
       singleton : true,
 
       promiseWhile: function(condition, action, actionOnResult) {
        	var promise = new RSVP.Promise();
        		
        	var loop = function(result) {
        		if (result) {
        			actionOnResult(result);
        		}
        		if (!condition()) {
        			return promise.resolve();
        		}
        		return action().then(loop,
        				function(error) {
        					console.log(error);
        				}
        		);
        	}
        			
        	loop(null);
        	return promise;
        }
});