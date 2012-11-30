/*
*   This file is part of the Perspectives Firefox Client
*
*   Copyright (C) 2011 Dan Wendlandt
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, version 3 of the License.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


var Geopki_statusbar = {
	STATE_ERROR : -1,
	STATE_SEC   : 0,
	STATE_NSEC  : 1,
	STATE_NEUT  : 2,
	STATE_QUERY  : 3,

	setStatus: function(uri,state, tooltip){

		if(uri != null && uri != window.gBrowser.currentURI) { 
		//	Pers_debug.d_print("main", "Ignoring setStatus for '" + uri.spec + 
		//	"' because current browser tab is for '" + 
		//	window.gBrowser.currentURI.spec + "'"); 
			return;  
		}

		if(!tooltip){
			tooltip = "GeoPKI";
		}

		var imgList = document.querySelectorAll("image.geopki-status-image-class");

		if(!imgList){ //happens when called from a dialog
			imgList = window.opener.document.
				querySelectorAll("image.geopki-status-image-class");

		}

		for (var j = 0; j < imgList.length; ++j) {
			imgList[j].parentNode.setAttribute("tooltiptext", tooltip); 
			switch(state){
			case Geopki_statusbar.STATE_SEC:
				//Pers_debug.d_print("main", "Secure Status\n");
				Geopki.printDebug("Secure Status");
				imgList[j].setAttribute("src", "chrome://geopki/content/good.png");
				continue;
			case Geopki_statusbar.STATE_NSEC:
				//Pers_debug.d_print("main", "Unsecure Status\n");
				Geopki.printDebug("Unsecure Status");
				imgList[j].setAttribute("src", "chrome://geopki/content/bad.png");
				continue;
			case Geopki_statusbar.STATE_NEUT:
				//Pers_debug.d_print("main", "Neutral Status\n");
				Geopki.printDebug("Neutral Status");
				imgList[j].setAttribute("src", "chrome://geopki/content/default.png");
				continue;
			case Geopki_statusbar.STATE_QUERY:
				//Pers_debug.d_print("main", "Querying Status\n");
				Geopki.printDebug("Querying Status");
				imgList[j].setAttribute("src", "chrome://geopki/content/progress.gif");
				continue;
			case Geopki_statusbar.STATE_ERROR:
				//Pers_debug.d_print("main", "Error Status\n");
				Geopki.printDebug("Error Status");
				imgList[j].setAttribute("src", "chrome://geopki/content/error.png");
				continue;
			}
		}
		//Pers_debug.d_print("main", "changing tooltip to: " + tooltip + "\n"); 
		return true;
	}
}
