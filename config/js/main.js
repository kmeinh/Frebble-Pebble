$(document).ready(function(){
	defineElements();
	loadOptionsFromQueryParams();
	setupUIActions();
});


ErrorMessage = {
	"NotANumber" : "Bitte gib eine Zahl ein.",
	"Empty" : "Bitte gib einen Hostnamen oder eine IP Adresse ein."
};

var inputErrorClass = "item-input-wrapper-error";

function defineElements(){
	submitButton = $('#submit');
	automaticDiscoveryToggle = $('#automatic-discovery');
	enableAutomaticRefresh = $('#enable-automatic-refresh');
	refreshcycle = $('#refreshcycle');
	wancic = $('#wancic');
	wanipc = $('#wanipc');
	ip = $('#ip');
	port = $('#port');
	refreshcycleError = $('#refreshcycle-error');
	ipError = $('#ip-error');
	portError = $('#port-error');
}	

function setupUIActions(){
	submitButton.on('click',submitToPebbleKit);
	automaticDiscoveryToggle.on('change',toggleAutomaticDiscovery);
	enableAutomaticRefresh.on('change', toggleAutomaticRefresh);
	refreshcycle.on('keyup',refreshcycleValid);
	ip.on('keyup',ipValid);
	port.on('keyup',portValid);
}

function submitToPebbleKit(){
	if (!allFieldsValid()){
		return;
	}
	var returnTo = getQueryParam("return_to","pebblejs://close#");
	console.log("encoding"+JSON.stringify(buildConfigData()));
	document.location = returnTo + encodeURIComponent(JSON.stringify(buildConfigData()));
}

function allFieldsValid(){
	return refreshcycleValid() & ipValid() & portValid();
}

function refreshcycleValid(){
	if (isNaN(refreshcycle.val()) || isNaN(parseInt(refreshcycle.val()))){
		refreshcycleError[0].innerHTML = ErrorMessage.NotANumber;
		refreshcycle.parent().addClass(inputErrorClass);
		return false;
	}else{
		refreshcycleError[0].innerHTML = '';
		refreshcycle.parent().removeClass(inputErrorClass);
		return true;
	}
}

function ipValid(){
	if (ip.val().trim().length < 1){
		ipError[0].innerHTML = ErrorMessage.Empty;
		ip.parent().addClass(inputErrorClass);
		return false;
	}else{
		ipError[0].innerHTML = '';
		ip.parent().removeClass(inputErrorClass);
		return true;
	}
}

function portValid(){
	if (isNaN(port.val()) || isNaN(parseInt(port.val()))){
		portError[0].innerHTML = ErrorMessage.NotANumber;
		port.parent().addClass(inputErrorClass);
		return false;
	}else{
		portError[0].innerHTML = '';
		port.parent().removeClass(inputErrorClass);
		return true;
	}
}

function toggleAutomaticDiscovery(){
	if (automaticDiscoveryToggle[0].checked){
		$("#service-urls-wrapper").css("max-height","0px");
	}else{
		$("#service-urls-wrapper").css("max-height","200px");
	}
}

function toggleAutomaticRefresh() {
	if (enableAutomaticRefresh[0].checked) {
		$("#refreshcycle-wrapper").css("max-height","150px");
	} else {
		$("#refreshcycle-wrapper").css("max-height","0px");
	}

}

function loadOptionsFromQueryParams(){
	var valueString = getQueryParam("values","");
	if (valueString == ""){
		return;
	}
	valuesObject = JSON.parse(decodeURIComponent(valueString));
	refreshcycle.val(valuesObject.REFRESH_CYCLE);
	enableAutomaticRefresh[0].checked = valuesObject.ENABLE_AUTOMATIC_REFRESH;
	ip.val(valuesObject.FRITZ_IP);
	port.val(valuesObject.FRITZ_PORT);
	wancic.val(valuesObject.WANCIC_URL);
	wanipc.val(valuesObject.WANIPC_URL);
	automaticDiscoveryToggle[0].checked = valuesObject.AUTOMATIC_DISCOVERY;
	toggleAutomaticDiscovery();
	toggleAutomaticRefresh();
}

function buildConfigData(){
	return {
		REFRESH_CYCLE : refreshcycle.val(),
		ENABLE_AUTOMATIC_REFRESH : enableAutomaticRefresh[0].checked,
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
