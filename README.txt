Yocto-reader - The free light-weight RSS news reader prototype version 0.2

ABSTRACT

Yocto-reader is a  web based RSS/Atom reader written in
Javascript. In this release the GUI front end is fully functional but
a backend will be written at a later date in Node.js and Firebird.
The plan for Backend is to convert RSS/Atom feed to a Json stream http://rssjs.org/ that can be previwed in 
the Frontend 

Conversion tools for node
https://npmjs.org/package/rsj

KEY FEATURES

* Web 3.0 application
* Keyword based search for news feeds
* Browse and subscribe to feed bundles
* Starring and sharring favourite news items
* Custom tagging and folders 
* Tracking of read items
* Loading huge amount of news items in background
* Uses Google feed reader API
* List View, Expanded View, Subscription View, Preferences etc.

INSTALLATION To be updated

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
