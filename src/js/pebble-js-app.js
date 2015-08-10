SET_SERVICE_DATA = 0;
SET_CONFIG_DATA = 1;
GET_SERVICE_DATA = 2;

var ConfigData = {
	REFRESH_CYCLE : localStorage.getItem("REFRESH_CYCLE")||5,
	FRITZ_IP : localStorage.getItem("FRITZ_IP")||"fritz.box",
	FRITZ_PORT : localStorage.getItem("FRITZ_PORT")||49000,
	AUTOMATIC_DISCOVERY : localStorage.getItem("AUTOMATIC_DISCOVERY")||1,
	WANCIC_URL : localStorage.getItem("WANCIC_URL")||"/igdupnp/control/WANCommonIFC1",
	WANIPC_URL : localStorage.getItem("WANIPC_URL")||"/igdupnp/control/WANIPConn1"
}

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
	handleIncomingMessage                 
	);

Pebble.addEventListener('showConfiguration',function(){
	Pebble.openURL(createURLFromLocalConfigData());
});

Pebble.addEventListener('webviewclosed',function(e){
	if (e.response == ""){
		return;
	}
	var updatedConfigData = JSON.parse(decodeURIComponent(e.response));
	updateConfigData(updatedConfigData);
	Pebble.sendAppMessage(buildDictionaryFromConfigData(),function(e){},function(e){});
});

function createURLFromLocalConfigData(){
	var baseUrl = 'http://85631c28.ngrok.io/index.html';
	return baseUrl + "?values=" + encodeURIComponent(JSON.stringify(ConfigData));
}

function handleIncomingMessage(message){
	switch(message.payload.MESSAGE_TYPE){
		case GET_SERVICE_DATA:
			updateDataAndSendToWatch();
		break;
		default:
			console.log("MESSAGE_TYPE missing or unknown, dropping message.");
	}
}

function updateConfigData(updatedConfigData){
	ConfigData.REFRESH_CYCLE = updatedConfigData.REFRESH_CYCLE;
	ConfigData.FRITZ_IP = updatedConfigData.FRITZ_IP;
	ConfigData.FRITZ_PORT = updatedConfigData.FRITZ_PORT;
	ConfigData.AUTOMATIC_DISCOVERY = updatedConfigData.AUTOMATIC_DISCOVERY;
	ConfigData.WANCIC_URL = updatedConfigData.WANCIC_URL;
	ConfigData.WANIPC_URL = updatedConfigData.WANIPC_URL;
	localStorage.setItem("REFRESH_CYCLE",updatedConfigData.REFRESH_CYCLE);
	localStorage.setItem("FRITZ_IP",updatedConfigData.FRITZ_IP);
	localStorage.setItem("FRITZ_PORT",updatedConfigData.FRITZ_PORT);
	localStorage.setItem("AUTOMATIC_DISCOVERY",+updatedConfigData.AUTOMATIC_DISCOVERY);
	localStorage.setItem("WANCIC_URL",updatedConfigData.WANCIC_URL);
	localStorage.setItem("WANIPC_URL",updatedConfigData.WANIPC_URL);
}

function buildDictionaryFromConfigData(){
	return {
		MESSAGE_TYPE:SET_CONFIG_DATA,
		REFRESH_CYCLE:parseInt(ConfigData.REFRESH_CYCLE)
	};
}

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
	callFritzAction("http://"+ConfigData.FRITZ_IP+":"+ConfigData.FRITZ_PORT+ConfigData.WANCIC_URL,"urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1","GetCommonLinkProperties",
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
	callFritzAction("http://"+ConfigData.FRITZ_IP+":"+ConfigData.FRITZ_PORT+ConfigData.WANCIC_URL,"urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1","GetAddonInfos",
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
	callFritzAction("http://"+ConfigData.FRITZ_IP+":"+ConfigData.FRITZ_PORT+ConfigData.WANIPC_URL,"urn:schemas-upnp-org:service:WANIPConnection:1","GetStatusInfo",
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
		MESSAGE_TYPE:SET_SERVICE_DATA,
		MAX_UP : DataStore.maxUpstream,
		MAX_DOWN : DataStore.maxDownstream,
		AVAILABLE_UP : DataStore.availableUpstream,
		AVAILABLE_DOWN : DataStore.availableDownstream,
		UPTIME : DataStore.uptime,
		CONNECTION_STATUS : DataStore.connectionStatus
	};
}
