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


var testlist = [];
var TestQueue;
var TestPaused = false;
var ConfirmYes = true;
var PromptResponse = 'default';

function initTests() {
   document.f1.tgroups.value = "";
   startTests();
}

function startTests() {
    doTest($.clone(testlist));
}

function TestPause() {
    TestPaused = true;
}

function TestResume() {
    TestPaused = false;
    var mylist = TestQueue;
    TestQueue = null;
    setTimeout(function(){doTest(mylist);}, 10);
}

// Make sure Wait is the last call in the calling function
function Wait(msecs) {
    TestPause();
    setTimeout(function(){TestResume();}, msecs);
}

function SetConfirm(bool) {
    ConfirmYes = bool;
}

function SetPromptResponse(str) {
    PromptResponse = str;
}

function confirm(str) {
    AddStatus("  confirm('" + str + "') -> " + ConfirmYes);
    return ConfirmYes;
}

function alert(str) {
    AddStatus("  alert('" + str + "')");
}

function prompt(str) {
    AddStatus("  prompt('" + str + "') -> " + PromptResponse);
    return PromptResponse;
}

function doTest(mylist) {
    if (TestPaused) {
        TestQueue = mylist;
        return;
    }

    var status = document.getElementById('tStatus');
    var x = mylist.shift();

    if (typeof(window[x]) == 'function') {
        try {
            window[x]();
            AddStatus(x + " OK");
        } catch(jse) {
            if (jse.isJsUnitException) {
                AddStatus(x + " failed ***");
                AddStatus('    ' + jse.comment + ': ' + jse.jsUnitMessage + "\n");
            } else {
                jsUnitAllCases++;
                AddStatus(x + " (JS error) ***");
                
                AddStatus('    Error: ' + jse.message?jse.message:jse + "\n");
                AddStatus(jse.stack);
            }
        }
    }
    
    status.innerHTML = "Finished: " + x + "&nbsp;&nbsp; Passed:" + 
        jsUnitPassedCases+'/' + jsUnitAllCases;
    
    if (mylist.length > 0) {
        setTimeout(doTest.bind(null, mylist), 200);
    } else {
        status.innerHTML = "All Done " + "&nbsp;&nbsp; Passed:" + 
        jsUnitPassedCases+'/' + jsUnitAllCases;
    
        AddStatus("\n\nAll Testcases Completed\n");
    }
}

function AddStatus(str) {
    document.f1.tgroups.value += "\n" + str;
}

google.setOnLoadCallback = function(fn) {
}

window.uitest = true;
$(window).load(startTests);
