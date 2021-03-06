/*
*   This file is part of the Geopki Firefox Client
*
*   This is beerware.  If you like it, get us a beer :-)
*/

//Get user permission to use geolocation
function prompt(window, pref, message, callback) {
    let branch = Components.classes["@mozilla.org/preferences-service;1"]
                           .getService(Components.interfaces.nsIPrefBranch);
 
    if (branch.getPrefType(pref) === branch.PREF_STRING) {
        switch (branch.getCharPref(pref)) {
        case "always":
            return callback(true);
        case "never":
            return callback(false);
        }
    }
 
    let done = false;
 
    function remember(value, result) {
        return function() {
            done = true;
            branch.setCharPref(pref, value);
            callback(result);
        }
    }
 
    let self = window.PopupNotifications.show(
        window.gBrowser.selectedBrowser,
        "geolocation",
        message,
        "geo-notification-icon",
        {
            label: "Share Location",
            accessKey: "S",
            callback: function(notification) {
                done = true;
                callback(true);
            }
        }, [
            {
                label: "Always Share",
                accessKey: "A",
                callback: remember("always", true)
            },
            {
                label: "Never Share",
                accessKey: "N",
                callback: remember("never", false)
            }
        ], {
            eventCallback: function(event) {
                if (event === "dismissed") {
                    if (!done) callback(false);
                    done = true;
                    window.PopupNotifications.remove(self);
                }
            },
            persistWhileVisible: true
        });
}

var Geopki = {
	
	// Updates the status of the current page 
	updateStatus: function(win, is_forced){
		Geopki.printDebug("updateStatus called");

		var ti = Geopki.getCurrentTabInfo(win);
		
		/*if(ti.uri.scheme != "https"){
			var text = Perspectives.strbundle.
				getFormattedString("nonHTTPSError", [ ti.uri.host, ti.uri.scheme ]);
			Pers_statusbar.setStatus(ti.uri, Pers_statusbar.STATE_NEUT, text); 
			ti.reason_str = text;
			return;
		}*/
		
		Geopki_statusbar.setStatus(ti.uri,Geopki_statusbar.STATE_NEUT, null); 

		ti.cert = Geopki.getCertificate(ti.browser);
		Geopki.printDebug("Certificate Common Name: " + ti.cert.commonName);

		// Print the SHA-1 Fingerprint of the Certificate object
		var certFingerprint = ti.cert.sha1Fingerprint;
		Geopki.printDebug("Certificate SHA1 Fingerprint: " + certFingerprint);

		// Make XHR to retrieve info from the GeoPKI server

		// Obtain URL of the GeoPKI server from the extenstion properties
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

		//Get geolocation data.
		Geopki.printDebug("Calling Prompt.");
		prompt(window,
		       "extensions.geopki.allowGeolocation",
		       "GeoPKI needs to know your location to help assure your connection is secure.",
		       function callback(allowed) { });
		Geopki.printDebug("Calling GeoLocation");
		//Get actual location here!
		if("geolocation" in navigator) {
			Geopki.printDebug("geolocation is in navigator.");
			//get geolocation
			var geolocation = Components.classes["@mozilla.org/geolocation;1"].getService(Components.interfaces.nsIDOMGeoGeolocation);

		 	geolocation.getCurrentPosition(function(position) {
		    Geopki.printDebug("Coordinates:" + position.coords.latitude + " / " + position.coords.longitude);
		  	Geopki.printDebug("Altitude: " + position.coords.altitude);

		  	var lat = position.coords.latitude;
			var lon = position.coords.longitude;
			var alt = position.coords.altitude;
			Geopki.printDebug("Geo Variables Assigned.");
		
			var geoPKIServerUrl = prefs.getComplexValue("geopki.server-url", Components.interfaces.nsISupportsString).data;
			geoPKIServerUrl = geoPKIServerUrl + "?lat=" + lat + "&lon=" +  lon + "&alt=" + alt; 

			var req  = XMLHttpRequest();
			//var url = "http://www.google.com";
			req.open("GET", geoPKIServerUrl, true);
			req.onreadystatechange = (function(evt) { 
				var response = req.responseText; 
				
				Geopki.printDebug("Response: " + response);
				Geopki.printDebug("Response status: " + req.status);
			
				if (req.status == "404"){
					Geopki_statusbar.setStatus(ti.uri,Geopki_statusbar.STATE_ERROR, "GeoPKI: Error"); 
				} else if (response == 'null') {
					Geopki_statusbar.setStatus(ti.uri,Geopki_statusbar.STATE_NSEC, "GeoPKI: Not Secure"); 
				}
				// call the validation method if the response was successfull
				else {
					var isValid = Geopki.validateNode(response, certFingerprint);
					if (isValid) {
						Geopki_statusbar.setStatus(ti.uri,Geopki_statusbar.STATE_SEC, "GeoPKI: Secure"); 
					} else {
						Geopki_statusbar.setStatus(ti.uri,Geopki_statusbar.STATE_NSEC, "GeoPKI: Not Secure"); 
					}
					Geopki.printDebug("Certificate valid?: " + isValid);	
				}
				
			}); 
			req.send(null);
		}); //Close geolocation.getCurrentPosition(function(position)
		}
	},

	buildBase64DER: function(chars){
    	var result = "";
    	for (i=0; i < chars.length; i++)
        	result += String.fromCharCode(chars[i]);
    	return btoa(result);
	},
	
	get_invalid_cert_SSLStatus: function(uri){
		var recentCertsSvc = 
		Components.classes["@mozilla.org/security/recentbadcerts;1"]
			.getService(Components.interfaces.nsIRecentBadCertsService);
		if (!recentCertsSvc)
			return null;

		var port = (uri.port == -1) ? 443 : uri.port;  

		var hostWithPort = uri.host + ":" + port;
		var gSSLStatus = recentCertsSvc.getRecentBadCert(hostWithPort);
		if (!gSSLStatus)
			return null;
		return gSSLStatus;
	},

	// gets current certificate, if it FAILED the security check 
	psv_get_invalid_cert: function(uri) { 
		var gSSLStatus = Geopki.get_invalid_cert_SSLStatus(uri);
		if(!gSSLStatus){
			return null;
		}
		return gSSLStatus.QueryInterface(Components.interfaces.nsISSLStatus)
				.serverCert;
	}, 

	// gets current certificate, if it PASSED the browser check 
	psv_get_valid_cert: function(ui) { 
		try { 
			ui.QueryInterface(Components.interfaces.nsISSLStatusProvider); 
			if(!ui.SSLStatus) 
				return null; 
			return ui.SSLStatus.serverCert; 
		}
		catch (e) {
			Geopki.printDebug("GeoPKI Error: " + e); 
			return null;
		}
	}, 
	
	getCertificate: function(browser){
		var uri = browser.currentURI;
		var ui  = browser.securityUI;
		var cert = this.psv_get_valid_cert(ui);
		if(!cert){
			cert = this.psv_get_invalid_cert(uri);  
		}

		if(!cert) {
			return null;
		}
		return cert;
	},
	
	geopkiListener: {
		onSecurityChange:    function() {
			Geopki.printDebug("onSecurityChange called"); // DEBUG MESSAGE
			Geopki.updateStatus(window,false);
		}
	},
	
	initGeopki: function() {
		Geopki.printDebug("initGeopki Called"); // DEBUG MESSAGE
		getBrowser().addProgressListener(Geopki.geopkiListener, Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
	},
	
	tab_info_cache : {},
	
	getCurrentTabInfo : function(win) { 
		var uri = win.gBrowser.currentURI; 
		var port = (uri.port == -1) ? 443 : uri.port;  
		var service_id = uri.host + ":" + port + ",2"; 

		var ti = Geopki.tab_info_cache[service_id]; 
		if(!ti) {
			ti = {};
			// defaults 
			ti.firstLook = true; 
			ti.override_used = false;
			ti.has_user_permission = false; 
			ti.last_banner_type = null; 
			Geopki.tab_info_cache[service_id] = ti; 
		}
		ti.uri = uri;
		ti.host = uri.host; 
		ti.service_id = service_id; 
		ti.browser = win.gBrowser; 
		ti.reason_str = "";
		return ti; 
	},

	printDebug: function(message)
	{
		try{
			Firebug.Console.log("GeoPKI: " + message);
		}
		catch(e){}

		try{
			console.log("GeoPKI: "+ message);
		}
		catch(e){}
	},

	// Method that validates if a node is legitimate given the array response returned by the server
	// params:
	// GeoPKIResponse -> array with intermediate and root hashes, returned by the GeoPKI server
	// certFingerprint -> fingerprint of the certificate that we want to validate
	validateNode: function(GeoPKIResponse, certFingerprint)
	{
		// initial hash is the hash of the certificate that we are trying to validate
		var hash = certFingerprint.replace(/:/g,'').toLowerCase();
		var leftHash;
		var rightHash;
		var rootHash;
		var isValid = false;

		var GeoPKIResponse = JSON.parse(GeoPKIResponse);
		for (var i = 0; i < GeoPKIResponse.length; i+=2){
			if(GeoPKIResponse[i+1] == 'rchild'){
				leftHash = hash;
				rightHash = GeoPKIResponse[i];
				hash = CryptoJS.SHA1(leftHash + rightHash);
			} else if (GeoPKIResponse[i+1] == 'lchild'){
				leftHash = GeoPKIResponse[i];
				rightHash = hash;
				hash = CryptoJS.SHA1(leftHash + rightHash);
			} else if (GeoPKIResponse[i+1] == 'root'){
				rootHash = GeoPKIResponse[i]; 
			}
		}

		if (rootHash == hash) {
			isValid = true;
		} 
		return isValid;
	}
}