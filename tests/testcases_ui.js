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


var allfolders1;
var allfolders;
var brows;
var checks;
var chk;
var choices;
var dropdown;
var feed1;
var feed2;
var feed;
var feedinfo1;
var feedinfo2;
var feedrows1;
var feedrows2;
var feedrows;
var homerows;
var invoke;
var itemid;
var keyword;
var link;
var ncount1;
var ncount2;
var renamelink;
var selectedFolder;
var srows;
var subs;
var tag1;
var tag2;
var tag3;
var tagrows;
var title1;
var topnode;

function testInit() {
    // R.L.0
    clearEventLog();
    reader_main();
    assertEvent("R.L.0/0", 'evOpen');
    assertEvent("R.L.0/1", 'evRefresh');

    // Start with a sane state
    ReaderViewer.viewtype = 'HomeView';
    ReaderViewer.handleEvent('evListView');
}

function testReader0() {
    testInit();

    // R.L.1
    clearEventLog();
    Reader.handleEvent('evHome', $("#ol-home")[0]);
    assertEvent("R.L.1/0", "evListView");
    assertEquals("R.L.1/1",  'HomeView', ReaderViewer.viewtype);

    // Resize in listview
    handle_resize();

    // Handle clicking on the main body
    body_clicked();
}
 
function testReader0a() {
    // Start off in trends view without any recently items
    FRV_tagHash['_starred'] = [];
    FRV_tagHash['_shared'] = [];

    clearEventLog();
    Reader.handleEvent('evHome', $("#ol-home")[0]);
    assertEvent("R.L.1/2", "evListView");
    assertEquals("R.L.1/3",  'HomeView', ReaderViewer.viewtype);

    assertEquals("R.L.1/4", 'none', DOM.recentStarred.css('display'));
    assertEquals("R.L.1/5", 'none', DOM.recentShared.css('display'));
}

function testReader1() {
    // R.L.2
    clearEventLog();
    Reader.handleEvent('evAddSub',$("#quickadd")[0]);

    // Test a non-enter keypress
    clearEventLog();
    var node = DOM.quickadd;
    node[0].onkeypress({type: 'keypress', 
                                target: node[0], 
                                keyCode: KEY_ESC});
    assertNoevent("R.L.2/0", "evListView");

    clearEventLog();
    // Need to press enter for search
    node.enter();
    
    assertEquals("R.L.2/1", 'SearchResultsView', ReaderViewer.viewtype);
    assertEvent("R.L.2/2", "evListView");
    
    // R.L.3
    Reader.handleEvent('evRefresh');
}


function testReader2() {
    // R.L.4
    clearEventLog();
    Reader.handleEvent('evBrowse');
    assertEquals("R.L.4/1", 'FeedDiscoveryView', ReaderViewer.viewtype);
    assertEvent("R.L.4/0", "evListView");

    // Add a bundle
    Reader.bundleAdded('bundle1');
    assertEquals("Reader.0", 'added',
                 FR_getProperty(FRP_BUNDLE_STATE + 'bundle1'));

}


function testReader3() {    
    // R.L.5
    clearEventLog();
    Reader.handleEvent('evAllItems', $("#ol-allitems")[0]);
    assertEquals("R.L.5/1", 'AllItemsView', ReaderViewer.viewtype);
    assertEvent("R.L.5/0", "evListView");

}


function testReader4() {
    // R.L.6
    clearEventLog();
    Reader.handleEvent('evSubscriptionTitle', null, TEST_FEED3);
    assertEquals("R.L.6/1", 'SubscriptionView', ReaderViewer.viewtype);
    assertEvent("R.L.6/0", "evListView");
    assertEquals("R.L.6/2", TEST_FEED3, Reader.feed);

    // Refresh after selecting a feed
    Reader.handleEvent('evRefresh');

}


function testReader5() {
    // Add feed to two folders
    FR_copyToFolder(TEST_FEED3, 'newfolder');
    // Refresh after selecting a feed in 2 folders
    Reader.handleEvent('evRefresh');
    
}


function testReader6() {
    // Open an orphan feed 
    Reader.handleEvent('evSubscriptionTitle', null, TEST_FEED5);
    assertEquals("R.L.6/3", 'SubscriptionView', ReaderViewer.viewtype);
    assertEvent("R.L.6/4", "evListView");
    assertEquals("R.L.6/5", TEST_FEED5, Reader.feed);
    // Refresh after selecting an orphan feed
    Reader.handleEvent('evRefresh');

}


function testReader7() {
    // R.L.7
    clearEventLog();
    assert("R.L.7/0", !$("#ol-feedlist").is(".updatedonly"));
    Reader.handleEvent('evSortUpDatedorAll');
    assert("R.L.7/1", $("#ol-feedlist").is(".updatedonly"));
    Reader.handleEvent('evSortUpDatedorAll');
    assert("R.L.7/2", !$("#ol-feedlist").is(".updatedonly"));

    Reader.showUpdatedOnly();
    assert("R.L.7/3", $("#ol-feedlist").is(".updatedonly"));

    Reader.showAll();
    assert("R.L.7/4", !$("#ol-feedlist").is(".updatedonly"));
}


function testReader8() {
    // R.L.8
    clearEventLog();
    Reader.handleEvent('evTrends', $("#trends-selector")[0]);
    assertEquals("R.L.8/1", 'TrendsView', ReaderViewer.viewtype);
    assertEvent("R.L.8/0", "evListView");
}


function testReader9() {    
    // R.L.9
    clearEventLog();
    Reader.handleEvent('evTagTitle', null, 'tag1');
    assertEquals("R.L.9/1", 'TagView', ReaderViewer.viewtype);
    assertEvent("R.L.9/0", "evListView");

    // Refresh after selecting a tag
    Reader.handleEvent('evRefresh');
}


function testReader10() {
    //
    // Missing from specs - folders
    //
    Reader.openFolder('news');
    // Refresh after selecting a folder
    Reader.handleEvent('evRefresh');
    // Refresh after expanding a folder
    Reader.toggleFolder('news');
    Reader.handleEvent('evRefresh');
}


function testReader11() {
    // More toggling, expanding collapsing
    assert("Reader.1", Reader.folderNodes['news'].is('.collapsed'));
    Reader.toggleFolder('news');
    assert("Reader.2", !Reader.folderNodes['news'].is('.collapsed'));

    Reader.expandFolder('technology');
    assert("Reader.3", !Reader.folderNodes['technology'].is('.collapsed'));
    Reader.collapseFolder('technology');
    assert("Reader.4", Reader.folderNodes['technology'].is('.collapsed'));
}


function testReader12() {
    // R.L.10
    clearEventLog();
    Reader.handleEvent('evStarred');
    assertEquals("R.L.10/1", 'BrandView', ReaderViewer.viewtype);
    assertEquals("R.L.10/2", 'starred', Reader.brand);
    assertEvent("R.L.10/0", "evListView");

    // Refresh after selecting a brand
    Reader.handleEvent('evRefresh');

}


function testReader13() {
    // R.L.11
    clearEventLog();
    Reader.handleEvent('evShared');
    assertEquals("R.L.11/1", 'BrandView', ReaderViewer.viewtype);
    assertEquals("R.L.11/2", 'shared', Reader.brand);
    assertEvent("R.L.11/0", "evListView");
}


function testReader14() {
    // R.L.13
    clearEventLog();
    assertEquals("R.L.13/0", 'block', $("#nav").css('display'));
    Reader.handleEvent('evClose');
    assertEquals("R.L.13/1", 'none', $("#nav").css('display'));

    Reader.handleEvent('evOpen');
    assertEquals("R.L.13/2", 'block', $("#nav").css('display'));

    // from UI
    clearEventLog();
    $("#nav-toggler").click();
    assertEvent("R.L.13/3", 'evClose');
    assertEquals("R.L.13/4", 'none', $("#nav").css('display'));

    clearEventLog();
    $("#nav-toggler").click();
    assertEvent("R.L.13/5", 'evOpen');
    assertEquals("R.L.13/6", 'block', $("#nav").css('display'));
}


function testReader15() {
    // Feed flashing
    Reader.flashFeeds([TEST_FEED3, TEST_FEED5]);
}


function testReader16() {
    // Update unread count
    itemid = FC_makeItemId(TEST_FEED3, 'dummyitem');
    FR_tagItem(itemid, 'news');
    FR_brandItem(itemid, 'starred');

    Reader.updateFeedCount([TEST_FEED5, TEST_FEED3], [itemid]);

}


function testReader17() {    // Remove a non-existant feed
    clearEventLog();
    Reader.removeFeed(TEST_FEED1);
    assertEvent("Reader.5", "evRefresh");
    
}

function testReader18() {
    // click various elements in the reader list
    assert("ReaderInvoke.3", $(".feed-invoke", $("#Reader")).length>0);
    $($(".feed-invoke", $("#Reader"))[0]).click();
}

function testReader19() {
    assert("ReaderInvoke.0", $(".folder-invoke", $("#Reader")).length>0);
    $($(".folder-invoke", $("#Reader"))[0]).click();
}

function testReader20() {
    assert("ReaderInvoke.1", $("#fl-taglist//li").length>0);
    $($("#fl-taglist//li")[0]).click();
}

function testReader21() {
    assert("ReaderInvoke.2", $(".tpl-brandlist", $("#Reader")).length>0);
    $($(".tpl-brandlist", $("#Reader"))[0]).click();
}

function testReader22() {
    $(".lv-refresh").click();
}

function testSettings0() {
    testInit();

    // Switch to settings mode
    // R.L.12
    clearEventLog();
    assertEquals("R.L.12/0", "block", $("#main").css('display'))
    assertEquals("R.L.12/1", "none", $("#settings").css('display'))
    Reader.handleEvent('evSettings');
    assertEquals("R.L.12/2", "none", $("#main").css('display'))
    assertEquals("R.L.12/3", "block", $("#settings").css('display'))

    // Transition : R.L -> R.S
    assertEquals("R.L.12/4", "Settings", Reader.state);
}

function testSettings1() {
    clearEventLog();
    Reader.handleEvent('evSubTab');
    assertEquals("R.S.0/0", 'SubView', Settings.viewtype);
    assertEvent("R.S.0/1", "evSettingsView");
}

function testSettings2() {
    clearEventLog();
    Reader.handleEvent('evPrefTab');
    assertEquals("R.S.1/0", 'PrefView', Settings.viewtype);
    assertEvent("R.S.1/1", "evSettingsView");

}

function testSettings3() {
    clearEventLog();
    Reader.handleEvent('evTagTab');
    assertEquals("R.S.2/0", 'TagView', Settings.viewtype);
    assertEvent("R.S.2/1", "evSettingsView");

}

function testSettings4() {
    clearEventLog();
    Reader.handleEvent('evGoodiesTab');
    assertEquals("R.S.3/0", 'GoodiesView', Settings.viewtype);
    assertEvent("R.S.3/1", "evSettingsView");

}

function testSettings5() {
    clearEventLog();
    Reader.handleEvent('evImexportTab');
    assertEquals("R.S.4/0", 'ImexportView', Settings.viewtype);
    assertEvent("R.S.4/1", "evSettingsView");
    
}

function testSettings6() {
    // Transition : R.S -> R.L
    clearEventLog();
    Reader.handleEvent('evReturnToReader');
    assertEquals("R.S.6/0", true, StateVars.PreviousView);
    assertEquals("R.S.6/1", 'List', Reader.state);
    assertEvent("R.S.6/2", "evListView");
}

function testSettingsSubs0() {
    testInit();

    // First Switch to settings mode
    // R.L.12
    clearEventLog();
    assertEquals("R.L.12/0", "block", $("#main").css('display'))
    assertEquals("R.L.12/1", "none", $("#settings").css('display'))
    Reader.handleEvent('evSettings');
    assertEquals("R.L.12/2", "none", $("#main").css('display'))
    assertEquals("R.L.12/3", "block", $("#settings").css('display'))

    // R.S.S.0
    Reader.handleEvent('displaySubList');

}

function testSettingsSubs1() {
    // R.S.S.1
    feedrows1 = $(".tpl-settings-row", DOM.settings);
    ncount1 = 0;
    feedrows1.each(function(i, row) {
        if ($(this).css('display') != 'none')
            ncount1++;
    });

    DOM.subsFilterInput.setdata('cnn').enter();
    feedrows2 = $(".tpl-settings-row", DOM.settings);
    ncount2 = 0;
    feedrows2.each(function(i, row) {
        if ($(this).css('display') != 'none')
            ncount2++;
    });
    assert("R.S.S.1", ncount1 > ncount2);
}

function testSettingsSubs2() {
    // R.S.S.2
    DOM.subsFilterInput.setdata('').enter();
    feed1 = $(".fld-feed", feedrows1[0]).getdata();
    feedinfo1 = FR_feedInfo(feed1);

    // rename
    renamelink = $(".rename-link", feedrows1[0]).click();
    // test cancelling
    $("#hover-form//.cancel").click();

    // Open the rename form again
    renamelink.click();
    title1 = $("#hover-form//input.fld-title").getdata();

    assertEquals("R.S.S.2", feedinfo1.title, title1);
    $("#hover-form//input.fld-title").setdata('New Title');
    $("#hover-form//#subs-rename-button").click();
    feedinfo2 = FR_feedInfo(feed1);
    assertEquals("R.S.S.2/1", 'New Title', feedinfo2.title);
}
    
function testSettingsSubs3() {
    // R.S.S.3

    feedrows1 = $(".tpl-settings-row", DOM.settings);
    var sfeed1 = $(".fld-feed", feedrows1[2]).getdata();
    dropdown = $(".subs-folder-chooser", feedrows1[2]);
    var topnode = dropdown.parents(".tpl-settings-row");
    var ulc = $("ul.contents", topnode);

    assertEquals("R.S.S.3/0", 'none', ulc.css('display'));
    dropdown.click();
    assertEquals("R.S.S.3/1", 'block', ulc.css('display'));

    // click againt to test closing it
    dropdown.click();
    assertEquals("R.S.S.3/2", 'none', ulc.css('display'));

    // click againt to open it - and choose a tag
    dropdown.click();

    // click the first tag
    var choices = $("li", ulc);
    var stag = $(choices[0]).getdata();

    assert("R.S.S.3/3", !FR_folderForFeed(sfeed1));
    $(choices[0]).click();
    assert("R.S.S.3/4", $.indexOf(FR_folderForFeed(sfeed1), stag) >= 0);
    assertEquals("R.S.S.3/5", 'none', ulc.css('display'));

    // click againt to open it - and unchoose a tag
    dropdown.click();

    // click the first tag
    choices = $("li", ulc);
    $(choices[0]).click();

    assertEquals("R.S.S.3/6", undefined, FR_folderForFeed(sfeed1));
    assertEquals("R.S.S.3/7", 'none', ulc.css('display'));

    // Try adding a new tag
    
    // click againt to open it - and unchoose a tag
    dropdown.click();

    // click the first tag
    var choice = $("li.newfolder", ulc)[0];
    var newtag = 'test_folder1';

    // Test pressing cancel on the prompt dialog
    SetPromptResponse(false);
    $(choice).click();
    assert("R.S.S.3/8a", $.indexOf(FR_folderForFeed(sfeed1), newtag) < 0);

    // Return 'test_folder1' when prompted for new tag
    SetPromptResponse(newtag);
    $(choice).click();
    
    // verify that the new tag got added
    assert("R.S.S.3/8", $.indexOf(FR_folderForFeed(sfeed1), newtag) >= 0);
}

function testSettingsSubs4() {
    // R.S.S.4
    $(".unsubscribe-cell", feedrows1[0]).click();
    assert("R.S.S.4", $.indexOf(FR_allFeeds(), feed1) < 0);
}

function testSettingsSubs5() {
    feedrows = $(".tpl-settings-row", DOM.settings);
    chk = $("input.chkbox", feedrows);

    // Give the selection links a work out
    Settings.select_all();
    assert("R.S.S.5/0a", chk[0].checked);
    assert("R.S.S.5/0b", chk[1].checked);

    Settings.select_unassigned();

    // R.S.S.5 & R.S.S.7
    $([chk[0], chk[1]]).attr('checked', 'checked');
    feed1  = $(".fld-feed", feedrows[0]).getdata();
    feed2  = $(".fld-feed", feedrows[1]).getdata();

    Settings.checkChanged();
    $("#subs-folder-options")[0].selectedIndex = 3;
    selectedFolder = $("#subs-folder-options")[0].value;
    Settings.folderChanged($("#subs-folder-options")[0]);
    
    assert("R.S.S.5/1", $.indexOf(FR_folderForFeed(feed1), selectedFolder) >= 0);
    assert("R.S.S.5/2", $.indexOf(FR_folderForFeed(feed2), selectedFolder) >= 0);

    // Try selecting without anything checked
    Settings.select_none();
    Settings.unsubscribeSelected();

    // reload feedrows since they may have changed
    // and verify feeds are not selected
    feedrows = $(".tpl-settings-row", DOM.settings);
    chk = $("input.chkbox", feedrows);
    assert("R.S.S.5/3a", !chk[0].checked);
    assert("R.S.S.5/3b", !chk[1].checked);

    // Select a feed & remove its selected folder
    $(chk[0]).attr('checked', 'checked');
    Settings.checkChanged();

    feed1  = $(".fld-feed", feedrows[0]).getdata();

    var remoptions = $("#subs-folder-options//option.remove");
    assert("R.S.S.5/4", remoptions.length > 0);

    var remfolder = remoptions[0].value;

    assert("R.S.S.5/5", $.indexOf(FR_folderForFeed(feed1), remfolder) >= 0);

    $("#subs-folder-options")[0].selectedIndex = remoptions[0].index;
    Settings.folderChanged($("#subs-folder-options")[0]);
    assert("R.S.S.5/6", $.indexOf(FR_folderForFeed(feed1), remfolder) < 0);
}

function testSettingsSubs6() {
    // R.S.S.6
    SetConfirm(false);
    Settings.unsubscribeSelected();
    assert("R.S.S.6/1", $.indexOf(FR_allFeeds(), feed1) >= 0);

    SetConfirm(true);
    Settings.unsubscribeSelected();
    assert("R.S.S.6/1", $.indexOf(FR_allFeeds(), feed1) < 0);
}
    
function testSettingsSubs7() {
    // R.S.S.8
    Reader.handleEvent('evSettingsView');
    assertEquals("R.S.8/0", 'SubView', Settings.viewtype);
    assertEvent("R.S.8/1", "evSettingsView");
    Reader.handleEvent('evReturnToReader');
}

function testSettingsTags0() {
    testInit();

    // First Switch to settings mode
    // R.L.12
    clearEventLog();
    assertEquals("R.L.12/0", "block", $("#main").css('display'))
    assertEquals("R.L.12/1", "none", $("#settings").css('display'))
    Reader.handleEvent('evSettings');
    assertEquals("R.L.12/2", "none", $("#main").css('display'))
    assertEquals("R.L.12/3", "block", $("#settings").css('display'))
}

function testSettingsTags1() {
    // Then switch to tags tab
    clearEventLog();
    Reader.handleEvent('evTagTab');
    assertEquals("R.S.2/0", 'TagView', Settings.viewtype);
    assertEvent("R.S.2/1", "evSettingsView");
}

function testSettingsTags2() {
    // R.S.T.0
    Reader.handleEvent('displayTagList');
    
    tagrows = $(".tpl-tags-row", DOM.settings);
    allfolders = FR_allFolders();
    $.merge(allfolders, FR_allTags());

    assertEquals("R.S.T.0", tagrows.length, allfolders.length);
}

function testSettingsTags3() {
    // R.S.T.1
    tag1 = $(".fld-folder", tagrows[0]).getdata();
    assertEquals("R.S.T.1/0", null, FR_getProperty(FRP_FOLDER_SHARE + tag1));
    $(".change-sharing", tagrows[0]).click();
    assertEquals("R.S.T.1/1", 'public', FR_getProperty(FRP_FOLDER_SHARE + tag1));

    $(".starred-change-sharing").click();
    assertEquals("R.S.T.1/1a", 'public', 
                 FR_getProperty(FRP_FOLDER_SHARE + "_starred"));

    // Refresh with a public feed
    Reader.handleEvent('evSettingsView');

    tagrows = $(".tpl-tags-row", DOM.settings);
    $(".change-sharing", tagrows[0]).click();
    assertEquals("R.S.T.1/2", null, FR_getProperty(FRP_FOLDER_SHARE + tag1));
}

function testSettingsTags4() {
    tagrows = $(".tpl-tags-row", DOM.settings);

    // R.S.T.2
    tag2 = $(".fld-folder", tagrows[1]).getdata();
    tag3 = $(".fld-folder", tagrows[2]).getdata();

    // Work out the selection options
    Settings.select_alltags();

    Settings.select_publictags();

    Settings.select_privatetags();

    Settings.select_notags();

    // Finally select 2 items only
    checks = $("input.chkbox", tagrows);
    $([checks[1], checks[2]]).attr('checked', 'checked');
    Settings.tagCheckChanged(checks[1]);
    Settings.tagCheckChanged(checks[2]);

    Settings.checkChanged();

    // Refresh after selecting
    Reader.handleEvent('evSettingsView');
}
    
function testSettingsTags5() {
    // R.S.T.3
    $(".labels-change-sharing")[0].value = 'public';
    Settings.shareOptionChanged($(".labels-change-sharing")[0]);
    assertEquals("R.S.T.3/1", 'public', FR_getProperty(FRP_FOLDER_SHARE + tag2));
    assertEquals("R.S.T.3/2", 'public', FR_getProperty(FRP_FOLDER_SHARE + tag3));

    $(".labels-change-sharing")[0].value = 'private';
    Settings.shareOptionChanged($(".labels-change-sharing")[0]);
    assertEquals("R.S.T.2/3", null, FR_getProperty(FRP_FOLDER_SHARE + tag2));
    assertEquals("R.S.T.2/4", null, FR_getProperty(FRP_FOLDER_SHARE + tag3));
}
    
function testSettingsTags6() {
    // R.S.T.4
    var tss = $(".ts-starred-checkbox")
    tss.attr('checked', 'checked');
    Settings.tagCheckChanged(tss[0]);

    Settings.removeSelectedTags();
    assert("RST4/0a", $.indexOf(FR_allFolders(), tag2) >= 0);

    tss.attr('checked', '');
    Settings.tagCheckChanged(tss[0]);

    Settings.removeSelectedTags();

    allfolders1 = FR_allFolders();
    $.merge(allfolders1, FR_allTags());
    assert("RST4/0", $.indexOf(allfolders1, tag2) < 0);
    assert("RST4/1", $.indexOf(allfolders1, tag3) < 0);

}

function testSettingsTags7() {
    tagrows = $(".tpl-tags-row", DOM.settings);

    // R.S.T.5
    assert("R.S.T.5/0", $.indexOf(allfolders1, tag1) >= 0);
//    Settings.removeFolder($(tagrows[0]));
    $(".delete-cell", tagrows[0]).click();
    
    allfolders1 = FR_allFolders();
    $.merge(allfolders1, FR_allTags());
    assert("R.S.T.5/1", $.indexOf(allfolders1, tag1) < 0);
}

function testSettingsTags8() {
    // R.S.T.6
    Reader.handleEvent('evSettingsView');
    assertEquals("R.S.T.6/0", 'TagView', Settings.viewtype);
    assertEvent("R.S.T.6/1", "evSettingsView");

    Reader.handleEvent('evReturnToReader');
}

function testSettingsPrefs0() {
    testInit();

    // First Switch to settings mode
    // R.L.12
    clearEventLog();
    assertEquals("R.L.12/0", "block", $("#main").css('display'))
    assertEquals("R.L.12/1", "none", $("#settings").css('display'))
    Reader.handleEvent('evSettings');
    assertEquals("R.L.12/2", "none", $("#main").css('display'))
    assertEquals("R.L.12/3", "block", $("#settings").css('display'))
}

function testSettingsPrefs1() {
    // Then switch to prefs tab
    clearEventLog();
    Reader.handleEvent('evPrefTab');

    // RSP0
    Reader.handleEvent('evRevert');
    assertEquals("RSP0", 'true', FR_getProperty(FRP_REVERT));

    // RSP1
    Reader.handleEvent('evSetHome', null, 'newhome');
    assertEquals("RSP1", 'newhome', FR_getProperty(FRP_START_PAGE));
    
    // RSP2
    Reader.handleEvent('evScrollTracking', null, true);
    assertEquals("RSP2/1", 'true', FR_getProperty(FRP_SCROLL_TRACKING));

    Reader.handleEvent('evScrollTracking', null, false);
    assertEquals("RSP2/2", null, FR_getProperty(FRP_SCROLL_TRACKING));
}

function testSettingsPrefs2() {
    // RSP3
    Reader.handleEvent('evSettingsView');
    assertEquals("R.S.P.3/0", 'PrefView', Settings.viewtype);
    assertEvent("R.S.P.3/1", "evSettingsView");

    Reader.handleEvent('evReturnToReader');
}

function testImportExport() {
    testInit();

    // First Switch to settings mode
    // R.L.12

    if (Reader.state != 'List')
        Reader.handleEvent('evReturnToReader');

    clearEventLog();
    assertEquals("R.L.12/0", "block", $("#main").css('display'))
    assertEquals("R.L.12/1", "none", $("#settings").css('display'))
    Reader.handleEvent('evSettings');
    assertEquals("R.L.12/2", "none", $("#main").css('display'))
    assertEquals("R.L.12/3", "block", $("#settings").css('display'))

    // Then switch to Im/Exp tab
    clearEventLog();
    Reader.handleEvent('evImexportTab');

    // R.S.I.0
    Reader.handleEvent('evExImportToOPML');

    // R.S.I.1
    Reader.handleEvent('evSettingsView');
    assertEquals("R.S.I.1/0", 'ImexportView', Settings.viewtype);
    assertEvent("R.S.I.1/1", "evSettingsView");

    Reader.handleEvent('evReturnToReader');
}

function testGoodies() {
    testInit();

    // First Switch to settings mode
    // R.L.12
    if (Reader.state != 'List')
        Reader.handleEvent('evReturnToReader');

    clearEventLog();
    assertEquals("R.L.12/0", "block", $("#main").css('display'))
    assertEquals("R.L.12/1", "none", $("#settings").css('display'))
    Reader.handleEvent('evSettings');
    assertEquals("R.L.12/2", "none", $("#main").css('display'))
    assertEquals("R.L.12/3", "block", $("#settings").css('display'))

    // Then switch to goodies tab
    clearEventLog();
    Reader.handleEvent('evGoodiesTab');

    // R.S.G.0
    Reader.handleEvent('evResource');

    // R.S.G.1
    Reader.handleEvent('evSettingsView');
    assertEquals("R.S.G.1/0", 'GoodiesView', Settings.viewtype);
    assertEvent("R.S.G.1/1", "evSettingsView");

    Reader.handleEvent('evReturnToReader');
}

function testRVHome0() {
    testInit();

    // Switch to home view
    Reader.handleEvent('evHome', $("#ol-home")[0]);

    // RVH0 - todo
    ReaderViewer.handleEvent("evDevBlog");

    // RVH1 - todo
    ReaderViewer.handleEvent("evTip");

    // RVH3 - todo
    ReaderViewer.handleEvent("displayTips");
}

function testRVHome1() {
    // RVH2
    homerows = $(".tpl-summary", $("#main"));
    link = $(".openfeed-link", homerows[0]);

    clearEventLog();
    Reader.openFeed(TEST_FEED3);
    assertEquals("RVH2/1", 'SubscriptionView', ReaderViewer.viewtype);
    assertEvent("RVH2/0", "evListView");
    assertEquals("RVH2/2", TEST_FEED3, Reader.feed);
}
    

function testRVBrowse0() {
    testInit();

    // Switch to feed discovery
    Reader.handleEvent('evBrowse');

    $("#show-more-bundles-link").click();
    assert("Browse.1", $("#directory-box").is(".bundles-only")); 

    $("#show-more-bundles-return-link").click();
    assert("Browse.2", !$("#directory-box").is(".bundles-only")); 

    brows = $(".tpl-bundle-news//.bundle-invoke", $("#main"));
    subs  = $(".tpl-bundle-news//.bundle-subscribe", $("#main"));

    // RV.FD.2
    clearEventLog();
    ReaderViewer.handleEvent('evSubscribe', subs[0]);
    assert("RVFD2", $.indexOf(FR_allFolders(), 'News') >= 0);
}

function testRVBrowse1() {
    //RV.FD.4
    clearEventLog();
    ReaderViewer.handleEvent('evClose');
}

function testRVBrowse1a() {
    //RV.FD.5
    clearEventLog();
    ReaderViewer.handleEvent('displayBundles');
}

function testRVBrowse1b() {
    //RV.FD.6
    clearEventLog();
    ReaderViewer.handleEvent('evImport');
    assertEvent("RV.FD.6/0", "evSettingsView");
    assertEquals("FV.FD.6/1", 'ImexportView', Settings.viewtype);

    // Get out of the settings
    Reader.handleEvent('evReturnToReader');
}

function testRVBrowse2() {
    // RV.FD.1
    clearEventLog();

    $(brows[0]).click();
//    ReaderViewer.handleEvent('evTag', brows[0]);
    assertEvent("RVFD.1/0", 'evTag');
    assertEvent("RVFD.1/0", 'evListView');
    assertEquals("RVFD.1/1", "News", Reader.folder);
}

function testRVBrowse3() {
    // RV.FD.3 
    clearEventLog();
    keyword = 'open source';
    $('#directory-search-query').setdata(keyword);
    ReaderViewer.handleEvent('evSearch');

    assertEquals("FV.FD.3/1", 'SearchResultsView', ReaderViewer.viewtype);
    assertEvent("RV.FD.3/0", "evListView");
    assertEquals("RV.FD.3/2", keyword, $("#sv-keyword").getdata());
}
    
function testRVBrowse4() {
    // RV.FD.7
    ReaderViewer.viewtype = 'HomeView';
    ReaderViewer.handleEvent('evListView');
}

function testRVSearch0() {
    testInit();

    // Start with the search results page
    clearEventLog();
    Reader.handleEvent('evAddSub',$("#quickadd")[0]);
    assertEquals("RV.SR.0/0", 'block',
                 $("#quick-add-bubble-holder").css('display'));

    quickadd_close_clicked();
    assertEquals("RV.SR.0/0", 'none',
                 $("#quick-add-bubble-holder").css('display'));

    Reader.handleEvent('evAddSub',$("#quickadd")[0]);

    // Need to press enter for search  
    DOM.quickadd.enter();
}

function testRVSearch1() {
    // .. continue prev test
    assertEquals("R.L.2/1", 'SearchResultsView', ReaderViewer.viewtype);
    assertEvent("R.L.2/0", "evListView");

    // RV.SR.0
    ReaderViewer.handleEvent('doSearch');

    // RV.SR.2
    srows = $(".tpl-search//table.subscribe", $("#main"));
    // if there are any results
    assert("RV.SR.2/0", srows.length > 1);
    feed = $(".fld-entries-url", srows[1]).getdata();
}

function testRVSearch1a() {
    // RV.SR.SS.0
    mrows = $(".tpl-search//.sv-folder-menu", $("#main"));
    assert("RV.SR.SS.0", mrows.length > 1);

    // make sure dropdown is not visible to begin with
    assertEquals("RV.SR.SS.0/1", 'none', 
                 $("ul.contents", mrows[1]).css('display'));

    $(mrows[1]).click();

    // make sure dropdown is visible now
    assertEquals("RV.SR.SS.0/2", 'block', 
                 $("ul.contents", mrows[1]).css('display'));

    var mchoice = $($("ul.contents//li", mrows[1])[0]);
    var mtag    = mchoice.getdata();

    mchoice.click();
    // make sure dropdown is not visible now
    assertEquals("RV.SR.SS.0/3", 'none', 
                 $("ul.contents", mrows[1]).css('display'));

    assert("RV.SR.SS.0/4", $.indexOf(FR_folderForFeed(feed), mtag) >= 0);
    
    // test clicking on dropdown to dismiss it

    // open dropdown
    $(mrows[1]).click();

    // make sure dropdown is visible now
    assertEquals("RV.SR.SS.0/5", 'block', 
                 $("ul.contents", mrows[1]).css('display'));

    $(mrows[1]).click();

    // make sure dropdown is hidden now
    assertEquals("RV.SR.SS.0/6", 'none', 
                 $("ul.contents", mrows[1]).css('display'));

}
    
function testRVSearch1b() {
    // RV.SR.SS.1 &
    // RV.SR.SS.2
    assert("RV.SR.2/2", $.indexOf(FR_allFeeds(), feed) < 0);
    $(srows[1]).click();
    assert("RV.SR.2/1", $.indexOf(FR_allFeeds(), feed) >= 0);
    assertEvent("RV.SR.2/3", "evSubSubscribed");
}
    
function testRVSearch2() {
    topnode = $(srows[1]).parents('.tpl-search');
    invoke = $(".feed-invoke", topnode);
    clearEventLog();
    invoke.click();

    assertEquals("RV.SR.SS.1/1", 'SubscriptionView', ReaderViewer.viewtype);
    assertEquals("RV.SR.SS.1/2", feed, Reader.feed);
    assertEvent("RV.SR.SS.1/3", "evListView");
}
    
function testRVSearch3() {
    // Back to search view for more testing
    clearEventLog();
    Reader.handleEvent('evAddSub',$("#quickadd")[0]);
    // Need to press enter for search
    DOM.quickadd.enter();

    Wait(2000); // we have to wait for the search results - takes time
}

function testRVSearch3a() {
    // RV.SR.SS.3

    srows = $(".tpl-search//span.unsubscribe", $("#main"));
    feed1 = $(".fld-entries-url", srows[1]).getdata();

    // make sure we are dealing with same feed
    assertEquals("RV.SR.SS.3/0", feed, feed1);

    clearEventLog();
    // first test if confirm cancel works
    SetConfirm(false);
    $(srows[1]).click();
    assert("RV.SR.SS.3/1", $.indexOf(FR_allFeeds(), feed) >= 0);

    SetConfirm(true);
    $(srows[1]).click();

    assertEvent("RV.SR.SS.3/3", "evUnsubscribe");
    assert("RV.SR.SS.3/4", $.indexOf(FR_allFeeds(), feed) < 0);
    
}

function testRVSearch4() {
    // RV.SR.1
    ReaderViewer.handleEvent('evReturnToFD');
    assertEquals("RV.SR.1/1", 'FeedDiscoveryView', ReaderViewer.viewtype);
    assertEvent("RV.SR.1/0", "evListView");

    // RV.SR.3
    ReaderViewer.viewtype = 'HomeView';
    ReaderViewer.handleEvent('evListView');
}
    
function testRVLV0() {
    testInit();

    // RV.LV
    // Open a list view for feed
    Reader.handleEvent('evSubscriptionTitle', null, TEST_FEED3);
    assertEquals("R.L.6/1", 'SubscriptionView', ReaderViewer.viewtype);
    assertEvent("R.L.6/0", "evListView");
    assertEquals("R.L.6/2", TEST_FEED3, Reader.feed);
}

function testRVLV1() {
    // RV.LV.0
    ReaderViewer.refresh();
    markall_clicked();
    // Pause for effect on pending items
    Wait(2000);
}

function testRVLV2() {
    // RV.LV.1
    ReaderViewer.showUnreadOnly();

    ReaderViewer.showAll();
}

function testRVLV3() {
    // RV.LV.2
    ReaderViewer.nextItem();
    ReaderViewer.nextItem();
    ReaderViewer.nextItem();

    // Wait for the item to be marked read
    Wait(2000);
}

function testRVLV3a() {

    // Click on open item
    item_clicked(FRS_current_item);

    // RV.LV.3
    ReaderViewer.prevItem();
    ReaderViewer.prevItem();
    ReaderViewer.prevItem();

    ReaderViewer.refresh();
    ReaderViewer.prevItem();

    // open an item and wait for a period to let it be marked as read
    ReaderViewer.nextItem();
    Wait(2000);
}

function testRVLV4() {
    // Toggle read state
    itemread_clicked(FRS_current_item);
    itemread_clicked(FRS_current_item);

    // RV.LV.4
    ReaderViewer.handleEvent('evRefresh');
}

function testRVLV5() {
    // RV.LV.A.0
    ReaderViewer.viewtype = 'AllItemsView';
    ReaderViewer.handleEvent('evRefresh');
}


function testRVLV6() {
    // RV.LV.A.1
    clearEventLog();
//    ReaderViewer.settingsClicked();

    // Click the Settings dropdown
    $("#lv-settings-menu").click();
    $("#order-by-newest").click();

    assertEquals("RV.LV.A.1/0", ReaderViewer.SortMode, 'newest');
    assertEvent("RV.LV.A.1/1", 'evRefresh');
}

function testRVLV7() {
    // RV.LV.A.1
    clearEventLog();
    ReaderViewer.settingsClicked();
    $("#order-by-oldest").click();

    assertEquals("RV.LV.A.1/2", ReaderViewer.SortMode, 'oldest');
    assertEvent("RV.LV.A.1/3", 'evRefresh');
}

function testRVLV8() {
    // RV.LV.A.1
    clearEventLog();
    ReaderViewer.settingsClicked();
    $("#order-by-auto").click();

    assertEquals("RV.LV.A.1/4", ReaderViewer.SortMode, 'auto');
    assertEvent("RV.LV.A.1/5", 'evRefresh');


    // RV.LV.A.2
    ReaderViewer.handleEvent('evListView');
}

function testRVLV9() {
    // RV.LV.T.0
    Reader.tag = 'tag1';
    ReaderViewer.viewtype = 'TagView';
    ReaderViewer.handleEvent('evRefresh');
    assertEquals("RV.LV.T.0", 'tag1', $('#lv-title').getdata());
}

function testRVLV10() {
    // RV.LV.T.1
    clearEventLog();
    ReaderViewer.settingsClicked();
    $("#order-by-newest").click();

    assertEquals("RV.LV.T.1/0", ReaderViewer.SortMode, 'newest');
    assertEvent("RV.LV.T.1/1", 'evRefresh');

    // RV.LV.T.2
    ReaderViewer.handleEvent('evListView');
}

function testRVLV11() {
    // RV.LV.ST.0
    Reader.brand = 'starred';
    ReaderViewer.viewtype = 'BrandView';
    ReaderViewer.handleEvent('evListView');
    assertEquals("RV.LV.ST.0", 'Your starred items', $('#lv-title').getdata());

    // RV.LV.ST.1
    ReaderViewer.setTitle('junk');
    ReaderViewer.handleEvent('evListView');
    assertEquals("RV.LV.ST.1", 'Your starred items', $('#lv-title').getdata());
}

function testRVLV12() {
    // RV.LV.SH.0
    Reader.brand = 'shared';
    ReaderViewer.viewtype = 'BrandView';
    ReaderViewer.handleEvent('evListView');
    assertEquals("RV.LV.SH.0", 'Your shared items', $('#lv-title').getdata());

    // RV.LV.SH.1
    ReaderViewer.setTitle('junk1');
    ReaderViewer.handleEvent('evListView');
    assertEquals("RV.LV.ST.1", 'Your shared items', $('#lv-title').getdata());
}

function testRVLV13() {
    // RV.LV.SU
    Reader.feed = TEST_FEED3;
    ReaderViewer.viewtype = 'SubscriptionView'

    // RV.LV.SU.0
    // RV.LV.SU.1
    ReaderViewer.handleEvent('evListView');
    assertEquals("RV.LV.SU.1", TEST_TITLE3, $('#lv-title').getdata());
}

function testRVLV14() {
    // RV.LV.SU.2
    clearEventLog();
    ReaderViewer.settingsClicked();
    $("#order-by-oldest").click();

    assertEquals("RV.LV.SU.2/0", ReaderViewer.SortMode, 'oldest');
    assertEvent("RV.LV.SU.2/1", 'evRefresh');
}

function testRVLV15() {
    // RV.LV.SU.3
    var tagoptions = $("ul.contents//li", $("#lv-settings-menu-contents"));

    // pick a tag thats not currently present for this feed
    var tag = $(tagoptions[3]).getdata();
    assert("RV.LV.SU.3/0", $.indexOf(FR_folderForFeed(TEST_FEED3), tag) < 0);
    ReaderViewer.settingsClicked();
    $(tagoptions[3]).click();
    assertEvent("RV.LV.SU.3/1", 'evRefresh');
    assert("RV.LV.SU.3/2", $.indexOf(FR_folderForFeed(TEST_FEED3), tag) >= 0);
}

function testRVLV16() {
    // RV.LV.SU.4

    assertEquals("RV.LV.SU.4/0", TEST_FEED3, Reader.feed);
    var newfeedname = 'Test String Feed Name';
    SetPromptResponse(newfeedname);
    ReaderViewer.handleEvent('evRename');

    assertEquals("RV.LV.SU.4/1", newfeedname, $("#lv-title").getdata());
    assertEquals("RV.LV.SU.4/2", newfeedname, FR_feedInfo(TEST_FEED3).title);
}

function testRVLV17() {
    // RV.LV.SU.5

    assertEquals("RV.LV.SU.5/0", TEST_FEED3, Reader.feed);
    ReaderViewer.handleEvent('evDelete');

    assert("RV.LV.SU.5/1", $.indexOf(FR_allFeeds(), TEST_FEED3) < 0);
    assertEvent("RV.LV.SU.5/2", 'evListView');
    assertEquals("RV.LV.SU.5/3", 'HomeView', ReaderViewer.viewtype);
}

function testRVIV0() {
    testInit();

    // Start with all items list view
    // I.IV.0
    Reader.handleEvent('evAllItems', $("#ol-allitems"));

    Wait(4000); // wait for a bit for the list to get loaded
}

var entries, item;
function testRVIV1() {
    // I.IV.1
    entries = $(".tpl-entry", $("#main"));
    assert("I.IV.1/0", entries.length > 0);

    item = $(".iv-main", entries[0]);
    itemid = $(".fld-entries-itemid", item).getdata();

    assertEquals("I.IV.1/1", false, FR_isShared(itemid));
    $(".item-share", item).click();
    assertEquals("I.IV.1/2", true, FR_isShared(itemid));
    $(".item-share", item).click();
    assertEquals("I.IV.1/3", false, FR_isShared(itemid));
}

function testRVIV2() {
    // I.IV.2
    item = $(".iv-main", entries[1]);
    itemid = $(".fld-entries-itemid", item).getdata();

    assertEquals("I.IV.2/1", false, FR_isStarred(itemid));
    $(".item-star", item).click();
    assertEquals("I.IV.2/2", true, FR_isStarred(itemid));
    $(".item-star", item).click();
    assertEquals("I.IV.2/3", false, FR_isStarred(itemid));
}

function testRVIV3() {
    // I.IV.3
    item = $(".iv-main", entries[2]);
    itemid = $(".fld-entries-itemid", item).getdata();

    assertEquals("I.IV.3/1", false, FR_isItemRead(itemid));
    $(".item-read", item).click();
    assertEquals("I.IV.3/2", true, FR_isItemRead(itemid));
    $(".item-read", item).click();
    assertEquals("I.IV.3/3", false, FR_isItemRead(itemid));
}

function testRVIV4() {
    // I.IV.4
    feed = FC_getItemFeed(itemid);
    clearEventLog();
    $(".iv-from", entries[2]).click();
    
    assertEquals("I.IV.4/1", 'SubscriptionView', ReaderViewer.viewtype);
    assertEvent("I.IV.4/0", "evListView");
    assertEquals("I.IV.4/2", feed, Reader.feed);
}

function testRVIV5() {
    // I.IV.5
    clearEventLog();
    $(".iv-goto", entries[2]).click();
}

function testRVIV6() {
    // I.IV.6
    clearEventLog();
    $(".iv-email", entries[2]).click();
}

function testRVIV7() {
    // I.IV.7
    clearEventLog();
    assertEquals("I.IV.7/0", 'none', $("#hover-tags-edit").css('display'));
    $(".iv-edittags", entries[2]).click();
    assertEquals("I.IV.7/1", 'block', $("#hover-tags-edit").css('display'));

    // check cancel
    $(".iv-addtags-cancel", $("#hover-tags-edit")).click();
    assertEquals("I.IV.7/1a", 'none', $("#hover-tags-edit").css('display'));

    // open tags again
    $(".iv-edittags", entries[2]).click();
    assertEquals("I.IV.7/1b", 'block', $("#hover-tags-edit").css('display'));
    
    var newtag = 'newtag';
    assert("I.IV.7/2", $.indexOf(FR_tagsForItem(itemid), newtag) < 0);
    $(".iv-addtags-input").setdata(newtag);

    // save the tags
    $(".iv-addtags-save", $("#hover-tags-edit")).click();
    assert("I.IV.7/3", $.indexOf(FR_tagsForItem(itemid), newtag) >= 0);
}

function testTrends0() {
    testInit();

    // Start off in trends view
    Reader.handleEvent('evTrends', $("#trends-selector")[0]);
    assertEquals("R.L.8/1", 'TrendsView', ReaderViewer.viewtype);
    assertEvent("R.L.8/0", "evListView");
}

function testTrends1() {
    // click on various tabs
    $($("#trends-period-tab//.tab-header")[1]).click();
    $($("#trends-period-tab//.tab-header")[2]).click();

    $("#trends-period-tab//.tab-header")[0].onclick({type: 'click', 
          target: $("#trends-period-tab//td.c")[0]});

}

function testTrends2() {
    $($("#trends-brand-tab//.tab-header")[1]).click();
    $($("#trends-brand-tab//.tab-header")[2]).click();
    $($("#trends-brand-tab//.tab-header")[0]).click();

}

function testTrends3() {
    $($("#trends-freq-tab//.tab-header")[1]).click();
    $($("#trends-freq-tab//.tab-header")[0]).click();
}

function testTrends4() {
}

function testCorners0() {
    testInit();

    var junkfeed = TEST_FEED1;
    FR_cacheFeed(junkfeed, 'test');
    FR_addFeed(junkfeed); // Non existant feed

    Reader.refresh();
    Reader.reloadFeeds();

    Reader.openFeed(junkfeed);
    Wait(1000);
}

function testCorners1() {
    testInit();

    Reader.handleEvent('evAllItems', $("#ol-allitems"));
    Wait(2000);
}

function testCorners2() {
    entries = $(".tpl-entry", $("#main"));
    item = $(".iv-main", entries[1]);
    itemid = $(".fld-entries-itemid", item).getdata();

    // Mark various attributes
    FR_starItem(itemid);
    FR_shareItem(itemid);
    FR_setItemRead(itemid);

    // Trigger a refresh
    Reader.handleEvent('evAllItems', $("#ol-allitems"));
    Wait(2000);
}

function testCorners3() {
    testInit();
    Reader.handleEvent('evJunk');

    // Reduce feed queue count so we can workout the
    // injector code
    FEEDLOAD_NUMENTRIES = 2;
    Reader.handleEvent('evAllItems', $("#ol-allitems"));
    Wait(1000);
}

function testCorners4() {
    // code coverage
    var result = choose_folder_clicked($(".sv-folder-menu-contents"));
    assertEquals("CornerCase.4", true, result);
    
    markall_clicked();
    Wait(4000);
}

function testCorners5() {
    var ucnode = $(".lv-unread-count");

    ReaderViewer.setLVCount(232);
    assertEquals("RV Count.0", '200+', ucnode.getdata());

    ReaderViewer.setLVCount(6132);
    assertEquals("RV Count.1", '6000+', ucnode.getdata());
}

function testCorners6() {
    $.browser.mozilla = $.browser.msie = $.browser.opera = $.browser.safari = false;

    $.browser.mozilla = true;
    reader_main();
    assert("CornerCase.6/0", $(document.body).is(".mozilla"));

    $.browser.mozilla = false;
    $.browser.msie = true;

    $.browser.version = 7;
    Reader.domLoaded = false;
    reader_main();
    assert("CornerCase.6/1", $(document.body).is(".ie"));
    assert("CornerCase.6/1a", !$(document.body).is(".ie6"));

    $.browser.version = 6;
    Reader.domLoaded = false;
    reader_main();
    assert("CornerCase.6/1b", $(document.body).is(".ie6"));

    $.browser.msie = false;
    $.browser.opera = true;
    Reader.domLoaded = false;
    reader_main();
    assert("CornerCase.6/2", $(document.body).is(".opera"));

    $.browser.opera = false;
    $.browser.safari = true;
    Reader.domLoaded = false;
    reader_main();
    assert("CornerCase.6/3", $(document.body).is(".safari"));
}

function testPerma0() {
    testInit();

    clearEventLog();
    handle_permalinks('?allitems');
    assertEquals("Perma0/0", 'AllItemsView', ReaderViewer.viewtype);
    assertEvent("Perma0/1", "evListView");
}

function testPerma1() {
    testInit();
    clearEventLog();
    handle_permalinks('?starred');
    assertEquals("Perma1/0", 'BrandView', ReaderViewer.viewtype);
    assertEvent("Perma1/1", "evListView");
    assertEquals("Perma1/2", 'starred', Reader.brand);
}

function testPerma1a() {
    testInit();
    clearEventLog();
    handle_permalinks('?shared');
    assertEquals("Perma2/0", 'BrandView', ReaderViewer.viewtype);
    assertEvent("Perma2/1", "evListView");
    assertEquals("Perma2/2", 'shared', Reader.brand);
}

function testPerma1b() {
    testInit();
    clearEventLog();
    handle_permalinks('?trends');
    assertEquals("Perma3/0", 'TrendsView', ReaderViewer.viewtype);
    assertEvent("Perma3/1", "evListView");
}

function testPerma2() {
    testInit();
    clearEventLog();
    handle_permalinks('?browse/more');
    assertEquals("Perma4/0", 'FeedDiscoveryView', ReaderViewer.viewtype);
    assertEvent("Perma4/1", "evListView");
}

function testPerma3() {
    testInit();
    clearEventLog();
    handle_permalinks('?search/abc');

    assertEquals("Perma4/0", 'SearchResultsView', ReaderViewer.viewtype);
    assertEvent("Perma4/1", "evListView");
    assertEquals("Perma4/2", 'abc', DOM.quickadd.getdata());
}

function testPerma4() {
    testInit();
    clearEventLog();
    handle_permalinks('?folder/news');

    assertEquals("Perma5/0", 'SubscriptionView', ReaderViewer.viewtype);
    assertEvent("Perma5/1", "evListView");
    assertEquals("Perma5/2", 'news', Reader.folder);
}

function testPerma4a() {
    testInit();
    clearEventLog();
    handle_permalinks('?feed/http%3A%2F%2Fwww.theonion.com%2Fcontent%2Ffeeds%2Fdaily/http%3A%2F%2Fwww.theonion.com%2Fcontent%2Ffeeds%2Fdaily%3A%40%40%3A1189832516000%2F%5Baudio%5D%20Women%20Now%20Empowered%20By%20Everything%20A%20Woman%20Does');
//    handle_permalinks('?feed/http%3A%2F%2Fvitativeness.blogspot.com%2Ffeeds%2Fposts%2Fdefault');
    assertEquals("Perma4a/0", 'SubscriptionView', ReaderViewer.viewtype);
    assertEvent("Perma4a/1", "evListView");
    assertEquals("Perma4a/2", 'http://www.theonion.com/content/feeds/daily', 
                 Reader.feed);
    
}


function testPerma5() {
    testInit();
    clearEventLog();
    handle_permalinks('?tag/tag1');

    assertEquals("Perma6/0", 'TagView', ReaderViewer.viewtype);
    assertEvent("Perma6/1", "evListView");
    assertEquals("Perma6/2", 'tag1', Reader.tag);
}

function testPerma6() {
    testInit();
    clearEventLog();
    handle_permalinks('?settings/imexport');
    assertEquals("testPerma6/0", 'ImexportView', Settings.viewtype);
    assertEvent("testPerma6/1", "evSettingsView");
}

function testPerma7() {
    testInit();
    clearEventLog();
    handle_permalinks('?settings/labels');
    assertEquals("testPerma7/0", 'TagView', Settings.viewtype);
    assertEvent("testPerma7/1", "evSettingsView");
}

function testPerma8() {
    testInit();
    clearEventLog();
    handle_permalinks('?settings/goodies');
    assertEquals("testPerma8/0", 'GoodiesView', Settings.viewtype);
    assertEvent("testPerma8/1", "evSettingsView");
}

function testPerma9() {
    testInit();
    clearEventLog();
    handle_permalinks('?settings/prefs');
    assertEquals("testPerma9/0", 'PrefView', Settings.viewtype);
    assertEvent("testPerma9/1", "evSettingsView");
}

function testPerma10() {
    testInit();
    clearEventLog();
    handle_permalinks('?settings/subs');
    assertEquals("testPerma10/0", 'SubView', Settings.viewtype);
    assertEvent("testPerma10/1", "evSettingsView");
}

function testPerma11() {
    testInit();
    clearEventLog();
    handle_permalinks('?trends');
    assertEquals("testPerma11/1", 'TrendsView', ReaderViewer.viewtype);
    assertEvent("testPerma11/0", "evListView");
}

function testExpInit() {
    clearEventLog();
    reader_main(function() {
                    alert('callback called');
                    FR_setProperty(FRP_EXPANDED_VIEW, 'true');
                });
}

function testExpanded0() {
    testExpInit();
    clearEventLog();

    // Make sure we are in expanded view
    assertEquals("testExpanded0/0", 'true', FR_getProperty(FRP_EXPANDED_VIEW));

    // Toggle expanded view off
    clearEventLog();
    ReaderViewer.handleEvent('evToggleExpanded');
    assertEvent('testExpanded0/1', 'evListView');
    assertEquals("testExpanded0/2", null, FR_getProperty(FRP_EXPANDED_VIEW));

    // Set expanded view back on
    clearEventLog();
    ReaderViewer.setExpanded(true);
    assertEvent('testExpanded0/3', 'evListView');
    assertEquals("testExpanded0/4", 'true', FR_getProperty(FRP_EXPANDED_VIEW));

    // Go to all items view
    Reader.handleEvent('evAllItems', $("#ol-allitems"));
    Wait(5000);
}

function testExpanded1() {
    // Handle scrolling
    var currentEntry = $("#current-entry");
    $("#entries")[0].scrollTop = 200;
    
    ReaderViewer.handleScroll();

    var newEntry = $("#current-entry");
    assert('testExpanded0/5', currentEntry.length != newEntry.length ||
           currentEntry[0] != newEntry[0]);

    // Test clicking the card
    alert('Clicking: ' + $($("#entry//.entry")[0]).attr('id'));

    var node = $($("#entry//.entry")[0]);
    var evt = {type: 'click', 
               target: $(".entry-main", node[0])[0]};
    card_clicked(evt);

//    assertEquals('testExpanded0/6', 'current-entry', node.attr('id'));
}

function  testKeycuts() {
    /*
     * Handle keys in Global context
     */
    testInit();
    clearEventLog();

    Wait(2000);
}

function testKeycuts1() {
    var event = new Object;
    event.target = document.body;
    event.shiftKey = true;

//    assertEquals("testKeycuts/0", $(".navigated").length, 0);
    event.keyCode = keycode('n');
    handle_keycuts(event);
//    assertEquals("testKeycuts/0", $(".navigated").length, 1);

    // Toggle expand the folder
    event.keyCode = keycode('x');
    handle_keycuts(event);

    event.keyCode = keycode('x');
    handle_keycuts(event);

    // Open the selected folder
    event.keyCode = keycode('o');
    handle_keycuts(event);

    event.keyCode = keycode('n');
  
    // Navigate all the way down
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);

    assert('KC1/4', $('.navigated').is('.tag-selector'));

    // Open the selected tag
    event.keyCode = keycode('o');
    handle_keycuts(event);

    /*
     * Handle keys in Global context
     */
    testInit();
    clearEventLog();

    Wait(2000);
}

function testKeycuts2() {    
    var event = new Object;
    event.target = document.body;
    event.shiftKey = true;

    event.keyCode = keycode('p');
    handle_keycuts(event);

    // Navigate back all the way down
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);

    event.shiftKey = false;
    event.keyCode = keycode('u');
    // Enter full screen
    handle_keycuts(event);

    // exit full screen
    handle_keycuts(event);

    // Switch to listview
    Reader.handleEvent('evAllItems', $("#ol-allitems")[0]);
    assertEquals("KC1/0", 'AllItemsView', ReaderViewer.viewtype);
    assertEvent("KC1/1", "evListView");
    Wait(5000);
}

function testKeycuts3() {
    /*
     * Test keys in listview
     */
    var event = new Object;
    event.target = document.body;
    event.keyCode = keycode('j');
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);

    event.keyCode = keycode('k');
    handle_keycuts(event);
    handle_keycuts(event);
    handle_keycuts(event);

    event.keyCode = keycode('n');
    handle_keycuts(event);
    handle_keycuts(event);

    event.keyCode = keycode('p');
    handle_keycuts(event);
    handle_keycuts(event);

    event.keyCode = keycode('o');
    handle_keycuts(event);

    event.keyCode = KEY_ENTER;
    handle_keycuts(event);

    event.keyCode = keycode('s');
    handle_keycuts(event);

    event.shiftKey = true;
    event.keyCode = keycode('s');
    handle_keycuts(event);
    event.shiftKey = false;

    // Toggle item read
    event.keyCode = keycode('m');
    handle_keycuts(event);

    // toggle it back
    handle_keycuts(event);

    // Invoke tag item
    assertEquals("KC2/6", 'none', $("#hover-tags-edit").css('display'));
    event.keyCode = keycode('t');
    handle_keycuts(event);
    assertEquals("KC2/7", 'block', $("#hover-tags-edit").css('display'));

    // check cancel
    $(".iv-addtags-cancel", $("#hover-tags-edit")).click();
    assertEquals("KC2/7a", 'none', $("#hover-tags-edit").css('display'));

    event.keyCode = keycode('v');
    handle_keycuts(event);

    event.keyCode = keycode('1');
    handle_keycuts(event);

    event.keyCode = keycode('2');
    handle_keycuts(event);

    event.keyCode = keycode('r');
    handle_keycuts(event);


    event.keyCode = keycode('a');
    handle_keycuts(event);
}

function testKeycuts4() {
    var event = new Object;
    event.target = document.body;
    
    // Goto home
    event.keyCode = keycode('g');
    handle_keycuts(event);
    event.keyCode = keycode('h');
    handle_keycuts(event);
 
    assertEvent("KC4/0", "evListView");
    assertEquals("KC4/1",  'HomeView', ReaderViewer.viewtype);
    
    Wait(2000);
}

function testKeycuts5() {
    var event = new Object;
    event.target = document.body;

    // Goto allitems
    event.keyCode = keycode('g');
    handle_keycuts(event);
    event.keyCode = keycode('a');
    handle_keycuts(event);
 
    assertEvent("KC4/2", "evListView");
    assertEquals("KC4/3", 'AllItemsView', ReaderViewer.viewtype);
    Wait(2000);
}


function testKeycuts6() {
    var event = new Object;
    event.target = document.body;

    // Goto prompted feed
    SetPromptResponse('The Onion');
    event.keyCode = keycode('g');
    handle_keycuts(event);
    event.keyCode = keycode('u');
    handle_keycuts(event);

    assertEquals("KC4/4", 'SubscriptionView', ReaderViewer.viewtype);
    assertEvent("KC4/5", "evListView");
}

$.merge(testlist, [
    'testReader0',
    'testReader0a',
    'testReader1',
    'testReader2',
    'testReader3',
    'testReader4',
    'testReader5',
    'testReader6',
    'testReader7',
    'testReader8',
    'testReader9',
    'testReader10',
    'testReader11',
    'testReader12',
    'testReader13',
    'testReader14',
    'testReader15',
    'testReader16',
    'testReader17',
    'testReader18',
    'testReader19',
    'testReader20',
    'testReader21',
    'testReader22',

    'testExpanded0',
    'testExpanded1',

    'testKeycuts',
    'testKeycuts1',
    'testKeycuts2',
    'testKeycuts3',
    'testKeycuts4',
    'testKeycuts5',
    'testKeycuts6',

    'testSettings0', 
    'testSettings1', 
    'testSettings2', 
    'testSettings3', 
    'testSettings4', 
    'testSettings5', 
    'testSettings6', 
    'testSettingsSubs0', 
    'testSettingsSubs1', 
    'testSettingsSubs2', 
    'testSettingsSubs3', 
    'testSettingsSubs4', 
    'testSettingsSubs5', 
    'testSettingsSubs6', 
    'testSettingsSubs7', 
    'testSettingsTags0',
    'testSettingsTags1',
    'testSettingsTags2',
    'testSettingsTags3',
    'testSettingsTags4',
    'testSettingsTags5',
    'testSettingsTags6',
    'testSettingsTags7',
    'testSettingsTags8',
    'testSettingsPrefs0', 
    'testSettingsPrefs1', 
    'testSettingsPrefs2', 
    'testImportExport', 
    'testGoodies',
    'testRVLV0',
    'testRVLV1',
    'testRVLV2',
    'testRVLV3',
    'testRVLV3a',
    'testRVLV4',
    'testRVLV5',
    'testRVLV6',
    'testRVLV7',
    'testRVLV8',
    'testRVLV9',
    'testRVLV10',
    'testRVLV11',
    'testRVLV12',
    'testRVLV13',
    'testRVLV14',
    'testRVLV15',
    'testRVLV16',
    'testRVLV17',
    'testRVHome0',
    'testRVHome1',
    'testRVIV0',
    'testRVIV1',
    'testRVIV2',
    'testRVIV3',
    'testRVIV4',
    'testRVIV5',
    'testRVIV6',
    'testRVIV7',
    'testRVBrowse0',
    'testRVBrowse1',
    'testRVBrowse1a',
    'testRVBrowse1b',
    'testRVBrowse2',
    'testRVBrowse3',
    'testRVBrowse4',
    'testRVSearch0',
    'testRVSearch1',
    'testRVSearch1a',
    'testRVSearch1b',
    'testRVSearch2',
    'testRVSearch3',
    'testRVSearch3a',
    'testRVSearch4',
    'testTrends0',
    'testTrends1',
    'testTrends2',
    'testTrends3',
    'testTrends4',
    'testCorners0',
    'testCorners1',
    'testCorners2',
    'testCorners3',
    'testCorners4',
    'testCorners5',
    'testCorners6',
    'testPerma0',
    'testPerma1',
    'testPerma1a',
    'testPerma1b',
    'testPerma2',
    'testPerma3',
    'testPerma4',
    'testPerma4a',
    'testPerma6',
    'testPerma7',
    'testPerma8',
    'testPerma9',
    'testPerma10',
    'testPerma11',
    'testPerma5'
]);               
                 
