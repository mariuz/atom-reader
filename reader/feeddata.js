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

function feed_load_dummy(url, fn) {
    var data = FTC_feedData[url];
    var result = {status: {code: 404}};

    if (data) {
        result.status.code = 200;
        result.feed = data.feed;
    } 

    fn(result);
}

var google = {};
google.dummy = true;
google.feeds = {};
google.feeds.Feed = Class.create();
google.feeds.Feed.prototype.initialize = function(feedurl) {
    this.url = feedurl;
}

google.load = function() {
}

google.setOnLoadCallback = function(fn) {
    $(window).load(reader_main); 
}

google.feeds.findFeeds = function(query, callback) {
    var result = FTC_feedSearchData;
    result.status = {code: 200};

    setTimeout(function(){callback(result)}, 200);
}

google.feeds.Feed.prototype.load = function(callback) {
    var url = this.url;
    setTimeout(function(){feed_load_dummy(url, callback)}, 200);
}

google.feeds.Feed.prototype.setNumEntries = function(num) {
}

var FTC_feedData = {};

/*
 * Return a time thats 'hours' hours behind 'now'
 */
function getPast(hours) {
    var d = new Date();
    var dm = d.getTime();
    var past = dm - hours*60*60*1000;

    var pastd = new Date(past);
    return pastd.toString();
}

// Get a date with a single digit min for code coverage
function getSpcDate() {
    var ds = getPast(1);
    var d  = new Date(ds);
    
    d.setMinutes(5);
    return d.toString();
}

FTC_feedData['http://rss.cnn.com/rss/cnn_topstories.rss'] =
{"feed":
   {"title":"CNN.com",
    "link":"http://www.cnn.com/?eref\u003Drss_topstories",
    "author":"",
    "description":"CNN.com delivers up-to-the-minute news and information on the latest top stories, weather, entertainment, politics and more.",
    "type":"rss20",
    "entries":[
        {"title":"Simpson: Casino incident overblown","link":"http://rss.cnn.com/~r/rss/cnn_topstories/~3/156999937/index.html","author":"",
         // pubDate in recent past for testing (AM/PM)
"publishedDate":getPast(2),"contentSnippet":"Former NFL star O.J. Simpson says he and one of the alleged victims of a robbery have spoken by telephone and agree the ...","content":"Former NFL star O.J. Simpson says he and one of the alleged victims of a robbery have spoken by telephone and agree the incident was blown out of proportion. Las Vegas police say no arrests have been made.\n\u003Cp\u003E\u003Ca href\u003D\u0022http://rss.cnn.com/~a/rss/cnn_topstories?a\u003D8Js1vt\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~a/rss/cnn_topstories?i\u003D8Js1vt\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\u003C/p\u003E\u003Cdiv\u003E\n\u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DVuYro1as\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DVuYro1as\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DGDbEgwbK\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DGDbEgwbK\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DUeM5GH3B\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DUeM5GH3B\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DsV0zU32H\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DsV0zU32H\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DXIa7EegJ\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DXIa7EegJ\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\n\u003C/div\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~r/rss/cnn_topstories/~4/156999937\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E","categories":[]},
        {"title":"Thousands protest Iraq war, 160 arrested","link":"http://rss.cnn.com/~r/rss/cnn_topstories/~3/157014496/index.html","author":"",

         // pubDate in recent past for testing (PM/AM)
"publishedDate":getPast(14),"contentSnippet":"Read full story for latest details.\n\n    \n","content":"Read full story for latest details.\n\u003Cp\u003E\u003Ca href\u003D\u0022http://rss.cnn.com/~a/rss/cnn_topstories?a\u003Db8CJz3\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~a/rss/cnn_topstories?i\u003Db8CJz3\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\u003C/p\u003E\u003Cdiv\u003E\n\u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003D5eZxq3Ab\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003D5eZxq3Ab\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DHqIbyoXU\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DHqIbyoXU\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DXi5LUQhL\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DXi5LUQhL\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DgbpS4QAa\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DgbpS4QAa\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DhB32UeUF\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DhB32UeUF\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\n\u003C/div\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~r/rss/cnn_topstories/~4/157014496\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E","categories":[]},
        {"title":"Report: Retired judge may replace Gonzales","link":"http://rss.cnn.com/~r/rss/cnn_topstories/~3/156946485/index.html","author":"",
// Get a date with single hour / for code coverage
         "publishedDate":getSpcDate(),"contentSnippet":"A retired federal judge is a leading candidate to replace Attorney General Alberto Gonzales, whose last day on the job was ...","content":"A retired federal judge is a leading candidate to replace Attorney General Alberto Gonzales, whose last day on the job was Friday, two sources told CNN on Saturday. Michael B. Mukasey was nominated to the bench in 1988 by President Ronald Reagan.\n\u003Cp\u003E\u003Ca href\u003D\u0022http://rss.cnn.com/~a/rss/cnn_topstories?a\u003DAVDuJG\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~a/rss/cnn_topstories?i\u003DAVDuJG\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\u003C/p\u003E\u003Cdiv\u003E\n\u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DCXNvBrOj\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DCXNvBrOj\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DXgTEyF76\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DXgTEyF76\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DJ9L5OSoF\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DJ9L5OSoF\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DP1slDKtt\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DP1slDKtt\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DQQRCo9cp\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DQQRCo9cp\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\n\u003C/div\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~r/rss/cnn_topstories/~4/156946485\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E","categories":[]},
        {"title":"As hopes dim, Fossett search to be assessed","link":"http://rss.cnn.com/~r/rss/cnn_topstories/~3/157003819/index.html","author":"","publishedDate":"Sat, 15 Sep 2007 16:44:40 -0700","contentSnippet":"Read full story for latest details.\n\n    \n","content":"Read full story for latest details.\n\u003Cp\u003E\u003Ca href\u003D\u0022http://rss.cnn.com/~a/rss/cnn_topstories?a\u003Dc1eKV8\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~a/rss/cnn_topstories?i\u003Dc1eKV8\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\u003C/p\u003E\u003Cdiv\u003E\n\u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DYp3zmTiH\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DYp3zmTiH\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DPxj9NPLL\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DPxj9NPLL\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DfKxlsibE\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DfKxlsibE\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DyXULsz2i\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DyXULsz2i\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?a\u003DWosFhnlY\u0022\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~f/rss/cnn_topstories?i\u003DWosFhnlY\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\n\u003C/div\u003E\u003Cimg src\u003D\u0022http://rss.cnn.com/~r/rss/cnn_topstories/~4/157003819\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E","categories":[]}
    ]}};

FTC_feedData['http://technosophyunlimited.blogspot.com/atom.xml'] = 
{"feed":
   {"title":"Technosophy Unlimited",
     "link":"http://technosophyunlimited.blogspot.com/",
     "author":"Chandan Kudige",
     "description":"",
     "type":"atom10",
     "entries":[{"title":"M$ - Microsoft ? Myspace ?",
     "link":"http://technosophyunlimited.blogspot.com/2007/06/m-microsoft-myspace.html",
     "author":"Chandan Kudige",
     "publishedDate":"Tue, 26 Jun 2007 19:43:00 -0700",
     "contentSnippet":"Myspace has still been holding up, against all odds and all the predictions by sensible people, just defying the logic - how ...",
     "content":"Myspace has still been holding up, against all odds and all the predictions by sensible people, just defying the logic - how can something so crappy be still so popular ?\u003Cbr\u003E\u003Cbr\u003EAnd the moment we ask that question, we realize the error in our thinking. All it takes is to look back. But is being crappy the only thing thats similar between Myspace and Microsoft, or is there anything else we can learn and predict ?\u003Cbr\u003E\u003Cbr\u003EFirstly, believe it or not, both Microsoft and Myspace are in the same kind of business - building platforms. Microsoft built a desktop platform, whereas myspace built a networking platform. But on the technology front, Microsoft built a platform to run 3rd party applications, whereas myspace built a online platform to run 3rd party widgets. Niether of them started with that grand scheme, but rather their shortcomings prompted the developers to plug in the gaps and before we know there was a whole new market segment. Entrepernuers, whose forte was identifying all the limitations and building new companies just to fix it. All this is very similar between the two M$\u0027s.\u003Cbr\u003E\u003Cbr\u003ESo what does the future hold? If past lessons are anything to go by Myspace will continue to be very open (\u0022absolutely nothing worth keeping a secret\u0022), developer friendly (\u0022we are too lazy to fix our own bugs\u0022), will face a lot of security issues (\u0022users are not worth protecting\u0022) and continue building the money muscle (\u0022quality is nothing\u0022).\u003Cbr\u003E\u003Cbr\u003EBut the fatal mistake of Myspace unlike Microsoft is that they don\u0027t have a good plan to \u0027lock\u0027 users in, except for their over-hyped critical mass of users. But in this dynamic age critical mass just gives you a head start. Even the mighties like Google have started to realise (TODO: Add references to backup my bold claims!).  Over time, (hopefully in less than a year or two), there will be an awesome addon to myspace which gets the users so hooked that they will forget to go back to myspace.",
     "categories":["technology",
     "prediction",
     "microsoft",
     "myspace"]},
        {"title":"New take on Google\u0027s \u0022personal time\u0022",
     "link":"http://technosophyunlimited.blogspot.com/2007/05/new-take-on-googles-personal-time.html",
     "author":"Chandan Kudige",
     "publishedDate":"Thu, 24 May 2007 17:12:00 -0700",
     "contentSnippet":"As almost everyone knows, Google started an unique trend in the industry. At first they allowed, then encouraged, and now they ...",
     "content":"As almost everyone knows, Google started an unique trend in the industry. At first they allowed, then encouraged, and now they require their employees to put aside one day of the week to work on their own pet projects. It was a revolutionary idea that attracted two kinds of reactions. The starry eyed programmers everywhere said what a noble company Google was, they had the employee\u0027s best interest in their heart. As we all suspected, Google has a heart of gold. On the other hand, industry veterans like Steve Balmer \u003Ca href\u003D\u0022http://searchengineland.com/070316-084008.php\u0022\u003Emocked google\u0027s personal time concept\u003C/a\u003E\u003Cbr\u003Ecalling it naive and insane.\u003Cbr\u003E\u003Cbr\u003EHowever what most people missed is that the motivation for this concept was neither altruistic nor misguided naivety.  It was a carefully calculated, but bold move, that any entrepreneur would appreciate. Think what happens in most companies that attract great people. These people do their day job to earn a living and spend the rest of their free time  thinking up other great ideas. If they come up with a hit, they take off, start their own venture and eventually make millions or move on to the next big thing. The company where they were earning their living didn\u0027t really gain much from this.\u003Cbr\u003E\u003Cbr\u003ECompanies do try throwing their lawyers\u003Ca href\u003D\u0022http://bp3.blogger.com/_FUBV2D4gbvc/RlYs9qoBh9I/AAAAAAAAALo/8h-ZCQsam_U/s1600-h/dilbert2006052442720.gif\u0022\u003E\u003Cimg style\u003D\u0022margin:0pt 0pt 10px 10px;float:right\u0022 src\u003D\u0022http://bp3.blogger.com/_FUBV2D4gbvc/RlYs9qoBh9I/AAAAAAAAALo/8h-ZCQsam_U/s320/dilbert2006052442720.gif\u0022 alt\u003D\u0022\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E at such ventures, trying to claim the intellectual property, but except for the fear factor they create, they rarely succeed. So how do you take advantage of such great ideas fomenting in the brains of their employees ? Why, encourage them to work on these in company\u0027s time. This is exactly what Google is saying, and I don\u0027t think its as evil as it sounds. If I were working for such a company, I would probably work on less spectacular ideas during the personal time, and still keep the more spectacular ones for after work, in the quiet comforts of my basement, ensuring no evil hands can ever reach them ...\u003Cbr\u003E\u003Cbr\u003EIt would be great to hear opinions of new and old Google engineers about this :)",
     "categories":["steve balmer",
     "google",
     "personal time",
     "microsoft",
     "larry page"]},
        {"title":"Yahoo! Widgets",
     "link":"http://technosophyunlimited.blogspot.com/2005/12/yahoo-widgets.html",
     "author":"Chandan Kudige",
     "publishedDate":"Tue, 13 Dec 2005 08:06:00 -0800",
     "contentSnippet":"Yahoo just announced their new version of Konfabulator - Yahoo! Widgets.For those of you who cared to read my previous rants, I ...",
     "content":"\u003Cp\u003EYahoo just announced their new version of Konfabulator - Yahoo! Widgets.\u003C/p\u003E\u003Cp\u003EFor those of you who cared to read my previous rants, I  must say, \u003Cbr\u003EYahoo! is eerily headed in the right direction. They even have one \u003Cbr\u003Ewidget (The 21st century sticky notes) which can be accessed from \u003Cbr\u003Eanywhere and the notes are stored at the server. This is such a classic \u003Cbr\u003Eexample of the desktop reinvention I have been going on about.\u003C/p\u003E\u003Cp\u003EI have to check their developer APIs to see if they support standard \u003Cbr\u003EHTML (like Tiger Dashboard) or some custom scripts. I bet its going to \u003Cbr\u003Ebe regular HTML\u003Cbr\u003E(just a I predicted).\u003C/p\u003E",
     "categories":[]},
        {"title":"An Interlude - Ajax Tutorial",
     "link":"http://technosophyunlimited.blogspot.com/2005/12/interlude-ajax-tutorial.html",
     "author":"Chandan Kudige",
     "publishedDate":"Fri, 09 Dec 2005 01:36:00 -0800",
     "contentSnippet":"After the ranting in the previous entries, I think its time to take a break from the philosophical side and get our hands ...",
     "content":"\u003Cp\u003EAfter the ranting in the previous entries, I think its time to take a break from the philosophical side and get our hands dirty. I am going to put together a tutorial which explains how to you Ajax. I plan to start from the simplest tricks all the way to the most complex ones.\u003Cbr\u003EBut one step at a time.\u003C/p\u003E\u003Cp\u003ETo begin with I will demonstrate what I have been discussing - the \u0022world-wide-wait\u0022 syndrome everyone is so familiar with. In this demo I have two pages. The first one is a traditional template based web site and the second one is Ajax based. Both of them provide you the exact same information (reviews on 7 latest car models) but you can see thedifference for yourself! \u003C/p\u003E\u003Cp\u003EI call the first one Click-and-Wait. You click each link and you wait for the page to load up. The second one, in contrast, is Wait-and-Click-click-click. The page loads the data which is packaged in an XML file and after the initial wait, you are free to click asfast as you can! \u003C/p\u003E\u003Cp\u003E\u003Ca href\u003D\u0022http://kudang.com/users/chandan/blogget/click-and-wait/click-n-wait.php\u0022\u003EPage 1\u003C/a\u003E - The typical Click and Wait website\u003C/p\u003E\u003Cp\u003E\u003Ca href\u003D\u0022http://www.blogger.com/post-edit.g?blogID\u003D19538401\u0026amp;postID\u003D113412100928656554\u0022\u003EPage 2\u003C/a\u003E - Same information, but with nifty ajax at work.\u003C/p\u003E\u003Cp\u003E\u003Cspan style\u003D\u0022font-size:85%\u0022\u003ENext: I will dissect this demo and explain how it all works. This will be useful to anyone who wants to learn the nuts and bolts of ajax orwants to implement their own ajax code. \u003C/span\u003E\u003C/p\u003E",
         "categories":[]}]}};

FTC_feedData['http://rss.slashdot.org/Slashdot/slashdot'] = 
{"feed":{"title":"Slashdot",
     "link":"http://slashdot.org/",
     "author":"help@slashdot.org",
     "description":"News for nerds, stuff that matters",
     "type":"rss10",
     "entries":[{"title":"PC Superstore Admits Linux Hinge Repair Mistake",
     "link":"http://rss.slashdot.org/~r/Slashdot/slashdot/~3/157024083/article.pl",
     "author":"Erris (posted by Zonk)",
     "publishedDate":"Sat, 15 Sep 2007 18:29:00 -0700",
     "contentSnippet":"Erris writes \u0022PC Superstore says their store manager was wrong to turn away a client with a broken hinge whose machine should ...",
     "content":"Erris writes \u0022PC Superstore says their store manager was wrong to turn away a client with a broken hinge whose machine should have been repaired. \u0027El Reg put a call in to the DSGi-owned retail giant to get some clarification on PC World\u0027s Linux support policy. A spokesman told us that there had simply been a misunderstanding at the store and that, in fact, the normal procedure would be for the Tech Guys to provide a fix. [PC World] will provide a full repair once the firm has made contact with Tikka.\u0027\u003Cp\u003E\u003Ca href\u003D\u0022http://linux.slashdot.org/article.pl?sid\u003D07/09/15/2031231\u0026amp;from\u003Drss\u0022\u003ERead more of this story\u003C/a\u003E at Slashdot.\u003C/p\u003E\n\u003Cp\u003E\u003Ca href\u003D\u0022http://rss.slashdot.org/~a/Slashdot/slashdot?a\u003DdFhewl\u0022\u003E\u003Cimg src\u003D\u0022http://rss.slashdot.org/~a/Slashdot/slashdot?i\u003DdFhewl\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\u003C/p\u003E\u003Cimg src\u003D\u0022http://rss.slashdot.org/~r/Slashdot/slashdot/~4/157024083\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E",
     "categories":["portables"]},{"title":"Impassable Northwest Passage Open For First Time In History",
     "link":"http://rss.slashdot.org/~r/Slashdot/slashdot/~3/157024084/article.pl",
     "author":"Zonk",
     "publishedDate":"Sat, 15 Sep 2007 16:05:00 -0700",
     "contentSnippet":"An anonymous reader writes \u0022The Northwest Passage, a normally ice-locked shortcut between Europe and Asia, is now passable for ...",
     "content":"An anonymous reader writes \u0022The Northwest Passage, a normally ice-locked shortcut between Europe and Asia, is now passable for the first time in recorded history reports the European Space Agency. Leif Toudal Pedersen from the Danish National Space Centre said in the article: \u0027We have seen the ice-covered area drop to just around 3 million sq km which is about 1 million sq km less than the previous minima of 2005 and 2006. There has been a reduction of the ice cover over the last 10 years of about 100 000 sq km per year on average, so a drop of 1 million sq km in just one year is extreme.\u0027\u0022\u003Cp\u003E\u003Ca href\u003D\u0022http://science.slashdot.org/article.pl?sid\u003D07/09/15/2023212\u0026amp;from\u003Drss\u0022\u003ERead more of this story\u003C/a\u003E at Slashdot.\u003C/p\u003E\n\u003Cp\u003E\u003Ca href\u003D\u0022http://rss.slashdot.org/~a/Slashdot/slashdot?a\u003DAz9sHz\u0022\u003E\u003Cimg src\u003D\u0022http://rss.slashdot.org/~a/Slashdot/slashdot?i\u003DAz9sHz\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\u003C/p\u003E\u003Cimg src\u003D\u0022http://rss.slashdot.org/~r/Slashdot/slashdot/~4/157024084\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E",
     "categories":["science"]},{"title":"Stealthy Windows Update Raises Serious Concerns",
     "link":"http://rss.slashdot.org/~r/Slashdot/slashdot/~3/157024085/article.pl",
     "author":"Zonk",
     "publishedDate":"Sat, 15 Sep 2007 15:26:00 -0700",
     "contentSnippet":"UniversalVM writes \u0022What is the single biggest issue that bothers open source advocates about proprietary software? It is ...",
     "content":"UniversalVM writes \u0022What is the single biggest issue that bothers open source advocates about proprietary software? It is probably the ability of the vendor to pull stunts like Microsoft\u0027s recent stealth software update and subsequent downplaying of any concerns. Their weak explanation seems to be a great exercise in circular logic: \u0027Had we failed to update the service automatically, users would not have been able to successfully check for updates and, in turn, users would not have had updates installed automatically or received expected notifications.\u0027 News.com is reporting that all of the updated files on both XP and Vista appears to be in windows update itself. This is information that was independently uncovered by users and still not released by Microsoft.\u0022\u003Cp\u003E\u003Ca href\u003D\u0022http://it.slashdot.org/article.pl?sid\u003D07/09/15/2040259\u0026amp;from\u003Drss\u0022\u003ERead more of this story\u003C/a\u003E at Slashdot.\u003C/p\u003E\n\u003Cp\u003E\u003Ca href\u003D\u0022http://rss.slashdot.org/~a/Slashdot/slashdot?a\u003D1UNV7y\u0022\u003E\u003Cimg src\u003D\u0022http://rss.slashdot.org/~a/Slashdot/slashdot?i\u003D1UNV7y\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\u003C/p\u003E\u003Cimg src\u003D\u0022http://rss.slashdot.org/~r/Slashdot/slashdot/~4/157024085\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E",
     "categories":["windows"]},{"title":"Google Calls for International Privacy Standards",
     "link":"http://rss.slashdot.org/~r/Slashdot/slashdot/~3/157024086/article.pl",
     "author":"Zonk",
     "publishedDate":"Sat, 15 Sep 2007 14:18:00 -0700",
     "contentSnippet":"HairyNevus writes \u0022The Washington Post has an article detailing Google\u0027s request for international privacy standards. Google is ...",
     "content":"HairyNevus writes \u0022The Washington Post has an article detailing Google\u0027s request for international privacy standards. Google is taking this matter all the way to the U.N., arguing that a hodge-podge of privacy law unnecessarily burdens Internet-based companies while also failing to protect consumers. Although Google is currently under investigation by the EU for its privacy practices, the company claims it has been a crusader for protecting consumer privacy. Google\u0027s privacy counsel Peter Fleischer called America\u0027s privacy laws \u0027too complex and too much of a patchwork,\u0027 and the European Union\u0027s laws \u0027too bureaucratic and inflexible.\u0027 The alternative? Something closer to the Asia-Pacific Economic Cooperation\u0027s framework which \u0027balances very carefully information privacy with business needs and commercial interests\u0027, according to Fleischer.\u0022\u003Cp\u003E\u003Ca href\u003D\u0022http://yro.slashdot.org/article.pl?sid\u003D07/09/15/2014253\u0026amp;from\u003Drss\u0022\u003ERead more of this story\u003C/a\u003E at Slashdot.\u003C/p\u003E\n\u003Cp\u003E\u003Ca href\u003D\u0022http://rss.slashdot.org/~a/Slashdot/slashdot?a\u003DMUjpX1\u0022\u003E\u003Cimg src\u003D\u0022http://rss.slashdot.org/~a/Slashdot/slashdot?i\u003DMUjpX1\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\u003C/p\u003E\u003Cimg src\u003D\u0022http://rss.slashdot.org/~r/Slashdot/slashdot/~4/157024086\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E",
     "categories":["google"]},{"title":"Internal Emails of An RIAA Attack Dog Leaked",
     "link":"http://rss.slashdot.org/~r/Slashdot/slashdot/~3/157024087/article.pl",
     "author":"Zonk",
     "publishedDate":"Sat, 15 Sep 2007 13:24:00 -0700",
     "contentSnippet":"qubezz writes \u0022The company MediaDefender works with the RIAA and MPAA against piracy, setting up fake torrents and trackers and ...",
     "content":"qubezz writes \u0022The company MediaDefender works with the RIAA and MPAA against piracy, setting up fake torrents and trackers and disrupting p2p traffic. Previously, the TorrentFreak site accused them of setting up a fake internet video download site designed to catch and bust users. MediaDefender denied the entrapment charges. Now 700MB of MediaDefender\u0027s internal emails from the last 6 months have been leaked onto BitTorrent trackers. The emails detail their entire plan, including how they intended to distance themselves from the fake company they set up and future strategies. Other pieces of company information were included in the emails such as logins and passwords, wage negotiations, and numerous other aspect of their internal business.\u0022\u003Cp\u003E\u003Ca href\u003D\u0022http://it.slashdot.org/article.pl?sid\u003D07/09/15/1843234\u0026amp;from\u003Drss\u0022\u003ERead more of this story\u003C/a\u003E at Slashdot.\u003C/p\u003E\n\u003Cp\u003E\u003Ca href\u003D\u0022http://rss.slashdot.org/~a/Slashdot/slashdot?a\u003DGLD4CC\u0022\u003E\u003Cimg src\u003D\u0022http://rss.slashdot.org/~a/Slashdot/slashdot?i\u003DGLD4CC\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\u003C/p\u003E\u003Cimg src\u003D\u0022http://rss.slashdot.org/~r/Slashdot/slashdot/~4/157024087\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E",
                               "categories":["security"]}]}};

FTC_feedData['http://www.comedycentral.com/rss/colbertvideos.jhtml'] =
{"feed":{"title":"Colbert Report Videos",
     "link":"http://www.comedycentral.com/shows/the_colbert_report/index.jhtml?rsspartner\u003DrssFeedfetcherGoogle",
     "author":"",
     "description":"Watch Stephen Colbert feel the news at you, anytime!",
     "type":"rss20",
     "entries":[{"title":"Are You There, God?",
     "link":"http://www.comedycentral.com/extras/indecision2008/videos/indecision_colbert/index.jhtml?playVideo\u003D102735\u0026rsspartner\u003DrssFeedfetcherGoogle",
     "author":"",
     "publishedDate":"Fri, 14 Sep 2007 00:00:00 -0700",
     "contentSnippet":"Mother Teresa doubted the existence of God – Boy, did she have a bad career counselor!",
     "content":"Mother Teresa doubted the existence of God – Boy, did she have a bad career counselor!",
     "categories":[]},{"title":"Father James Martin",
     "link":"http://www.comedycentral.com/shows/the_colbert_report/videos/celebrity_interviews/index.jhtml?playVideo\u003D102804\u0026rsspartner\u003DrssFeedfetcherGoogle",
     "author":"",
     "publishedDate":"Fri, 14 Sep 2007 00:00:00 -0700",
     "contentSnippet":"Father James Martin sets Stephen straight about Mother Teresa\u0027s crisis of faith.",
     "content":"Father James Martin sets Stephen straight about Mother Teresa\u0027s crisis of faith.",
     "categories":[]},{"title":"WristStrong",
     "link":"http://www.comedycentral.com/videos/index.jhtml?playVideo\u003D102738\u0026rsspartner\u003DrssFeedfetcherGoogle",
     "author":"",
     "publishedDate":"Fri, 14 Sep 2007 00:00:00 -0700",
     "contentSnippet":"Stephen suggests that Matt Lauer slip his WristStrong bracelet to President Mahmoud Ahmadinejad.",
     "content":"Stephen suggests that Matt Lauer slip his WristStrong bracelet to President Mahmoud Ahmadinejad.",
                       "categories":[]}]}};

FTC_feedData['http://www.quotationspage.com/data/qotd.rss'] = 
{"feed":{"title":"Quotes of the Day",
     "link":"http://www.quotationspage.com/qotd.html",
     "author":"",
     "description":"Four humorous quotations each day from The Quotations Page",
     "type":"rss20",
     "entries":[{"title":"Bernard M. Baruch",
     "link":"http://www.quotationspage.com/quote/38809.html",
     "author":"",
     "publishedDate":"Fri, 14 Sep 2007 17:00:00 -0700",
     "contentSnippet":"\u0022Never answer a critic, unless he\u0027s right.\u0022",
     "content":"\u0022Never answer a critic, unless he\u0027s right.\u0022",
     "categories":[]},{"title":"Booth Tarkington",
     "link":"http://www.quotationspage.com/quote/30199.html",
     "author":"",
     "publishedDate":"Fri, 14 Sep 2007 17:00:00 -0700",
     "contentSnippet":"\u0022There are two things that will be believed of any man whatsoever, and one of them is that he has taken to drink.\u0022",
     "content":"\u0022There are two things that will be believed of any man whatsoever, and one of them is that he has taken to drink.\u0022",
     "categories":[]},{"title":"C. E. Montague",
     "link":"http://www.quotationspage.com/quote/26282.html",
     "author":"",
     "publishedDate":"Fri, 14 Sep 2007 17:00:00 -0700",
     "contentSnippet":"\u0022To be amused by what you read--that is the great spring of happy quotations.\u0022",
     "content":"\u0022To be amused by what you read--that is the great spring of happy quotations.\u0022",
                       "categories":[]}]}};


FTC_feedData['http://www.theonion.com/content/feeds/daily'] =
{"feed":{"title":"The Onion",
     "link":"http://www.theonion.com/content",
     "author":"",
     "description":"America\u0027s Finest News Source",
     "type":"rss20",
     "entries":[{"title":"[audio] Women Now Empowered By Everything A Woman Does",
     "link":"http://feeds.theonion.com/~r/theonion/daily/~3/156725839/women_now_empowered_by",
     "author":"",
     "publishedDate":"Fri, 14 Sep 2007 22:01:56 -0700",
     "contentSnippet":"Onion Radio News - with Doyle Redland\n  \n",
     "content":"Onion Radio News - with Doyle Redland\u003Cdiv\u003E\n\u003Ca href\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?a\u003Dd927JcyN\u0022\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?i\u003Dd927JcyN\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?a\u003DTIPcv3mH\u0022\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?i\u003DTIPcv3mH\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?a\u003DaadR8zgH\u0022\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?i\u003DaadR8zgH\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\n\u003C/div\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~r/theonion/daily/~4/156725839\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E",
     "categories":["Onion_Radio_News"]},{"title":"Description Of Sexual Fantasy Changing With Girlfriend\u0027s Reaction",
     "link":"http://feeds.theonion.com/~r/theonion/daily/~3/156725840/description_of_sexual_fantasy",
     "author":"",
     "publishedDate":"Fri, 14 Sep 2007 22:01:41 -0700",
     "contentSnippet":"HOUSTON— \u0022I put my finger up your—lips. Up to your lips. Like, to hush you, because the moment is so awe-inspiring,\u0022 said ...",
     "content":"HOUSTON— \u0026quot;I put my finger up your—lips. Up to your lips. Like, to hush you, because the moment is so awe-inspiring,\u0026quot; said Kendler, choking back his actual fantasy.\u003Cdiv\u003E\n\u003Ca href\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?a\u003DoviqivBi\u0022\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?i\u003DoviqivBi\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?a\u003DfsMMhXK4\u0022\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?i\u003DfsMMhXK4\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?a\u003DhqiyMuVE\u0022\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?i\u003DhqiyMuVE\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\n\u003C/div\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~r/theonion/daily/~4/156725840\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E",
     "categories":["Sex",
     "couples",
     "Bars",
     "News",
     "People"]},{"title":"[audio] Florida Town Mentally Prepares For Hurricane",
     "link":"http://feeds.theonion.com/~r/theonion/daily/~3/156276304/florida_town_mentally",
     "author":"",
     "publishedDate":"Thu, 13 Sep 2007 22:01:58 -0700",
     "contentSnippet":"Onion Radio News - with Doyle Redland\n  \n",
     "content":"Onion Radio News - with Doyle Redland\u003Cdiv\u003E\n\u003Ca href\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?a\u003D0B6fP3fh\u0022\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?i\u003D0B6fP3fh\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?a\u003DZs5JTOM2\u0022\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?i\u003DZs5JTOM2\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E \u003Ca href\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?a\u003DtPIwrFa8\u0022\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~f/theonion/daily?i\u003DtPIwrFa8\u0022 border\u003D\u00220\u0022\u003E\u003C/a\u003E\n\u003C/div\u003E\u003Cimg src\u003D\u0022http://feeds.theonion.com/~r/theonion/daily/~4/156276304\u0022 height\u003D\u00221\u0022 width\u003D\u00221\u0022\u003E",
                 "categories":["Onion_Radio_News"]}]}};

FTC_feedData['http://vitativeness.blogspot.com/feeds/posts/default'] =
{"feed":{"title":"Vitativeness","link":"http://vitativeness.blogspot.com/","author":"Vitativeness","description":"","type":"atom10","entries":[{"title":"Moved","link":"http://vitativeness.blogspot.com/2007/06/moved.html","author":"Vitativeness","publishedDate":"Tue, 26 Jun 2007 19:17:00 -0700","contentSnippet":"I\u0027ve moved! Here\u0027s my new addy: touchedbycolors","content":"I\u0027ve moved! Here\u0027s my new addy: \u003Ca href\u003D\u0022http://touchedbycolors.blogspot.com\u0022\u003Etouchedbycolors\u003C/a\u003E","categories":[]},{"title":"I am back!","link":"http://vitativeness.blogspot.com/2007/04/i-am-back.html","author":"Vitativeness","publishedDate":"Sat, 28 Apr 2007 04:54:00 -0700","contentSnippet":"I\u0027ve seen it all in these past couple of months, the Washington snow,the Boston chill, the California blue sky, Las Vegas hot ...","content":"I\u0027ve seen it all in these past couple of months, the Washington snow,\u003Cbr\u003E\u003Cbr\u003Ethe Boston chill, the California blue sky, Las Vegas hot sun,\u003Cbr\u003E\u003Cbr\u003ELos Angeles rain, and to think I used to complain about Melbourne\u0027s\u003Cbr\u003E\u003Cbr\u003Eweather!\u003Cbr\u003E\u003Cbr\u003EI\u0027ve collected enough paint on this trip to last me for a couple of\u003Cbr\u003E\u003Cbr\u003Eyears (no more excuses), and to those of you who have been\u003Cbr\u003E\u003Cbr\u003Epatiently waited for me to return, thank you! New posts are on the\u003Cbr\u003E\u003Cbr\u003Eway!\u003Cbr\u003E\u003Cbr\u003E(sorry, no photos from the trip. I am not much of a clicking tourist\u003Cbr\u003E\u003Cbr\u003Eperson, hate the dead weight of the camera and if I did carry it\u003Cbr\u003E\u003Cbr\u003Earound, too lazy to take any pic).","categories":[]},{"title":"Flick It","link":"http://vitativeness.blogspot.com/2006/07/flick-it.html","author":"Vitativeness","publishedDate":"Mon, 17 Jul 2006 22:23:00 -0700","contentSnippet":"You’re in a hallway, there are three switches.Two of these switches do not perform any function.There’s a door at the end of ...","content":"\u003Cp\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022\u003EYou’re in a hallway, there are three switches.\u003Cbr\u003E\u003C/span\u003E\u003C/p\u003E\u003Cp\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022\u003ETwo of these switches do not perform any function.\u003Cbr\u003E\u003C/span\u003E\u003C/p\u003E\u003Cp\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022\u003EThere’s a door at the end of hallway leading to a room.\u003Cbr\u003E\u003C/span\u003E\u003C/p\u003E\u003Cp\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022\u003EThe third switch will turn on the light in that room.\u003Cbr\u003E\u003C/span\u003E\u003C/p\u003E\u003Cp\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022\u003EYou can flick the switches as many times as you like,\u003Cbr\u003E\u003C/span\u003E\u003C/p\u003E\u003Cp\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022\u003Ehowever, the door to the room can only be opened once.\u003Cbr\u003E\u003C/span\u003E\u003C/p\u003E\u003Cp\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022\u003EYou can not determine whether the light in that room is\u003Cbr\u003E\u003C/span\u003E\u003C/p\u003E\u003Cp\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022\u003Eon or off without opening the door. How do you establish\u003Cbr\u003E\u003C/span\u003E\u003C/p\u003E\u003Cp\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022\u003Ewhich switch\u003Cspan\u003E  \u003C/span\u003Ewill light the room?\u003Cbr\u003E\u003C/span\u003E\u003C/p\u003E\u003Cp\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022\u003E(None of the switches are dimmers \u003C/span\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022 style\u003D\u0022font-family:Wingdings\u0022\u003E\u003Cspan\u003E:)\u003C/span\u003E\u003C/span\u003E\u003Cspan lang\u003D\u0022EN-AU\u0022\u003E).\u003C/span\u003E\u003C/p\u003E","categories":[]}]}};


FTC_feedSearchData = {"query":"cnn","entries":[{"url":"http://rss.cnn.com/rss/cnn_topstories.rss","title":"\u003Cb\u003ECNN\u003C/b\u003E.com - Breaking News, U.S., World, Weather, Entertainment \u003Cb\u003E...\u003C/b\u003E","contentSnippet":"\u003Cb\u003ECNN\u003C/b\u003E.com delivers the latest breaking news and information on the latest top \u003Cbr\u003E  stories, weather, \u003Cb\u003E...\u003C/b\u003E 2007 \u003Cb\u003ECable News Network\u003C/b\u003E LP, LLLP. A Time Warner Company. \u003Cb\u003E...\u003C/b\u003E","link":"http://www.cnn.com/"},
   {"url":"http://rss.cnn.com/rss/cnn_tech.rss","title":"Technology - Computers, Internet and Personal Tech News from \u003Cb\u003ECNN\u003C/b\u003E.com","contentSnippet":"Find information about the latest advances in technology at \u003Cb\u003ECNN\u003C/b\u003E. \u003Cb\u003ECNN\u003C/b\u003E Technology \u003Cbr\u003E  news and video covers the internet, business and personal tech, video games, \u003Cb\u003E...\u003C/b\u003E","link":"http://www.cnn.com/TECH/"},
   {"url":"http://rss.cnn.com/rss/money_topstories.rss","title":"\u003Cb\u003ECNN\u003C/b\u003E/Money","contentSnippet":"\u003Cb\u003ECNN\u003C/b\u003E, FORTUNE, MONEY, BUSINESS 2.0 and Fortune Small Business magazines offer \u003Cbr\u003E  business news and financial market coverage updated throughout the day, \u003Cb\u003E...\u003C/b\u003E","link":"http://money.cnn.com/"},
/*   {"url":"http://rss.cnn.com/rss/edition.rss","title":"\u003Cb\u003ECNN\u003C/b\u003E.com International","contentSnippet":"World news, the latest world news headlines, weather, sport, business and \u003Cbr\u003E  entertainment brought to you by \u003Cb\u003ECNN\u003C/b\u003E europe.","link":"http://edition.cnn.com/"},
   {"url":"http://rss.cnn.com/rss/edition_asia.rss","title":"\u003Cb\u003ECNN\u003C/b\u003E.com International","contentSnippet":"Countdown Beijing. Countdown Beijing. \u003Cb\u003ECNN\u003C/b\u003E takes an in-depth look at China\u0026#39;s \u003Cbr\u003E  preparations for the 2008 Olympic Games full story \u003Cb\u003E...\u003C/b\u003E","link":"http://edition.cnn.com/ASIA/"},
   {"url":"http://rss.cnn.com/rss/si_topstories.rss","title":"\u003Cb\u003ECNN\u003C/b\u003E/SI Network Page","contentSnippet":"SI.com - sports news, scores, photos, columns and expert analysis from the world \u003Cbr\u003E  of sports including NFL, NBA, NHL, MLB, NASCAR, college basketball, \u003Cb\u003E...\u003C/b\u003E","link":"http://sportsillustrated.cnn.com/"},
   {"url":"http://rss.cnn.com/rss/si_topstories.rss","title":"SI.com - 2006 Winter Olympics","contentSnippet":"Cops put on leave after Tasering student. WEATHER. \u003Cb\u003ECNN\u003C/b\u003E CareerBuilder \u0026middot; SI.com. \u003Cbr\u003E  STOCK QUOTE:. SUBSCRIBE TO SI \u0026middot; GIVE THE GIFT OF SI \u003Cb\u003E...\u003C/b\u003E","link":"http://sportsillustrated.cnn.com/olympics/"},
   {"url":"http://rss.cnn.com/rss/cnn_politicalticker.rss","title":"\u003Cb\u003ECNN\u003C/b\u003E.com - \u003Cb\u003ECNN\u003C/b\u003E Political Ticker","contentSnippet":"WASHINGTON (\u003Cb\u003ECNN\u003C/b\u003E) – Former Massachusetts Gov. Mitt Romney criticizes his fellow \u003Cbr\u003E  Republicans for failing to control spending, neglecting to take action on \u003Cb\u003E...\u003C/b\u003E","link":"http://politicalticker.blogs.cnn.com/"},
*/   {"url":"http://twitter.com/statuses/user_timeline/428333.rss","title":"Twitter / cnnbrk","contentSnippet":"Name: \u003Cb\u003ECNN\u003C/b\u003E Breaking News; Bio: \u003Cb\u003ECNN\u003C/b\u003E.com is among the world\u0026#39;s leaders in online news \u003Cbr\u003E  and \u003Cb\u003E...\u003C/b\u003E Location: Everywhere. Web: http://www.\u003Cb\u003Ecnn\u003C/b\u003E.com/; Joined: Jan 2007 \u003Cb\u003E...\u003C/b\u003E","link":"http://twitter.com/cnnbrk"},
   {"url":"http://rss.cnn.com/rss/cnn_topstories.rss","title":"\u003Cb\u003ECNN\u003C/b\u003E.com - Breaking News, U.S., World, Weather, Entertainment \u003Cb\u003E...\u003C/b\u003E","contentSnippet":"\u003Cb\u003ECNN\u003C/b\u003E.com delivers the latest breaking news and information on the latest top \u003Cbr\u003E  stories, weather, business, entertainment, politics, and more.","link":"http://cnn.org/"}]};
