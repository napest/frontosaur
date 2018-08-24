var helpers = new function() {
	var helpers = this;
		   
    this.signOut = function(msg) {
        chrome.storage.sync.get(['fronto_token'], function(result) {
					$.post( "https://frontosaur.com/api/exit", {token: result.fronto_token}, function( data ) {
					  
			          data = JSON.parse(data);
					  if (data.error == 0) {
						    chrome.storage.sync.remove(['fronto_token']);
			            	helpers.sendMsg({
					        	from: "project",
					        	text: "openScript",
					        	script: "auth"
					        });
			            } else if (data.error == 4) {
			            	helpers.sendMsg({
					        	from: "helpers",
					        	text: "openScript",
					        	script: "auth"
					        });
			            }
					});
		});
    };
    
    this.sendMsg = function(msg) {
        chrome.runtime.sendMessage(msg);
    };

    this.getElem = function(id) {
    	return window.frontosaur.shadowRoot.getElementById(id);
    };
    
}

