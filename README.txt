Atom-reader - The free light-weight RSS/Atom news reader 

ABSTRACT

Atom-reader is a  web based RSS/Atom reader written in
Javascript. In this release the GUI front end is fully functional but
a backend is written in Node.js and Firebird.
Backend is to converting RSS/Atom feed subscriptions to Json streams 
http://rssjs.org/ that can be previwed in the Frontend 

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
* List View, Expanded View, Subscription View, Preferences etc.

INSTALLATION TODO: be updated

Step 1.   Unzip this distribution under the web server's DocumentRoot
          hierarchy.

Step 2.   Access the feedread.html via http URL.

Optional. Edit reader/mockapi.js and change the default RSS feeds by
          changing the FRV_feedlist and FRV_feedinfo variables.

TEST CASES

All the testcases can be executed by the command tools/runuitests
(Requires jscoverage in the path)

TODO:

* User login with Oauth 
* Changes to be persistent on backend
          
Initial AUTHORS

* Loic Dachary 
* Chandan Kudige