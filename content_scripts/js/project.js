var project = new function() {
	var project = this;
	var frdom = window.frontosaur.dom;
	var curSide = "left";
	var token = "";
	var userdata;
	this.messageListener = function(message, sender) {
        var msg = message.text;
        console.log(msg);
        // on active tab:
        if (msg === "open project") project.load(message.side, message.id);
        else if (msg === "close project") project.close();
        
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
		      
		    FB.AppEvents.logprojectView();   
		      
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
    	return $(window.frontosaur.shadowRoot.getElementById(id));
    }

    this.close = function() {
    	project.removeEventListeners();
    	project.removeTemplate();
    }

    this.removeEventListeners = function() {
// 		project.getElem("ge-add-project") && project.getElem("ge-add-project").removeEventListener("click", project.addProject);
		
    }

    this.addEventListeners = function() {
/*
		project.getElem('ge-add-project').on("click", function() {
			console.log(project.getElem('ge-add-project-popup'));
	    	if (project.getElem('ge-add-project-popup').css('display') == 'none') {project.getElem('ge-add-project-popup').show(); project.getElem("popup_input").focus()}
	    	else project.getElem('ge-add-project-popup').hide();
		});
*/
		
    }



    this.removeTemplate = function() {
    	frdom.Empty(window.frontosaur.shadowRoot);
    }

    this.load = function(side, id) {
    	curSide = side;
    	project.loadTemplate(id);
    };

    this.loadTemplate = function(id) {
    	
    	window.frontosaur.ajaxRequest(chrome.extension.getURL("content_scripts/html/project.html"), null, function(data) {
    		try {
	    		var elem = '<link href="https://fonts.googleapis.com/css?family=Catamaran:400,600" rel="stylesheet"><link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/index.css") +
	            '">',
	            elem = elem + '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/project.css") +
	            '">',
	            elem = elem + '<div id="id_frontosaur" class="frontosaur">'+ (data + '</div>');
				window.frontosaur.shadowRoot.innerHTML = elem;
				project.setVars(id);
    		} catch (err)
    		{
	    		console.log(err);
    		}
	    	
		    project.addEventListeners();
	    });
    };
	this.setVars = function(id){
		chrome.storage.sync.get(['fronto_userinfo'], function(result) {
      		project.getElem('username').html(result.fronto_userinfo.name);
      		project.getElem('userphoto').attr("src", result.fronto_userinfo.img);
        });
        chrome.storage.sync.get(['fronto_token'], function(result) {
        $.post( "https://frontosaur.com/api/project_info", {token: result.fronto_token, id_project: id}, function( data ) {
			          data = JSON.parse(data);
					  if (data.error == 0) {
			            	$(function () {
				            	project.getElem('ge-item-container').html('');
					            project.getElem('ge-item-pages').tmpl(data.pages).appendTo(project.getElem('ge-item-container'));
					        });
			            } else if (data.error == 4) {
			            	
			            } 
			            console.log(data);
					});
		});
	}
	
	
	
        this.error = function(message) {
    	project.getElem("id_wrong-data-container").css("display","block");
    	project.getElem("id_wrong-data-text").html(message);
    };

    this.addProject = function() {
	    
			if(project.getElem('popup_input').val() != "") {
				chrome.storage.sync.get(['fronto_token'], function(result) {
					 $.post( "https://frontosaur.com/api/add_project", {token: result.fronto_token, name: project.getElem('popup_input').val()}, function( data ) {
			          data = JSON.parse(data);
					  if (data.error == 0) {
			            	project.sendMsg({
					        	from: "project",
					        	side: curSide,
					        	text: "openScript",
					        	script: "project-details"
					        })
			            } else if (data.error == 4) {
			            	
			            } 
			            console.log(data);
					});
		        });
			}
			else console.log("error");
	
    };
}

