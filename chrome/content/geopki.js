/*
*   This file is part of the Geopki Firefox Client
*
*   This is beerware.  If you like it, get us a beer :-)
*/

var Geopki = {
	
	// Updates the status of the current page 
	updateStatus: function(win, is_forced){
		console.log("updateStatus called");
		alert("updateStatus Called");
	},
	
	geopkiListener: {
		onSecurityChange:    function() {
       	/*		var uri = null;
       			try{
         			uri = window.gBrowser.currentURI;
         			Pers_debug.d_print("main", "Security change " + uri.spec + "\n");
         			Perspectives.updateStatus(window,false);
       			} catch(err){
         			Pers_debug.d_print("error", "Perspectives had an internal exception: " + err);
         			if(uri) {
          				Pers_statusbar.setStatus(uri, Pers_statusbar.STATE_ERROR, 
						"Perspectives: an internal security change error occurred: " + err); //TODO: localize
         			}
       			}
 
  		}*/ 
		console.log("onSecurityChange called"); // DEBUG MESSAGE
		alert("onSecurityChange Called");
		Geopki.updateStatus(window,false);
		}
	},
	
	initGeopki: function() {
		console.log("initGeopki Called"); // DEBUG MESSAGE
		alert("initGeopki Called");
		getBrowser().addProgressListener(Geopki.geopkiListener, Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
	}
	
}