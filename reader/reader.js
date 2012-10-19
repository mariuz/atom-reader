/*
 * Element naming conventions:
 * id='<prefix><name>'
 *
 * Prefix: ol (Operation list box in left margin)
 *         af (Add Feed box in left margin)
 *         fl (Feed list box in left margin)
 *         sfl (Sub folder)
 *         hm (Home View)
 *         lv (List View)
 *         tpl (Template container)
 *
 * class='<type>-<name>'
 * Type:   fld (Templated element field)
 *
 */

/* --------------------------------------------
 *               State Variables.
 * If any of these variables are changed,
 * dont forget to call the corresponding 
 * update function(s)
 *--------------------------------------------*/
var FRS_folders       = [];   // List of folders
var FRS_feedinfo_list = [];   // List of all subscribed feeds
var FRS_tags          = [];   // List of all tags
var FRS_current_item  = null;

var FEEDLOAD_NUMENTRIES = 7;
var FEEDLOAD_INTERVAL   = 150;
var ALL_VIEWS = '#listview,#searchview,#settingsview,' + 
    '#browsefeedsview,#home,#trendsview';
var SETTING_TABS = ['subscriptions','labels','goodies','importexport','extras'];
//Container for all dom element references
var DOM = {};

function reader_main(initCallback) {
    // Init subsystems
    FR_init(initCallback);

    FR_setProperty(FRP_SCROLL_TRACKING, '');
    //FR_setProperty(FRP_START_PAGE, '?tag/tag1');
//    FR_setProperty(FRP_EXPANDED_VIEW, 'true');

    Reader.init();

    // Reload the feeds periodically
    Reader.reloadFeeds();
    setInterval(Reader.reloadFeeds.bind(this), FC_updateInterval);

    ReaderViewer.init();
    Settings.init();

    Reader.hideLoading();

    handle_resize();

    var start_page = location.search.length > 0? location.search : (
        FR_getProperty(FRP_START_PAGE));
    handle_permalinks(start_page);

    $(document).keyup(handle_keycuts);
}

function handle_resize() {
    var winh, winw;
    
    var sizeElements = {};

    sizeElements['msie'] = {obj: document.documentElement,
                            fieldHeight: 'clientHeight',
                            fieldWidth: 'clientWidth'};
    sizeElements['opera'] = 
    sizeElements['safari'] = 
    sizeElements['mozilla'] = {obj: window,
                                   fieldHeight: 'innerHeight',
                                   fieldHeight: 'innerWidth'};
    $.each(sizeElements, function(browsertype, info) {
        if ($.browser[browsertype]) {
            if (!winh) {
                winh = info.obj[info.fieldHeight];
                winw = info.obj[info.fieldWidth];
            }
        }
    });

    if ($.browser.mozilla) {
        winh = window.innerHeight; winw = window.innerWidth;
    }


    if ($.browser.mozilla) {
        var pos = $("#nav-toggler").positionedOffset();
        var delh = winh - pos[1];
        
        $("#nav-toggler").css('height', delh + 'px'); 
    }
        
    if (ReaderViewer.state == stateListView) {
        var pos = $("#entries").positionedOffset();
        var delh = winh - pos[1] - $("#chrome-footer-container")[0].offsetHeight;
        var delw = winw - pos[0];
        
        $("#entries").css('width', delw + 'px'); 
        $("#entries").css('height', delh + 'px'); 
    }

    var node;

    try {
        node = $("#browsefeedsview");

        var pos = node.positionedOffset();
        
        var delh = winh - pos[1];
        var delw = winw - pos[0];
        
        node.css('height', delh + 'px'); 
    } catch(e) {
//        alert(e.message);
    }

    if (!$.browser.msie) {
        if (ReaderViewer.viewtype == 'TrendsView') {
            var pos = $("#trends").positionedOffset();
            var delh = winh - pos[1];
            var delw = winw - pos[0];
            
            $("#trends").css('width', delw + 'px'); 
            $("#trends").css('height', delh + 'px'); 
        }
        
        var elem = $("#sub-tree-resizer");
        var rpos = elem.positionedOffset();
        var rdelh = winh - rpos[1] - 15 - $("#sub-tree-footer")[0].offsetHeight;
        
        elem.css('height', rdelh + 'px');
    }
}

// Create state machines
var Reader = new StateMachine(stateList, ReaderFSM);
var ReaderViewer = new StateMachine(stateListView, RVFSM);
var Settings = new StateMachine(stateSubs, STFSM);

/*
 * Reload data from backend
 */
Reader.init = function(evt) {
    this.state = 'List';
    this.buttonClicked($('#ol-home'));

    if (!this.domLoaded) {
        this.domLoaded = true;

        // Setup DOM by browser and version
        var body = $(document.body);
        if ($.browser.mozilla) {
            body.addClass('mozilla');
        } else if ($.browser.msie) { 
            body.addClass('ie');            
        } else if ($.browser.opera) { 
            body.addClass('opera'); 
        } else if ($.browser.safari) {
            body.addClass('safari');
        }
        
        DOM.quickadd = $("#quickadd");
        DOM.recentStarred = $("#recent-activity-star");
        DOM.recentShared  = $("#recent-activity-share");

        $(document.body).click(body_clicked);
        $(window).resize(handle_resize);

/*
        DOM.navToggler = $("#nav-toggler");
        DOM.navToggler.hover(
            DOM.navToggler.addClass.bind(DOM.navToggler, 'hover'),
            DOM.navToggler.removeClass.bind(DOM.navToggler, 'hover')),
*/
    }

    // Initially populate unread counts from cached value
    // from database
    $.each(FR_allFeeds(), function(i, feed) {
        try {
            FC_updateUnread(feed, FR_feedInfo(feed).unread);
        } catch(e) {}
    });

    Reader.handleEvent("evOpen");
    Reader.handleEvent("evHome", $("#ol-home")[0]);
}

Reader.toggleNav = function() {
    if ($(document.body).is(".hide-nav"))
        this.handleEvent('evOpen');
    else
        this.handleEvent('evClose');
}

Reader.close = function(evt) {
    $(document.body).addClass("hide-nav");
}

Reader.open = function(evt) {
    $(document.body).removeClass("hide-nav");
    Reader.handleEvent('evRefresh');
}

/*
 * Fetch all the feeds and see if there are any new items,
 * If so update the counts and flash the corresponding feed/folder
 * in Reader view.
 */
Reader.reloadFeeds = function() {
    $.each(FR_allFeeds(), function(i, feed) {
        FC_retreiveFeed(feed);
    });
}

/*
 * Redraw the UI with the latest data
 */
Reader.refresh = function(evt) {
    this.brands = FR_allBrands();

    var folders = this.folders = FR_allFolders();

    this.feedlist = FR_allFeeds();
    this.orphans  = $.grep(this.feedlist, function(feed) {
        return (!FR_folderForFeed(feed));
    });

    this.tags = $.grep(FR_allTags(), function(tag) {
        return ($.indexOf(folders,tag) < 0);
    });
    this.folderNodes = {};
    this.brandNodes = {};

    // Populate the brands
    var brand_bindings = $('#ol-brandlist').clear().populate(this.brands, '#tpl-brandlist'); 
    $.each(brand_bindings, function(i, bind) {
        Reader.brandNodes[bind.obj.brand] = bind.node;
        if (Reader.brand) {
            if (bind.obj.brand == Reader.brand) {
                Reader.buttonClicked(bind.node[0], true);
            }
        }
    });

    // Populate the folders
    var folder_bindings = $('#fl-folderlist').clear().populate(this.folders,
        '#tpl-folder');

    Reader.folderNodes = new Object;
    Reader.feedNodes   = new Object;
    Reader.tagNodes    = new Object;

    var feed_bindings;

    // For each folder, populate the feeds in that folder
    $.each(folder_bindings, function(i, binding) {
        var node   = binding.node;
        var folder = binding.obj;

        // Store the UI node displaying this folder in folderNodes
        Reader.folderNodes[folder] = node;

        var feeds_in_folder = FR_feedsInFolder(folder);
        var feed_infos = $.map(feeds_in_folder,FR_feedInfo);

        node.attr("name", folder);
        feed_bindings = $('.sfl-container',node).populate(feed_infos,
                                                         '#tpl-feed');

        // For each feed in the folder, hash the UI node in feedNodes
        $.each(feed_bindings, function (i, info) {
            var fnode = Reader.feedNodes[info.obj.feed];
            if (fnode) {
                Reader.feedNodes[info.obj.feed] = fnode.addnodes(info.node);
            } else {
                Reader.feedNodes[info.obj.feed] = info.node;
            }
        });

        // Remember if this folder was collapsed last time.
        if (FR_getProperty(FRP_FOLDER_STATE + folder) == 'open') {
            Reader.toggleFolder(folder);
        }
        
    });                             

    if(this.folder && this.folderNodes[this.folder]) {
        this.buttonClicked($('.folder-selector', 
                             this.folderNodes[this.folder]), true);
    }

    // Populate the feeds not part of any folder
    feed_bindings = $('#fl-feedlist').clear().populate(
        $.map(this.orphans,FR_feedInfo),'#tpl-feed');

    // For each feed at top level, hash the UI node in feedNodes
    $.each(feed_bindings, function (i, info) {
        Reader.feedNodes[info.obj.feed] = info.node;
    });

    if (this.feed && this.feedNodes[this.feed]) {
        this.buttonClicked($('.feed-selector', 
                             this.feedNodes[this.feed]), true);
    }

    // Populate the tag list
    var tag_bindings = $('#fl-taglist').clear().populate(this.tags, '#tpl-tagfolder');

    $.each(tag_bindings, function(i, info) {
        Reader.tagNodes[info.obj] = info.node;
    });

    this.updateFeedCount(this.feedlist);
}

Reader.buttonClicked = function(node, from_code) {
    if (node) {
        if (!from_code)
            this.feed = this.brand = this.folder = this.tag = undefined;

        this.elem = node;
    }
    
    if (this.selectedNode) {
        this.selectedNode.removeClass('selected');
    }
    this.selectedNode = $(this.elem);
    if (this.selectedNode) {
        this.selectedNode.addClass('selected');
    }

    $('.navigated').removeClass('navigated');
}

/*
// XXX
Reader.buttonClicked1 = function(node) {
    if (node) {
        this.feed = this.brand = this.folder = undefined;

        this.elem = node;
    }

    if (this.selectedNode) {
        this.selectedNode.removeClass('selected');
    }

    if (this.elem) {
        this.selectedNode = $(this.elem);
    }

    this.selectedNode.addClass('selected');
}
*/

Reader.allitems = function(evt) {
    this.buttonClicked();

    if (ReaderViewer.viewtype != 'AllItemsView') {
        ReaderViewer.listLoaded = false;
        ReaderViewer.viewtype = 'AllItemsView';
    }

    ReaderViewer.handleEvent('evListView');
}

Reader.home = function(evt) {
    this.buttonClicked();

    ReaderViewer.viewtype = 'HomeView';
    ReaderViewer.handleEvent('evListView');
}

Reader.trends = function(evt) {
    this.buttonClicked();

    ReaderViewer.viewtype = 'TrendsView';
    ReaderViewer.handleEvent('evListView');
}

Reader.quickadd = function (evt) {
    var s = $('#add-box');
    
    var o = s.positionedOffset();
    
    var s = $('#quick-add-bubble-holder');
    s.css('top', o [1] + "px");
    s.css('left', o [0] + "px");
    
    s.show();

    try {
        DOM.quickadd.setdata('cnn')[0].focus();
    } catch(e) {}
}

Reader.browse = function(evt) {
    ReaderViewer.viewtype = 'FeedDiscoveryView';
    ReaderViewer.handleEvent('evListView');
}

Reader.bundleAdded = function(bundle_name) {
    FR_setProperty(FRP_BUNDLE_STATE + bundle_name, 'added');
}

Reader.openFolder = function(folder) {
    var node = Reader.folderNodes[folder];
    if (node)
        Reader.buttonClicked($('.folder-selector', node));

    this.folder = folder;

    ReaderViewer.viewtype = 'SubscriptionView';
    ReaderViewer.listLoaded = false;
    Reader.feedFilter = FR_feedsInFolder(folder);
    ReaderViewer.handleEvent('evListView');
}

Reader.expandFolder = function(folder) {
    var node = Reader.folderNodes[folder];

    if (node && node.is(".collapsed")) 
        this.toggleFolder(folder)
}

Reader.collapseFolder = function(folder) {
    var node = Reader.folderNodes[folder];

    if (node && node.is(".expanded")) 
        this.toggleFolder(folder)
}

Reader.openTagEvent = function(evt, data) {
    return this.openTag(data);
}

Reader.openTag = function(tag) {
    this.buttonClicked($('.tag-selector', this.tagNodes[tag]));

    this.tag = tag;

    ReaderViewer.viewtype = 'TagView';
    ReaderViewer.listLoaded = false;
    ReaderViewer.handleEvent('evListView');
}

Reader.openStarredEvent = function(evt) {
    return Reader.openBrand('starred');
}

Reader.openSharedEvent = function(evt) {
    return Reader.openBrand('shared');
}

Reader.openBrand = function(brand) {
    if (this.brandNodes[brand])
        this.buttonClicked(this.brandNodes[brand]);
    this.brand = brand;

    ReaderViewer.viewtype = "BrandView";
    ReaderViewer.listLoaded = false;
    ReaderViewer.handleEvent('evListView');
}

Reader.showSettings = function(evt) {
    // Switch to settings state
    this.state = 'Settings';

    Settings.show();
}

Reader.displaySubList = function(evt) {
    Settings.showsubscriptions();
}

Reader.displayTagList = function(evt) {
    Settings.showlabels();
}

/*
 * These events dont make sense since they are dependant on
 * a sequence of actions not captured in the state diagrams.
 * Example - rename involves displaying the rename box and 
 * pressing OK.
 * So instead of blindly implementing these event handles 
 * that dont make sense, I have indicated the events in the
 * actual UI handles.
 */ 
/*
Reader.subsFilter = function(evt) {
    Settings.filterSubs();
}

Reader.subsRename = function(evt) {
    // #subs-rename-button
    save_rename_clicked(this.elem);
}

Reader.subsAddTag = function(evt) {
}

Reader.subsDelete = function(evt) {
}

Reader.subsTagSelected = function(evt) {
}

Reader.subsDeleteSelected = function(evt) {
}

Reader.subsSelect = function(evt) {
}
*/

/* Prefs Pane */
Reader.prefsRevert = function(evt) {
    FR_setProperty(FRP_REVERT, 'true');
}

Reader.prefsSetHome = function(evt, data) {
    FR_setProperty(FRP_START_PAGE, data);
}

Reader.prefsScrollTracking = function(evt, data) {
    FR_setProperty(FRP_SCROLL_TRACKING, data?'true':null);
}

/* Import Export Pane - best done at server */
Reader.importExport = function(evt) {
}

/* Goodies Pane - cool links */
Reader.goodies = function(evt) {
}

Reader.toggleFolder = function(folder) {
    var node = Reader.folderNodes[folder];
    if (node) {
        node = $(node);
        
        node.toggleClass('expanded');
        node.toggleClass('collapsed');

        // Save State
        if (node.is('.expanded')) {
            FR_setProperty(FRP_FOLDER_STATE + folder, 'open');
        } else {
            FR_setProperty(FRP_FOLDER_STATE + folder, 'closed');
        }
    }
}

Reader.openFeedEvent = function(evt, data) {
    return Reader.openFeed(data);
}

Reader.openFeed = function(feedurl) {
    var node = Reader.feedNodes[feedurl];
    if (node)
        Reader.buttonClicked($('.feed-selector', node));

    this.feed = feedurl;

    ReaderViewer.viewtype = 'SubscriptionView';
    ReaderViewer.listLoaded = false;
    Reader.feedFilter = [];
    Reader.feedFilter.push(feedurl);

    var folders = FR_folderForFeed(feedurl);
    if (folders && folders.length > 0) {
        $.each(folders, function(i, folder) {
            Reader.expandFolder(folder);
        });
    }

//    alert('[' + folder + '] ' + ReaderViewer.feedFilter.length);
    ReaderViewer.handleEvent('evListView');
}

Reader.removeFeed = function(feed) {
    FR_removeFeed(feed);
    FC_clearUnread(feed);;

    this.handleEvent('evRefresh');
}

Reader.flashNode = function(anode) {
    anode.addClass('updated');
    setTimeout(function() {
        anode.removeClass('updated');
        anode.addClass('updated-intermediate');
        setTimeout(function() {
            anode.removeClass('updated-intermediate');
        }, 500);
    }, 500);
}

Reader.flashFeeds = function(feeds) {
    var folders = [];

    $.each(feeds, function(i, feed) {
        if (FR_folderForFeed(feed))
            $.merge(folders, FR_folderForFeed(feed));

        var node = Reader.feedNodes[feed];
        if (node) 
            Reader.flashNode($(".feed-selector", node));        
    });

    $.each(folders, function(i, folder) {
        var node = Reader.folderNodes[folder];
        if (node)
            Reader.flashNode($(".folder-selector", node));        
    });
}

/*
 * Updated the unread count for given feeds, their folders & All Items
 */
Reader.updateFeedCount = function(feeds, items) {
    var folders = [];
    var unread = 0;
    
    if (!items)
        items = [];

    $.each(feeds, function(i, feed) {
        if (FR_folderForFeed(feed))
            $.merge(folders, FR_folderForFeed(feed));

        if (Reader.feedNodes[feed]) {
            unread = FC_getUnread(feed);
            Reader.setUnreadNode('feed', feed, unread);
        }
    });

    $.each(items, function(i, itemid) {
        $.merge(folders, FR_tagsForItem(itemid));
    });

    $.each(folders, function(i, folder) {
        unread = 0;
        $.each(FR_feedsInFolder(folder), function(i, feed) {
            unread += FC_getUnread(feed);
        });
        
        // Folder can also be a tag ... handle this.
        $.each(FR_taggedItems(folder), function(i, itemid) {
            if (!FR_isItemRead(itemid)) {
                unread++;
            }
        });

        Reader.setUnreadNode('folder', folder, unread);
    });

    $.each(['starred', 'shared'], function(i, brand) {
        var items = FR_brandedItems(brand);
        var bunread = 0;
        $.each(items, function(i, item) {
            var feed = FC_getItemFeed(item);

            if (feed && !FR_isItemRead(item)) {
                bunread++;
            }
        });

        Reader.setUnreadNode('brand', brand, bunread);
    });       

    unread = FC_getUnreadAll(); // check
    Reader.setUnreadNode('allitems', 'allitems', unread);
}

Reader.setUnreadNode = function(nodetype, name, unread) {
    var node, expr;

    switch (nodetype) {
    case 'feed':
        expr = ".fld-unread";
        node = this.feedNodes[name];
        break;

    case 'folder':
        expr = ".fld-folder_unread";
        node = this.folderNodes[name];
        break;

    case 'brand':
        expr = ".fld-brand_unread";
        node = this.brandNodes[name];
        break;

    case 'allitems':
        expr = ".fld-all_unread";
        node = $("#ol-allitems");
        break;

//    case 'tag':
//        break;
    }

    if (node) {
        $(expr, node).setdata(unread);
        if (unread > 0)
            node.addClass('unread');
        else
            node.removeClass('unread');
    }

    ReaderViewer.displayUnreadCount(nodetype, name, unread)
}

/*
 * In ther reader feedlist, toggle between showing all feeds/folders
 * and showing only updated feeds/folders
 */
Reader.showUpdatedOnly = function() {
    $("#ol-feedlist").addClass("updatedonly");
}

Reader.showAll = function() {
    $("#ol-feedlist").removeClass("updatedonly");
}

Reader.sortUpdatedOrAll = function() {
    $("#ol-feedlist").toggleClass("updatedonly");
}

Reader.showLoading = function() {
    $('#loading-area').removeClass('hidden');
}

Reader.hideLoading = function() {
    $('#loading-area').addClass('hidden');
}

Reader.settingsSubTab = function(evt) {
    Settings.viewtype = 'SubView';    
    $("#setting-subscriptions").click(); 
    Reader.handleEvent('evSettingsView'); 
}

Reader.settingsPrefTab = function(evt) {
    Settings.viewtype = 'PrefView';
    $("#setting-extra").click();
    Reader.handleEvent('evSettingsView');
}

Reader.settingsTagTab = function(evt) {
    Settings.viewtype = 'TagView';
    $("#setting-labels").click();
    Reader.handleEvent('evSettingsView');
}

Reader.settingsGoodiesTab = function(evt) {
    Settings.viewtype = 'GoodiesView';
    $("#setting-goodies").click();
    Reader.handleEvent('evSettingsView');
}

Reader.settingsImexportTab = function(evt) {
    Settings.viewtype = 'ImexportView';
    $("#setting-importexport").click();
    Reader.handleEvent('evSettingsView');
}

Reader.returnToReader = function(evt) {
    this.state = 'List';
    StateVars.PreviousView = true;
    Settings.hide();
    ReaderViewer.handleEvent('evListView');
}

ReaderViewer.init = function() {
    this.expandedView = false;

    if (FR_getProperty(FRP_EXPANDED_VIEW) == 'true') {
        this.handleEvent('evToggleExpanded'); // coverage
    }

    this.SortMode   = 'newest';
    this.listLoaded = false;
    this.homeLoaded = false;
    this.generation = 0;
    this.viewtype   = 'HomeView';
    this.homeviewFeeds   = {};
    this.homeviewFolders = {};

    if (!this.domLoaded) {
        
        // Dont barf if init is called more than once
        this.domLoaded = true;
        // Tag edit form setup
        $("#hover-tags-edit//input.iv-addtags-input").
        enter(ReaderViewer.saveTags.bind(ReaderViewer, null));
        
        // Trendview setup
        $("#trends-period-tab").maketab('tab-header', 'tab-contents');
        $("#trends-brand-tab").maketab('tab-header', 'tab-contents');
        $("#trends-freq-tab").maketab('tab-header', 'tab-contents');
        
        DOM.quickadd.enter(function() {
            ReaderViewer.viewtype = 'SearchResultsView';
            ReaderViewer.handleEvent('evListView');
        });

        $("#entries").scroll(this.handleScroll.bind(this));
    }

//    this.refresh();
}

ReaderViewer.refresh = function(evt) {
    switch(this.state) {
    case stateListView:
        this.listview();
        break;

/*    case stateHomeView:
        this.homeview();
        break;

    case stateTrendsView:
        this.trendsview();
        break;
*/
    }
}

ReaderViewer.setStatus = function(str) {
    $('#lv-status').setdata(str);
}

ReaderViewer.setTitle = function(str) {
    $('#lv-title').setdata(str);
}


ReaderViewer.renameCurrentFeed = function(evt) {
    if (this.viewtype == 'SubscriptionView') { 
        var newname = prompt('Enter new name for feed:');
        if (!newname.match(/^\s*$/))
            FR_cacheFeed(Reader.feed, newname);
        ReaderViewer.handleEvent('evRefresh');
    }
}

ReaderViewer.deleteCurrentFeed = function(evt) {
    if (this.viewtype == 'SubscriptionView') { 
        FR_removeFeed(Reader.feed);
        Reader.handleEvent("evHome", $("#ol-home")[0]);
    }
}

ReaderViewer.openFeedForItem = function(evt) {
    var feed = $('.fld-feed', this.elem).getdata();

    Reader.openFeed(feed);
}

ReaderViewer.openItemSite = function(evt) {
    // Nothing to do, html takes care of it
}

ReaderViewer.openItemEmail = function(evt) {
    // Nothing to do, html takes care of it
}

/*
 * Change the Settings dropdown menu in listview, at the top right
 */
ReaderViewer.setMenu = function(kind) {
    this.menuKind = kind;
    $("#lv-settings-menu,#lv-settings-menu-contents").removeClass("allitems-menu");
    $("#lv-settings-menu,#lv-settings-menu-contents").removeClass("folder-menu");
    $("#lv-settings-menu,#lv-settings-menu-contents").removeClass("single-feed-menu");
    $("#lv-settings-menu,#lv-settings-menu-contents").removeClass("brand-menu");

    $("#lv-settings-menu,#lv-settings-menu-contents").addClass(kind + "-menu");

    if (kind == 'single-feed') {
        var node = $("#lv-settings-menu-contents");
        populateFolders(node, Reader.feed, function() {
            $("ul.contents", node).removeClass('hidden');
            node.addClass('hidden');
        });

    }

    $("#order-by-newest,#order-by-oldest,#order-by-magic", 
      $("#lv-settings-menu-contents")).removeClass("chooser-item-selected");

    $("#order-by-" + this.SortMode, $("#lv-settings-menu-contents")).
    addClass("chooser-item-selected");
}

ReaderViewer.homeview = function(evt) {
    // All views
    $(ALL_VIEWS).hide();
    $('body,html').addClass('homeview');
    $('#home').show();

    make_permalink('home');

// Not in spec
//    if (this.homeLoaded) {
//        return;
//    }

    this.displayTips();
    this.displayRecently();
    var container = $('#hm-container').clear();

    var fr = new FeedRenderer ();
    $.each(Reader.feedlist, function(i, feed) {
        fr.add(feed);
    });
    fr.numEntries = 3;
    Reader.showLoading();
    var bindings = fr.render(container, $('.tpl-summary', $("#templates")));

    /* Cache the nodes for filling in feed & folder unread count */
    ReaderViewer.homeviewFolders = {};
    ReaderViewer.homeviewFeeds = {};

    /*
    $.each(bindings, function(i, bind) {
        var node = bind.node;
        
        var feed = bind.feed;
        var folder = $('.fld-folder', node).getdata();

        if (feed) {
            ReaderViewer.homeviewFeeds[feed] = $('.fld-feedunread', node);
        }

        if (folder) {
            ReaderViewer.homeviewFolders[folder] = $('.fld-folderunread', node);
        }
        alert(node[0].innerHTML);
    });
*/
    this.homeLoaded = true;
}

ReaderViewer.homeItemLoaded = function(node, feed, folder) {
    if (feed) {
        ReaderViewer.homeviewFeeds[feed] = $('.fld-feedunread', node);
    }
    
    if (folder) {
        var fnode = ReaderViewer.homeviewFolders[folder];
        if (fnode) 
             ReaderViewer.homeviewFolders[folder] = fnode.addnodes($('.fld-folderunread', node));
        else
            ReaderViewer.homeviewFolders[folder] = $('.fld-folderunread', node);
    }
    
    Reader.hideLoading();
}

ReaderViewer.listview = function(evt) {
    // We call listview for the sake of correctness against specs.
    // for everything (homeview, searchfeedsview) etc.

    if (this.viewtype == 'HomeView') {
        Reader.page = 'home';
        return this.homeview();
    }

    if (this.viewtype == 'SearchResultsView') {
        Reader.page = 'search';
        return this.searchfeedsview();
    }

    if (this.viewtype == 'FeedDiscoveryView') {
        Reader.page = 'browse';
        return this.browseFeeds();
    }

    if (this.viewtype == 'TrendsView') {
        Reader.page = 'trends';
        return this.trendsview();
    }

    // The real list view begins here
    $(ALL_VIEWS).hide();
    $('body,html').removeClass('homeview');
    $('#listview').show();    

// not in specs - removing
//    if (this.state == stateListView && this.listLoaded)
//        return;

    FRS_current_item = undefined;
    // Switch RV state to list view
    this.state = stateListView;

    handle_resize();

    this.generation++;
    var container = $('#entries').clear();

    var fr = new FeedRenderer ();
    fr.numEntries = 100;

    Reader.showLoading();
    this.setLVCount('');
    this.setStatus('loading ...');

    this.itemNodes = [];
    var sink = this.sink = new Injector(this.feedLoaded.bind(this, this.generation), 
        FEEDLOAD_NUMENTRIES, FEEDLOAD_INTERVAL);

    switch (this.viewtype) {
    case 'AllItemsView':
        Reader.page = 'allitems';
        this.setTitle("All Items");
        this.setMenu('allitems');
        make_permalink('allitems');
        $.each(Reader.feedlist,function(i,feed) {
            fr.add(feed);
        });
        break;

    case 'SubscriptionView':
        if (Reader.folder) 
            make_permalink('folder', Reader.folder);
        else
            make_permalink('feed', Reader.feed);

        this.setTitle(Reader.folder ? Reader.folder : 
                      FR_feedInfo(Reader.feed).title);
        this.setMenu(Reader.folder?'folder': 'single-feed');
        $.each(Reader.feedFilter, function(i, feed) {
            fr.add(feed);
        });

        // Folder can also be a tag for items - so load these too
        sink.inject($.map(FR_taggedItems(Reader.folder), FC_lookupItemId));
        break;

    case 'BrandView':
        make_permalink(Reader.brand);
        this.setTitle("Your " + Reader.brand +" items");
        this.setMenu('brand');
        
        /* In Shared View, we need a text section in the top explaining
         * what the shared view is and how to share */
        if (Reader.brand == 'shared')
            container.append($('.tpl-sharedview-hdr', 
                               $("#templates")).clone(true));
        sink.inject($.map(FR_brandedItems(Reader.brand), FC_lookupItemId));
        Reader.hideLoading();
        this.listLoaded = true;
        return;

    case 'TagView':
        make_permalink('tag', Reader.tag);
        this.setTitle(Reader.tag);
        this.setMenu('folder');

        sink.inject($.map(FR_taggedItems(Reader.tag), FC_lookupItemId));
        Reader.hideLoading();
        this.listLoaded = true;
        return;
    }

    Reader.showLoading();
    this.numItems = 0;
    this.numUnread = 0;
    fr.startLoading(sink);

    this.listLoaded = true;
}

ReaderViewer.sortBy = function(how) {
    this.SortMode = how;
    this.handleEvent('evRefresh');
}

ReaderViewer.showUnreadOnly = function() {
    $("#listview").addClass("unreadonly");
}

ReaderViewer.showAll = function() {
    $("#listview").removeClass("unreadonly");
}

ReaderViewer.updateLVCount = function() {
    var read = $("#entries//.brand-read").length;
    var unread = $("#entries//.entry").length - read;
    this.setLVCount(unread);
}

ReaderViewer.setLVCount = function(count) {
    var node = $(".lv-unread-count");

    if (count < 10) {
        node.setdata(count);
        return;
    } else if (count < 100) {
        factor = 10;
    } else if (count < 1000) { 
        factor = 100;  
    } else {
        factor = 1000;
    }

    node.setdata(parseInt(count/factor) * factor + '+');
}

ReaderViewer.nextItem = function(scanOnly) {
    var rows;
    if (!FRS_current_item) {
        rows = $("#entries//.entry");
    } else {
        rows = $(FRS_current_item).parent().next().children('.entry');
    }

    if (rows.length > 0) {
        if (scanOnly) {
            item_select(rows[0]);
        } else {
            item_clicked(rows[0]);
        }
        card_recenter($(rows[0]));
    }
}

ReaderViewer.prevItem = function(scanOnly) {
    var rows;
    if (!FRS_current_item) {
        rows = $("#entries//.entry");  
    } else {
        rows = $(FRS_current_item).parent().prev().children('.entry');
    }

    if (rows.length > 0) {
        if (scanOnly) {
            item_select(rows[0]);
        } else {
            item_clicked(rows[0]);
        }
        card_recenter($(rows[0]));
    }
}

ReaderViewer.toggleItemOpen = function() {
    if (FRS_current_item) {
        $(FRS_current_item).toggleClass('expanded');
    }
}

ReaderViewer.starCurrentItem = function() {
    if (FRS_current_item) {
        star_clicked($(".item-star", $(FRS_current_item))[0]);
    }
}

ReaderViewer.shareCurrentItem = function() {
    if (FRS_current_item) {
        $(".item-share", $(FRS_current_item)).click();
    }
}

ReaderViewer.toggleItemRead = function() {
    if (FRS_current_item) {
        var node = $(FRS_current_item);
        var itemid = $(".fld-entries-itemid", node);
        if (itemid.length) {
            var id = itemid[0].value;
            if (!FR_isItemRead(id)) {
                FC_setItemRead(id); 
                node.addClass('brand-read'); 
            } else {
                FC_setItemUnread(id); 
                node.removeClass('brand-read'); 
            }
        }
    }
}

ReaderViewer.tagItem = function() {
    if (FRS_current_item) {
        var node = $(FRS_current_item);

        var tagger = $(".iv-edittags", node);
        ReaderViewer.handleEvent('evAddTag', tagger[0]);
    }
}

ReaderViewer.viewOriginal = function() {
    if (FRS_current_item) {
        var link_a = $("a.fld-entries-link", $(FRS_current_item));
        if (link_a.length) {
            window.open(link_a[0].href, 'yacto-reader-newsitem');
        }
    }
}

ReaderViewer.trendsview = function(evt) {
    $(ALL_VIEWS).hide();
    $('body,html').removeClass('homeview');

//    this.state = stateTrendsView;
    $('#trendsview').show();    
    handle_resize();

    make_permalink('trends');
    var stats = FR_getStats();
    var dayscaling = get_scaling(stats.period.month)
    var hourscaling = get_scaling(stats.period.day);
    var dowscaling = get_scaling(stats.period.week);

    /* Handle periodic tab */
    var day  = $("#day-bucket-chart-contents").populate(dayscaling);
    var hour = $("#hour-bucket-chart-contents").populate(hourscaling);
    var dow  = $("#dow-bucket-chart-contents").populate(dowscaling);
    
    populateGraph(day, ".tpl-day-bucket-cell", dayscaling, stats.period.month);
    populateGraph(hour, ".tpl-hour-bucket-cell", hourscaling, stats.period.day);
    populateGraph(dow, ".tpl-dow-bucket-cell", dowscaling, stats.period.week);

    /* Handle reading trends tabs */
    populateTrends("#trends-most-read-sorting-contents//tbody",
                   ".tpl-reading-trends-read",
                   stats.itemstats, 'nread');

    populateTrends("#trends-most-starred-sorting-contents//tbody",
                   ".tpl-reading-trends-starred",
                   stats.itemstats, 'starred');

    populateTrends("#trends-most-shared-sorting-contents//tbody",
                   ".tpl-reading-trends-shared",
                   stats.itemstats, 'shared');

    populateTrends("#trends-most-emailed-sorting-contents//tbody",
                   ".tpl-reading-trends-emailed",
                   stats.itemstats, 'emailed');

    populateTrends("#trends-mobile-sorting-contents//tbody",
                   ".tpl-reading-trends-mobile",
                   stats.itemstats, 'readonmobile');

    /* Handle subscription trends tabs */
    populateTrends('#trends-most-updated-sorting-contents//tbody',
                   '.tpl-subs-trends-freq',
                   stats.update_frequency.frequent, 'items_per_day', true);

    populateTrends('#trends-least-updated-sorting-contents//tbody',
                   '.tpl-subs-trends-inactive',
                   $.map(stats.update_frequency.inactive,
                         FR_feedInfo), undefined, true);


    var totalstats = {
        nfeeds : 0,
        nread : 0,
        nstarred: 0,
        nshared : 0,
        nemailed : 0
    };

    $.each(stats.itemstats, function(i, stat) {
        totalstats.nfeeds++;
        totalstats.nread += stat.nread;
        totalstats.nstarred += stat.starred;
        totalstats.nshared += stat.shared;
        totalstats.nemailed += stat.emailed;
    });
      
    $("#trends-item-count-header").populateObject(totalstats);

    var tagcloud = $("#trends-tag-cloud");
    tagcloud.children().remove();
    var tagtemp  = $(".tpl-tag-cloud", $("#templates"));

    var clouds = tagcloud.populateArray(FR_allFolders(), tagtemp);
    var tagstats = {};

    var max_items = 0;
    var max_readitems = 0;
    $.each(clouds, function(i, binding) {
        var items = 0;
        var readitems = 0;

        var feeds = FR_feedsInFolder(binding.obj);

        if (feeds) {
            items = feeds.length;
            $.each(stats.itemstats, function(i, stat) {
                if ($.indexOf(feeds, stat.feed) >= 0) {
                    readitems += stat.nread;
                }
            });
        }
        tagstats[binding.obj] = {items: items, readitems: readitems, 
                                 node:binding.node};
        if (items > max_items)
            max_items = items;
        if (readitems > max_readitems)
            max_readitems = readitems;
    });
    
    $.each(tagstats, function(tag, tagstat) {
        var notch = Math.round(5.0 * tagstat.items / max_items);
        tagstat.node.addClass("x" + notch);

        var notch1 = Math.round(5.0 * tagstat.readitems / max_readitems);
        tagstat.node.addClass("y" + notch1);
    });
}

Reader.navNext = function() {
    var node = $('.navigated');
    if (!node || !node.length)
        node = Reader.selectedNode;

    var saved = node;

    // If this not a folder,feed or tag node ...
    if (!node || !node.parents('#fl-folderlist,#fl-feedlist,#fl-taglist').length) {
        node = $('span.link', $("#fl-folderlist"));

        if (node.length > 1)
            node = $(node[0]);
    } else {
        node = $('span.link', node.parents('li').next());
    }

    if (!node || !node.length) {
        node = $('span.link', saved.parents('#fl-folderlist,#fl-feedlist,#fl-taglist').next());
    }
        
    if (node.length > 1)
        node = $(node[0]);

    $('.navigated').removeClass('navigated');

    if (node && node.length) {
        node.addClass('navigated');
    }
}


Reader.navPrev = function() {
    var node = $('.navigated');
    if (!node || !node.length)
        node = Reader.selectedNode;

    var saved = node;

    // If this not a folder,feed or tag node ...
    if (!node || !node.parents('#fl-folderlist,#fl-feedlist,#fl-taglist').length) {
        node = $("#fl-taglist").children('li').children('span.link');

        if (node.length > 1)
            node = $(node[node.length-1]);
    } else {
        node = node.parents('li').prev().children('span.link');
    }

    if (!node || !node.length) {
        node = saved.parents('#fl-folderlist,#fl-feedlist,#fl-taglist').prev().children('li').children('span.link');

        if (node.length > 1)
            node = $(node[node.length-1]);

    }

    $('.navigated').removeClass('navigated');
    if (node && node.length) {
        node.addClass('navigated');
    }
}

Reader.navOpenSelected = function() {
    var node = $('.navigated');
    if (node.length > 0) {
        if (node.is('.tag-selector')) {
            node.parents('li.tag').click();
        } else {
            $('.folder-invoke,.feed-invoke', node).andSelf().click();
        }
    }
}

Reader.navToggleExpand = function() {
    var node = $('.navigated');
    if (node.length > 0)
        $('div.toggle', node.parent('li.folder')).click();
}

Reader.toggleFullScreen = function() {
    if ($(document.body).is('.hide-nav')) {
        Reader.open();
    } else {
        Reader.close();
    }
}

Reader.openPromptedFeed = function() {
    var feed = prompt('Feed to open:');
    $("#fl-feedlist//span.fld-title:contains('" + feed+ "')").parents('.feed-invoke').click();

}

/*
 * Function to populate the bar graph for trends
 */
function populateGraph(node, expr, scaling, statlist) {
    $(".bucket-scale-dyncell", node).remove();
    $.each(statlist, function(i, val) {
        var cell = $(expr, $("#templates")).clone(true);
        cell.attr('title', val); // XXX add a prefix

        $(".bucket", cell).css('height', parseInt(1+100*val/scaling.scalemax) + 'px');
        cell.appendTo($(".bucket-scale-dynrow", node));
    });
}

/* 
 * Function to populate the entrie trends screen
 */
function populateTrends(expr, template, orgstats, field, nosort) {
    var tmpstats;

    if (field) {
        tmpstats = $.grep($.clone(orgstats), function(stat) {
            return stat[field] > 0;
        });
    } else {
        tmpstats = $.clone(orgstats);
    }

    /* Sort if needed */
    var stats;
    if (!nosort) {
         stats = [];
        
        $.each(tmpstats, function(i, stat) {
            var found = false;
            for (var j=0; j<stats.length; j++) {
                if (stats[j][field] < stat[field]) {
                    var tstats = stats.slice(0,j);
                    tstats.push(stat);
                    $.merge(tstats, stats.slice(j));
                    stats = tstats;
                    found = true;
                    break;
                }
            }
            if (!found)
                stats.push(stat);
        });
    } else {
        stats = tmpstats;
    }

    $.each(stats, function(i, stat) {
        try {$.extend(stat, FR_feedInfo(stat.feed));} catch(e) {}
    });

    $(expr).children().remove();
    var bindings = $(expr).populateArray(stats, 
                  template);

    $.each(bindings, function (i, bind) {
        bind.node.addClass("top40");
        if (i < 20)
            bind.node.addClass("top20");
        if (i < 10)
            bind.node.addClass("top10");
            
    });
}

ReaderViewer.browseFeeds = function (evt) {
    $(ALL_VIEWS).hide();
    $('body,html').removeClass('homeview');

    $('#browsefeedsview').show();
    
    Reader.showLoading ();
    
    var container = $('#bundles-list').clear();

    var template = $('.tpl-bundle-news', $("#templates"));

    var googleBundles = FR_browseFeeds();
    var bundlesData = googleBundles.bundles;

    make_permalink('browse');
    var fr = new FeedRenderer ();
    Reader.showLoading();

    handle_resize();
    var bnum = 0;
    for (var p in bundlesData) {
        if (typeof (bundlesData [p]) == "object") {
            if (bnum == 3) {
                $(".tpl-more-bundles", $("#templates")).
                clone(true).appendTo(container);
            }
            
            var rt = template.clone(true);
            rt[0].id = bnum;
            container.append(rt);
            
            if (bnum >= 3)
                rt.addClass('bundle-extra');
            
            bundlesData[p].feedcount = ''+bundlesData[p].subscriptions.length;
            //        FeedRenderer.prototype.renderObject (bundlesData[p], rt, template);
            rt.populateFeed(bundlesData[p]);
            
            var link = $(".bundle-invoke", rt);
            
            var title = bundlesData[p].title;
            link.click(function(event){
	            event = jQuery.event.fix( event || window.event || {} );  
                
                ReaderViewer.handleEvent('evTag', event.target);
                return false;}); 
            
            if (FR_getProperty(FRP_BUNDLE_STATE + title) == 'added') {
                rt.addClass('bundle-added'); 
            }
            
            var bi = $(".feeds-bundle-data", rt);
            bi.each(function(i) {this.bundleData = bundlesData[p];});
            bnum++;
        }
    }


    Reader.hideLoading();
//    fr.renderSearchResult ($('#quickadd')[0].value, container, $('#tpl-search'));

    this.searchLoaded = true;    
    
}

ReaderViewer.showbundle = function(evt) {
    if (this.viewtype == 'FeedDiscoveryView') {
        var node = this.elem;
        
        var topnode = $(node).parents('.tpl-bundle-news');
        var inp = $(".feeds-bundle-data", topnode);
        var folder = inp[0].bundleData.title;
        
        //    var folder= node.href;
        if (folder.match(/([^\/]+)$/)) {
            folder = RegExp.$1;
        }
        
        Reader.openFolder(folder); 
    }

    return false;
}

ReaderViewer.showImport = function(evt) {
    if (this.viewtype == 'FeedDiscoveryView') {
        Reader.settingsImexportTab(); 
    }
}

ReaderViewer.searchfeedsview = function (evt) {
    $(ALL_VIEWS).hide();
    $('body,html').removeClass('homeview');
    
    $('#quick-add-bubble-holder').hide();
    $('#searchview').show();
    
    Reader.showLoading ();
    
    var container = $('#sr-container');
    container.children().remove();

    var fr = new FeedRenderer ();

    Reader.showLoading();

    var keyword = DOM.quickadd.getdata();
    $("#sv-keyword").setdata(keyword);

    make_permalink('search', keyword);

    fr.renderSearchResult (keyword, container, $('#tpl-search'));

    this.searchLoaded = true;    
    
}

ReaderViewer.searchInBrowse = function(evt) {
    DOM.quickadd.setdata($('#directory-search-query').getdata());
    this.viewtype = 'SearchResultsView';
    this.handleEvent('evListView');
}

ReaderViewer.toggleExpanded = function(evt) {
    this.expandedView = !this.expandedView;

    if (this.expandedView) {
        $("#view-cards").addClass('tab-header-selected');
        $("#view-list").removeClass('tab-header-selected');
        FR_setProperty(FRP_EXPANDED_VIEW, 'true');
    } else {
        $("#view-list").addClass('tab-header-selected');
        $("#view-cards").removeClass('tab-header-selected');
        FR_setProperty(FRP_EXPANDED_VIEW, null);
    }

    this.handleEvent('evListView');
}

ReaderViewer.setExpanded = function(expanded) {
    if (expanded != this.expandedView)
        this.handleEvent('evToggleExpanded');
}

ReaderViewer.feedLoaded = function(generation, entries) {
    // There is no way to STOP a feed being loaded.
    // So we use this trick
    if (generation != this.generation)
        return;

    if (this.expandedView) {
        $("#entries")[0].className = 'expanded';
    } else {
        $("#entries")[0].className = 'list';
    }

    var feeds = [];
    $.each(entries, function(i, property) {
        var itemid = property['entries-itemid'];
        var node = $(ReaderViewer.expandedView?'.tpl-entry-exp':'.tpl-entry', 
                     $("#templates")).clone(true);
        var itemnode = {node:node, 
                        timestamp:property.timestamp};
        var placed = false;
        switch (ReaderViewer.SortMode) {
        case 'newest':
            $.each(ReaderViewer.itemNodes, function(i, item) {
                       if (item.timestamp < property.timestamp) {
                           node.insertBefore(item.node);
                           var newnodes = ReaderViewer.itemNodes.slice(0,i);
                           newnodes.push(itemnode);
                           $.merge(newnodes, ReaderViewer.itemNodes.slice(i));
                           ReaderViewer.itemNodes = newnodes;
                           placed = true;
                           return false;
                       }
                   });
            break;

        case 'oldest':
            $.each(ReaderViewer.itemNodes, function(i, item) {
                       if (item.timestamp > property.timestamp) {
                           node.insertBefore(item.node);
                           var newnodes = ReaderViewer.itemNodes.slice(0,i);
                           newnodes.push(itemnode);
                           $.merge(newnodes, ReaderViewer.itemNodes.slice(i));
                           ReaderViewer.itemNodes = newnodes;
                           placed = true;
                           return false;
                       }
                   });
            break;

        default:
            break;
        }

        if (!placed) {
            node.appendTo($('#entries'));
            ReaderViewer.itemNodes.push(itemnode);
            placed = true;
        }

        node.populate(property);        
        $(".user-tags-list", node).populateArray(FR_tagsForItem(itemid),
                        $("#tpl-iv-tag-list", $("#templates")));
        setBranding(node, property);
        $.merge(feeds, [property.feed]);
        if (itemid == ReaderViewer.current_itemid) {
            FRS_current_item = $(".entry", node).addClass('expanded').attr('id', 'current-entry')[0];
        }
    });

    if (this.expandedView) {
        $("#entries//.entry").click(card_clicked);
    }

    Reader.updateFeedCount(feeds);

    this.numItems += entries.length;
    this.setLVCount(this.numItems);
    this.setStatus(' ' + this.numItems + ' items');
    Reader.hideLoading();
}

ReaderViewer.searchAddFolder = function(node, event) {
    var topnode = $(node); //".sv-folder-menu");
    var dropdown = $(".sv-folder-menu-contents", topnode);

    var inactive = dropdown.is('.hidden'); 

    if (inactive) { 
        dropdown.removeClass('hidden'); 
//        var bc = $('.button-container', topnode);
//        dropdown[0].style.width = bc[0].offsetWidth + 'px';
    } else {
        dropdown.addClass('hidden');  
    }
}

ReaderViewer.searchFolderHide = function() {
    $(".sv-folder-menu-contents").addClass('hidden');
}

ReaderViewer.searchViewFeed = function(node, event) {
    var feed = $("input.fld-entries-url", node.parentNode).getdata();

    var folders = FR_folderForFeed(feed);
    if (folders && folders.length > 0) {
        Reader.expandFolder(folders[0]);
    }

    Reader.openFeed(feed);
}

ReaderViewer.searchRemoveFeed = function(node, event) {
    if (!confirm("Are you sure you want to unsubscribe this feed?")) {
        return; 
    }

    // Unsubscribe the feed
    var feed = $("input.fld-entries-url", node.parentNode).getdata();
    Reader.removeFeed(feed);

    // Mark this search entry as unsubscribed
    $(node).parents(".tpl-search").removeClass("result-subscribed");
}

ReaderViewer.removeSubscribedFeed = function(evt) {
    return this.searchRemoveFeed(this.elem);
}

ReaderViewer.settingsClicked = function(node, event) {
    var topnode = $("#lv-settings-menu");
    var dropdown = $("#lv-settings-menu-contents");

    var inactive = dropdown.is('.hidden');

    if (inactive) {
        dropdown.removeClass('hidden');
//        var bc = $('.button-container', topnode);
//        dropdown[0].style.width = bc[0].offsetWidth + 'px';
    } else {
        dropdown.addClass('hidden');
    }
}

ReaderViewer.settingsHide = function() {
    var dropdown = $("#lv-settings-menu-contents");
    dropdown.addClass('hidden');
}

ReaderViewer.itemEditTags = function(evt) {
    return this.editTags(this.elem);
}

ReaderViewer.editTags = function(node, event) {
    node = $(node);  
    var topnode = node.parents(".entry");  
    var itemid = $(".fld-entries-itemid", topnode).getdata();  
    if(itemid.length > 0) {  
        this.currentItem = itemid;  
        this.currentItemNode = node.parents(".iv-main");  

        var tpl = $("#hover-tags-edit");  
        var pos = node.positionedOffset();  
        
        var l = (pos[0]+node[0].offsetWidth+2)+'px';  
        var t = (pos[1]-15)+'px';  
 
//        alert(l + ',' + t);
        tpl.css('left', l).  
        css('top', t).show();

        /* populate with current tags */
        var tags = FR_tagsForItem(itemid).join(', ');  

        $("input.iv-addtags-input", tpl).setdata(tags)[0].focus();  
    }
}

ReaderViewer.saveTags = function(node, event) {
    var tpl  = $("#hover-tags-edit")  
    if (this.currentItem) {  
        var itemid = this.currentItem;  
        var node   = this.currentItemNode;  
        this.currentItem = this.currentItemNode = undefined;  

        var tags = $.map($("input.iv-addtags-input", tpl).getdata().split(','), $.trim);  

        FR_untagAllForItem(itemid);  
        $.each(tags, function(i, tag) {  
            FR_tagItem(itemid, tag);  
        });

        var taglist = $(".user-tags-list", node);  
        taglist.children().remove();  
        taglist.populateArray(FR_tagsForItem(itemid),  
                        $("#tpl-iv-tag-list", $("#templates")));

        Reader.refresh();  
    }

    tpl.hide();  
}

ReaderViewer.close = function() {
    // Huh ?? 
}

ReaderViewer.cancelTags = function(node, event) {
    var tpl  = $("#hover-tags-edit")  
    tpl.hide();  

    this.currentItem = undefined;  
}

ReaderViewer.openDevBlog = function(evt) {
    window.open(FRU_devBlog);
}

ReaderViewer.openTips = function(evt) {
    window.open(FRU_tips);
}

ReaderViewer.displayTips = function(evt) {
    $(".hv-tips-container").populateObject(FR_getTips());
}

ReaderViewer.displayBundles = function(evt) {
    // Bundles are displayed as part of the main refresh
    // So nothing to do here
}

ReaderViewer.displayUnread = function(evt) {
    // Unread is displayed as part of the main refresh
    // So nothing to do here
}

var dbg = true;
ReaderViewer.displayUnreadCount = function(nodetype, name, unread) {
    if (nodetype == 'feed') {
        try {
            this.homeviewFeeds[name].setdata('('+unread+')');
        } catch(e){}
    } else if (nodetype == 'folder') {
        try {
//            alert(unread);
            this.homeviewFolders[name].setdata('('+unread+')');
        } catch(e){}
    }
}

ReaderViewer.displayRecently = function(evt) {
    var entries = FR_getStarredItems();

    var node =  DOM.recentStarred;
    if (entries && entries.length>0) {
        entries = entries.slice(entries.length-3);
        node.show().children('.tpl-recent').remove();
        node.populateArray($.map(entries, FC_lookupItemId), ".tpl-recent");
    } else {
        node.hide();
    }

    entries = FR_getSharedItems();
    entries = entries.slice(entries.length-3);

    node =  DOM.recentShared;
    if (entries && entries.length>0) {
        entries = entries.slice(entries.length-3);
        node.show().children('.tpl-recent').remove();
        node.populateArray($.map(entries, FC_lookupItemId), ".tpl-recent");
    } else {
        node.hide();
    }
}
                                    
Settings.init = function() {
    this.viewtype = 'SubView';
    this.currentTab = 'subscriptions';
    DOM.subsFilterInput = $("#subs-filter-input");
    if (!this.domLoaded) {
        // Dont barf if init is called more than once
        this.domLoaded = true;
        
        DOM.subsFilterInput.enter(this.filterSubs.bind(this)).
                                  keyup(this.filterSubs.bind(this));
    }

    DOM.settings = $("#settings");
}

Settings.show = function() {
    // Show the settings section and hide everything else
    $('#main').hide();
    DOM.settings.show();
    $("body,html").addClass('settings');

    switch(Settings.viewtype) {
    case 'SubView':
        make_permalink('settings', 'subs');
        this.currentTab = 'subscriptions';
        break;
    case 'PrefView':
        make_permalink('settings', 'prefs');
        this.currentTab = 'extras';
        break;
    case 'TagView':
        make_permalink('settings', 'labels');
        this.currentTab = 'labels';
        break;
    case 'ImexportView':
        make_permalink('settings', 'imexport');
        this.currentTab = 'importexport';
        break;
    case 'GoodiesView':
        make_permalink('settings', 'goodies');
        this.currentTab = 'goodies';
        break;
    }

    $.each(SETTING_TABS, function(i, tab) {
        $('#setting-' + tab).removeClass('selected');
        $('.setting-tab-' + tab).removeClass('selected');
    });

    $('#setting-' + this.currentTab).addClass('selected');
    $('.setting-tab-' + this.currentTab).addClass('selected');

    this['show' + this.currentTab]();
}

/* Settings.showtab = function(newtab) {
    this.currentTab = newtab;  
    this.show();  
} */

Settings.showextras = function() {
    var folders = FR_allFolders();
    var tags    = FR_allTags();

    var select  = $("#settings-prefs-dropdown");
    select.children(".dynamic").remove();
    
    $.each(folders, function(i, folder) {
        var option = $(document.createElement('option')).addClass('dynamic').setdata(folder).appendTo(select);
        option[0].value = '?folder/' + folder;
    });

    $.each(tags, function(i, tag) {
        var option = $(document.createElement('option')).addClass('dynamic').setdata(tag).appendTo(select);
        option[0].value = '?tag/' + tag;
    });

    select[0].value = FR_getProperty(FRP_START_PAGE);

    var scrollchk = $('#settings-prefs-scroll');
    scrollchk.attr('checked', FR_getProperty(FRP_SCROLL_TRACKING));
}

Settings.showimportexport = function() {
}

Settings.showgoodies = function() {
}

Settings.showsubscriptions = function() {
    if (!this.selectedFeeds)
        this.selectedFeeds = [];

    var subs = $.map(Reader.feedlist, FR_feedInfo);
    $.each(subs, function(i, sub) {
        var folders = FR_folderForFeed(sub.feed);
        if (folders) {
            sub.folders = folders.join(', ');
        }
    });
    var subsnode = $('#subscriptions');
    subsnode.children().each(function() {$(this).remove();});

    var bindings = subsnode.populateArray(subs, 
        $('.tpl-settings-row,.tpl-settings-row1', 
          $("#templates")));
    $.each(bindings, function(i, b) {
        if ($.indexOf(Settings.selectedFeeds, b.obj.feed)>=0) {
            $(".chkbox", b.node).attr('checked', 'checked');
        }

        populateFolders(b.node, b.obj.feed,
                        Settings.subsUpdateTags.bind(Settings, b.node, b.obj.feed));
    });

    $("#subs-total").setdata(subs.length);
    if (this.selectedFeeds.length > 0) {
        this.updateFolders([]);
    }
}

Settings.subsUpdateTags = function(topnode, feed) {
    var folders = FR_folderForFeed(feed);  
    if (!folders)
        folders = [];
    $(".fld-folders", topnode).setdata(folders.join(", "));  
}

Settings.hide = function() {
    DOM.settings.hide();
    $('#main').show();
    $("body,html").removeClass('settings');
}

/* -- Subscriptions tab -- */
Settings.show_folders_dropdown = function (topnode) {
    var feed = $(".feedid", topnode)[0].value;

    var dropdown = $("ul.contents", topnode);
    var inactive = dropdown.is('.hidden');

    /* Close all open dropdowns */
    this.hide_folder_dropdowns();

    if (inactive) {
        dropdown.removeClass('hidden');
        var bc = $('.button-container', topnode);
        dropdown[0].style.width = bc[0].offsetWidth + 'px';
    } else {
        dropdown.addClass('hidden');  
    }
}

Settings.hide_folder_dropdowns = function() {
    $(".tpl-settings-row//ul.contents").addClass('hidden');
}

/*
Settings.choice_clicked = function(feed, folder, remove, topnode) {
    if (remove) {  
        FR_removeFromFolder(feed, folder);  
    } else {
        FR_copyToFolder(feed, folder);  
    }
    
    Reader.refresh();  
    this.show();  
}
*/

Settings.show_rename = function(topnode) {
    var feed = $(".feedid", topnode)[0].value;
    var feedinfo = FR_feedInfo(feed);

    if (feedinfo) {
        return $("#hover-form", $("#globalnodes")).
                 populateObject(feedinfo);
    }
}

Settings.do_rename = function(feed, newtitle) {
    FR_cacheFeed(feed, newtitle);
    Reader.refresh();
    this.show();
}

Settings.remove_feed = function(topnode) {
    var feed = $(".feedid", topnode)[0].value;

    ReaderViewer.homeLoaded = false;
    Reader.removeFeed(feed);
    this.show();
}

Settings.select_all = function() {
    var settings = DOM.settings;  
    var folders = [];  
    this.selectedFeeds = FR_allFeeds();  

    $('.tpl-settings-row//.chkbox', settings).attr('checked', 'checked');  
    $('.tpl-settings-row//.fld-folders', settings).each(  
        function() {
            $.merge(folders, $(this).getdata().split(','));  
        });

    this.updateFolders(folders);  
}

Settings.select_none = function() {
    var settings = DOM.settings;  
    this.selectedFeeds = [];  
    $('.tpl-settings-row//.chkbox', settings).attr('checked', '');  

    this.updateFolders([]);  
}

Settings.select_unassigned = function() {
    var settings = DOM.settings;  
    this.selectedFeeds = [];  

    $('.tpl-settings-row', settings).each(function() {  
        if ($('.fld-folders', $(this)).getdata() == '') {  
            Settings.selectedFeeds.push($('.fld-feed', $(this)).getdata());  
            $('.chkbox', $(this)).attr('checked', 'checked');  
        } else {
            $('.chkbox', $(this)).attr('checked', '');  
        }
    });

    this.updateFolders([]);  
}

Settings.unsubscribeSelected = function() {
    if (!this.selectedFeeds || this.selectedFeeds.length == 0) {
        alert("Please select the feeds you want to unsubscribe from");  
        return;  
    }

    if (!confirm("Are you sure you want to unsubscribe from selected feeds?")) {
        return;  
    }

    Reader.showLoading();    

    ReaderViewer.homeLoaded = false;
    $.each(this.selectedFeeds, function(i, feed) {
        Reader.removeFeed(feed);
    });

    Reader.hideLoading();    
    this.selectedFeeds = [];
    this.show();
}

Settings.filterSubs = function() {
    var key = DOM.subsFilterInput.getdata();
    var settings = $("#settings");

    $('.tpl-settings-row', settings).each(function() {
        var feed = $('.fld-feed', $(this)).getdata()
        var folders = FR_folderForFeed(feed);
        var feedinfo = FR_feedInfo(feed);

        if (feed.indexOf(key) >= 0 ||
            feedinfo.title.indexOf(key) >= 0 ||
            (folders && folders.join('___').indexOf(key) >= 0)) {
            $(this).removeClass('hidden').next(".tpl-settings-row1").removeClass('hidden');
        } else {
            $(this).addClass('hidden').next(".tpl-settings-row1").addClass('hidden');
        }
    });
    
}

Settings.checkChanged = function() {
    var settings = DOM.settings;
    var folders = [];
    this.selectedFeeds = [];

    $('.tpl-settings-row', settings).each(function() {
        if ($('.chkbox', $(this)).attr('checked')) {
            Settings.selectedFeeds.push($('.fld-feed', $(this)).getdata());
            var fstr = $('.fld-folders', $(this)).getdata();

            if (fstr)
                $.merge(folders, fstr.split(','));
        }
    });

    this.updateFolders(folders);
}

Settings.updateFolders = function(remove_list) {
    remove_list = $.uniq($.map(remove_list, $.trim));

    var options = $('#subs-folder-options', DOM.settings).setdata('');
    var allfolders = FR_allFolders();
    $.merge(allfolders, FR_allTags());

    var option = $(document.createElement('option')).attr('value', '0');
    option[0].innerHTML = 'More actions...';

    options.append(option);
    
    option = $(document.createElement('option')).
               attr('disabled', 'disabled').attr('value', '0');
    option[0].innerHTML = 'Add tag...';
    options.append(option);

    // Add all folders
    $.each(allfolders, function(i, f) {
        option = $(document.createElement('option')).
                   attr('value', f).addClass('a').addClass('label');
        option[0].innerHTML = f;
        options.append(option);
    });

    if (remove_list && remove_list.length > 0) {
        option = $(document.createElement('option')).
                   attr('disabled', 'disabled');
        option[0].innerHTML = 'Remove tag...';
        options.append(option);
        
        // Add remove_list
        $.each(remove_list, function(i, f) {
            option = $(document.createElement('option')).
                       attr('value', f).addClass('a').addClass('label').
                       addClass('remove');
            option[0].innerHTML = f;
            options.append(option);
        });
    }

//    options.change(Settings.folderChanged.bind(Settings, options[0]));
}

Settings.folderChanged = function(node, event) {
    var settings = DOM.settings;
    var opt = $(node.options[node.selectedIndex]);

    var remove = false;
    var folder = opt[0].value;

    if (folder != '0') {
        if (opt.is('.remove')) {
            remove = true;  
        }
        
        $('.tpl-settings-row', settings).each(function() {
            var feed = $('.fld-feed', $(this))[0].value;
            
            if ($('.chkbox', $(this)).attr('checked')) {
                if (remove) {
                    FR_removeFromFolder(feed, folder);  
                } else
                    FR_copyToFolder(feed, folder);
            }
        });
        
        Reader.refresh();
        this.show();
    }
}

/* -- Tag tab -- */
Settings.showlabels = function() {
    if (!this.selectedLabels)
        this.selectedLabels = [];

    var allfolders = FR_allFolders();
    $.merge(allfolders, FR_allTags());
    
    var topnode = $("#settings");
    var tbody = $('#labels-list', topnode);
    tbody.children('.tpl-tags-row').remove();

    $(".labels-change-sharing")[0].selectedIndex = 0;

    var finfos = $.map(allfolders, function(f) {
        var info = {folder: f};
        return info;
    });

    var bindings = tbody.populateArray(finfos, 
        $('.tpl-tags-row', $("#templates")));
    bindings.push({node: $(".labels-list-starred"),
                   obj: {folder : "_starred"}});

    bindings.push({node: $(".labels-list-shared"),
                   obj: {folder : "_shared"}});

    $.each(bindings, function(i, bind) {
        if (FR_getProperty(FRP_FOLDER_SHARE + bind.obj.folder) ==
            'public') {
            bind.node.addClass('is-public');  
        }

        if ($.indexOf(Settings.selectedLabels,bind.obj.folder) >= 0) {
            $(".chkbox", bind.node).attr('checked', 'checked');  
        } else {
            $(".chkbox", bind.node).attr('checked', '');
        } 
    });

    if (FR_getProperty(FRP_FOLDER_SHARE + "_starred") =='public')
        $(".labels-list-starred").addClass("is-public");  
    else
        $(".labels-list-starred").removeClass("is-public");
    
    
    $("#labels-total").setdata(bindings.length);
}

Settings.togglepublic_clicked = function(event) {
	event = jQuery.event.fix( event || window.event || {} ); 
    var topnode = $(event.target).parents(".data-row");
    if (!topnode.is(".labels-list-shared")) {
        
        var isPublic = topnode.is(".is-public");
        var folder = $(".fld-folder", topnode).getdata();
        
        if (isPublic) {
            FR_setProperty(FRP_FOLDER_SHARE + folder, null);
            topnode.removeClass('is-public');
        } else {
            FR_setProperty(FRP_FOLDER_SHARE + folder, 'public');
            topnode.addClass('is-public');
        }
    }
}

Settings.removefolder_clicked = function(event) {
	event = jQuery.event.fix( event || window.event || {} );   
    var topnode = $(event.target).parents(".data-row");  
    var folder = $(".fld-folder", topnode).getdata();  
    
    if (confirm('Are you sure you want to remove the "' + folder   
                + '" label ?')) {
        this.removeFolder(topnode);  
        $("#labels-total").setdata($(".data-row", 
                                     $("#setting-labels")).length);  
    }
}

Settings.removeFolder = function(topnode) {
    var folder = $(".fld-folder", topnode).getdata();
    if (!folder.match(/^_/)) {
        
        var feeds = FR_feedsInFolder(folder);
        if (feeds)
            $.each(feeds, function(i, f) {FR_removeFromFolder(f, folder);});
        
        var items = FR_taggedItems(folder);
        if (items)
            $.each(items, function(i, item) {FR_untagItem(item, folder);});
        
        topnode.remove();
        Reader.refresh();
    }
}

Settings.removeSelectedTags = function() {
    if ($.grep(this.selectedLabels, function(label) {
        return label.match(/^_/);}).length > 0) {  
        alert("You cannot remove your starred or shared items");  
        return;  
    }

    if (confirm("Are you sure you want to remove the selected labels?")) {
        $(".chkbox", $("#setting-labels")).each(function() {
            var opt = $(this);
            if (opt.attr('checked')) {
                var topnode = opt.parents(".data-row");
                Settings.removeFolder(topnode);
            }
        });
        
        $("#labels-total").setdata($(".data-row", $("#setting-labels")).length);
    }
}

Settings.tagCheckChanged = function(node) {
    node = $(node);  

    var folder = $(".fld-folder",   
        node.parents(".data-row")).getdata();

    if (node.attr('checked')) {  
        this.selectedLabels.push(folder);  
        this.selectedLabels = $.uniq(this.selectedLabels);  
    } else {
        this.selectedLabels = $.grep(this.selectedLabels, function(l) {  
            return l != folder;  
        });
    }
}

Settings.shareOptionChanged = function(node) {
    var makePrivate = true;
    if (node.value != '0') {
        
        if (node.value == 'public') {
            makePrivate = false;
        }
        
        $(".chkbox", $("#setting-labels")).each(function() {
            var opt = $(this);
            if (opt.attr('checked')) {
                var topnode = opt.parents(".data-row");
                
                var isPublic = topnode.is(".is-public");
                var folder = $(".fld-folder", topnode).getdata();
                
                if (makePrivate && !topnode.is('.labels-list-shared')) {
                    FR_setProperty(FRP_FOLDER_SHARE + folder, null);
                    topnode.removeClass('is-public');
                } else {
                    FR_setProperty(FRP_FOLDER_SHARE + folder, 'public');
                    topnode.addClass('is-public');
                }
            }
        });
        
        node.selectedIndex = 0;
    }
}

Settings.select_alltags = function() {
    $(".chkbox", $("#setting-labels")).attr('checked', 'checked');  

    var allfolders = FR_allFolders(); 
    $.merge(allfolders, FR_allTags()); 

    this.selectedLabels = allfolders; 
}

Settings.select_notags = function() {
    $(".chkbox", $("#setting-labels")).attr('checked', ''); 
    this.selectedLabels = []; 
}

Settings.select_publictags = function() {
    this.selectedLabels = []; 

    $(".chkbox", $("#setting-labels")).each(function() { 
        var topnode = $(this).parents(".data-row"); 
        if (topnode.is(".is-public")) { 
            Settings.selectedLabels.push($(".fld-folder", topnode).getdata()); 
            $(this).attr('checked', 'checked'); 
        } else {
            $(this).attr('checked', ''); 
        }
    });
}

Settings.select_privatetags = function() {
    this.selectedLabels = []; 

    $(".chkbox", $("#setting-labels")).each(function() { 
        var topnode = $(this).parents(".data-row"); 
        if (topnode.is(".is-public")) { 
            $(this).attr('checked', ''); 
        } else {
            Settings.selectedLabels.push($(".fld-folder", topnode).getdata()); 
            $(this).attr('checked', 'checked'); 
        }
    });
}

//-- UI state manipulation  code --
function setBranding(node, property) {
    var itemid = property['entries-itemid'];
    if (itemid) {
        
        if (FR_isStarred(itemid)) {
            node.addClass('brand-starred'); 
        } else {
            node.removeClass('brand-starred');
        }
        
        if (FR_isShared(itemid)) {
            node.addClass('brand-shared'); 
        } else {
            node.removeClass('brand-shared');
        }
        
        if (FR_isItemRead(itemid)) {
            node.addClass('brand-read');
        } else {
            node.removeClass('brand-read');
            //        FC_updateUnread(property.feed, 1);
        }
    }
}

//-- Reader UI callbacks --
/*function home_clicked(node) {
    Reader.handleEvent('evHome', node);
}

function allitems_clicked(node) {
    Reader.handleEvent('evAllItems', node);
}

function quickadd_clicked (node) {
    Reader.handleEvent('evQuickAdd', node);
}

function browse_clicked (node) {
    ReaderViewer.handleEvent('evBrowse', node);
}

function searchfeeds_clicked (node) {
    ReaderViewer.handleEvent ('evSearchFeeds', node);
}
*/


function quickadd_close_clicked(node) {
    $("#quick-add-bubble-holder").hide(); 
}

function subscribeFeed_clicked (node) {
    var inp = $("input.fld-entries-url", node);

    var feed = {title: '', feed: ''};

    feed.feed = inp[0].value;

    inp = $("input.fld-entries-title", node);
    feed.title = inp[0].value;

    FR_cacheFeed(feed.feed, feed.title);
    FR_addFeed(feed.feed);
    // Start retreiving the items
    FC_retreiveFeed(feed.feed);

    ReaderViewer.handleEvent('evSubSubscribed', node);
    Reader.handleEvent('evRefresh', node);
}

ReaderViewer.addBundleOrFeed = function(evt) {
    if (this.viewtype == 'FeedDiscoveryView') {
        return subscribeBundle_clicked(this.elem);
    } else if (this.viewtype == 'SearchResultsView') {
        subscribeFeed_clicked(this.elem);
    }
}

ReaderViewer.doSearch = function() {
    // Search results are displayed as part of the main refresh
    // So nothing to do here
}

ReaderViewer.returnToFD = function() {
    if(this.viewtype == 'SearchResultsView') {
        Reader.handleEvent('evBrowse');
    }
}

ReaderViewer.searchFeedSubscribed = function(evt) {
    var node = this.elem;

    // markup the search and switch button display
    var topnode = $(node).parents(".tpl-search");
    topnode.addClass('result-subscribed');
}

ReaderViewer.openSubscribedFeed = function(evt) {
    this.searchViewFeed(this.elem);
}

ReaderViewer.handleScroll = function() {
    if (this.expandedView) {
        
        var scrollTop = $("#entries")[0].scrollTop;
        var done = false;
        $("#entries//.entry").each(function(i, entry) {
           if (!done) {
               if ($(entry).positionedOffset()[1] >= scrollTop) {
                   done = true;
                   item_clicked(entry);
               }
           }
         });
    }
}

function subscribeBundle_clicked (node) {
    var inp = $(".feeds-bundle-data", node);
    var bundle = inp[0].bundleData;

    for (var i = 0; i < bundle.subscriptions.length; i++) {
        var feed = {title: '', feed: ''};
        feed.title = bundle.subscriptions [i].title;
        feed.feed = bundle.subscriptions [i].id;
        feed.feed = feed.feed.replace (/^feed\//, "");

        FR_cacheFeed(feed.feed, feed.title);
        FR_addFeed(feed.feed);
        // Start retreiving the items
        FC_retreiveFeed(feed.feed);

        FR_copyToFolder(feed.feed, bundle.title);
    }

    Reader.bundleAdded(bundle.title);

    $(node).addClass('bundle-added');

    Reader.handleEvent('evRefresh', node);
    Reader.expandFolder(bundle.title);
}

function morebundles_clicked(node) {
    $("#directory-box").addClass("bundles-only"); 
    make_permalink('browse', 'more');
}

function lessbundles_clicked(node) {
    $("#directory-box").removeClass("bundles-only"); 
    make_permalink('browse');
}


function folder_clicked(node, e) {
    var elem = node.parentNode; 
    Reader.buttonClicked(elem); 
    Reader.openFolder($(".fld-name",node).getdata()); 

    return false; 
}

function tag_clicked(node, e) {
    Reader.openTag($(".fld-name", node).getdata()); 
}

function feed_clicked(elem, e) {
    Reader.openFeed($("input.fld-feed", elem).getdata()); 
}

function refresh_clicked(node, e) {
    ReaderViewer.listLoaded = false; 
    ReaderViewer.homeLoaded = false; 
    ReaderViewer.refresh(); 
}

function card_clicked(event) {
	event = jQuery.event.fix( event || window.event || {} ); 
    var node = $(event.target);

    var topnode = node.parents(".entry");
    item_clicked(topnode[0]);

    card_recenter(topnode);
}

function card_recenter(topnode) {
    // Move this item to the top
    $("#entries")[0].scrollTop = topnode.positionedOffset()[1] - 2;
}

function item_select(node) {
    if (FRS_current_item != node) {
        if (FRS_current_item) {
            $(FRS_current_item).removeClass('expanded'); 
            FRS_current_item.id = ''; 
        }
        
        FRS_current_item = node;
        FRS_current_item.id = 'current-entry';
//        $(FRS_current_item).addClass('expanded');
    }
}

function item_clicked(node, e) {
    if (FRS_current_item == node) {
        $(node).toggleClass('expanded'); 
    } else {
        if (FRS_current_item) {
            $(FRS_current_item).removeClass('expanded'); 
            FRS_current_item.id = ''; 
        }
        
        FRS_current_item = node;
        FRS_current_item.id = 'current-entry';
        $(FRS_current_item).addClass('expanded');
    }

    if (ReaderViewer.expandedView) {
        return;
    }

    node = $(node);
    var topnode = node.parents(".tpl-entry");
    var itemid = $(".fld-entries-itemid", topnode);

    if($(node).is('.expanded') && itemid.length > 0) {
        var ci = FRS_current_item;
        var timeout = FR_getProperty(FRP_ITEM_READ_TIMEOUT);
        if (timeout == null) {
            timeout = 1000;
        }

        setTimeout(function() {
            if (ci == FRS_current_item) {
                FC_setItemRead(itemid[0].value); 
                topnode.addClass('brand-read'); 
            }
        }, timeout);

        make_permalink_item(itemid.getdata());
    } else {
        make_permalink_item();
    }

    ReaderViewer.updateLVCount();
}

function itemread_clicked(node, event) {
    node = $(node); 
    var topnode = node.parents(".entry").parent(); 
    var itemid = $(".fld-entries-itemid", topnode); 
    if(itemid.length > 0) { 
        if (!FR_isItemRead(itemid[0].value)) { 
            FC_setItemRead(itemid[0].value); 
            topnode.addClass('brand-read');             
        } else {
            FC_setItemUnread(itemid[0].value); 
            topnode.removeClass('brand-read'); 
        }
    }
}

function markall_clicked(node, event) {
    Reader.showLoading();
    var top = $(".entry");

    // Set the status of currently displayed entries
    top.each(function() {
                 var itemid = $(".fld-entries-itemid", $(this));
                 if (itemid.length > 0) {
                     FC_setItemRead(itemid[0].value);
                     $(this).addClass('brand-read');
                 }
             });

    $.each(ReaderViewer.sink.entries, function(i, entry) {
        FC_setItemRead(entry['entries-itemid']); 
    });
    ReaderViewer.updateLVCount();
    Reader.hideLoading();
}

function star_clicked(node, event) {
    node = $(node); 
    var topnode = node.parents(".entry").parent(); 
    var itemid = $(".fld-entries-itemid", topnode); 
    if(itemid.length > 0) { 
        if (!FR_isStarred(itemid[0].value)) { 
            FR_starItem(itemid[0].value); 
            topnode.addClass('brand-starred'); 
        } else {
            FR_unstarItem(itemid[0].value); 
            topnode.removeClass('brand-starred'); 

            /* Not in spec, not needed
            // If we are in the star view we need to refresh
            if (ReaderViewer.state == stateListView && 
                ReaderViewer.viewtype == 'BrandView' &&
                Reader.brand == 'starred') {
                refresh_clicked(node, event); 
            }
            */
        }
    }

    Reader.updateFeedCount([]); 

	event = jQuery.event.fix( event || window.event || {} );  
    event.preventDefault(); 
    event.stopPropagation(); 
}

function share_clicked(node, e) {
    node = $(node); 
    var topnode = node.parents(".entry").parent(); 
    var itemid = $(".fld-entries-itemid", topnode); 
    if(itemid.length > 0) { 
        if (!FR_isShared(itemid[0].value)) { 
            FR_shareItem(itemid[0].value); 
            topnode.addClass('brand-shared'); 
        } else {
            FR_unshareItem(itemid[0].value); 
            topnode.removeClass('brand-shared'); 
        }
    }

    Reader.updateFeedCount([]); 
}

function listbrand_clicked(node, e) {
    node = $(node); 
    var brand = $(".fld-brand", node)[0].value; 
    Reader.buttonClicked(node); 
    Reader.openBrand(brand); 
}

/*
 * Dropdown which allows users to change the folders
 */
function change_folders_clicked(node, event) {
    node = $(node);
    var topnode = node.parents(".tpl-settings-row");

    Settings.show_folders_dropdown(topnode);
}

function choose_folder_clicked(node) {
    if (node.parents('.button-container').length > 0)
        return true; 

    return false;
}

function subs_rename_clicked(node, event) {
    var rform = Settings.show_rename($(node).parents(".tpl-settings-row"));
    var pos = $(node).positionedOffset();
    rform.css('left', (pos[0]-4) + 'px').
          css('top', (pos[1]-4) + 'px').show();
}

function cancel_rename_clicked(node, event) {
    $("#hover-form").hide(); 
}

function save_rename_clicked(node, event) {
    $("#hover-form").hide();
    node = $(node);
    Settings.do_rename(node.siblings("input.fld-feed").getdata(),
                       node.siblings("input.fld-title").getdata());

}

function subs_remove_feed(node, event) {
    var topnode = $(node).parents(".tpl-settings-row");
    if (confirm("Are you sure you want to unsubscribe from " + 
                $(".fld-title", topnode).getdata())) {
        Settings.remove_feed(topnode);
    }
}

function lv_settings_clicked(node) {
    
}

function body_clicked(event) {
	event = jQuery.event.fix( event || window.event || {} ); 

    if (!choose_folder_clicked($(event.target))) {
        Settings.hide_folder_dropdowns();
        ReaderViewer.settingsHide();
        ReaderViewer.searchFolderHide();
    }
}

function make_permalink_item(itemid) {
    var args = [Reader.page];

    switch (args[0]) {
/*    case 'allitems':
    case 'starred':
    case 'shared':
        break;*/

    case 'folder':
    case 'feed':
    case 'tag':
        args.push(Reader.page_args[0]);
        break;

    }

    if (itemid)
        args.push(itemid);

    make_permalink.apply(null, args);
}

function make_permalink() {
    var args = [];
    $.merge(args, arguments);
    var page = args.shift();

    Reader.page = page;
    Reader.page_args = $.makeArray(args);

    args = $.map(args, encodeURIComponent);

    args.unshift(page);

    $("#permalink").setdata(location.protocol + '//' + location.hostname + (location.port?':':'') + location.port  + location.pathname + '?' + args.join('/'));
}

function handle_permalinks(srch) {
    var page, args = [];
    if (srch && srch.length > 0) {
        page = srch.substring(1);;

        if (page.match(/^([a-z]+)\/(.*)$/)) {
            page = RegExp.$1;
            args = $.map(RegExp.$2.split('/'), decodeURIComponent);
        }
    }

    switch (page) {
    case 'allitems':
        if (args)
            ReaderViewer.current_itemid = args[0];

        Reader.handleEvent('evAllItems', $("#ol-allitems")[0]);

        break;

    case 'starred':
        if (args)
            ReaderViewer.current_itemid = args[0];
        listbrand_clicked($("#ol-brandlist//.tpl-brandlist")[0]);
        break;

    case 'shared':
        if (args)
            ReaderViewer.current_itemid = args[0];
        listbrand_clicked($("#ol-brandlist//.tpl-brandlist")[1]);
        break;

    case 'trends':
        Reader.handleEvent('evTrends', $("#trends-selector")[0]);
        break;

    case 'browse':
        Reader.handleEvent('evBrowse');
        if (args.length && args[0] == 'more') 
                $("#show-more-bundles-link").click();

        break;

    case 'search':
        DOM.quickadd.setdata(args);
        DOM.quickadd.enter();
        break;

    case 'folder':
        var folder = args.shift();
        if (args)
            ReaderViewer.current_itemid = args[0];
        Reader.openFolder(folder);
        break

    case 'feed':
        var feed = args.shift();
        if (args)
            ReaderViewer.current_itemid = args[0];
        Reader.openFeed(feed);
        break

    case 'tag':
        var tag = args.shift();
        if (args)
            ReaderViewer.current_itemid = args[0];
        Reader.openTag(tag);
        break

    case 'settings':
        var subpage = args.shift();
        switch (subpage) {
        case 'labels':
            Reader.handleEvent('evSettings');
            Reader.handleEvent('evTagTab');
            break;

        case 'goodies':
            Reader.handleEvent('evSettings');
            Reader.handleEvent('evGoodiesTab');
            break;

        case 'prefs':
            Reader.handleEvent('evSettings');
            Reader.handleEvent('evPrefTab');
            break;

        case 'imexport':
            Reader.handleEvent('evSettings');
            Reader.handleEvent('evImexportTab');
            break;

        default:
        case 'subs':
            Reader.handleEvent('evSettings');
            Reader.handleEvent('evSubTab');
            break;

        }
        break;
    }
}

var KeyTable = {};
var table;

/* Global Keys */
table = KeyTable['Global'] = {};
table[with_shift(keycode('n'))] = Reader.navNext;
table[with_shift(keycode('p'))] = Reader.navPrev;
table[with_shift(keycode('x'))] = Reader.navToggleExpand;
table[with_shift(keycode('o'))] = Reader.navOpenSelected;
table[keycode('u')] = Reader.toggleFullScreen;
table[keycode('g')] = function() {gotoMode = true;}
table[with_shift(keycode('g'))] = function() {gotoMode = true;}

/* List View Keys */
table = KeyTable['ListView'] = {};
table[keycode('j')] = ReaderViewer.nextItem;
table[keycode('k')] = ReaderViewer.prevItem;
table[keycode('n')] = function(){
    ReaderViewer.nextItem(true);
};
table[keycode('p')] = function() {
    ReaderViewer.prevItem(true)
};
table[keycode('o')] = ReaderViewer.toggleItemOpen;
table[KEY_ENTER] = ReaderViewer.toggleItemOpen;
table[keycode('s')] = ReaderViewer.starCurrentItem;
table[with_shift(keycode('s'))] = ReaderViewer.shareCurrentItem;
table[keycode('m')] = ReaderViewer.toggleItemRead;
table[keycode('t')] = ReaderViewer.tagItem;
table[keycode('v')] = ReaderViewer.viewOriginal;
table[with_shift(keycode('a'))] = markall_clicked;
table[keycode('1')] = function() {ReaderViewer.setExpanded(true)};
table[keycode('2')] = function() {ReaderViewer.setExpanded(false)};
table[keycode('r')] = ReaderViewer.refresh;

/* Goto Keys */
table = KeyTable['Goto'] = {};
table[keycode('h')] = function() {$("#ol-home").click()};
table[keycode('a')] = function() {$("#ol-allitems").click()};
table[keycode('s')] = function() {Reader.brandNodes['starred'].click()};

table[with_shift(keycode('s'))] = function() {Reader.brandNodes['shared'].click()};
table[with_shift(keycode('t'))] = function() {$("#trends-selector").click()};

table[keycode('t')] = function() {Reader.openTag(prompt('Tag name:'))}
table[keycode('u')] = Reader.openPromptedFeed;

var ViewXform = {
    'SubscriptionView' : 'ListView',
    'AllItemsView' : 'ListView',
    'BrandView'    : 'ListView',
    'TagView'      : 'ListView'
};

/*
var gShiftDown = false;
function handle_shiftdown(event) {
	event = jQuery.event.fix( event || window.event || {} ); 

    if (event.keyCode == KEY_SHIFT) {
        gShiftDown = true;
    }
}

function handle_shiftup(event) {
	event = jQuery.event.fix( event || window.event || {} ); 


    if (event.keyCode == KEY_SHIFT) {
        gShiftDown = false;
    }
}

*/

var gotoMode = false;

function handle_keycuts(event) {
	event = jQuery.event.fix( event || window.event || {} ); 
    var code = event.keyCode;

    var mod = MOD_NONE;
    
    if (event.shiftKey)
        mod |= MOD_SHIFT;
    
/*
 * We dont use alt and control keys right now
    if (event.altKey)
        mod |= MOD_ALT;
    
    if (event.ctrlKey)
        mod |= MOD_CTRL;
*/
    
    if (mod == MOD_NONE)
        mod = '';
    else
        mod = '_' + mod;
    
    // First look in the global key table
    var table, fn;
    
    if (gotoMode) {
        table = KeyTable['Goto'];
        gotoMode = false;
        fn = table[code + mod];

        if (fn)
            return fn();
    }

    table = KeyTable['Global'];
    fn = table[code + mod];

    if (fn)
        return fn();
    
    // If not found, look in state specific key table
    if (Reader.state == 'List') { // List
        var viewtype = ViewXform[ReaderViewer.viewtype] || ReaderViewer.viewtype;

        table = KeyTable[viewtype];
        if (table) {
            fn = table[code + mod];
        }
        if (fn)
            fn();
        else {
//            alert(code);
        }
    } else { // Settings
    }
}

// App Initialization 
google.load("feeds", "1"); 
google.setOnLoadCallback(function() {reader_main();}); 
