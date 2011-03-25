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

var stateList           = 'List';
var stateSettings       = 'Settings';
var stateHome           = 'Home';
var stateFeedDiscovery  = 'FeedDiscovery';
var StateSearchResults  = 'SearchResults';
var stateTrends         = 'Trends';
var stateHomeView       = 'HomeView';
var stateListView       = 'ListView';
var stateTrendsView     = 'TrendsView';
var stateItem           = 'Item';

var stateSubs           = 'Subscriptions';

var StateMachine = Class.create();

StateMachine.prototype = {
    initialize: function(startState, stateTable) {
        this.state = startState;
        this.table = stateTable;
    },

    handleEvent: function(evt, elem, data) {
        this.elem = elem;
        var table = this.table[this.state];
        if (this.logEvent) {
            this.logEvent(evt, elem,data);
        }

        try {
            this[table[evt]](evt, data);
        } catch(e) {
            alert('Invalid event [' + evt + '] in state ' + this.state + '\n' + e.message + e.stack + '\n\n');
        }
    }
}

var ReaderFSM = {
    '_name': 'Reader',
    'List' : {
        'evOpen'      : 'open',
        'evHome'      : 'home',
        'evAddSub'    : 'quickadd',
        'evRefresh'   : 'refresh',
        'evBrowse'    : 'browse',
        'evAllItems'  : 'allitems',
        'evSubscriptionTitle'    : 'openFeedEvent',
        'evSortUpDatedorAll'    : 'sortUpdatedOrAll',
        'evTrends'      : 'trends',
        'evTagTitle'    : 'openTagEvent',
        'evStarred'    : 'openStarredEvent',
        'evShared'    : 'openSharedEvent',
        'evSettings'    : 'showSettings',

        'evSettingsView'   : 'showSettings',
        'evClose'    : 'close'        
    },

    'Settings' : {
        'evRefresh'        : 'refresh',
        'evSettings'       : 'showSettings',
        'evSettingsView'   : 'showSettings',

        'evSubTab'         : 'settingsSubTab',
        'evPrefTab'        : 'settingsPrefTab',
        'evTagTab'         : 'settingsTagTab',
        'evGoodiesTab'     : 'settingsGoodiesTab',
        'evImexportTab'    : 'settingsImexportTab',
        'evReturnToReader' : 'returnToReader',

        'displaySubList'   : 'displaySubList',
        'displayTagList'   : 'displayTagList',

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
        'evFilter'         : 'subsFilter',
        'evRename'         : 'subsRename',
        'evAddTag'         : 'subsAddTag',
        'evDelete'         : 'subsDelete',
        'evTagSeleceted'   : 'subsTagSelected',
        'evDeleteSelected' : 'subsDeleteSelected',
        'evSelect'         : 'subsSelect',
*/

        'evRevert'              : 'prefsRevert',
        'evSetHome'             : 'prefsSetHome',
        'evScrollTracking'      : 'prefsScrollTracking',

        'evExImportToOPML'      : 'importExport',

        'evResource'            : 'goodies',

        'evSettingsView'   : 'showSettings'
    }
};

var RVFSM_events = {
//        'evHomeView' : 'homeview',
    'evRefresh' : 'refresh',
    'evListView' : 'listview',

    'evToggleExpanded': 'toggleExpanded',
//        'evSearchFeeds': 'searchfeedsview',
//        'evBrowse'    : 'browseFeeds',
//        'evTrendsView'    : 'trendsview'
    
    // Home
    'evDevBlog'      : 'openDevBlog',
    'evTip'          : 'openTips',
    'displayTips'    : 'displayTips',
    'displayUnread'  : 'displayUnread',
    'displayRecently': 'displayRecently',
    
    // FeedDiscovery
    'evAddBlog'      : 'addblog', // xxx
    'evTag'          : 'showbundle',
    'evSubscribe'    : 'addBundleOrFeed',
    
    'evSearch'       : 'searchInBrowse',
    'evClose'        : 'close',
    
    'displayBundles' : 'displayBundles',
    'evImport'       : 'showImport',
    
    // SearchResults
    'doSearch'       : 'doSearch',
    'evReturnToFD'   : 'returnToFD',
    'evSubSubscribed': 'searchFeedSubscribed',
    'evView'         : 'openSubscribedFeed',
    'evUnsubscribe'  : 'removeSubscribedFeed',
    
    // RV.LV.SU
    'evRename' : 'renameCurrentFeed',
    'evDelete' : 'deleteCurrentFeed',

    // IV
    'evFrom'   : 'openFeedForItem',
    'evGoto'   : 'openItemSite',
    'evEmail'  : 'openItemEmail',
    'evAddTag' : 'itemEditTags'
};

var RVFSM = {
    '_name': 'ReaderViewer',
    'ListView' : RVFSM_events,
    'HomeView' : RVFSM_events,
    'TrendsView' : RVFSM_events 
};

var STFSM = {
    '_name': 'Settings',
    'SubsView' : {
    }
};

var StateVars = {
    SortString: false,
    
    // --- from here
    SubscriptionView: false,
    HomeView: false,
    SearchResultsView: false,
    FeedDiscoveryView: false,
    AllItemsView: false,
    TrendsView: false,
    TagView: false,
    SharedView: false,
    FeedDiscoveryView: false,
    // -- to here - incorporated as ReaderViewer.viewtype

    HomePage: false,
    PreviousView: false,

    // --- from here
    SubView: false,
    PrefView: false,
    TagView: false,
    GoodiesView: false,
    ImexportView: false,
    ImexportView: false,
    // -- to here - incorporated as Settings.viewtype

    Title: false,
    Date: false,
    NumItems: false,
    NumRead: false,
    Link: false,
    Read: false,
    Shared: false,
    Starred: false,
    NumTags: false,
    NumSubscriptions: false
};
