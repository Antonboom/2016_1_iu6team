define(function (require) {
	return function(method, model, options) {
        var methodMap = {
			'read': {
                type: 'GET',

                success: function(userData) {                      
                        console.log("...RECEIVING USER DATA - SUCCESS!");
                        console.log(userData);
                        
                        model.set(userData);

                        model.trigger('status:received');
                },

                error: function(xhr, error_msg, error) {
                    var error = new Error(error_msg);
                    error.code = xhr.status;

                    console.log("...RECEIVING USER DATA ERROR!\n" + error.code + " " + error.message);                      
                }
            },

            'create': {
				type: 'POST',
				
				success: function(user) {                      
                    console.log("...SIGNUP SUCCESS!");
                    console.log(user);
                    model.trigger('signUpSuccess');
                },

                error: function(xhr, error_msg, error) {
                    console.log("...SIGNUP ERROR!\n" + xhr.status + " " + error_msg); 
                    model.trigger('signUpError');
                } 
            }
		};	// methodMap

		var type = methodMap[method].type,
			success = methodMap[method].success,
			error = methodMap[method].error;

        var requestData = { 
            url: model.url,
              
            type: type,
            
            dataType: 'json',
          
            contentType: 'application/json',
 
            data: model.toNotFullJSON(),              
        }

        if (type === 'GET') {
            requestData.url += '/' + model.get('id');
            requestData.data = null
        }

		var jqXHR = $.ajax(requestData)
                        .done(success)
                        .fail(error);

		return jqXHR;
	}	// return function()
});	// define
