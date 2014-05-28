var feedparser = require('feedparser')
  , fs = require('fs') // used in the examples below
    ;


function callback (article) {
	  console.log('Got Article %s', JSON.stringify(article));
}

// You can give a local file path to parseFile()
//   // For libxml compatibility, you can also give a URL to parseFile()
feedparser.parseFile('http://feeds.bbci.co.uk/news/video_and_audio/science_and_environment/rss.xml')
     .on('article', callback);
