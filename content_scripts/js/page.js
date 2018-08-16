var page = new function() {
	var page = this;
	var frdom = window.frontosaur.dom;
	var curSide = "left";
	var token = "";
	var userdata;
	this.messageListener = function(message, sender) {
        var msg = message.text;
        console.log(msg);
        // on active tab:
        if (msg === "open page") page.load(message.side);
        else if (msg === "close page") page.close();
        
    };
    chrome.runtime.onMessage.addListener(this.messageListener);
	/*
window.fbAsyncInit = function() {
		    FB.init({
		      appId      : '400056927186702',
		      cookie     : true,
		      xfbml      : true,
		      version    : 'v3.1'
		    });
		      
		    FB.AppEvents.logPageView();   
		      
			};
		
		  (function(d, s, id){
		     var js, fjs = d.getElementsByTagName(s)[0];
		     if (d.getElementById(id)) {return;}
		     js = d.createElement(s); js.id = id;
		     js.src = "https://connect.facebook.net/en_US/sdk.js";
		     fjs.parentNode.insertBefore(js, fjs);
		   }(document, 'script', 'facebook-jssdk'));
*/
		   
    this.sendMsg = function(msg) {
        chrome.runtime.sendMessage(msg);
    };

    this.getElem = function(id) {
    	return window.frontosaur.shadowRoot.getElementById(id);
    }

    this.close = function() {
    	page.removeEventListeners();
    	page.removeTemplate();
    }

    this.removeEventListeners = function() {
		page.getElem("id_login_button") && page.getElem("id_login_button").removeEventListener("click", page.login);
		page.getElem("to_register") && page.getElem("to_register").removeEventListener("click", page.toRegister);
    	page.getElem("id_register_button") && page.getElem("id_register_button").removeEventListener("click", page.register);
    	page.getElem("to_login") && page.getElem("to_login").removeEventListener("click", page.toLogin);
    }

    this.addEventListeners = function() {
		page.getElem("id_login_button") && page.getElem("id_login_button").addEventListener("click", page.login);
		page.getElem("to_register") && page.getElem("to_register").addEventListener("click", page.toRegister);
		page.getElem("id_register_button") && page.getElem("id_register_button").addEventListener("click", page.register);
		page.getElem("to_login") && page.getElem("to_login").addEventListener("click", page.toLogin);
		page.getElem("login_google") && page.getElem("login_google").addEventListener("click", page.authGoogle);
    }

    this.removeTemplate = function() {
    	frdom.Empty(window.frontosaur.shadowRoot);
    }

    this.load = function(side) {
    	curSide = side;
    	page.loadTemplate();
    };

    this.loadTemplate = function() {
    	
    	window.frontosaur.ajaxRequest(chrome.extension.getURL("content_scripts/html/page.html"), null, function(data) {
    		try {
	    		var elem = '<link href="https://fonts.googleapis.com/css?family=Catamaran:400,600" rel="stylesheet"><link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/index.css") +
	            '">',
	            elem = elem + '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/page.css") +
	            '">',
	            elem = elem + '<div id="id_frontosaur" class="frontosaur">'+ (data + '</div>');
				window.frontosaur.shadowRoot.innerHTML = elem;
				page.setVars();
    		} catch (err)
    		{
	    		console.log(err);
    		}
	    	
		    page.addEventListeners();
	    });
    };
	this.setVars = function(){
		chrome.storage.sync.get(['fronto_userinfo'], function(result) {
      		page.getElem('username').innerHTML = result.fronto_userinfo.name;
      		page.getElem('userphoto').setAttribute("src", result.fronto_userinfo.img);
        });
	}
	
	
	
        this.error = function(message) {
    	page.getElem("id_wrong-data-container").style.display="block";
    	page.getElem("id_wrong-data-text").innerHTML=message;
    };

    this.signInOk = function(token) {
    	chrome.storage.sync.set({fronto_token: token}, function() {});
        // chrome.storage.sync.get(['fronto_token'], function(result) {
        //   console.log(result.fronto_token);
        // });
        page.sendMsg({
        	from: "auth",
        	side: curSide,
        	text: "openScript",
        	script: "page"
        })
    };

    this.signUpOk = function(token) {
    	chrome.storage.sync.set({fronto_token: token}, function() {});
        chrome.storage.sync.get(['fronto_token'], function(result) {
        console.log(result.fronto_token);
        });
        page.sendMsg({
        	from: "register",
        	side: curSide,
        	text: "openScript",
        	script: "page"
        })
    };
    this.checkFbStatus = function(){  
		FB.getLoginStatus(function(response) {
		    statusChangeCallback(response);
		    console.log(response);
		});
    }
    this.authGoogle = function(){
	    page.sendMsg({
        	from: "register",
        	side: curSide,
        	text: "authGoogle",
        	script: "page"
        })
    }
    this.afterAuthGoogle = function(message){
			//console.log(message);
			localStorage.setItem('frontosaurToken', message.token);
	        userdata = message.data;
		    var postdata = {
	            mail: userdata.emailAddresses[0].value,
	            name: userdata.names[0].displayName,
	            photo: userdata.photos[0].url,
	            googleid: userdata.resourceName.substring(7)
	        };
	        //console.log(postdata);
	        $.post( "https://frontosaur.com/api/registrationGoogle", postdata, function( data ) {
	          data = JSON.parse(data);
			  if (data.error == 0) {
	            	page.signUpOk(data.token);
	            } else if (data.error == 1) {
	            	page.error("This E-Mail already exists.");
	            } else if (data.error == 12) {
	            	page.error("Please fill all the fields.");
	            } else {
	            	page.error("Unknown error.");
	            }
	            console.log(data);
			});
    }
}

