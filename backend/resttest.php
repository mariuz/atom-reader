<?

$ch = curl_init();

$url = "http://backend.yocto.aminche.com/urlfeed";
$postData = "http://technosophyunlimited.blogspot.com/atom.xml";

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.1) Gecko/20061204 Firefox/2.0.0.1');
curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie);
curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

curl_setopt($this->ch, CURLOPT_POST, true);
curl_setopt($this->ch, CURLOPT_POSTFIELDS, $postData);

$result = curl_exec($this->ch);
print $result;

?>
