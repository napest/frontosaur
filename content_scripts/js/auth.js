var auth = new function() {
	var auth = this;
	var frdom = window.frontosaur.dom;
	var curSide = "left";
	var token = "";
	var userdata;
	this.messageListener = function(message, sender) {
        var msg = message.text;
        console.log(message);
        // on active tab:
        if (msg === "open auth") auth.load(message.side);
        else if (msg === "close auth") auth.close();
        else if (message.token){
	        if (message.type == 'facebook') auth.afterAuthFacebook(message)
	        else auth.afterAuthGoogle(message);
        };
    };
    chrome.runtime.onMessage.addListener(this.messageListener);
		   
    this.sendMsg = function(msg) {
        chrome.runtime.sendMessage(msg);
    };

    this.getElem = function(id) {
    	return window.frontosaur.shadowRoot.getElementById(id);
    }
    this.close = function() {
    	auth.removeEventListeners();
    	auth.removeTemplate();
    }
    this.removeEventListeners = function() {
		auth.getElem("id_login_button") && auth.getElem("id_login_button").removeEventListener("click", auth.login);
		auth.getElem("to_register") && auth.getElem("to_register").removeEventListener("click", auth.toRegister);
    	auth.getElem("id_register_button") && auth.getElem("id_register_button").removeEventListener("click", auth.register);
    	auth.getElem("to_login") && auth.getElem("to_login").removeEventListener("click", auth.toLogin);
    	auth.getElem("login_google") && auth.getElem("login_google").addEventListener("click", auth.authGoogle);
    	auth.getElem("login_google2") && auth.getElem("login_google2").addEventListener("click", auth.authGoogle);
    	auth.getElem("login_facebook") && auth.getElem("login_facebook").addEventListener("click", auth.authFacebook);
    	auth.getElem("login_facebook2") && auth.getElem("login_facebook2").addEventListener("click", auth.authFacebook);
    }
    this.addEventListeners = function() {
		auth.getElem("id_login_button") && auth.getElem("id_login_button").addEventListener("click", auth.login);
		auth.getElem("to_register") && auth.getElem("to_register").addEventListener("click", auth.toRegister);
		auth.getElem("id_register_button") && auth.getElem("id_register_button").addEventListener("click", auth.register);
		auth.getElem("to_login") && auth.getElem("to_login").addEventListener("click", auth.toLogin);
		auth.getElem("login_google") && auth.getElem("login_google").addEventListener("click", auth.authGoogle);
		auth.getElem("login_google2") && auth.getElem("login_google2").addEventListener("click", auth.authGoogle);
		auth.getElem("login_facebook") && auth.getElem("login_facebook").addEventListener("click", auth.authFacebook);
		auth.getElem("login_facebook2") && auth.getElem("login_facebook2").addEventListener("click", auth.authFacebook);	
    }
    this.removeTemplate = function() {
    	window.frontosaur.shadowRoot.innerHTML = "";
    }
    this.load = function(side) {
    	curSide = side;
    	auth.loadTemplate();
    };

    this.loadTemplate = function() {
    	
    	$.get(chrome.extension.getURL("content_scripts/html/auth.html"), function(data) {
            var elem = '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/index.css") +
                '">',
                elem = elem + '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/auth.css") +
                '">',
                elem = elem + '<div id="id_frontosaur" class="frontosaur">' + (data + '</div>');
            window.frontosaur.shadowRoot.innerHTML = elem;
            auth.addEventListeners();
        });
    };

    this.login = function() {
        var username = auth.getElem("id_login_username").value;
        //  secure??
        var pass = auth.getElem("id_login_pass").value;
        var postdata = {
            mail: username,
            pass: window.MD5(window.MD5(pass))
        };
        console.log(postdata);
        $.post("https://frontosaur.com/api/login", postdata, function(data) {
            data = JSON.parse(data);
            if (!data.error) {
                auth.signInOk(data.token);
            } else if (data.error == 3) {
                auth.error("Invalid username or password");
            } else {
                auth.error("Unknown error");
            }
            console.log(data);
        });
    };

    this.register = function() {
        var username = auth.getElem("id_register_username").value;
        var mail = auth.getElem("id_register_email").value;
        //  secure??
        var pass = auth.getElem("id_register_pass").value;
        var postdata = {
            mail: mail,
            name: username,
            pass: window.MD5(window.MD5(pass))
        };
        console.log(postdata);
        $.post("https://frontosaur.com/api/registration", postdata, function(data) {
            data = JSON.parse(data);
            if (!data.error) {
                auth.signUpOk(data.token);
            } else if (data.error == 1) {
                auth.error("This E-Mail already exists");
            } else if (data.error == 12) {
                auth.error("Please fill all the fields");
            } else {
                auth.error("Unknown error");
            }
            console.log(data);
        });
    };

    this.toRegister = function() {
        auth.getElem("id_login_form").style.display = "none";
        auth.getElem("id_register_form").style.display = "block";
        auth.removeEventListeners();
        auth.addEventListeners();
    }

    this.toLogin = function() {
        auth.getElem("id_register_form").style.display = "none";
        auth.getElem("id_login_form").style.display = "block";
        auth.removeEventListeners();
        auth.addEventListeners();
    }
    
	this.error = function(message) {
        auth.getElem("id_wrong-data-container").style.display = "block";
        auth.getElem("id_wrong-data-text").innerHTML = message;
    };

    this.signInOk = function(token) {
        chrome.storage.sync.set({fronto_token: token}, function() {});
        chrome.storage.sync.get(['fronto_token'], function(result) {
        console.log(result.fronto_token);
        });
        
        $.post( "https://frontosaur.com/api/main_info", {token: token}, function( data ) {
	          data = JSON.parse(data);
			  if (data.error == 0) {
	            	chrome.storage.sync.set({fronto_userinfo: data.info}, function() {});
	            	
	            } else if (data.error == 4) {
	            	auth.error("Token has expired");
	            } 
	            console.log(data);
			});
        auth.sendMsg({
        	from: "auth",
        	side: curSide,
        	text: "openScript",
        	script: "projects"
        })
    };

    this.signUpOk = function(token) {
    	
    };
    this.checkFbStatus = function(){  
		FB.getLoginStatus(function(response) {
		    statusChangeCallback(response);
		    console.log(response);
		});
    }
    this.authGoogle = function(){
	    console.log("");
	    auth.sendMsg({
        	from: "auth",
        	side: curSide,
        	text: "authGoogle",
        	script: "page"
        })
    }
    this.authFacebook = function(){
	    console.log("");
	    auth.sendMsg({
        	from: "auth",
        	side: curSide,
        	text: "authFacebook",
        	script: "page"
        })
    }
    this.afterAuthGoogle = function(message){
			//console.log(message);
			localStorage.setItem('frontosaurTokenG', message.token);
	        userdata = message.data;
		    var postdata = {
	            mail: userdata.emailAddresses[0].value,
	            name: userdata.names[0].displayName,
	            photo: userdata.photos[0].url,
	            googleid: userdata.resourceName.substring(7)
	        };
	        //console.log(postdata);
	        $.post( "https://frontosaur.com/api/registrationGoogle", postdata, function( data ) {
		        console.log(data);
	          data = JSON.parse(data);
			  if (data.error == 0) {
	            	auth.signInOk(data.token);
	            } else if (data.error == 1) {
	            	auth.error("This E-Mail already exists.");
	            } else if (data.error == 12) {
	            	auth.error("Please fill all the fields.");
	            } else {
	            	auth.error("Unknown error.");
	            }
	            console.log(data);
			});
    }
    this.afterAuthFacebook = function(message){
			console.log(message);
			localStorage.setItem('frontosaurTokenFb', message.token);
	        userdata = message.data;
		    var postdata = {
	            mail: userdata.email,
	            name: userdata.name,
	            photo: userdata.picture.data.url,
	            facebookid: userdata.id
	        };
	        //console.log(postdata);
	        $.post( "https://frontosaur.com/api/registrationFacebook", postdata, function( data ) {
	          console.log(data);data = JSON.parse(data);
			  if (data.error == 0) {
	            	auth.signInOk(data.token);
	            } else if (data.error == 1) {
	            	auth.error("This E-Mail already exists.");
	            } else if (data.error == 12) {
	            	auth.error("Please fill all the fields.");
	            } else {
	            	auth.error("Unknown error.");
	            }
	            console.log(data);
			});
    }
}

