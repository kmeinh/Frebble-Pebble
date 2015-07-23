var maxUpstream;
var maxDownstream;
var availableUP;
var availableDownstream;
var uptime;
var connectionStatus;
var DictionaryEnum = Object.freeze({
	MAX_UP : 0,
	MAX_DOWN : 1,
	AVAILABLE_UP : 2,
	AVAILABLE_DOWN : 3,
	UPTIME : 4
});

function watchfaceReady(){
	fetchMaxUpAndDown();
	fetchCurrentUpAndDown();
	fetchUptimeAndConnectionStatus();
	console.log("status"+connectionStatus);
	var dictionary = {
  		0 : parseInt(maxUpstream),
  		1 : parseInt(maxDownstream),
  		2 : parseInt(availableUP),
  		3 : parseInt(availableDownstream),
  		4 : parseInt(uptime),
  		5 : connectionStatus
	};
	Pebble.sendAppMessage(dictionary,function(e){},function(e){});
}

function fetchMaxUpAndDown(){
	commonLinkPorpertiesXML = callFritzAction("http://fritz.box:49000/igdupnp/control/WANCommonIFC1","urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1","GetCommonLinkProperties");
	maxUpstream=commonLinkPorpertiesXML.match(/<NewLayer1UpstreamMaxBitRate>(.*?)<\/NewLayer1UpstreamMaxBitRate>/)[1];
	maxDownstream=commonLinkPorpertiesXML.match(/<NewLayer1DownstreamMaxBitRate>(.*?)<\/NewLayer1DownstreamMaxBitRate>/)[1];
}

function fetchCurrentUpAndDown(){
	commonLinkPorpertiesXML = callFritzAction("http://fritz.box:49000/igdupnp/control/WANCommonIFC1","urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1","GetAddonInfos");
	availableUP=commonLinkPorpertiesXML.match(/<NewByteSendRate>(.*?)<\/NewByteSendRate>/)[1];
	availableDownstream=commonLinkPorpertiesXML.match(/<NewByteReceiveRate>(.*?)<\/NewByteReceiveRate>/)[1];
}

function fetchUptimeAndConnectionStatus(){
	statusInfoXML= callFritzAction("http://fritz.box:49000/igdupnp/control/WANIPConn1","urn:schemas-upnp-org:service:WANIPConnection:1","GetStatusInfo");
	uptime = statusInfoXML.match(/<NewUptime>(.*?)<\/NewUptime>/)[1];
	connectionStatus = statusInfoXML.match(/<NewConnectionStatus>(.*?)<\/NewConnectionStatus>/)[1];
}

function callFritzAction(url, urn, action){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST",url,false);
	xmlhttp.setRequestHeader("Content-type","text/xml; charset=UTF-8");
	xmlhttp.setRequestHeader("SoapAction",urn+"#"+action);
	xmlhttp.send("<?xml version=\"1.0\" encoding=\"utf-8\"?><s:Envelope xmlns:s=\"http://www.w3.org/2003/05/soap-envelope\"><s:Body><m:"+action+" xmlns:m=\""+urn+"\"></m:"+action+"></s:Body></s:Envelope>");
	return xmlhttp.responseText;
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  watchfaceReady
);

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log('AppMessage received!');
    watchfaceReady();
  }                     
);