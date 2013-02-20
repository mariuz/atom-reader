var feedparser = require('feedparser')
  , fs = require('fs') // used in the examples below
    ;


function callback (article) {
	  console.log('Got article: %s', JSON.stringify(article));
}

// You can give a local file path to parseFile()
//   // For libxml compatibility, you can also give a URL to parseFile()
feedparser.parseFile('http://cyber.law.harvard.edu/rss/examples/rss2sample.xml')
     .on('article', callback);
