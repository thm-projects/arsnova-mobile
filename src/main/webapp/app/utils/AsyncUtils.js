Ext.define('ARSnova.utils.AsyncUtils', {
       singleton : true,
 
       promiseWhile: function(condition, action, actionOnResult) {
        	console.log('promiseWhile()');
        	
        	var promise = new RSVP.Promise();
        		
        	var loop = function(result) {
        		console.log('loop()');
        		
        		console.log('result:');
        		console.log(result);
        		if (result) {
        			actionOnResult(result);
        		}
        		if (!condition()) {
        			console.log('condition false');
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