var DataStore = {
	maxUpstream : 0,
	maxDownstream : 0,
	availableUpstream : 0,
	availableDownstream : 0,
	uptime: 0,
	connectionStatus : ""
};

Pebble.addEventListener('ready', 
	updateDataAndSendToWatch
);

Pebble.addEventListener('appmessage',
	updateDataAndSendToWatch                   
);

Pebble.addEventListener('showConfiguration',function(){
	var url = 'http://a58f305b.ngrok.io/index.html';
	Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed',function(e){
	var configData = JSON.parse(decodeURIComponent(e.response));
	console.log(JSON.stringify(configData));
	Pebble.sendAppMessage({REFRESH_CYCLE:parseInt(configData.refreshcycle)},function(e){},function(e){});
})

function updateDataAndSendToWatch(){
	fetchDataFromService(sendDataToWatch);
}

function fetchDataFromService(callbackWhenAllDataFetched){
	clearDataStore();
	fetchMaxUpAndDown(callbackWhenAllDataFetched);
	fetchCurrentUpAndDown(callbackWhenAllDataFetched);
	fetchUptimeAndConnectionStatus(callbackWhenAllDataFetched);
}

function clearDataStore(){
	DataStore.maxUpstream = null;
	DataStore.maxDownstream = null;
	DataStore.availableUpstream = null;
	DataStore.availableDownstream = null;
	DataStore.uptime = null;
	DataStore.connectionStatus = null;
}

function fetchMaxUpAndDown(callback){
	callFritzAction("http://fritz.box:49000/igdupnp/control/WANCommonIFC1","urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1","GetCommonLinkProperties",
		function(actionResponse){
			DataStore.maxUpstream=parseInt(actionResponse.match(/<NewLayer1UpstreamMaxBitRate>(.*?)<\/NewLayer1UpstreamMaxBitRate>/)[1]);
			DataStore.maxDownstream=parseInt(actionResponse.match(/<NewLayer1DownstreamMaxBitRate>(.*?)<\/NewLayer1DownstreamMaxBitRate>/)[1]);
			if(allDataFetched()){
				callback();
			}
		}
	);
}

function fetchCurrentUpAndDown(callback){
	callFritzAction("http://fritz.box:49000/igdupnp/control/WANCommonIFC1","urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1","GetAddonInfos",
		function(actionResponse){
			DataStore.availableUpstream=parseInt(actionResponse.match(/<NewByteSendRate>(.*?)<\/NewByteSendRate>/)[1]);
			DataStore.availableDownstream=parseInt(actionResponse.match(/<NewByteReceiveRate>(.*?)<\/NewByteReceiveRate>/)[1]);
			if(allDataFetched()){
				callback();
			}
		}
	);
}

function fetchUptimeAndConnectionStatus(callback){
	callFritzAction("http://fritz.box:49000/igdupnp/control/WANIPConn1","urn:schemas-upnp-org:service:WANIPConnection:1","GetStatusInfo",
		function(actionResponse){
			DataStore.uptime = parseInt(actionResponse.match(/<NewUptime>(.*?)<\/NewUptime>/)[1]);
			DataStore.connectionStatus = actionResponse.match(/<NewConnectionStatus>(.*?)<\/NewConnectionStatus>/)[1];
			if(allDataFetched()){
				callback();
			}
		}
	);
	
}

function allDataFetched(){
	return (DataStore.maxUpstream!=null && DataStore.maxDownstream!=null && DataStore.availableUpstream!=null && DataStore.availableDownstream!=null && DataStore.uptime!=null && DataStore.connectionStatus!=null);
}

function callFritzAction(url, urn, action, readyCallback){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
  		if (xmlhttp.readyState==4 && xmlhttp.status==200){	
    		readyCallback(xmlhttp.responseText);
    	}else if (xmlhttp.readyState==4 && xmlhttp.status!=200){
    		readyCallback("");
    	}
  	}
	xmlhttp.open("POST",url,true);
	xmlhttp.setRequestHeader("Content-type","text/xml; charset=UTF-8");
	xmlhttp.setRequestHeader("SoapAction",urn+"#"+action);
	xmlhttp.send("<?xml version=\"1.0\" encoding=\"utf-8\"?><s:Envelope xmlns:s=\"http://www.w3.org/2003/05/soap-envelope\"><s:Body><m:"+action+" xmlns:m=\""+urn+"\"></m:"+action+"></s:Body></s:Envelope>");
}

function sendDataToWatch(){
	Pebble.sendAppMessage(buildDictionaryFromDataStore(),function(e){},function(e){});
}

function buildDictionaryFromDataStore(){
	return {
  		MAX_UP : DataStore.maxUpstream,
  		MAX_DOWN : DataStore.maxDownstream,
  		AVAILABLE_UP : DataStore.availableUpstream,
  		AVAILABLE_DOWN : DataStore.availableDownstream,
  		UPTIME : DataStore.uptime,
  		CONNECTION_STATUS : DataStore.connectionStatus
	};
}

// Listen for when the watchface is opened


// Listen for when an AppMessage is received
