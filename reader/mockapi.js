/*
 *    yocto-reader - A light-weight RSS reader aggregator prototype, version 0.2
 *                   (http://yocto-reader.flouzo.net/)
 *
 *    Copyright (C) 2007 Loic Dachary (loic@dachary.org) 
 *    Copyright (C) 2007 Chandan Kudige (chandan@nospam.kudige.com)
 *    Copyright (C) 2008 Bradley M. Kuhn <bkuhn@ebb.org>
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*======================================================= 
 *
 * DB Cache Variables 
 *
 * All DB access is expected to be cached in these
 * variables, and the application accesses the cache
 * when calling the FR_* APIs
 *
 * APIs which modify the DB should update the cache immediately and
 * return.
 * The actual DB update should happen in background, hopefully
 * with a request queue.
 *
 *=======================================================*/

/* Login Info:
 * Details for the user logged in
 */
var FRV_logininfo;

/* Unique url for user's shared items */
var FRV_shareurl;

/* This is a list of all subscribed feeds */
var FRV_feedlist;

/* Internal to mock apis */
var FRV_feedinfo;

/* This is a hash keyed on feed url, value contains the title.
 * This is used for speeding up the UI
 */
var FRV_feedhash;

/*
 * Hashtable keyed on tagnames, and the values are arrays of
 * itemids.
 * itemid = feedurl + '::' + item publish timestamp
 */
var FRV_tagHash;

/* This dict stores the time stamp at which each item was tagged/branded
 * a particular tag
 */
var FRV_tagTime;

/*
 * Generalized list of item-level operations. Currently only
 * 'Starred' and 'Shared' items are provided. Please see the 
 * note in FR_init() for format of this structure.
 */
var FRV_brands;

/*
 * Hash table keyed on feed urls, and value is the foldername
 * (if that feed is filed under any folder).
 */
var FRV_folderHash;

/*
 * Hash table keyed on property name and values are property values.
 * The DB should support storing whatever properties are passed
 * by the application and retreive them back when requested.
 */  
var FRV_properties;

/*
 * List of items to be displayed when user 'browses' feeds.
 * - Format yet to be specified -
 */
var FRV_browseFeeds;

/*
 * Reading stats for the 'trends' display
 */
var FRV_trends;

/* Item status such as Starred, Shared and Read are stored as
 * special tags in FRV_tagHash. The special names of the special tags
 * start with this prefix 
 */
var FRC_brandPrefix = '_';

/*
 * Safe string to join item components to create an itemid
 */
var FRC_joinstring = ':@@:';

/*
 * Property Prefixes:
 * We use FR_get/setProperty for storing a lot of state information.
 * Here are the prefixes used
 */
var FRP_FOLDER_STATE = 'folder-state-';
var FRP_FOLDER_SHARE = 'folder-share-';
var FRP_BUNDLE_STATE = 'bundle-state-';

/* This property determines the time for which an item should be open
 * before its marked read
 */
var FRP_ITEM_READ_TIMEOUT = 'iv-read-timeout';
var FRP_REVERT            = 'PrefsRevertFlag';
var FRP_START_PAGE        = 'StartPage';
var FRP_SCROLL_TRACKING   = 'ScrollTracking';
var FRP_EXPANDED_VIEW     = 'ExpandedView';
var FRU_devBlog = "http://example.com/devBlog";
var FRU_tips = "http://example.com/tips";

var FRV_tips = [
{title: "Tip1",
 content: "This is tip 1. This is tip 1. This is tip 1. This is tip 1. This is tip 1. This is tip 1. "
},

{title: "Tip2",
 content: "This is tip 2. This is tip 2. This is tip 2. This is tip 2. This is tip 2. This is tip 2. This is tip 2. "
},

{title: "Tip3",
 content: "This is tip 3.This is tip 3.This is tip 3.This is tip 3.This is tip 3.This is tip 3."
},

{title: "Tip4",
 content: "This is tip 4. This is tip 4. This is tip 4. This is tip 4. This is tip 4. This is tip 4. This is tip 4. This is tip 4. "
}];


/*======================================================= 
 *
 * DB APIs  
 *
 *=======================================================*/

/*
 * FR_init(callback)
 *
 * This should be called upon page load, and callback should be the application
 * entry point.
 *
 * In real version, this call loads data from the server via REST and invoke
 * the callback function. In mock version, it simply loads variables with
 * static info and invokes the callback on a timer. 
 */ 
function FR_init(onLoadCallback) {
    FRV_logininfo = {'id': 'dummy@gmail.com',
                     'lastlogin': '0',
                     'name': "Big Dummy"};
                     
    FRV_shareurl  = "http://www.example.com/user/reader/12345432";

    FRV_feedlist = [
        'http://rss.cnn.com/rss/cnn_topstories.rss', // TEST_FEED3
        'http://www.comedycentral.com/rss/colbertvideos.jhtml',
        'http://esperanto-usa.org/eusa/?q=node/feed',
        'http://rss.slashdot.org/Slashdot/slashdot',
        'http://www.quotationspage.com/data/qotd.rss',
        'http://technosophyunlimited.blogspot.com/atom.xml', // TEST_FEED4
        'http://www.theonion.com/content/feeds/daily', // TEST_FEED5
        'http://vitativeness.blogspot.com/feeds/posts/default',
        ];

    FRV_feedinfo = [
         {title:'CNN.com',
          feed:'http://rss.cnn.com/rss/cnn_topstories.rss',
          lastupdated: '9/16/07',
          unread : 5}, // TEST_FEED3
         {title:'Colbert Report Videos',
          feed:'http://www.comedycentral.com/rss/colbertvideos.jhtml',
          lastupdated: '9/13/07',
          unread : 6},
         {title:'Esperanto-USA',
          feed:'http://esperanto-usa.org/eusa/?q=node/feed',
          lastupdated: '9/14/07',
          unread : 7},
         {title:'Slashdot',
          feed:'http://rss.slashdot.org/Slashdot/slashdot',
          lastupdated: '9/15/07',
          unread : 8},
         {title:'Quotes of the day',
          feed:'http://www.quotationspage.com/data/qotd.rss',
          lastupdated: '8/30/07',
          unread : 9},
         {title:'Technosophy Unlimited',
          feed:'http://technosophyunlimited.blogspot.com/atom.xml',
          lastupdated: '6/27/07',
          unread : 10}, // TEST_FEED4
         {title:'The Onion',
          feed:'http://www.theonion.com/content/feeds/daily',
          lastupdated: '9/16/07',
          unread : 0},
         {title:'Vitativeness',
          feed:'http://vitativeness.blogspot.com/feeds/posts/default',
          lastupdated: '6/28/07',
          unread : 0}
    ];

    // These items are for testing only
    FRV_tagHash = {
        'tag1' : ['item1', 'item2', 'item3'],
        'tag2' : ['item2', 'item4', 'item5'],
        'tag3' : ['item3'],
        'tag4' : [],
        'tag5' : ['item3', 'item1'],
        '_starred' : ['item3', 'item1'],
        '_shared' : ['item4', 'item5'],
        '_read' : ['item3', 'item5']
    };

    FRV_tagTime = {
    };

/*
 * Currently google has two brandings - Starred and Shared.
 * In our reader this is extended to any number of brandings.
 */
    FRV_brands = [{display: 'Starred items', 
                   brand: 'starred', 
                   icon: 'icon-starred.png'},
    {display: 'Shared items',  
     brand: 'shared',  
     icon: 'icon-shared.png'}];

    FRV_folderHash = {
    'http://rss.cnn.com/rss/cnn_topstories.rss':['news'],
    'http://www.comedycentral.com/rss/colbertvideos.jhtml':['comedy'],
//    'http://esperanto-usa.org/eusa/?q=node/feed':['language'],
    'http://rss.slashdot.org/Slashdot/slashdot':['news'],
    'http://www.quotationspage.com/data/qotd.rss':['language'],
    'http://technosophyunlimited.blogspot.com/atom.xml':['technology']
                    };
    FRV_properties = {};
    FRV_browseFeeds = FRV_googleBundles;
    FRV_trends = FRV_sampleTrends;
    FRV_feedhash = {};
    
    FRI_feedInit(FRV_feedinfo);

    /* --------------
     * Simulate database loading by invoking the callback
     * with a small delay.
     *--------------*/
    if (onLoadCallback && typeof onLoadCallback == 'function') {
            onLoadCallback();
        }
}

/*
 * FR_loginInfo:
 *
 * Input
 *   none
 *
 *
 * Output
 *   Object with fields =
 *    id : Login ID
 *    name: full name
 *    lastlogin: timestamp of last login
 */

function FR_loginInfo() {
    return FRV_logininfo;
}

/*
 * FR_getShareURL:
 *
 * Input
 *   none
 *
 *
 * Output
 *   Full URL to the publicly accessible shared items
 */ 
function FR_getShareURL() {
    return FRV_shareurl;
}

/*
 * FR_feedInfo
 *
 * Input 
 *  feed : URL for the feed
 *
 * Output
 *  Object with fields -
 *   feed :  Url for this feed
 *   title : Display text for the feed
 *   unread : Number of items in this feed that the user has not read
 *   lastupdated : UNIX timestamp when the feed was last updated
 *                 from the server perspective.
 */
function FR_feedInfo(feed) {
    return FRV_feedhash[feed];
}

/*
 * FR_allFeeds - List all subscribed feeds
 * 
 * Input
 *  None
 *
 * Output
 *  Array of all subscribed feed URLs
 */
function FR_allFeeds() {
    return FRV_feedlist;
}

/*
 * FR_browseFeeds -  Browse available feed bundles
 * 
 * Input
 *  None
 *
 * Output
 *  Array of all available feed bundles
 *  See the structure of FRV_browseFeeds for return format
 */
function FR_browseFeeds() {
    return FRV_browseFeeds;
}

/*
 * FR_addFeed - Subscribe to a new feed
 *   (modifies DB)
 *
 * Input
 *  Feed URL
 *
 * Output
 *  None
 */
function FR_addFeed(feed) {
    $.merge(FRV_feedlist, [feed])
}

/*
 * FR_removeFeed - Unsubscribe an existing feed
 *   (modifies DB)
 *
 * Input
 *  Feed URL
 *
 * Output
 *  None
 */
function FR_removeFeed(feed) {
    FRV_folderHash[feed] = undefined;
    FRV_feedlist = $.grep(FRV_feedlist, function(f, i) {
                              return feed != f;});
}

/*
 * FR_isFeedSubscribed - Check if a feed URL has been subscribed
 *
 * Input
 *  Feed URL
 *
 * Output
 *  true  : Feed has already been subscribed to
 *  false : Feed has not been subscribed to
 */
function FR_isFeedSubscribed(feed) {
    return ($.indexOf(FRV_feedlist,feed) >= 0);
}

/*
 * FR_allTags - List all tags for the user
 *
 * Input
 *  None
 *
 * Output
 *  Array of unique tagnames
 */
function FR_allTags() {
    return $.grep($.keys(FRV_tagHash), function(t) {
                      return t.match(/^[^_]/);});
}

/*
 * FR_tagItem - Add a given tag to a given item
 * (modifies DB)
 *
 * Input
 *  itemid : Item to be tagged
 *  tag    : tag name (new or existing)
 *
 * Output
 *  None
 */
function FR_tagItem(itemid, tag) {
    var d = new Date();

    // update the tag time
    FRV_tagTime[itemid + FRC_joinstring + tag] = d.getTime();
 
    FRI_AddToList(FRV_tagHash, tag, itemid);
}

/*
 * FR_untagItem - Removes a given tag from a given item
 * (modifies DB)
 *
 * Input
 *  itemid : Item to be tagged
 *  tag    : tag name to be removed
 *
 * Output
 *  None
 */
function FR_untagItem(itemid, tag) {
    // update the tag time
    FRV_tagTime[itemid + FRC_joinstring + tag] = undefined;

    FRI_RemoveFromList(FRV_tagHash, tag, itemid);
    if (FRV_tagHash[tag].length == 0) {
        FRV_tagHash[tag] = undefined;
    }
}

/*
 * FR_untagAllForItem - Removes all user tags from a given item
 * (modifies DB)
 *
 * Input
 *  itemid : Item to be untagged
 *
 * Output
 *  None
 */
function FR_untagAllForItem(itemid) {
    $.each(FR_allTags(itemid), function(i, tag) {
               FR_untagItem(itemid, tag);
           });
}

/*
 * Internal to mock api
 */
function FRI_tagsLookup(itemid) {
    var alltags = $.keys(FRV_tagHash);
    var tags = [];

    return $.grep(alltags, function(tag, i) {
                      return ($.indexOf(FRV_tagHash[tag],itemid) >= 0);
                  });

}

/*
 * FR_tagsForItem - List tags for a given item
 *
 * Input
 *  itemid : Item to be tagged
 *
 * Output
 *  Array of tag names
 */
function FR_tagsForItem(itemid) {
    var tags = FRI_tagsLookup(itemid);
    return $.grep(tags, function(t) {
                      return t.match(/^[^_]/);});
}

/*
 * FR_taggedItems - Items tagged with a given tag
 *
 * Input
 *  tagname : string value
 *
 * Output
 *  Array of itemids which have been tagged with the tagname
 */
function FR_taggedItems(tagname) {
    return FRV_tagHash[tagname] ? FRV_tagHash[tagname] : [];
}

/*
 * FR_taggedTime - UNIX Time stamp at which the item was tagged
 *
 * Input
 *  item : Item to be looked up
 *   tag : tag to be looked up
 *
 * Output
 *   UNIX timestamp when the item was tagged.
 *   undefined if no timestamp
 *
 * NOTE: DO NOT check the timestamp to determine if an item has been
 * tagged or not. Use FR_tagsForItem
 *
 */
function FR_taggedTime(item, tagname) {
    return FRV_tagTime[item + FRC_joinstring + tagname];
}

/* Brands:
 * Starred and Shared items are implemented using special tags:
 * _starred & _shared
 */
function FR_allBrands() {
    return FRV_brands;
}

/*
 * FR_brandedItems - Items which have been branded by a given brand
 *
 * Input
 *  brand : starred / shared / read
 *
 * Output
 *  Array of branded items
 */
function FR_brandedItems(brand) {
    return FR_taggedItems(FRC_brandPrefix + brand);
}

/*
 * FR_brandItem - Add a brand to a given item
 * (modifies DB)
 *
 * Input
 *  itemid : Item to be branded
 *  brand  : starred / shared / read
 *
 * Output
 *  None
 */
function FR_brandItem(itemid, brand) {
    return FR_tagItem(itemid, FRC_brandPrefix + brand);
}

/*
 * FR_unbrandItem - Remove a brand from a given item 
 * (modifies DB)
 *
 * Input
 *  itemid : Item to be unbranded
 *  brand  : starred / shared / read
 *
 * Output
 *  None
 */
function FR_unbrandItem(itemid, brand) {
    return FR_untagItem(itemid, FRC_brandPrefix + brand);
}

/*
 * FR_isItemBranded - Check if an item has a given brand 
 *
 * Input
 *  itemid : Item to be checked
 *  brand  : starred/shared/read
 *
 * Output
 *  Array of itemids which have the brand
 */
function FR_isItemBranded(itemid, brand) {
    var tags = FRI_tagsLookup(itemid);

    return ($.indexOf(tags, FRC_brandPrefix + brand) >= 0);
}

/*
 * FR_brandedTime - returns the timestamp when the item was branded (if it was)
 *
 * Input
 *  itemid : Item to be checked
 *  brand  : starred/shared/read
 *
 * Output
 *  UNIX timestamp
 */

function FR_brandedTime(itemid, brand) {
    return FR_taggedTime(itemid, FRC_brandPrefix + brand);
}


/* starred items */

/*
 * FR_getStarredItems - List of items that have been starred
 *
 * Input
 *  None
 *
 * Output
 *  Array of itemids which have been starred
 */
function FR_getStarredItems() {
    return FR_brandedItems('starred');
}

/*
 * FR_starItem - Star a given item
 * (modifies DB)
 *
 * Input
 *  itemid :
 *
 * Output
 *  None
 */
function FR_starItem(itemid) {
    return FR_brandItem(itemid, 'starred');
}

/*
 * FR_unstarItem - Unstar a given item 
 * (modifies DB)
 *
 * Input
 *  itemid :
 *
 * Output
 *  None
 */
function FR_unstarItem(itemid) {
    return FR_unbrandItem(itemid, 'starred');
}

/*
 * FR_isStarred - Check if an item is starred
 *
 * Input
 *  itemid :
 *
 * Output
 *  true  : Itemid is starred
 *  false : Itemid is not starred
 */
function FR_isStarred(itemid) {
    return FR_isItemBranded(itemid, 'starred');
}

function FR_starredTime(itemid) {
    return FR_taggedTime(itemid, FRC_brandPrefix + 'starred');
}


/* shared items - APIs similar to "starred items"*/
function FR_getSharedItems() {
    return FR_brandedItems('shared');
}

function FR_shareItem(itemid) {
    return FR_brandItem(itemid, 'shared');
}

function FR_unshareItem(itemid) {
    return FR_unbrandItem(itemid, 'shared');
}

function FR_isShared(itemid) {
    return FR_isItemBranded(itemid, 'shared');
}

function FR_sharedTime(itemid) {
    return FR_taggedTime(itemid, FRC_brandPrefix + 'shared');
}

/* read items - APIs similar to "starred items" */
function FR_getReadItems() {
    return FR_brandedItems('read');
}

function FR_setItemRead(itemid) {
    return FR_brandItem(itemid, 'read');
}

function FR_setItemUnread(itemid) {
    return FR_unbrandItem(itemid, 'read');
}

function FR_isItemRead(itemid) {
    return FR_isItemBranded(itemid, 'read');
}

function FR_itemReadTime(itemid) {
    return FR_taggedTime(itemid, FRC_brandPrefix + 'read');
}

/* Folder */
/*
 * FR_allFolders - List of all folders in the system 
 *
 * Input
 *  None
 *
 * Output
 *  Array of folder names
 */
function FR_allFolders() {
    var folders = [];
    $.each($.values(FRV_folderHash), function(i, folderlist) {
        if (folderlist)
            $.merge(folders, folderlist);
    });

    return folders;
}

/*
 * FR_moveToFolder - Move a feed into a different folder removing this
 *   feed from any folder(s) it is currently present
 * (modifies DB)
 *
 * Input
 *  feed   : feed URL
 *  folder : name of the folder to move into (new or existing)
 *
 * Output
 *  None
 */
function FR_moveToFolder(feed, foldername) {
    FRV_folderHash[feed]= [foldername];
}

/*
 * FR_copyToFolder - Copy a feed into a different folder leaving this 
 *   feed in any other folder(s) it is currently present, intact
 * (modifies DB)
 *
 * Input
 *  feed   : feed URL
 *  folder : name of the folder to move into (new or existing)
 *
 * Output
 *  None
 */
function FR_copyToFolder(feed, foldername) {
    if (!FRV_folderHash[feed]) {
        FRV_folderHash[feed] = [];
    }

    $.merge(FRV_folderHash[feed], [foldername]);
}

/*
 * FR_removeFromFolder - Remove a feed from its folder
 * (modifies DB)
 *
 * Input
 *  feed   : feed URL
 *  folder : name of the folder to remove from (new or existing)
 *
 * Output
 *  None
 */
function FR_removeFromFolder(feed, foldername) {
    if (foldername && FRV_folderHash[feed]) {
        var newhash = $.grep(FRV_folderHash[feed],
                                      function(f, i) {
                                          return (f != foldername);
                                      });
        if (newhash.length == 0)
            newhash = undefined;
        FRV_folderHash[feed] = newhash;
    }
}

/*
 * FR_feedsInFolder - List of feeds in a given folder 
 *
 * Input
 *  folder : Name of the folder to list
 *
 * Output
 *  Array of feed URLs in this folder
 */
function FR_feedsInFolder(foldername) {
    var feeds = [];
    var str = '';

    var allentries = $.keys(FRV_folderHash);

    for (var i=0; i<allentries.length; i++) {
        var f = allentries[i];

        if (f && FRV_folderHash[f] && 
            $.indexOf(FRV_folderHash[f],foldername) >= 0)
            $.merge(feeds, [f]);
    }

    return feeds;
}

/*
 * FR_folderForFeed - Find the folder in which the feed resides 
 *
 * Input
 *  feed : Feed URL
 *
 * Output
 *  list of folder names or [] (if feed is not under any folder)
 */
function FR_folderForFeed(feed) {
    try {
        if (FRV_folderHash[feed])
            return FRV_folderHash[feed];
    } catch(e) {
    }
}

/*
 * FR_getStats - Return the stats needed to display the reading trends
 *
 * Input
 *  None
 *
 * Output
 *   See the structure of FRV_sampleTrends for the return format
 */
function FR_getStats() {
    return FRV_trends;
}

/*
 * FR_sendEmail - allows sending an item from a given feed as an
 * email to a friend
 *
 * Input
 *  to_address : Email address of the friend
 *  subject : Subject for email
 *  note : text message for the email
 *  feed : URL of the feed
 *  itemid : Item ID for the item being emailed
 *
 * Output
 *   None - Success
 *   String - error message
 */
function FR_sendEmail(to_address, subject, note, feed, itemid) {
    // Do nothing
}

/* Property functions */

/*
 * FR_getProperty - Get the value string for given property name 
 * (modifies DB)
 *
 * Input
 *  propname : Name of the property
 *
 * Output
 *  string value of the property or null (if property not found)
 */
function FR_getProperty(propname) {
    try {
        if (FRV_properties[propname]) 
            return FRV_properties[propname];
    } catch(e) {
    }

    return null;
}

/*
 * FR_setProperty - Set the value string for given property name 
 * (modifies DB)
 *
 * Input
 *  propname : Name of the property to be set
 *  value    : string value to be set
 *
 * Output
 *  None
 */
function FR_setProperty(propname, value) {
    FRV_properties[propname] = value;
}

function FR_cacheFeed(feed, title, lastupdated, unread) {
    FRV_feedhash[feed] = {feed:feed, 
                          title:title,
                          lastupdated: lastupdated,
                          unread: unread};
}

/* Internal Functions */
function FRI_AddToList(obj, tag, feed) {
    if (obj[tag]) {
        $.merge(obj[tag], [feed]);
    } else {
        obj[tag] = [feed];
    }
}

function FRI_RemoveFromList(obj, tag, feed) {
    if (obj[tag]) {
        obj[tag] = $.grep(obj[tag], function(f, i) {
                              return f != feed;});
    }
}

function FRI_feedInit(feedlist) {
    $.each(feedlist, function(i, feedInfo) {
                            FRV_feedhash[feedInfo.feed] = feedInfo;
                    });
    
/*    FRV_feedhash = 
        feedlist.inject(FRV_feedhash, function(feedhash, feedInfo, index) {
                            feedhash[feedInfo.feed] = feedInfo;
                            return feedhash;
                    });
*/
}

var FRV_googleBundles = {"bundles":{"news":{"id":"news","title":"News","isadded":false,"subscriptions":[{"id":"feed/http://newsrss.bbc.co.uk/rss/newsonline_world_edition/front_page/rss.xml","title":"BBC News (World)"},{"id":"feed/http://www.csmonitor.com/rss/top.rss","title":"Christian Science Monitor"},{"id":"feed/http://sports.espn.go.com/espn/rss/news","title":"ESPN.com"},{"id":"feed/http://news.google.com/?output\u003Drss","title":"Google News"},{"id":"feed/http://www.marketwatch.com/rss/topstories","title":"MarketWatch.com"},{"id":"feed/http://www.npr.org/rss/podcast.php?id\u003D500001","title":"NPR Podcast (7AM EST)"}]},"sports":{"id":"sports","title":"Sports","isadded":false,"subscriptions":[{"id":"feed/http://sports.espn.go.com/espn/rss/news","title":"ESPN.com"},{"id":"feed/http://newsrss.bbc.co.uk/rss/sportonline_world_edition/front_page/rss.xml","title":"BBC Sport"},{"id":"feed/http://sports.espn.go.com/keyword/search?searchString\u003Dbill_simmons\u0026feed\u003Drss\u0026src\u003Drss\u0026rT\u003Dsports","title":"Bill Simmons"},{"id":"feed/http://www.ericmcerlain.com/offwingopinion/index.rdf","title":"Off Wing Opinion"},{"id":"feed/http://www.themightymjd.com/feed/","title":"the mighty mjd sports blog"},{"id":"feed/http://www.sportsfrog.com/feed.xml","title":"The Sports Frog"},{"id":"feed/http://www.truehoop.com/atom.xml","title":"True Hoop"},{"id":"feed/http://yanksfansoxfan.typepad.com/ysfs/atom.xml","title":"Yanksfan vs Soxfan"},{"id":"feed/http://www.footbag.org/index2/index.rss","title":"Footbag WorldWide"}]},"fun":{"id":"fun","title":"Fun","isadded":false,"subscriptions":[{"id":"feed/http://www.comedycentral.com/rss/colbertvideos.jhtml","title":"Colbert Report Videos"},{"id":"feed/http://www.comedycentral.com/rss/tdsvideos.jhtml","title":"Daily Show Videos"},{"id":"feed/http://video.google.com/videofeed?type\u003Dtop100new","title":"Google Video Top 100"},{"id":"feed/http://www.quotationspage.com/data/qotd.rss","title":"Quotes of the Day"},{"id":"feed/http://www.theonion.com/content/feeds/daily","title":"The Onion"},{"id":"feed/http://youtube.com/rss/global/top_viewed_today.rss","title":"YouTube Most Viewed"}]},"thinkers":{"id":"thinkers","title":"Thinkers","isadded":false,"subscriptions":[{"id":"feed/http://www.freakonomics.com/blog/feed/","title":"Freakonomics Blog"},{"id":"feed/http://gladwell.typepad.com/gladwellcom/atom.xml","title":"Malcolm Gladwell\u0027s Blog"},{"id":"feed/http://www.kottke.org/remainder/index.rdf","title":"kottke.org remaindered links"},{"id":"feed/http://itre.cis.upenn.edu/~myl/languagelog/index.rdf","title":"Language Log"},{"id":"feed/http://www.languagehat.com/index.rdf","title":"LanguageHat"},{"id":"feed/http://www.marginalrevolution.com/marginalrevolution/index.rdf","title":"Marginal Revolution"},{"id":"feed/http://www.npr.org/rss/podcast.php?id\u003D4538138","title":"NPR: This I Believe"},{"id":"feed/http://feeds.salon.com/salon/index","title":"Salon"},{"id":"feed/http://tedblog.typepad.com/tedblog/atom.xml","title":"TED Blog"}]},"celebrities":{"id":"celebrities","title":"Celebrities","isadded":false,"subscriptions":[{"id":"feed/http://www.defamer.com/index.xml","title":"Defamer"},{"id":"feed/http://www.gawker.com/index.xml","title":"Gawker"},{"id":"feed/http://www.perezhilton.com/index.xml","title":"PerezHilton"},{"id":"feed/http://feeds.feedburner.com/popsugar","title":"PopSugar"},{"id":"feed/http://www.thesuperficial.com/index.xml","title":"The Superficial"}]},"geeky":{"id":"geeky","title":"Geeky","isadded":false,"subscriptions":[{"id":"feed/http://feeds.feedburner.com/CoolTools","title":"Cool Tools"},{"id":"feed/http://lifehacker.com/index.xml","title":"Lifehacker"},{"id":"feed/http://www.makezine.com/blog/index.xml","title":"MAKE Magazine"},{"id":"feed/http://www.penny-arcade.com/rss.xml","title":"Penny-Arcade"},{"id":"feed/http://www.pvrblog.com/pvr/index.rdf","title":"PVRblog"}]},"video":{"id":"video","title":"Video","isadded":false,"subscriptions":[{"id":"feed/http://feeds.feedburner.com/AskANinja","title":"Ask A Ninja"},{"id":"feed/http://video.google.com/videofeed?type\u003Dtop100new","title":"Google Video Top 100"},{"id":"feed/http://feeds.feedburner.com/hotair/vent","title":"Hot Air TV"},{"id":"feed/http://www.rocketboom.com/vlog/atom.xml","title":"Rocketboom"},{"id":"feed/http://www.zefrank.com/theshow/atom.xml","title":"The Show with zefrank"},{"id":"feed/http://feeds.feedburner.com/TikiBarTV","title":"Tiki Bar TV"},{"id":"feed/http://youtube.com/rss/global/top_viewed_today.rss","title":"YouTube Most Viewed"}]},"food":{"id":"food","title":"Food","isadded":false,"subscriptions":[{"id":"feed/http://chocolateandzucchini.com/index.rdf","title":"Chocolate \u0026 Zucchini"},{"id":"feed/http://dinersjournal.blogs.nytimes.com/?feed\u003Drss2","title":"Diner\u0027s Journal"},{"id":"feed/http://www.megnut.com/index.xml","title":"Megnut"},{"id":"feed/http://feeds.feedburner.com/PurpleLiquidAWineAndFoodDiary","title":"Purple Liquid"},{"id":"feed/http://www.amateurgourmet.com/the_amateur_gourmet/atom.xml","title":"The Amateur Gourmet"},{"id":"feed/http://www.thefoodsection.com/foodsection/index.rdf","title":"The Food Section"}]},"finance":{"id":"finance","title":"Finance","isadded":false,"subscriptions":[{"id":"feed/http://rss.cnn.com/rss/money_topstories.rss","title":"CNNMoney.com"},{"id":"feed/http://www.iwillteachyoutoberich.com/atom.xml","title":"I Will Teach You To Be Rich"},{"id":"feed/http://www.marketwatch.com/rss/topstories","title":"MarketWatch.com"},{"id":"feed/http://www.pfblog.com/index.xml","title":"Personal Finance Blog"},{"id":"feed/http://www.fool.com/About/headlines/rss_headlines.asp","title":"The Motley Fool"},{"id":"feed/http://www.thestreet.com/feeds/rss/index.xml","title":"TheStreet.com"}]},"google-related":{"id":"google-related","title":"Google-related","isadded":false,"subscriptions":[{"id":"feed/http://blog.outer-court.com/rss.xml","title":"Google Blogoscoped"},{"id":"feed/http://googlesightseeing.com/feed/","title":"Google Sightseeing"},{"id":"feed/http://battellemedia.com/index.xml","title":"John Battelle\u0027s Searchblog"},{"id":"feed/http://googleblog.blogspot.com/atom.xml","title":"Official Google Blog"},{"id":"feed/http://googlereader.blogspot.com/atom.xml","title":"Official Google Reader Blog"},{"id":"feed/http://googlevideo.blogspot.com/atom.xml","title":"Official Google Video Blog"}]},"technology":{"id":"technology","title":"Technology","isadded":false,"subscriptions":[{"id":"feed/http://digg.com/rss/index.xml","title":"Digg"},{"id":"feed/http://www.engadget.com/rss.xml","title":"Engadget"},{"id":"feed/http://slashdot.org/index.rss","title":"Slashdot"},{"id":"feed/http://feeds.feedburner.com/Techcrunch","title":"TechCrunch"},{"id":"feed/http://www.wired.com/news/feeds/rss2/0,2610,,00.xml","title":"Wired News"}]},"small-business":{"id":"small-business","title":"Small-business","isadded":false,"subscriptions":[{"id":"feed/http://www.businesspundit.com/index.rdf","title":"Businesspundit"},{"id":"feed/http://exacttarget.typepad.com/chrisbaggott/atom.xml","title":"Email Marketing Best Practices"},{"id":"feed/http://www.churchofthecustomer.com/blog/index.rdf","title":"Church of the Customer Blog"},{"id":"feed/http://feeds.feedburner.com/ducttapemarketing/nRUD","title":"Duct Tape Marketing"},{"id":"feed/http://sethgodin.typepad.com/seths_blog/atom.xml","title":"Seth\u0027s Blog"},{"id":"feed/http://feeds.feedburner.com/SmallBusinessTrends","title":"Small Business Trends"},{"id":"feed/http://forum.belmont.edu/cornwall/atom.xml","title":"The Entrepreneurial Mind"}]},"science":{"id":"science","title":"Science","isadded":false,"subscriptions":[{"id":"feed/http://scienceblogs.com/cognitivedaily/atom.xml","title":"Cognitive Daily"},{"id":"feed/http://cosmicvariance.com/feed/","title":"Cosmic Variance"},{"id":"feed/http://news.nationalgeographic.com/index.rss","title":"National Geographic News"},{"id":"feed/http://www.nature.com/news/rss.rdf","title":"Nature.com"},{"id":"feed/http://www.realclimate.org/feed/rss2/","title":"RealClimate"},{"id":"feed/http://www.sciam.com/xml/sciam.xml","title":"Scientific American"}]},"photography":{"id":"photography","title":"Photography","isadded":false,"subscriptions":[{"id":"feed/http://www.durhamtownship.com/index.rdf","title":"A Walk Through Durham Township, Pennsylvania"},{"id":"feed/http://wvs.topleftpixel.com/index_fullfeed.rdf","title":"[daily dose of imagery]"},{"id":"feed/http://www.dpreview.com/news/dpr.rdf","title":"Digital Photography Review"},{"id":"feed/http://www.filemagazine.com/thecollection/atom.xml","title":"FILE Magazine"},{"id":"feed/http://www.greyscalegorilla.com/index.php?x\u003Drss","title":"greyscalegorilla"},{"id":"feed/http://groundglass.ca/index.xml","title":"groundglass"},{"id":"feed/http://www.mylalaland.com/hello/index.xml","title":"HELLO"},{"id":"feed/http://feeds.feedburner.com/ngpod","title":"National Geographic Photo of the Day"},{"id":"feed/http://www.photoflavor.com/index.xml","title":"photoflavor"},{"id":"feed/http://www.photojojo.com/content/feed","title":"Photojojo"},{"id":"feed/http://vitrineenillumina.zerosun6.com/index.php?x\u003Drss","title":"vitrine en illumina"}]},"cars":{"id":"cars","title":"Cars","isadded":false,"subscriptions":[{"id":"feed/http://www.autoblog.com/rss.xml","title":"Autoblog"},{"id":"feed/http://carscarscars.blogs.com/index/atom.xml","title":"Cars! Cars! Cars!"},{"id":"feed/http://www.jalopnik.com/index.xml","title":"Jalopnik"},{"id":"feed/http://feeds.popularmechanics.com/pm/blogs/automotive_news","title":"PopularMechanics Automotive News"},{"id":"feed/http://www.thetruthaboutcars.com/?feed\u003Drss2","title":"The Truth About Cars"}]}}};


var FRV_sampleTrends = {
    period : {
        /* Last 30 days : Array of 30 numbers, one for item count each day */
        month : [
            0, 10, 0, 0, 0, 0, 10, 5, 2, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 20
            ],

        /* Time of day : Array of 24 numbers, one for each hourly period
         * starting with index 0 = midnight - 1AM 
         */
        day : [
            0, 0, 0, 6, 0, 0, 0, 5, 0, 0, 0, 0,
            2, 1, 1, 1, 0, 0, 2, 0, 0, 0, 0, 2
        ],

        /* Day of week : Array of 7 numbers, one for each day of week
        * starting with index 0 = Sunday*/
        week : [
            8, 2, 1, 0, 2, 0, 4
        ]
    },

    /*
     * For each feed, stats like number of items read, percent read,
     * number of items shared, starred, emailed, read on mobile
     */
    itemstats : 
        [// Feed 1
         {feed: 'http://rss.cnn.com/rss/cnn_topstories.rss',
          link: "http://www.cnn.com/?eref\u003Drss_topstories",
          nread: 6,
          percentread: 22,
          shared: 0,
          starred: 3,
          emailed: 1,
          readonmobile: 1
        },
         // Feed 2
         {feed: 'http://www.comedycentral.com/rss/colbertvideos.jhtml',
          link:"http://www.comedycentral.com/shows/the_colbert_report/index.jhtml?rsspartner\u003DrssFeedfetcherGoogle",
          nread: 4,
          percentread: 16,
          shared: 1,
          starred: 0,
          emailed: 3,
          readonmobile: 0
        } 
            // More feeds
        ],

    /*
     * ordered list of feeds which are frequently updated
     * and those which are inactive
     */
    update_frequency: {
        frequent: [
            {feed: 'http://www.comedycentral.com/rss/colbertvideos.jhtml',
             items_per_day: 8,
             percent_read: 16
            },

            {feed: 'http://rss.cnn.com/rss/cnn_topstories.rss',
             items_per_day: 4,
             percent_read: 12
            } 
            // More feeds
        ],
        inactive: [
            // least active
            'http://www.comedycentral.com/rss/colbertvideos.jhtml', 

            // next least active
            'http://rss.cnn.com/rss/cnn_topstories.rss'
            
            // More feeds
        ]
    }
}

/*
 * Return a given tip by its number
 * Internal to mockapi
 */
function FR_getTips(num) {
    if (!num) {
        num = Math.round(FRV_tips.length*Math.random());
    }

    return FRV_tips[num];
}

