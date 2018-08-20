var frontosaur = new function() {
	var fr = this;
	var hostElement;
    var shadowRoot;
    var state = 0;
    var isopen = {
	    "auth": 0,
	    "projects": 0,
	    "project": 0
    }

    this.messageListener = function(message, sender) {
        var msg = message.text;
        // on active tab:
        if (msg === "togglePanel") fr.panelToggle();
        if (msg === "createPanel") fr.panelCreate();
    };

    chrome.runtime.onMessage.addListener(this.messageListener);

    this.sendMsg = function(msg) {
        chrome.runtime.sendMessage(msg);
    };
    

    this.templatePaths = {
        "login": "/content_scripts/html/login.html",
        "register": "/content_scripts/html/register.html"
    };

    this.getUrl = function(template) {
        return chrome.extension.getURL(fr.templatePaths[template]);
    };

    this.panelToggle = function() {
        fr.panelVisible() ? fr.panelOff() : fr.panelOn();
    };

    this.panelVisible = function() {
        return $("#id_frontoHost").is(":visible");
    };

    this.panelOff = function() {
		$("#id_frontoHost").hide();
    };
    
    this.panelOn = function(){
	    $("#id_frontoHost").show();
    }

    this.panelCreate = function() {
        document.body.innerHTML+= '<link href="https://fonts.googleapis.com/css?family=Catamaran:400,600|Istok+Web|Montserrat:700|Open+Sans:400,600,700&amp;subset=cyrillic" rel="stylesheet">';
        if($("#id_frontoHost").length){
	        $("#id_frontoHost").remove();
        }
        
	        fr.hostElement = frdom.Create("div", "", {
            id: "id_frontoHost",
            "class": "fronto-host"
        });
        fr.shadowRoot = fr.hostElement.attachShadow({
            mode: "open"
        });
        frdom.Append(document.body, fr.hostElement);
        
    };

    this.checkAuth = function() {
        var postdata = {
            token: 'getoken'
        };
        fr.ajaxRequest("https://frontosaur.com/api/main_info", postdata, function(data) {
            return data["error"] ? 0 : 1;
        });
    };


    this.dom = function(a) {
    	return fr.hostElement.shadowRoot.querySelector("#" + a)
    };
	var frdom = fr.dom;
    this.dom.Create = function(tag, innerHtml, attrs) {
        var elem = document.createElement(tag);
        elem.innerHTML = innerHtml;
        attrs && this.Attrs(elem, attrs);
        return elem;
    };
    this.dom.Attrs = function(elem, attrs) {
        for (var i in attrs) elem.setAttribute(i, attrs[i]);
        return elem;
    };
    this.dom.Append = function(elem, child) {
        elem.appendChild(child);
        return child;
    };
    this.dom.Empty = function(elem) {
        elem.innerHTML = "";
        return elem;
    };
    this.dom.Remove = function(elem) {
        elem.parentElement.removeChild(elem)
    }
};

frontosaur.sendMsg({
    from: "frontosaur",
    text: "frLoaded"
});
