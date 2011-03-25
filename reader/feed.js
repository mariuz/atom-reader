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

/*
 * FeedRenderer class 
 * Wrapper around Google Feed API to display feeds in different
 * formats.
 */
function FeedRenderer () {
    this.feeds = new Array ();
    this.numEntries = 4;
}

FeedRenderer.prototype.add = function (url) {
    if (typeof(url) != typeof([])) {
        url = [url];
    }

    $.merge(this.feeds, [url]);
}

FeedRenderer.prototype.renderFeed = function (url, target, template) {
    var fn = function (myurl, result) {
        if (result.status.code == 200) {
            result.feed.feed = myurl + '';
            if (FC_getUnread(result.feed.feed))
                result.feed.feedunread = '(' + FC_getUnread(result.feed.feed) + ')';
            var folders = FR_folderForFeed(result.feed.feed);
            var folder;
            if (folders && folders.length>0) {
                folder = folders[0];
                result.feed.folder = '' + folders[0];
                target.addClass('summary-with-folder');
                var folderunread = 0;
                $.each(FR_feedsInFolder(folders[0]), function(i, ffeed) {
                    folderunread += FC_getUnread(ffeed);
                });

                if (folderunread) 
                    result.feed.folderunread = '(' + folderunread + ')';
            }
            target.populateFeed(result.feed).removeClass('hidden');
            ReaderViewer.homeItemLoaded(target, result.feed.feed, folder);
        }
        else {
// error
        }
    }

    fn = fn.bind(null, url);

    var feed = new google.feeds.Feed (url);
    feed.setNumEntries(this.numEntries);
    feed.load(fn);
}

FeedRenderer.prototype.render = function (target, template) {
    var bindings = [];
    for (var i=0; i< this.feeds.length; i++) {
        var rt = template.clone(true).addClass('hidden');
        target.append(rt);
        
        this.renderFeed (this.feeds[i], rt);
        bindings.push({node: rt, feed: this.feeds[i]});
    }

    return bindings
}

FeedRenderer.prototype.renderSearchResult = function (query, target, template) {
    google.feeds.findFeeds (query, function (result) {
        if (result.status.code == 200) {
            var rt = template.clone (true);
            rt[0].id = "";
            target.append (rt);
            target.populateFeed(result);
            Reader.hideLoading();

            // Mark the entries whose feeds are already subscribed to
            $(".tpl-search", $("#main")).each(function() {
                var node = $(this);

                var feed = $("input.fld-entries-url", node).getdata();
                if (FR_feedInfo(feed)) {
                    node.addClass('result-subscribed');
                }
                
                populateFolders(node, feed);
            });
        }
        else {
            // error
        }
    });
}

FeedRenderer.prototype.startLoading = function (sink) {
    for (var i=0; i< this.feeds.length; i++) {
        var feedurl = this.feeds[i];

        var fn = function(entries, error) {
            if (error) {
                alert(feedurl + ' error: ' + error);
            } else if (entries) {
                sink.inject(entries);
            }
        }

        FC_retreiveFeed(feedurl, fn);
    }
}

var MonthNames = [
    'Jan', 'Feb', 'Mar',
    'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'
];
    
function format_author(author) {
    return "by " + author;
}

function format_date(datestr) {
    var today = new Date();
    var d = new Date(datestr);

    var tm = today.getTime();
    var dm = d.getTime();

    if (dm > tm - 24*60*60*1000) {
        var hh = d.getHours();
        var mm = d.getMinutes();
        var am = 'AM';

        if (hh >= 12) {
            hh -= 12;
            am = 'PM';
        }
        
        if (mm < 10) {
            mm = '0' + mm;
        }

        return hh + ':' + mm + ' ' + am;
    } else {
        return MonthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

}

function format_timestamp(str) {
    var d = new Date(str);
    return d.getTime();
}

function GfeedToEntries(gfeed, feedurl) {
    var unread = 0;
    var updated = false;
    var entries = $.map(gfeed.entries,function(entry) {
        var timestamp = 0;
        var title = entry['title'];
        if (entry['publishedDate']) {
            timestamp = format_timestamp(entry['publishedDate']);
            entry['formatDate'] = format_date(entry['publishedDate']);
        }
        if (entry['author']) {
            entry['formatAuthor'] = format_author(entry['author']);
        }
        
        // Item ID format is decided here.
        var itemid = entry['itemid'] = 
            FC_makeItemId(feedurl, timestamp+'/'+title);
        if (!FR_isItemRead(itemid)) {
            unread ++;
        }

        var property = objectCopy({feed: feedurl}, gfeed, '');
        property = objectCopy(property, entry, 'entries-');
        property.timestamp = timestamp;

        if (!FC_lookupItemId(itemid)) {
            FC_cacheItem(property);
            updated = true;
        }

        return property;
    });

    FC_clearUnread(feedurl);
    FC_updateUnread(feedurl, unread);

    Reader.updateFeedCount([feedurl]);
    if (updated) {
        Reader.flashFeeds([feedurl]);
    }

    return entries;
}

/*
 * Injector takes an array, 'inject' into a processing function
 * slowly, with timeouts, so that the browser does not become
 * unresponsive
 */
function Injector(callback, num, interval) {
    this.callback = callback;
    this.entries = [];
    this.timer = false;
    this.num   = num;
    this.interval = interval;
}

Injector.prototype = {
    inject: function(items) {

/*        if (typeof(items) != typeof([])) {
            items = [items];
        }
*/        
        $.merge(this.entries, items);

        this.added();
    },

    added: function() {
        if (!this.timer && this.entries.length > 0) {
            this.pushout();
        }
    },

    pushout: function() {
        this.timer = false;

        var current = this.entries.slice(0, this.num);
        this.entries = this.entries.slice(this.num);

        this.callback(current);
        if (this.entries.length > 0) {
            setTimeout(this.pushout.bind(this), this.interval);
            this.timer = true;
        }
    }
}
