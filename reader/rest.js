var REST_root = 'http://localhost:8000/';
var REST_user = 'test';

function encodeParams(opcode, params) {
    if (!params)
        params = {};

    var paramStr = opcode + '?user=' + REST_user;
    $.each(params, function(key, value) {
               paramStr += '&' + key + '=' + escape(value);
           });
    return '/yocto-reader/rest/proxy.php?u=' + encodeURIComponent(REST_root + paramStr);
}

function REST_init() {
    var context = new AsyncContext(function() {
        alert('allDone');
    });
    
    context.addRequest(encodeParams('allFeeds'), function(json) {
        alert('returned: ' + json);
    });

    context.fire();
}

function AsyncContext() {
    this.requests = [];
    this.doneCount = 0;
}

AsyncContext.prototype.addRequest = function(url, callback) {
    this.requests.push({'url': url, 'callback' : callback});
}

AsyncContext.prototype.fire = function() {
    var self = this;

    $.each(this.requests, function(i, req) {
//        alert(req.url);
        loadUrl(req.url, self._onDone.bind(self, i));
    })
}

AsyncContext.prototype.setOnComplete = function(fn) {
    this.onComplete = fn;
}

AsyncContext.prototype._onDone = function(i, reply) {
    this.requests[i].callback(reply.responseText);
    this.doneCount++;

    if (this.doneCount >= this.requests.length) {
        if (this.onComplete)
            this.onComplete();
    }
}

function loadUrl (url, processingFunction, async)
{
    async = true;
        
    var httpRequestObj = null
        try {
        if (window.XMLHttpRequest)
        {
            httpRequestObj = new XMLHttpRequest ()
        }        
    } catch(e) {
        alert(e.message);
    }
        
    httpRequestObj.onreadystatechange = function () {stateChange (httpRequestObj, processingFunction)}
    httpRequestObj.open ("GET", url, async)
        httpRequestObj.setRequestHeader( "If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT" );
    httpRequestObj.send ("")
        
        return httpRequestObj;
}

function stateChange (httpRequestObj, callBack)
{
    if (httpRequestObj.readyState == 4)
    {
        if (httpRequestObj.status == 200 )
        {
            if (callBack)
                callBack (httpRequestObj)
        }
        else
        {
            alert("Problem retrieving XML data " + httpRequestObj.status)
        }
    }
}

$(window).load(REST_init);
