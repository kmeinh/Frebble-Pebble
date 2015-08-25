#include "appMessageManager.h"

void initAppMessageManager() {
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);
  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
}

static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  Tuple *messageType = dict_find(iterator,MESSAGE_TYPE);
  if (messageType == NULL){
    APP_LOG(APP_LOG_LEVEL_DEBUG, "No Message Type specified, dropping message.");
    return;
  }
  switch(messageType->value->int32){
    case SET_SERVICE_DATA:
      parseServiceData(iterator);
      break;
    case SET_CONFIG_DATA:
      parseConfigData(iterator);
      break;
    case SET_ERROR:
      vibes_short_pulse();
      parseError(iterator);
      break;
  }
}

void refresh_data() {
  DictionaryIterator *iterator;
  app_message_outbox_begin(&iterator);
  dict_write_int8(iterator,MESSAGE_TYPE,GET_SERVICE_DATA);
  app_message_outbox_send();
  setTimerTicksUntilUpdate(getRefreshCycle());
}

static void parseServiceData(DictionaryIterator *iterator){
  Tuple *tuple = dict_read_first(iterator);

  uint32_t currentUpstreamInBits=0;
  uint32_t currentDownstreamInBits=0;
  uint32_t availableUpstreamInBytes=0;
  uint32_t availableDownstreamInBytes=0;
  uint32_t upTime=0;
  char connectionStatus[7];

  while (tuple != NULL) {
    switch(tuple->key) {
      case MAX_UP:
      currentUpstreamInBits = (uint32_t)tuple->value->int32;
      break;
      case MAX_DOWN:
      currentDownstreamInBits = (uint32_t)tuple->value->int32;
      break;
      case AVAILABLE_UP:
      availableUpstreamInBytes = (uint32_t)tuple->value->int32;
      break;
      case AVAILABLE_DOWN:
      availableDownstreamInBytes = (uint32_t)tuple->value->int32;
      break;
      case UPTIME:
      upTime = (uint32_t)tuple->value->int32;
      break;
      case CONNECTION_STATUS:
      snprintf(connectionStatus, 7, tuple->value->cstring);
      break;
    }
    tuple = dict_read_next(iterator);
  }
  updateBandwidthStream(currentUpstreamInBits, availableUpstreamInBytes, ROW_UPSTREAM);
  updateBandwidthStream(currentDownstreamInBits, availableDownstreamInBytes, ROW_DOWNSTREAM);
  updateUpTime(upTime);
  displayConnectionStatus(connectionStatus);
}

static void parseConfigData(DictionaryIterator *iterator){
  Tuple *tuple = dict_read_first(iterator);
  while (tuple != NULL) {
    switch(tuple->key) {
      case REFRESH_CYCLE:
        setRefreshCycle((uint32_t)tuple->value->int32);
        break;
      case ENABLE_AUTOMATIC_REFRESH:
        setShouldUpdateFlag(tuple->value->int32);
        APP_LOG(APP_LOG_LEVEL_DEBUG, "setting automatic refresh %li", tuple->value->int32);
    }
    tuple = dict_read_next(iterator);
  }
}

static void parseError(DictionaryIterator *iterator){
  Tuple *tuple = dict_read_first(iterator);
  char errorString[80];
  while (tuple != NULL) {
    switch(tuple->key) {
      case ERROR_STRING:
        APP_LOG(APP_LOG_LEVEL_DEBUG,"Error string: %s", tuple->value->cstring);
        snprintf(errorString, 80, tuple->value->cstring);
        break;
    }
    tuple = dict_read_next(iterator);
  }
  displayErrorString(errorString);
}

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}
