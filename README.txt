Yocto-reader - The free light-weight RSS news reader prototype version 0.2

ABSTRACT

Yocto-reader is a  web based RSS reader written in
Javascript. In this release the GUI front end is fully functional but
a backend will be written at a later date in node.js and firebird. 


KEY FEATURES

* Web 2.0 application
* Keyword based search for news feeds
* Browse and subscribe to feed bundles
* Starring and sharring favourite news items
* Custom tagging and folders 
* Tracking of read items
* Loading huge amount of news items in background
* Uses Google feed reader API
* List View, Expanded View, Subscription View, Preferences etc.

INSTALLATION

Step 1.   Unzip this distribution under the web server's DocumentRoot
          hierarchy.

Step 2.   Access the feedread.html via http URL.

Optional. Edit reader/mockapi.js and change the default RSS feeds by
          changing the FRV_feedlist and FRV_feedinfo variables.

TEST CASES

All the testcases can be executed by the command tools/runuitests
(Requires jscoverage in the path)

LIMITATIONS OF THE PROTOTYPE

* No user login 
* Changes are not persistent as it lacks a backend
          
Initial AUTHORS

* Loic Dachary 
* Chandan Kudige




