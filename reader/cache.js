/*
 *    yocto-reader - A light-weight RSS reader aggregator prototype, version 0.2
 *                   (http://yocto-reader.flouzo.net/)
 *
 *    Copyright (C) 2007 Loic Dachary (loic@dachary.org) 
 *    Copyright (C) 2007 Chandan Kudige (chandan@nospam.kudige.com)
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

/*  Cache for feed items and their status
 *
 *  (c) 2005-2007 Chandan Kudige
 *
 *
/*--------------------------------------------------------------------------*/

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
            // XXX
            callback([], "Feed could not be loaded - " + result.status.code);
        }
    }

}
