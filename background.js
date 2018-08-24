var curScript = "projects",
	curId = "",
    curSide = "left",
    recentRunAt = "document_idle",
    scriptNames = [
        "auth"
    ]
    isopen = {
	    "auth": 0,
	    "projects": 0,
	    "project": 0
    }

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onMessage.addListener(messageListener);
chrome.browserAction.onClicked.addListener(onBrowserAction);
chrome.tabs.onUpdated.addListener(onTabStatusUpdated);

function onTabStatusUpdated(tabId, changeInfo, tab) {
    isopen = {
	    "auth": 0,
	    "projects": 0,
	    "project": 0
    }
}

function onInstalled() {
/*
    chrome.tabs.create({
        url: chrome.extension.getURL('content_scripts/html/startpage.html')
    });
*/
}

function messageListener(message, sender) {
    var msg = message.text;
    if (msg === "open 0") loadPageScript();
    else if (msg === "open 1") togglePagePanel();
    else if (msg === "frLoaded") createPagePanel();
    else if (msg === "authGoogle") authGoogle();
    else if (msg === "authFacebook") authFacebook();
    else if (msg === "openScript") {
        curScript = message.script;
        curSide = message.side;
        curId = message.id;
        closeScript(message.from);
        openScript()
    }
}

function onBrowserAction() {
	
    chrome.tabs.executeScript({
        code: "chrome.runtime.sendMessage({text:'open '+(window.frontosaur? 1:0)});",
        runAt: recentRunAt
    })
}


function closeScript(script) {
    postMsg({
        from: "bg",
        text: "close " + script
    });
}

function openScript() {
	console.log(isopen);
	if(isopen[curScript]==0) {
		chrome.tabs.executeScript({
	        file: "content_scripts/js/" + curScript + ".js",
	        runAt: recentRunAt
	    });
	    isopen[curScript] = 1;
	}
    setTimeout(function(){
	    postMsg({
        from: "bg",
        text: "open " + curScript,
        id: curId,
        side: curSide
    });
    }, 500);
    
    
}


function loadPageScript() {
    // on active tab:
    chrome.tabs.executeScript({
        file: "content_scripts/js/helpers.js",
        runAt: recentRunAt
    });
    chrome.tabs.executeScript({
        file: "content_scripts/js/jquery.js",
        runAt: recentRunAt
    });
    
    chrome.tabs.executeScript({
        file: "content_scripts/js/frontosaur.js",
        runAt: recentRunAt
    });
    
    chrome.tabs.executeScript({
        file: "content_scripts/js/MD5.js",
        runAt: recentRunAt
    });
    chrome.tabs.executeScript({
        file: "content_scripts/js/jquery.tmpl.min.js",
        runAt: recentRunAt
    });
}
function createPagePanel() {
    postMsg({
        text: "createPanel"
    });
    openScript();
}


function togglePagePanel() {
    postMsg({
        text: "togglePanel"
    });
}
function authFacebook(){
		var redirectUri = 'https://' + chrome.runtime.id +
                      '.chromiumapp.org/provider_cb';
		var redirectRe = new RegExp(redirectUri + '[#\?](.*)');
		access_token = null;
		 function parseRedirectFragment(fragment) {
          var pairs = fragment.split(/&/);
          var values = {};

          pairs.forEach(function(pair) {
            var nameval = pair.split(/=/);
            values[nameval[0]] = nameval[1];
          });

          return values;
        }
        function handleProviderResponse(values) {
          if (values.hasOwnProperty('access_token'))
            setAccessToken(values.access_token);
          else if (values.hasOwnProperty('code'))
            exchangeCodeForToken(values.code);
          else callback(new Error('Neither access_token nor code avialable.'));
        }
        function exchangeCodeForToken(code) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET',
                   'https://www.facebook.com/dialog/oauth?'+
                   //'https://graph.facebook.com/oauth/access_token?' +
                   'client_id=400056927186702'+
                   '&client_secret=c25cd1d277509933f84b0a58fc575bbb' +
                   '&redirect_uri=' + redirectUri +
                   '&code=' + code);
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.onload = function () {
            if (this.status === 200) {
              var response = JSON.parse('"'+this.responseText+'"');
              response = response.substring(0,response.indexOf('&'));
              setAccessToken(response);
              access_token = response;
            }
          };
          xhr.send();
        }

        function setAccessToken(token) {
          access_token = token;
          
          getuserinfo(token);
        }
        function getuserinfo(token) {
	        var xhr = new XMLHttpRequest();
	        console.log(token);
	          xhr.open('GET',
	                   'https://graph.facebook.com/me?fields=name,picture,email&access_token='+token);
	          xhr.setRequestHeader('Content-Type', 'application/json');
	          xhr.onload = function () {
	            if (this.status === 200) {
		            console.log(response);console.log(this.responseText);
	              var response = JSON.parse(this.responseText);
	              
	              
	              postMsg({
			        token: token,
			        type: "facebook",
			        data: response
			    });
	            }
	          };
          xhr.send();
        }
		chrome.identity.launchWebAuthFlow({'url': 'https://www.facebook.com/dialog/oauth?client_id=400056927186702&redirect_uri=https://inkobepdpephejfifiapofeioijpdcmj.chromiumapp.org/provider_cb&scopes=public_profile,email&response_type=token&state={"{st=state123a,ds=123456789}"}', 'interactive': true},
		
		function(redirectUri) { 
		    var matches = redirectUri.match(redirectRe);
          if (matches && matches.length > 1)
            handleProviderResponse(parseRedirectFragment(matches[1]));
          else
            callback(new Error('Invalid redirect URI'));
		   
		});
}


function authGoogle(){


	chrome.identity.getAuthToken({interactive: true}, function(token) {
        let init = {
          method: 'GET',
          async: true,
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          'contentType': 'json'
        };
        fetch(
            'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos&key=AIzaSyCslzkZV5CtgMBJrsuObnsC4_gwi_HJzc4',
            init)
            .then((response) => response.json())
            .then(function(data) {
              postMsg({
		        token: token,
		        data: data
		    });
            });
      });
}

function postMsg(message) {
    // on active tab:
    chrome.tabs.query({
            currentWindow: true,
            active: true
        },
        function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, message)
        }
    );
}