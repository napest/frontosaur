var projects = new function() {
	var projects = this;
	var frdom = window.frontosaur.dom;
	var curSide = "left";
	var token = "";
	var userdata;
	this.messageListener = function(message, sender) {
        var msg = message.text;
        if (msg === "open projects") projects.load(message.side);
        if (msg === "close projects") projects.close();
        
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
    	projects.removeEventListeners();
    	projects.removeTemplate();
    }

    this.removeEventListeners = function() {
// 		projects.getElem("ge-add-project") && projects.getElem("ge-add-project").removeEventListener("click", projects.addProject);
		
    }

    this.addEventListeners = function() {
		projects.getElem('ge-add-project').on("click", function() {
	    	if (projects.getElem('ge-add-project-popup').css('display') == 'none') {projects.getElem('ge-add-project-popup').show(); projects.getElem("popup_input").focus()}
	    	else projects.getElem('ge-add-project-popup').hide();
		});
		projects.getElem('dots').on("click", function() {
	    	if (projects.getElem('ge-settings-popup').css('display') == 'none') {projects.getElem('ge-settings-popup').show()}
	    	else projects.getElem('ge-settings-popup').hide();
		});
		setTimeout(function () {
		    projects.getElements("div.ge-title").on("click", function(){ projects.openProject($(this).attr("data-id"))});
		  }, 500);
		
		projects.getElem('ge-add-project-popup-btn').on("click", function(){ projects.addProject()});
		projects.getElem('signoutbtn').on("click", function(){ helpers.signOut()});
    }

    this.removeTemplate = function() {
    	window.frontosaur.shadowRoot.innerHTML = "";
    }

    this.load = function(side) {
    	curSide = side;
    	projects.loadTemplate();
    };
	
    this.loadTemplate = function() {
	    var getTemplate = function(){
	    var r = $.Deferred();
	    $.get(chrome.extension.getURL("content_scripts/html/projects.html"), function(data) {
            var elem = '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/index.css") +
                '">',
                elem = elem + '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/projects.css") +
                '">',
                elem = elem + '<div id="id_frontosaur" class="frontosaur">' + (data + '</div>');
            window.frontosaur.shadowRoot.innerHTML = elem;
            r.resolve();
        });
        return r;
    };
	    getTemplate().done(function(){
		    projects.setVars();
            projects.addEventListeners();
	    })
    };
    this.openProject = function(id){
	    projects.sendMsg({
					        	from: "projects",
					        	side: curSide,
					        	text: "openScript",
					        	script: "project",
					        	id: id
					        })
    };
	this.setVars = function(){
		chrome.storage.sync.get(['fronto_userinfo'], function(result) {
      		projects.getElem('username').html(result.fronto_userinfo.name ? result.fronto_userinfo.name : "No name");
      		projects.getElem('userphoto').attr("src", result.fronto_userinfo.img ? result.fronto_userinfo.img : chrome.extension.getURL("content_scripts/img/user.png"));
        });
        chrome.storage.sync.get(['fronto_token'], function(result) {
        $.post( "https://frontosaur.com/api/all_projects", {token: result.fronto_token}, function( data ) {
			          data = JSON.parse(data);
					  if (data.error == 0) {
			            	
				            	projects.getElem('ge-item-container').html('');
				            	if((data.invites.length == 0)&&(data.projects[0].length==0)){
									$("<p>You have no active projects</p>").addClass("ge-empty-alert").appendTo("<div></div>").addClass("ge-empty-item").appendTo(projects.getElem('ge-item-container'));
				            	}
				            	else {
					            	 projects.getElem('ge-item-invites').tmpl(data.invites).appendTo(projects.getElem('ge-item-container'));
									 projects.getElem('ge-item-projects').tmpl(data.projects).appendTo(projects.getElem('ge-item-container'));
				            	}
					           
					            
						        //console.log($(window.frontosaur.shadowRoot.getElementById('ge-item-container').querySelectorAll("div.ge-item-name")));
					        
			            } else if (data.error == 4) {
			            	
			            } 
					});
		});
	}
	
	
        this.error = function(message) {
    	projects.getElem("id_wrong-data-container").css("display","block");
    	projects.getElem("id_wrong-data-text").html(message);
    };
	this.signOut = function() {
		chrome.storage.sync.get(['fronto_token'], function(result) {
					 $.post( "https://frontosaur.com/api/exit", {token: result.fronto_token}, function( data ) {
					  
			          data = JSON.parse(data);
			          
					  if (data.error == 0) {
						    chrome.storage.sync.remove(['fronto_token']);
			            	projects.sendMsg({
					        	from: "projects",
					        	side: curSide,
					        	text: "openScript",
					        	script: "auth"
					        });
					        projects.close();
			            } else if (data.error == 4) {
			            	project.sendMsg({
						        	from: "project",
						        	side: curSide,
						        	text: "openScript",
						        	script: "auth"
						        });
			            } 
			            console.log(data);
					});
		        });
	}
    this.addProject = function() {
	    
			if(projects.getElem('popup_input').val() != "") {
				chrome.storage.sync.get(['fronto_token'], function(result) {
					 $.post( "https://frontosaur.com/api/add_project", {token: result.fronto_token, name: projects.getElem('popup_input').val()}, function( data ) {
			          data = JSON.parse(data);
					  if (data.error == 0) {
			            	projects.sendMsg({
					        	from: "projects",
					        	side: curSide,
					        	text: "openScript",
					        	script: "project"
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
projects.load("left");
