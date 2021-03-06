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
	    project.getElem('signoutbtn').on("click", function(){ helpers.signOut()});
		project.getElem('addpeople').on("click", function() {
	    	if (project.getElem("addpeoplepopup").css('display') == 'none') {project.getElem("addpeoplepopup").show(); project.getElem("addpeopleinput").focus()}
	    	else project.getElem("addpeoplepopup").hide();
		});
		project.getElem('dots').on("click", function() {
	    	if (project.getElem('ge-settings-popup').css('display') == 'none') {project.getElem('ge-settings-popup').show()}
	    	else project.getElem('ge-settings-popup').hide();
		});
		project.getElem('profile_settings').on("click", function(){ 
			project.sendMsg({
	        	from: "projects",
	        	side: curSide,
	        	text: "openScript",
	        	script: "profile"
			})
		});
    }



    this.removeTemplate = function() {
    	frdom.Empty(window.frontosaur.shadowRoot);
    }

    this.load = function(side, id) {
    	curSide = side;
    	console.log("load");
    	project.loadTemplate(id);
    };

    this.loadTemplate = function(id){
	    var getTemplate = function(){
	    var r = $.Deferred();
	    $.get(chrome.extension.getURL("content_scripts/html/project.html"), function(data) {
            var elem = '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/index.css") +
                '">',
                elem = elem + '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_scripts/css/project.css") +
                '">',
                elem = elem + '<div id="id_frontosaur" class="frontosaur">' + (data + '</div>');
            window.frontosaur.shadowRoot.innerHTML = elem;
            r.resolve();
        });
        return r;
    };
	    getTemplate().done(function(){
		    project.setVars(id);
            project.addEventListeners();
	    })
    };
	this.setVars = function(id){
		chrome.storage.sync.get(['fronto_userinfo'], function(result) {
      		project.getElem('username').html(result.fronto_userinfo.name);
      		project.getElem('userphoto').attr("src", result.fronto_userinfo.img);
        });
        chrome.storage.sync.get(['fronto_token'], function(result) {
        $.post( "https://frontosaur.com/api/project_info", {token: result.fronto_token, id_project: id}, function( data ) {
			          
					})
					.done(function(data) {
						data = JSON.parse(data);
						switch(data.error) {
							case 0: 
								$(function () {
					            	project.getElem('ge-project-name').html(data.info.name);
					            	project.getElem('ge-item-container').html('');
					            	if(data.info.owner_img) {
						            	projects.getElem('project-owner').attr("src", data.info.owner_img);
					            	}
					            	else {
						            	
					            	}
					            	if(data.pages.length==0){
						            	$("<p>There are no pages in this project yet</p>").addClass("ge-empty-alert").appendTo("<div></div>").addClass("ge-empty-item").appendTo(project.getElem('ge-item-container'));
					            	}
						            else project.getElem('ge-item-pages').tmpl(data.pages).appendTo(project.getElem('ge-item-container'));
						            if(data.info.users.length>3){
							         project.getElem('ge-item-people').tmpl(data.info.users.slice(0,2)).appendTo(project.getElem('ge-people'));
							         project.getElem("ge-people").html(project.getElem("ge-people").html()+'<div class="ge-people-item ge-people-amount">'+data.info.users.length-2+'</div>')   
						            }
						            else {
							            project.getElem('ge-item-people').tmpl(data.info.users).appendTo(project.getElem('ge-people'));
						            }
						        });
							break;
							
							case 4:
								project.sendMsg({
						        	from: "project",
						        	side: curSide,
						        	text: "openScript",
						        	script: "auth"
						        });
							break;
							
							case 9:
							break;
						}
					  })
					  .fail(function() {
						  setTimeout(function () {
						  	project.getElem("content").html('<div class="ge-empty-item"><p class="ge-paragraph">500 error, sorry!</p></div>');
						  	}, 500);
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
