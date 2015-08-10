$(document).ready(function(){
	defineElements();
	loadOptionsFromQueryParams();
	setupButtons();
});

function defineElements(){
	submitButton = $('#submit');
	automaticDiscoveryToggle = $('#automatic-discovery');
	refreshcycle = $('#refreshcycle');
	wancic = $('#wancic');
	wanipc = $('#wanipc');
	ip = $('#ip');
	port = $('#port');
}	

function setupButtons(){

	submitButton.on('click',function(){
		var returnTo = getQueryParam("return_to","pebblejs://close#");
		console.log("encoding"+JSON.stringify(buildConfigData()));
		document.location = returnTo + encodeURIComponent(JSON.stringify(buildConfigData()));
	});

	automaticDiscoveryToggle.on('change',toggleAutomaticDiscovery);
}

function toggleAutomaticDiscovery(){
	if (automaticDiscoveryToggle[0].checked){
		$("#service-urls-wrapper").css("height","0px");
	}else{
		$("#service-urls-wrapper").css("height","159px");
	}
}



function loadOptionsFromQueryParams(){
	var valueString = getQueryParam("values","");
	if (valueString == ""){
		return;
	}
	valuesObject = JSON.parse(decodeURIComponent(valueString));
	refreshcycle.val(valuesObject.REFRESH_CYCLE);
	ip.val(valuesObject.FRITZ_IP);
	port.val(valuesObject.FRITZ_PORT);
	wancic.val(valuesObject.WANCIC_URL);
	wanipc.val(valuesObject.WANIPC_URL);
	automaticDiscoveryToggle[0].checked = valuesObject.AUTOMATIC_DISCOVERY;
	toggleAutomaticDiscovery();
}

function buildConfigData(){
	return {
		REFRESH_CYCLE : refreshcycle.val(),
		WANCIC_URL : wancic.val(),
		WANIPC_URL : wanipc.val(),
		AUTOMATIC_DISCOVERY : automaticDiscoveryToggle[0].checked,
		FRITZ_IP : ip.val(),
		FRITZ_PORT : port.val()
	};
}

function getQueryParam(variable, defaultValue) {
  // Find all URL parameters
  var query = location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
  	var pair = vars[i].split('=');

    // If the query variable parameter is found, decode it to use and return it for use
    if (pair[0] === variable) {
    	return decodeURIComponent(pair[1]);
    }
}
return defaultValue || false;
}
