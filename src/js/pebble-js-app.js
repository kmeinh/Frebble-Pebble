SET_SERVICE_DATA = 0;
SET_CONFIG_DATA = 1;
GET_SERVICE_DATA = 2;
SET_ERROR = 3;

var ConfigData = {
	REFRESH_CYCLE : localStorage.getItem("REFRESH_CYCLE")||5,
	FRITZ_IP : localStorage.getItem("FRITZ_IP")||"fritz.box",
	FRITZ_PORT : localStorage.getItem("FRITZ_PORT")||49000,
	AUTOMATIC_DISCOVERY : localStorage.getItem("AUTOMATIC_DISCOVERY")||1,
	WANCIC_URL : localStorage.getItem("WANCIC_URL")||"/igdupnp/control/WANCommonIFC1",
	WANIPC_URL : localStorage.getItem("WANIPC_URL")||"/igdupnp/control/WANIPConn1"
};

Pebble.addEventListener('ready', 
	getData
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
	var baseUrl = 'http://3b46ec4a.ngrok.io/index.html';
	return baseUrl + "?values=" + encodeURIComponent(JSON.stringify(ConfigData));
}

function getData(){
	//create and store object
	req = new ServiceDataRequest(clone(ConfigData));
	req.updateDataAndSendToWatch();
}

function handleIncomingMessage(message){
	switch(message.payload.MESSAGE_TYPE){
		case GET_SERVICE_DATA:
		getData();
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


function ServiceDataRequest(configData){
	this.DataStore = {
	maxUpstream : 0,
	maxDownstream : 0,
	availableUpstream : 0,
	availableDownstream : 0,
	uptime: 0,
	connectionStatus : "",
	error : false};
	this.ConfigData = configData;
	this.callbackWhenDone = null;
}

ServiceDataRequest.prototype.updateDataAndSendToWatch=function(){
	this.fetchDataFromService(this.sendDataToWatch);
};

ServiceDataRequest.prototype.fetchDataFromService=function(callbackWhenAllDataFetched){
	this.clearDataStore();
	this.fetchMaxUpAndDown(callbackWhenAllDataFetched);
	this.fetchCurrentUpAndDown(callbackWhenAllDataFetched);
	this.fetchUptimeAndConnectionStatus(callbackWhenAllDataFetched);
};

ServiceDataRequest.prototype.clearDataStore=function(){
	this.DataStore.maxUpstream = null;
	this.DataStore.maxDownstream = null;
	this.DataStore.availableUpstream = null;
	this.DataStore.availableDownstream = null;
	this.DataStore.uptime = null;
	this.DataStore.connectionStatus = null;
	this.DataStore.error = false;
};

ServiceDataRequest.prototype.fetchMaxUpAndDown=function(callback){
	var innerThis = this;
	this.callFritzAction("http://"+ConfigData.FRITZ_IP+":"+ConfigData.FRITZ_PORT+ConfigData.WANCIC_URL,"urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1","GetCommonLinkProperties",
		function(actionResponse){
			innerThis.DataStore.maxUpstream=parseInt(actionResponse.match(/<NewLayer1UpstreamMaxBitRate>(.*?)<\/NewLayer1UpstreamMaxBitRate>/)[1]);
			innerThis.DataStore.maxDownstream=parseInt(actionResponse.match(/<NewLayer1DownstreamMaxBitRate>(.*?)<\/NewLayer1DownstreamMaxBitRate>/)[1]);
			if(innerThis.allDataFetched()){
				callback(innerThis);
			}
		}
		);
};

ServiceDataRequest.prototype.fetchCurrentUpAndDown=function(callback){
	var innerThis = this;
	this.callFritzAction("http://"+ConfigData.FRITZ_IP+":"+ConfigData.FRITZ_PORT+ConfigData.WANCIC_URL,"urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1","GetAddonInfos",
		function(actionResponse){
			innerThis.DataStore.availableUpstream=parseInt(actionResponse.match(/<NewByteSendRate>(.*?)<\/NewByteSendRate>/)[1]);
			innerThis.DataStore.availableDownstream=parseInt(actionResponse.match(/<NewByteReceiveRate>(.*?)<\/NewByteReceiveRate>/)[1]);
			if(innerThis.allDataFetched()){
				callback(innerThis);
			}
		}
		);
};

ServiceDataRequest.prototype.fetchUptimeAndConnectionStatus=function(callback){
	var innerThis = this;
	this.callFritzAction("http://"+ConfigData.FRITZ_IP+":"+ConfigData.FRITZ_PORT+ConfigData.WANIPC_URL,"urn:schemas-upnp-org:service:WANIPConnection:1","GetStatusInfo",
		function(actionResponse){
			innerThis.DataStore.uptime = parseInt(actionResponse.match(/<NewUptime>(.*?)<\/NewUptime>/)[1]);
			innerThis.DataStore.connectionStatus = actionResponse.match(/<NewConnectionStatus>(.*?)<\/NewConnectionStatus>/)[1];
			if(innerThis.allDataFetched()){
				callback(innerThis);
			}
		}
		);
};

ServiceDataRequest.prototype.allDataFetched=function(){
	return (this.DataStore.maxUpstream!=null && this.DataStore.maxDownstream!=null && this.DataStore.availableUpstream!=null && this.DataStore.availableDownstream!=null && this.DataStore.uptime!=null && this.DataStore.connectionStatus!=null);
};

ServiceDataRequest.prototype.callFritzAction=function(url, urn, action, readyCallback){
	var innerThis = this;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			readyCallback(xmlhttp.responseText);
		}else if (xmlhttp.readyState==4 && xmlhttp.status!=200){
			console.log("xmlhttp no good:"+xmlhttp.status+" "+xmlhttp.statusText);
		}
	};
	xmlhttp.timeout = 3000;
	xmlhttp.ontimeout=function() {
		console.log("timeout");
		if (!innerThis.DataStore.error){
			Pebble.sendAppMessage({MESSAGE_TYPE:SET_ERROR,
				ERROR_STRING:"Request timed out after 3s."},function(e){},function(e){});
		}
		innerThis.DataStore.error = true;
	};
	xmlhttp.onerror=function() {
		Pebble.sendAppMessage({MESSAGE_TYPE:SET_ERROR,
			ERROR_STRING:"Unknown error."},function(e){},function(e){});
	};
	xmlhttp.open("POST",url,true);
	xmlhttp.setRequestHeader("Content-type","text/xml; charset=UTF-8");
	xmlhttp.setRequestHeader("SoapAction",urn+"#"+action);
	xmlhttp.send("<?xml version=\"1.0\" encoding=\"utf-8\"?><s:Envelope xmlns:s=\"http://www.w3.org/2003/05/soap-envelope\"><s:Body><m:"+action+" xmlns:m=\""+urn+"\"></m:"+action+"></s:Body></s:Envelope>");
};

ServiceDataRequest.prototype.sendDataToWatch=function(context){
	console.log(context);
	Pebble.sendAppMessage(context.buildDictionaryFromDataStore(),function(e){},function(e){});
};

ServiceDataRequest.prototype.buildDictionaryFromDataStore=function(){
	return {
		MESSAGE_TYPE:SET_SERVICE_DATA,
		MAX_UP : this.DataStore.maxUpstream,
		MAX_DOWN : this.DataStore.maxDownstream,
		AVAILABLE_UP : this.DataStore.availableUpstream,
		AVAILABLE_DOWN : this.DataStore.availableDownstream,
		UPTIME : this.DataStore.uptime,
		CONNECTION_STATUS : this.DataStore.connectionStatus
	};
};

function clone(obj){
	if(obj == null || typeof(obj) != 'object')
		return obj;

	var temp = new obj.constructor(); 
	for(var key in obj)
		temp[key] = clone(obj[key]);

	return temp;
}