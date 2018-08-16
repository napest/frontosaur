var register = new function() {
	var register = this;
	var frdom = window.frontosaur.dom;
	var curSide = "left";
	this.messageListener = function(message, sender) {
        var msg = message.text;
        // on active tab:
        if (msg === "open register") register.load(message.side);
        else if (msg === "close register") register.close();
    };
    chrome.runtime.onMessage.addListener(this.messageListener);

    this.sendMsg = function(msg) {
        chrome.runtime.sendMessage(msg);
    };

    this.close = function() {
    	register.removeEventListeners();
    	register.removeTemplate();
    }

    this.removeEventListeners = function() {
    	window.frontosaur.shadowRoot.getElementById("id_register_button").removeEventListener("click", register.register);
    	window.frontosaur.shadowRoot.getElementById("to_login").removeEventListener("click", register.toLogin)
    }

    this.removeTemplate = function() {
    	frdom.Empty(window.frontosaur.hostElement);
    }

    this.load = function(side) {
    	curSide = side;
    	register.loadTemplate();
    };

    this.loadTemplate = function() {
    	window.frontosaur.ajaxRequest(chrome.extension.getURL("content_scripts/html/register.html"), null, function(data) {
	    	var elem = '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/index.css") +
	            '">',
	            elem = elem + '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/register.css") +
	            '">',
	            elem = elem + '<div id="id_frontosaur" class="frontosaur">'+ (data + '</div>');
	        window.frontosaur.shadowRoot.innerHTML = elem;
		    register.addEventListeners();
	    });
    };

	this.addEventListeners = function() {
    	window.frontosaur.shadowRoot.getElementById("id_register_button").addEventListener("click", register.register);
    	window.frontosaur.shadowRoot.getElementById("to_login").addEventListener("click", register.toLogin);
    };

    this.register = function() {
    	var username = window.frontosaur.shadowRoot.getElementById("id_username").value;
    	//  secure??
    	var pass = window.frontosaur.shadowRoot.getElementById("id_pass").value;
		var postdata = {
            mail: username,
            pass: window.MD5(window.MD5(pass))
        };
        console.log(postdata);
        window.frontosaur.ajaxRequest("https://frontosaur.com/api/register", postdata, function(data) {
            console.log(data);
            if (!data["error"]) {
            	register.wrongUserData();
            } else {
            	register.signUpOk(token);
            }
            // console.log(data);
        });
    };

    this.toLogin = function() {
    	register.sendMsg({
        	from: "register",
        	side: curSide,
        	text: "openScript",
        	script: "login"
        })
    }

    this.wrongUserData = function() {
    	window.frontosaur.shadowRoot.getElementById("register_form").style.display="block";
    };

    this.signUpOk = function(token) {
    	chrome.storage.sync.set({fronto_token: token}, function() {});
        // chrome.storage.sync.get(['fronto_token'], function(result) {
        //   console.log(result.fronto_token);
        // });
        register.sendMsg({
        	from: "register",
        	side: curSide,
        	text: "openScript",
        	script: "page"
        })
    }

}
