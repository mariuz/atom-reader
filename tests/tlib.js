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


var testlist = {};
var testflags = {};

var TEST_FEED1 = 'http://kudang.com/myfeed1.xml';
var TEST_FEED2 = 'http://kudang.com/myfeed2.xml';
var TEST_FEED3 = 'http://rss.cnn.com/rss/cnn_topstories.rss';
var TEST_TITLE3 = 'CNN.com';
var TEST_FEED4 = 'http://technosophyunlimited.blogspot.com/atom.xml';
var TEST_FEED5 = 'http://www.theonion.com/content/feeds/daily';

var TEST_FOLDER1 = 'some';
var TEST_FOLDER2 = 'folder';
var TEST_FOLDER3 = 'news';
var TEST_FOLDER4 = 'technology';

var TEST_TAG1    = 'testtag1';
var TEST_TAG2    = 'testtag2';


var obj1 = {'url1':"http://www.example.com/", 
            'url2':"http://www.example.com/image.gif",
            'field1': "string1",
            'field2':"string2", 
            'field3':"string3"};

var obj2 = {'icon' : 'test.gif'};

var arr1 = [{'field1' : 'string1',
             'field2' : 'string2'},
            {'field1' : 'newstring1',
             'field2' : 'newstring2'}];
         
var feed1 = {'attr1' : 'text1',
             'url' : 'http://www.example.com/image.gif',
             'array1': [
                 {'name1' : 'test1.1',
                  'name2' : 'test string 1.2'},
                 {'name1' : 'test2.1',
                  'name2' : 'test string 2.2'}],
             'array2': [
                 {'name3' : 'obj1.1',
                  'name4' : 'obj string 1.2'},
                 {'name3' : 'obj2.1',
                  'name4' : 'obj string 2.2'},
                 {'name3' : 'obj3.1',
                  'name4' : 'test string 3.2'}]
            };

var obj3 = {'field1' : 'apple',
    'field2' : 'orange',
    'field3' : 'peach'};

var obj4 = {'attr1' : 'existing'};

function testflag_incr(flagname) {
    if (!testflags[flagname])
        testflags[flagname] = 0;
    testflags[flagname]++;
}

function testflag_resetall(flagname) {
    testflags = {};
}

function testflag_set(flagname) {
    testflags[flagname] = true;
}

function assertFlag(casenum, flag) {
    assertEquals(casenum, true, testflags[flag]);
}

function assertNoflag(casenum, flag) {
    assertEquals(casenum, undefined, testflags[flag]);
}

var testevents = {};
var dbg = true;
// Get the state machine to log events
StateMachine.prototype.logEvent = function(evt, elem, data) {
    testevents[evt] = {fsm: this.table._name, data: data, elem: elem};
}

// Clear event log
function clearEventLog() {
    testevents = {};
}

function assertEvent(testcase, evt) {
    assert(testcase + ': [' + evt + ']', testevents[evt] != undefined);
}

function assertNoevent(testcase, evt) {
    assert(testcase + ': [!' + evt + ']', testevents[evt] == undefined);
}


