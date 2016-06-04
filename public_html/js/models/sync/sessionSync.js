
define(function (require) {
	return function(method, model, options) {
        if (method === 'update') {
            method = 'create';
        }

        var methodMap = {
			'read': {
                type: 'GET',

                success: function(userData) {                      
                    console.log("...SESSION ALIVE!");
                    console.log(userData);

                    model.getUser().set({ id: userData.id });
                    model.getUser().fetch();
                },

                error: function(xhr, error_msg, error) {
                    var error = new Error(error_msg);
                    error.code = xhr.status;

                    model.clearUser();
                    model.trigger('status:received');

                    console.log("...DEAD SESSION!\n" + error.code + " " + error.message);
                }
            },

            'create': {
				type: 'POST',
				
				success: function(userData) {         
                    console.log(userData);

					model.getUser().set({ id: userData.id });
                    model.getUser().fetch();

                    console.log("...SIGNIN SUCCESS!");
                    
                    model.listenTo(model.getUser(), 'status:received', function() {
                        $(location).attr('href', '/');
                    });
                },

                error: function(xhr, error_msg, error) {
                    var error = new Error(error_msg);
                    error.code = xhr.status;
                    
                    model.trigger('loginError');

                    console.log("...SIGNIN ERROR!\n" + error.code + " " + error.message);
                }
            },

            'delete': {
                type: 'DELETE',

                success: function() { },

                error: function(xhr, error_msg, error) {
                    var error = new Error(error_msg);
                    error.code = xhr.status;

                    if (error.code === 200) { // No content
                        console.log("...SIGNOUT SUCCESS!");    
                        
                        model.clearUser();
                        model.trigger('logout');
                    } else {
                        console.log("...SIGNOUT ERROR!\n" + error.code + " " + error.message); 
                    }
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
 
            data: model.toJSON(),              
        }

        if (type === 'DELETE') {
            requestData.mimeType = 'text/html'  // "No element found" fix
        }

        if (type === 'GET') {
            requestData.data = null;
        }

		var jqXHR  = $.ajax(requestData)
                        .done(success)
                        .fail(error);

		return jqXHR;
	}	// return function()
});	// define
