var FCV_cache = {};
var FCV_unread = {'_all' : 0};

function FC_cacheItem(entry) {
    itemid = entry['entries-itemid'];

    FCV_cache[itemid] = entry;
}

/*
function FC_lookupItem(feed, timestamp) {
    return FC_lookupItemId(FC_makeItemId(feed, timestamp));
}
*/

function FC_lookupItemId(itemid) {
    return FCV_cache[itemid];
}

function FC_makeItemId(feed, timestamp) {
    return feed + FRC_joinstring + timestamp;
}

function FC_getItemFeed(itemid) {
    try {
        var t = itemid.split(FRC_joinstring);
        if (t.length > 1)
            return t[0];
    } catch(e) {
    }
}

function FC_clearUnread(feed) {
    if (feed) {
        if (FCV_unread[feed]) {
            FCV_unread['_all'] -= parseInt(FCV_unread[feed]);
            FCV_unread[feed] = 0;
        }
    } else {
//        FCV_unread = {'_all' : 0};
    }
}

function FC_updateUnread(feed, count) {
    if (!FCV_unread[feed]) 
        FCV_unread[feed] = 0;

    FCV_unread[feed] += count;
    FCV_unread['_all'] += count;
}

function FC_getUnread(feed) {
    if (!FCV_unread[feed]) 
        FCV_unread[feed] = 0;

    return FCV_unread[feed];
}

function FC_getUnreadAll() {
    return FCV_unread['_all'];
/*    var total = 0;

    $.each(FCV_unread, function(feed, num) {
        total += num;
    });

    return total;
*/
}

function FC_setItemRead(itemid) {
    var feed = FC_getItemFeed(itemid);
    if (!feed || FR_isItemRead(itemid))
        return;

    FC_updateUnread(feed, -1);

    FR_setItemRead(itemid);
    Reader.updateFeedCount([feed], [itemid]);
}

function FC_setItemUnread(itemid) {
    var feed = FC_getItemFeed(itemid);
    if (feed && FR_isItemRead(itemid)) {
        FC_updateUnread(feed, 1);
        
        FR_setItemUnread(itemid);
        Reader.updateFeedCount([feed], [itemid]);
    }
}

var FC_lastCacheTime = 0;
var FC_cacheInterval = 60*1000; //msec (1 min)
var FC_updateInterval = 5*60*1000; // (5 mins)
var FC_numEntries    = 100;
var FC_feedData      = {};

function FC_cacheFeed(feedurl, entries) {
    FC_feedData[feedurl] = {entries: entries,
                            cacheTime: currentTime()};
}

function FC_retreiveFeed(feedurl, callback) {
    var result = FC_feedData[feedurl];
    if (!result || timeExpired(result.cacheTime, FC_cacheInterval)) {
        var feed = new google.feeds.Feed (feedurl);
        feed.setNumEntries(FC_numEntries);
        feed.load(FC_cacheAndCall.bind(null, callback, feedurl));
    } else if (callback) {
//        callback(result.entries);
        setTimeout(function() {callback(result.entries);}, 100);
    }
}

function FC_cacheAndCall(callback, feedurl, result) {
    if (result.status.code == 200) {
        var entries = GfeedToEntries(result.feed, feedurl);
        FC_cacheFeed(feedurl, entries);
        if (callback)
            callback(entries);
    } else {
        if (callback) {          
            callback([], "Feed could not be loaded - " + result.status.code);
        }
    }

}