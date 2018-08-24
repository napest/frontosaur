var profile = new function() {
	var profile = this;
	var frdom = window.frontosaur.dom;
	var curSide = "left";
	var token = "";
	var userdata;
	this.messageListener = function(message, sender) {
        var msg = message.text;
        if (msg === "open profile") profile.load(message.side);
        if (msg === "close profile") profile.close();
        
    };
    
    chrome.runtime.onMessage.addListener(this.messageListener);
		   
    this.sendMsg = function(msg) {
        chrome.runtime.sendMessage(msg);
    };

    this.getElem = function(id) {
    	return $(window.frontosaur.shadowRoot.getElementById(id));
    }
    
    this.getElements = function(classn) {
    	var elements = $(window.frontosaur.shadowRoot.querySelectorAll(classn));
    	return elements;
    }

    this.close = function() {
    	profile.removeEventListeners();
    	profile.removeTemplate();
    }

    this.removeEventListeners = function() {
// 		profile.getElem("ge-add-project") && profile.getElem("ge-add-project").removeEventListener("click", profile.addProject);
		
    }

    this.addEventListeners = function() {
		profile.getElem('dots').on("click", function() {
	    	if (profile.getElem('ge-settings-popup').css('display') == 'none') {profile.getElem('ge-settings-popup').show()}
	    	else profile.getElem('ge-settings-popup').hide();
		});
		
		profile.getElem('signoutbtn').on("click", function(){ helpers.signOut()});
		
		
    }

    this.removeTemplate = function() {
    	window.frontosaur.shadowRoot.innerHTML = "";
    }

    this.load = function(side) {
    	curSide = side;
    	profile.loadTemplate();
    };
	
    this.loadTemplate = function() {
	    var getTemplate = function(){
	    var r = $.Deferred();
	    $.get(chrome.extension.getURL("content_scripts/html/profile.html"), function(data) {
            var elem = '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/index.css") +
                '">',
                elem = elem + '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/profile.css") +
                '">',
                elem = elem + '<div id="id_frontosaur" class="frontosaur">' + (data + '</div>');
            window.frontosaur.shadowRoot.innerHTML = elem;
            r.resolve();
        });
        return r;
    };
	    getTemplate().done(function(){
		    profile.setVars();
            profile.addEventListeners();
	    })
    };
   
	this.setVars = function(){
		chrome.storage.sync.get(['fronto_userinfo'], function(result) {
      		profile.getElem('username').html(result.fronto_userinfo.name ? result.fronto_userinfo.name : "No name");
      		profile.getElem('userphoto').attr("src", result.fronto_userinfo.img ? result.fronto_userinfo.img : chrome.extension.getURL("content_scripts/img/user.png"));
        });
        chrome.storage.sync.get(['fronto_token'], function(result) {
        $.post( "https://frontosaur.com/api/main_info", {token: result.fronto_token}, function( data ) {
			          data = JSON.parse(data);
					  if (data.error == 0) {
			            	
/*
				            	profile.getElem('ge-item-container').html('');
				            	if((data.invites.length == 0)&&(data.profile[0].length==0)){
									$("<p>You have no active profile</p>").addClass("ge-empty-alert").appendTo("<div></div>").addClass("ge-empty-item").appendTo(profile.getElem('ge-item-container'));
				            	}
				            	else {
					            	 profile.getElem('ge-item-invites').tmpl(data.invites).appendTo(profile.getElem('ge-item-container'));
									 profile.getElem('ge-item-profile').tmpl(data.profile).appendTo(profile.getElem('ge-item-container'));
				            	}
*/
					           
					            
						        //console.log($(window.frontosaur.shadowRoot.getElementById('ge-item-container').querySelectorAll("div.ge-item-name")));
					        
			            } else if (data.error == 4) {
			            	profile.sendMsg({
						        	from: "profile",
						        	text: "openScript",
						        	script: "auth"
						        });
			            } 
					});
		});
	}
	
	
        this.error = function(message) {
    	profile.getElem("id_wrong-data-container").css("display","block");
    	profile.getElem("id_wrong-data-text").html(message);
    };
	
    
}
profile.load("left");
