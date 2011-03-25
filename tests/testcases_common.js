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


function testBasics() {
    var Myclass = Class.create();
    Myclass.prototype.initialize = function(arg1, arg2) {
        testflags["0.0"] = [arg1, arg2].join(',');
    }

    Myclass.prototype.test1 = function(arg1, arg2) {
        testflags["0.1"] = [this.id, arg1, arg2].join(',');
    }

    var Myvar = new Myclass('a','b');
    assertEquals("0.0", "a,b", testflags["0.0"]);

    Myvar.id = "testid";
    var fn = Myvar.test1.bind(Myvar, "testarg1");
    fn("testarg2");

    assertEquals("0.1", "testid,testarg1,testarg2", testflags["0.1"]);
}

function testDomExt() {
    var node = $("#c-test1//input");
    node.enter(function() {
                   testflags["1.0.1"] = true;
               });

    node[0].onkeypress({type: 'keypress', target: node[0], keyCode: KEY_ESC});
    assertEquals("1.0.0", undefined, testflags['1.0.1']);

    node[0].onkeypress({type: 'keypress', target: node[0], keyCode: KEY_ENTER});
    assertEquals("1.0.1", true, testflags['1.0.1']);

    var node1 = $("#c-test2//.top");
    var node2 = $("#c-test2//.bottom");
    var node3 = $("#c-test2//.abs1");

    var pos1 = node1.positionedOffset();
    var pos2 = node2.positionedOffset();
    var pos3 = node3.positionedOffset();

    assert("1.1.0", pos2[1] > pos1[1]);
    assert("1.1.1", pos2[0] == pos1[0]);
    assertEquals("1.1.2", 100, pos3[1]);
    assertEquals("1.1.3", 250, pos3[0]);

    var input = $("#c-test3//input");
    var anchor = $("#c-test3//a");
    var img = $("#c-test3//img");
    var span = $("#c-test3//span");

    // test get data
    assertEquals("1.2.1", 'abcd', input.getdata());
    assertEquals("1.2.2", 'http://www.example.com/', anchor.getdata());
    assertEquals("1.2.3", 'http://www.example.com/image.gif', img.getdata());
    assertEquals("1.2.4", 'span test string', span.getdata());

    // test set data
    var str = "http://www.example.com/test";
    input.setdata(str);
    anchor.setdata(str);
    img.setdata(str);
    span.setdata(str);

    assertEquals("1.3.1", str, input[0].value);
    assertEquals("1.3.2", str, anchor[0].href);
    assertEquals("1.3.3", str, img[0].src);
    assertEquals("1.3.4", str, span[0].innerHTML);

    input.clear();
    anchor.clear();
    img.clear();
    span.clear();

    assertEquals("1.4.1", '', input[0].value);

    //these two are urls and when empty, the DOM returns the 
    // path of the script.
//    assertEquals("1.4.2", '', anchor[0].href);
//    assertEquals("1.4.3", '', img[0].src);

    assertEquals("1.4.4", '', span[0].innerHTML);

    // Simple Tab functions
    node = $("#c-test4");
    node.maketab('tab-header', 'tab-contents');
    assertEquals("1.5.0", "none", $(".tab-contents",node).css('display'));

    $("#tab1", node).click();
    assertEquals("1.5.1", "block", $("#tab1-contents",node).css('display'));
    assert("1.5.2", $("#tab1", node).is('.tab-header-selected'));

    $("#tab2", node)[0].onclick({type: 'click', target: $("#tab2/a")[0]});

    assertEquals("1.5.3", "none", $("#tab1-contents",node).css('display'));
    assert("1.5.4", !$("#tab1", node).is('.tab-header-selected'));
    assertEquals("1.5.5", "block", $("#tab2-contents",node).css('display'));
    assert("1.5.6", $("#tab2", node).is('.tab-header-selected'));

    // addnodes()
    var n1 = $(".node1,.node2", $("#c-test5"));
    var n2 = $(".node3,.node4,.node5", $("#c-test5"));

    var n3 = n1.addnodes(n2);
    assertEquals("1.6.1", 2, n1.length);
    assertEquals("1.6.2", 3, n2.length);
    assertEquals("1.6.3", 5, n3.length);
    assert("1.6.4", n3.is(".node1"));
    assert("1.6.5", n3.is(".node2"));
    assert("1.6.6", n3.is(".node3"));
    assert("1.6.7", n3.is(".node4"));
    assert("1.6.8", n3.is(".node5"));

}

function testUtils() {
    // uniq()

    var arr1 = [1,2,4,2,3,1,6];
    var arr2 = $.uniq(arr1);
    assertEquals("2.0", 5, arr2.length);
    assert("2.1.1", $.indexOf(arr2, 1) >= 0);
    assert("2.1.2", $.indexOf(arr2, 2) >= 0);
    assert("2.1.3", $.indexOf(arr2, 3) >= 0);
    assert("2.1.4", $.indexOf(arr2, 4) >= 0);
    assert("2.1.5", $.indexOf(arr2, 5) < 0);
    assert("2.1.6", $.indexOf(arr2, 6) >=  0);

    // keys
    var obj = {key1: 'val1', key2: 'val2', key3: 'val3'};
    var keys = $.keys(obj);
    assertEquals("2.2.1", "key1,key2,key3", keys.join(','));

    var vals = $.values(obj);
    assertEquals("2.2.2", "val1,val2,val3", vals.join(','));

    var arr3 = $.clone(arr1);
    assertEquals("2.2.3", '1,2,4,2,3,1,6', arr3.join(','));


    // get_scaling
    var scale = get_scaling([1,2,3,4,5,6,7,8,9,10]);
    assertEquals("2.3.1", 10, scale.scalemax);
    assertEquals("2.3.2", 6, scale.scale2);
    assertEquals("2.3.3", 3, scale.scale1);
    assertEquals("2.3.4", 0, scale.scale0);

    // current time test - pretty lame
    var t1 = currentTime();
    var t2 = currentTime();    
    assert("2.4.0", t2 >= t1);

    // time expired
    var t3 = t1 - 10000;
    assert("2.4.1", timeExpired(t3, 9000));
    assert("2.4.2", !timeExpired(t3, 20000));
}

testlist.push('testBasics');
testlist.push('testDomExt');
testlist.push('testUtils');
