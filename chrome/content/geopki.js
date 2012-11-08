/*
*   This file is part of the Geopki Firefox Client
*
*   This is beerware.  If you like it, get us a beer :-)
*/

var Geopki = {
	
	// Updates the status of the current page 
	updateStatus: function(win, is_forced){

		Firebug.Console.log("Update Status Called");
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
		console.log("A thing is happeneing Called"); // DEBUG MESSAGE
		Firebug.Console.log("onSecurityChange Called"); // DEBUG MESSAGE
		Geopki.updateStatus(window,false);
		//Firebug.Console.log("Geopki.updateStatus Called"); // DEBUG MESSAGE
		

	}
	
	initGeopki: function() {
		Firebug.Console.log("initGeopki Called"); // DEBUG MESSAGE
		getBrowser().addProgressListener(Geopki.geopkiListener, 
		Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
	}
	
}