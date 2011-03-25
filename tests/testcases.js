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


var initCallbackPassed = false;
function testAPIInit() {
    FR_init(function(){initCallbackPassed = true;});

    assertEquals("0.0.0", true, initCallbackPassed);
}

function testAPISubscription() {
    FR_init();

    var i,j,k;
    var allfeeds = FR_allFeeds();
    var savedAllfeeds = $.clone(allfeeds);
    
    var count = allfeeds.length;
    var existingFeed1 = allfeeds[0];         // first feed
    var existingFeed2 = allfeeds[count/2];   // middle feed
    var existingFeed3 = allfeeds[count-1];   // last feed
    
    // Test to make sure isFeedSubscribed works
    assert("0.0.1", !FR_isFeedSubscribed(TEST_FEED1));
    
    // Test adding existing feed, with corner cases
    FR_addFeed(existingFeed1);
    assert("0.0.2", FR_allFeeds() == allfeeds);
    
    FR_addFeed(existingFeed2);
    assert("0.1", FR_allFeeds() == allfeeds);
    
    FR_addFeed(existingFeed3);
    assert("0.2", FR_allFeeds() == allfeeds);
    
    // Test adding a new feed
    FR_addFeed(TEST_FEED1);
    
    assertEquals("0.3", FR_allFeeds().length, count+1);
    assert("0.4", FR_isFeedSubscribed(TEST_FEED1));
    
    for (i=0; i<count; i++) {
        assert("0.5 i=" + i, FR_isFeedSubscribed(savedAllfeeds[i]));
    }
    
    // Test removing a feed
    FR_removeFeed(TEST_FEED1);
    
    assertEquals("0.6", FR_allFeeds().length, count);
    assert("0.7", !FR_isFeedSubscribed(TEST_FEED1));
    
    for (i=0; i<count; i++) {
        assert("0.8 i=" + i, FR_isFeedSubscribed(savedAllfeeds[i]));
    }

    var browse = FR_browseFeeds();
    assert("0.9", browse != null);
}

function testAPIFolders() {
    FR_init();
    
    var all = FR_allFolders();

    // change these cases if default database is changed
    // Test folders of existing feeds
    assert("1.0.0", $.indexOf(all,'news') >= 0);
    assert("1.0.1", $.indexOf(all,'language') >= 0);
    assert("1.0.2", $.indexOf(all,'comedy') >= 0);
    assert("1.0.3", $.indexOf(all,'technology') >= 0);
    assert("1.0.4", $.indexOf(all,'slashdot') < 0);
    
    assertEquals("1.1.0", TEST_FOLDER3, FR_folderForFeed(TEST_FEED3)[0]);
    assertEquals("1.1.1", TEST_FOLDER4, FR_folderForFeed(TEST_FEED4)[0]);
    
    // Put new feeds in folders
    FR_addFeed(TEST_FEED1);
    FR_addFeed(TEST_FEED2);
    assert("1.2.0", FR_folderForFeed(TEST_FEED1) == null);
    assert("1.2.1", FR_folderForFeed(TEST_FEED2) == null);
    
    FR_moveToFolder(TEST_FEED1, TEST_FOLDER1);
    assertEquals("1.3.1", TEST_FOLDER1, FR_folderForFeed(TEST_FEED1)[0]);
    
    FR_moveToFolder(TEST_FEED2, TEST_FOLDER2);
    assertEquals("1.3.2", TEST_FOLDER2, FR_folderForFeed(TEST_FEED2)[0]);
    
    all = FR_allFolders();
    
    assert("1.4.0", $.indexOf(all,'news') >= 0);
    assert("1.4.1", $.indexOf(all,'language') >= 0);
    assert("1.4.2", $.indexOf(all,'comedy') >= 0);
    assert("1.4.3", $.indexOf(all,'technology') >= 0);
    assert("1.4.4", $.indexOf(all,TEST_FOLDER2) >= 0);
    assert("1.4.5", $.indexOf(all,TEST_FOLDER1) >= 0);
    
    
    FR_removeFromFolder(TEST_FEED2, TEST_FOLDER1);
    assertEquals("1.5",  TEST_FOLDER2, FR_folderForFeed(TEST_FEED2)[0]);
    
    FR_removeFromFolder(TEST_FEED2, TEST_FOLDER2);
    assertEquals("1.6", undefined, FR_folderForFeed(TEST_FEED2));
    
    FR_moveToFolder(TEST_FEED2, TEST_FOLDER1);
    var feeds = FR_feedsInFolder(TEST_FOLDER1);
    
    assertEquals("1.7", 2, feeds.length);
    assert("1.8", $.indexOf(feeds,TEST_FEED1) >= 0);
    assert("1.9", $.indexOf(feeds,TEST_FEED2) >= 0);

    // Test copying feeds to multiple folders
    feeds = FR_feedsInFolder(TEST_FOLDER2);
    assert("1.10", $.indexOf(feeds, TEST_FEED1) < 0);

    FR_copyToFolder(TEST_FEED1, TEST_FOLDER2);
    var folders = FR_folderForFeed(TEST_FEED1);
    assertEquals("1.10.0", 2, folders.length);
    assert("1.10.1", $.indexOf(folders, TEST_FOLDER1)>= 0);
    assert("1.10.2", $.indexOf(folders, TEST_FOLDER2)>= 0);

    feeds = FR_feedsInFolder(TEST_FOLDER2);
    assert("1.10.3", $.indexOf(feeds, TEST_FEED1) >= 0);

    FR_removeFromFolder(TEST_FEED1, TEST_FOLDER1);
    var folders = FR_folderForFeed(TEST_FEED1);
    assertEquals("1.11.0", 1, folders.length);
    assert("1.11.1", $.indexOf(folders, TEST_FOLDER1) < 0);
    assert("1.11.2", $.indexOf(folders, TEST_FOLDER2)>= 0);

    FR_removeFeed(TEST_FEED1);
    var folders = FR_folderForFeed(TEST_FEED1);
    assertEquals("1.11.13", undefined, folders);

    FR_copyToFolder(TEST_FOLDER1, TEST_FEED2);
    assertEquals("1.11.14", TEST_FOLDER1, FR_folderForFeed(TEST_FEED2)[0]);
} 

function testAPITags() {
    FR_init();
    
    var all = FR_allTags();
    
    // change these cases if default database is changed
    
    // Test tags of existing feeds
    assert("2.0.0", $.indexOf(all,'tag1') >= 0);
    assert("2.0.1", $.indexOf(all,'tag2') >= 0);
    assert("2.0.2", $.indexOf(all,'tag3') >= 0);
    assert("2.0.3", $.indexOf(all,'tag4') >= 0);
    assert("2.0.4", $.indexOf(all,'tag5') >= 0);
    assert("2.0.5", $.indexOf(all,'tag6')  < 0);
    
    // Multiple tags for same item
    var item3tags = FR_tagsForItem('item3');
    assertEquals("2.1.0", 3, item3tags.length);
    assert("2.1.1", $.indexOf(FR_tagsForItem('item3'),'tag1') >= 0);
    assert("2.1.2", $.indexOf(FR_tagsForItem('item3'),'tag3') >= 0);
    assert("2.1.4", $.indexOf(FR_tagsForItem('item3'),'tag5') >= 0);
    
    // negative case
    assert("2.1.3", $.indexOf(FR_tagsForItem('item3'),'tag4') < 0);
    
    assertEquals("2.1.4", FR_tagsForItem('item4').length, 1);
    assert("2.1.5", $.indexOf(FR_tagsForItem('item4'),'tag2') >= 0);
    assert("2.1.6", $.indexOf(FR_tagsForItem('item4'),'tag1') < 0);
    
    // Tag new items
    assert("2.2.0", !FR_tagsForItem('newitem1').length);
    assert("2.2.1", !FR_tagsForItem('newitem2').length);
    
    FR_tagItem('newitem1', TEST_TAG1);
    assertEquals("2.3.1", FR_tagsForItem('newitem1')[0], TEST_TAG1);
    
    FR_tagItem('newitem2', TEST_TAG2);
    assertEquals("2.3.2", FR_tagsForItem('newitem2')[0], TEST_TAG2);
    
    all = FR_allTags();
    
    // Ensure changes are reflected in the API
    assert("2.4.0", $.indexOf(all,'tag1') >= 0);
    assert("2.4.1", $.indexOf(all,'tag2') >= 0);
    assert("2.4.2", $.indexOf(all,'tag3') >= 0);
    
    // Check tag that doesnt belong to an item
    assert("2.4.3", $.indexOf(all,'tag6')  < 0);
    
    assert("2.4.4", $.indexOf(all,TEST_TAG2) >= 0);
    assert("2.4.5", $.indexOf(all,TEST_TAG1) >= 0);
    
    // Untag items
    FR_untagItem('newitem2', TEST_TAG1);
    assertEquals("2.5", FR_tagsForItem('newitem2')[0], TEST_TAG2);
    
    FR_untagItem('newitem2', TEST_TAG2);
    assert("2.6", !FR_tagsForItem('newitem2').length);
    
    // Same tag for multiple items
    FR_tagItem('newitem2', TEST_TAG1);
    var feeds = FR_taggedItems(TEST_TAG1);

    // Tag times
    var ts = FR_taggedTime('newitem2', TEST_TAG1);
    assert("2.6.1", ts > 0);

    assertEquals("2.7", feeds.length, 2);
    assert("2.8", $.indexOf(feeds,'newitem1') >= 0);
    assert("2.9", $.indexOf(feeds,'newitem2') >= 0);
    assert("2.9", $.indexOf(feeds,'newitem3')  < 0);

    FR_untagAllForItem('newitem2');
    assertEquals("2.10", 0, FR_tagsForItem('newitem2').length);
} 

function testAPIBrands() {
    FR_init();
    
    var brands = FR_allBrands();
    assertEquals("3.0.0", brands.length, 2);
    assertEquals("3.0.1", brands[0].brand, 'starred');
    assertEquals("3.0.2", brands[1].brand, 'shared');
    
    // Multiple brands for same item
    assertEquals("3.1.0", true, FR_isItemBranded('item3', 'starred'));
    assertEquals("3.1.1", true, FR_isItemBranded('item3', 'read'));
    // negative case
    assertEquals("3.1.2", false, FR_isItemBranded('item3', 'shared'));
    
    // Multiple items for same brand
    assertEquals("3.1.3", true, FR_isItemBranded('item3', 'starred'));
    assertEquals("3.1.4", true, FR_isItemBranded('item1', 'starred'));
    // negative case
    assertEquals("3.1.5", false, FR_isItemBranded('item2', 'starred'));
    
    // List of branded items
    var items = FR_brandedItems('read');
    assertEquals("3.1.6", 2, items.length);
    assert("3.1.7", $.indexOf(items,'item3') >= 0);
    assert("3.1.8", $.indexOf(items,'item5') >= 0);
    // negative case
    assert("3.1.9", $.indexOf(items,'item4') < 0);
    
    // Brand new items
    assertEquals("3.2.0", false, FR_isItemBranded('newitem1', 'shared'));
    assertEquals("3.2.1", false, FR_isItemBranded('newitem2', 'shared'));
    
    FR_brandItem('newitem1', 'shared');
    assertEquals("3.3.1", true, FR_isItemBranded('newitem1', 'shared'));
    
    FR_brandItem('newitem2', 'shared');
    assertEquals("3.3.2", true, FR_isItemBranded('newitem2', 'shared'));
    
    // Branding time
    var ts = FR_brandedTime('newitem2', 'shared');
    assert("3.3.3", ts>0);

    // Unbrand items
    FR_unbrandItem('newitem2', 'starred');
    assertEquals("3.4.1", true, FR_isItemBranded('newitem2', 'shared'));
    
    FR_unbrandItem('newitem2', 'shared');
    assertEquals("3.4.2", false, FR_isItemBranded('newitem2', 'shared'));
} 

function testAPIStarred() {
    FR_init();

    var starred = FR_getStarredItems();
    assertEquals("4.0.0", 2, starred.length);
    assert("4.0.1", $.indexOf(starred,'item3') >= 0);
    assert("4.0.2", $.indexOf(starred,'item1') >= 0);
    // negative case
    assert("4.0.3", $.indexOf(starred,'item2') < 0);

    // Test default values
    assertEquals("4.1.0", true, FR_isStarred('item3'));
    assertEquals("4.1.1", true, FR_isStarred('item1'));
    // negative case
    assertEquals("4.1.2", false, FR_isStarred('item2'));
    
    // Star new items
    assertEquals("4.2.0", false, FR_isStarred('newitem1'));
    assertEquals("4.2.1", false, FR_isStarred('newitem2'));
    
    FR_starItem('newitem1');
    assertEquals("4.3.1", true, FR_isStarred('newitem1'));
    
    FR_starItem('newitem2');
    assertEquals("4.3.2", true, FR_isStarred('newitem2'));

    // Starred time
    var ts = FR_starredTime('newitem2');
    assert("4.3.3", ts>0);
    
    // Unstar items
    FR_unshareItem('newitem2');
    assertEquals("4.4.1", true, FR_isStarred('newitem2'));
    
    FR_unstarItem('newitem2');
    assertEquals("4.4.2", false, FR_isStarred('newitem2'));
} 

function testAPIShared() {
    FR_init();
    
    var shared = FR_getSharedItems();
    assertEquals("5.0.0", 2, shared.length);
    assert("5.0.1", $.indexOf(shared,'item4') >= 0);
    assert("5.0.2", $.indexOf(shared,'item5') >= 0);
    // negative case
    assert("5.0.3", $.indexOf(shared,'item1') < 0);

    // Test default values
    assertEquals("5.1.0", true, FR_isShared('item4'));
    assertEquals("5.1.1", true, FR_isShared('item5'));
    // negative case
    assertEquals("5.1.2", false, FR_isShared('item2'));
    
    // Star new items
    assertEquals("5.2.0", false, FR_isShared('newitem1'));
    assertEquals("5.2.1", false, FR_isShared('newitem2'));
    
    FR_shareItem('newitem1');
    assertEquals("5.3.1", true, FR_isShared('newitem1'));
    
    FR_shareItem('newitem2');
    assertEquals("5.3.2", true, FR_isShared('newitem2'));
    
    // Shared time
    var ts = FR_sharedTime('newitem2');
    assert("5.3.3", ts>0);

    // Unstar items
    FR_unstarItem('newitem2');
    assertEquals("5.4.1", true, FR_isShared('newitem2'));
    
    FR_unshareItem('newitem2');
    assertEquals("5.4.2", false, FR_isShared('newitem2'));
} 

function testAPIRead() {
    FR_init();
    
    var read = FR_getReadItems();
    assertEquals("6.0.0", 2, read.length);
    assert("6.0.1", $.indexOf(read,'item3') >= 0);
    assert("6.0.2", $.indexOf(read,'item5') >= 0);
    // negative case
    assert("6.0.3", $.indexOf(read,'item1') < 0);

    // Test default values
    assertEquals("6.1.0", true, FR_isItemRead('item3'));
    assertEquals("6.1.1", true, FR_isItemRead('item5'));
    // negative case
    assertEquals("6.1.2", false, FR_isItemRead('item2'));
    
    // Set new items as read
    assertEquals("6.2.0", false, FR_isItemRead('newitem1'));
    assertEquals("6.2.1", false, FR_isItemRead('newitem2'));
    
    FR_setItemRead('newitem1');
    assertEquals("6.3.1", true, FR_isItemRead('newitem1'));
    
    FR_setItemRead('newitem2');
    assertEquals("6.3.2", true, FR_isItemRead('newitem2'));
    
    // Read time
    var ts = FR_itemReadTime('newitem2');
    assert("6.3.3", ts>0);

    // Unset read 
    FR_unshareItem('newitem2');
    assertEquals("6.4.1", true, FR_isItemRead('newitem2'));
    
    FR_setItemUnread('newitem2');
    assertEquals("6.4.2", false, FR_isItemRead('newitem2'));
} 

function testAPIFeedInfo() {
    FR_init();

    var feedinfo = FR_feedInfo(TEST_FEED3);
    assertEquals("7.0", TEST_TITLE3, feedinfo.title);
    assertEquals("7.1", TEST_FEED3, feedinfo.feed);

    FR_cacheFeed("testfeed1", 'testtitle1');
    var info = FR_feedInfo('testfeed1');
    assertEquals("7.2", 'testfeed1', info.feed);
    assertEquals("7.2", 'testtitle1', info.title);

    // Now for the stats
    var stats = FR_getStats();
    assertEquals("7.3", FRV_sampleTrends, stats);
}

function testAPIProperties() {
    FR_init();

    // Non existant property
    assertEquals("9.0", null, FR_getProperty('prop1'));
    
    // Set a property
    FR_setProperty('prop1', 'value1');
    // Verify the property
    assertEquals("9.1", 'value1', FR_getProperty('prop1'));

    // modify a property
    FR_setProperty('prop1', 'value2');
    // Verify the property
    assertEquals("9.2", 'value2', FR_getProperty('prop1'));
}

function testAPILogin() {
    FR_init();
    var info = FR_loginInfo();
    assertEquals("10.0", 'dummy@gmail.com', info.id);
    assertEquals("10.1", '0', info.lastlogin);
    assertEquals("10.2", 'Big Dummy', info.name);

    var shareurl = FR_getShareURL();
    assert("10.3", shareurl != null);
}

function testAPIMisc() {
    var tip1 = FR_getTips();
    var tip2 = FR_getTips(2);
}

$.merge(testlist, [
    'testAPIInit',
    'testAPISubscription',
    'testAPIFolders',
    'testAPITags',
    'testAPIBrands',
    'testAPIStarred',
    'testAPIShared',
    'testAPIRead',
    'testAPIFeedInfo',
    'testAPIProperties',
    'testAPILogin',
    'testAPIMisc'
]);

