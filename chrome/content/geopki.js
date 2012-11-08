/*
*   This file is part of the Geopki Firefox Client
*
*   This is beerware.  If you like it, get us a beer :-)
*/

var Geopki = {
	
	// Updates the status of the current page 
	updateStatus: function(win, is_forced){
		Geopki.printDebug("updateStatus called");
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
	}

}