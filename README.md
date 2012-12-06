GeoPKI-Firefox-Plugin
=====================

This is an implementation of the GeoPKI system for the Firefox Browser (plugin).

GeoPKI publication: https://sparrow.ece.cmu.edu/group/pub/kim_gligor_perrig_GeoPKI.pdf

To import the plugin into Firefox, simply drag the "GeoPKI.xpi" file into the open browser window and restart the browser.

You will see a logo appear to the left of the address bar. The states of the plugin are:
Green: the website you are visiting is presenting a certificate which is loaded into the GeoPKI server and your current location is within the boundaries of the certificate
Yellow: the plugin is experiencing problems in contacing the GeoPKI server; check the GeoPKI Preferences in the Firefox Add-on screen to ensure the GeoPKI server is set up properly
Red: the website you are visiting is presenting a certificate that contains a location outside of your current position; or the certificate is not part of GeoPKI
Earth globe: the website you are visiting is not presenting any certificate