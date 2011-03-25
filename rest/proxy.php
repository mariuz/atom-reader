<?php

header('Content-Type: text/plain');

function aglobal($name){
	foreach($_GET as $key=>$value){
		if($name == $key){if($value !== ''){$output = $value;}}
	}
    
	foreach($_POST as $key=>$value){
		if($name == $key){if($value !== ''){$output = $value;}}
	}
    
	if(!isset($output)){$output = '';}
    $output = strip_tags(substr(trim($output),0,500));
    
    return($output);
}

function readdata($ch, $data) {
   print $data;
}

/*
$url = urldecode(aglobal('u'));
$as  = aglobal('as');
if (!$as) {
   $as = 'raw';
}
*/
$url = 'http://backend.yocto.aminche.com/allFeeds?user=test';
print "$url\n\n"; 

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.1) Gecko/20061204 Firefox/2.0.0.1');

$resp = curl_exec($ch);
curl_close($ch);

print "Done: $resp\n\n";

$urlenc = urlencode($url);

if (0) {
    $resp = preg_replace('/(<\s*head.*?>)/i',
                         "\\1<base href='$url'>",
                         $resp);
}

exit;


if ($as == 'raw') {
    header('Content-Type: text/plain');

    print $resp; 
} else {
//    $resp = htmlentities($resp);
//    $resp = "<h1>Asassa</h1>Hello\n\nAbcd\n\n";
    $resp = preg_replace('/CDATA/i', '', $resp);
    $resp = preg_replace('/\]\]>/i', '', $resp);
    $resp1 = "<!DOCTYPE HTML PUBLIC \"-//IETF//DTD HTML 2.0//EN\">\n" .
"<HTML><HEAD>\n".
"<TITLE>404 Not Found</TITLE>\n" .
"</HEAD><BODY>\n" .
"<H1>Not Found</H1>\n" .
"The requested URL /proj/sudoku/empty.html was not found on this server.<P>\n" .
"<HR>\n" .
"<ADDRESS>Apache/1.3.33 Server at kudang.ourhome Port 80</ADDRESS>\n" .
        "</BODY></HTML>\n";

    header('Content-Type: text/xml');
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); // Date in the past
    ?>
<data type='proxy'><![CDATA[
<?= $resp ?>
]]></data>

<?
}
?> 
