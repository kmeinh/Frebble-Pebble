#include "appMessageManager.h"

void initAppMessageManager() {
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);
  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
}

static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "received");
  Tuple *tuple = dict_read_first(iterator);

  uint32_t currentUpstreamInBits=0;
  uint32_t currentDownstreamInBits=0;
  uint32_t availableUpstreamInBytes=0;
  uint32_t availableDownstreamInBytes=0;
  uint32_t upTime=0;

  while (tuple != NULL) {
    switch(tuple->key) {
      case MAX_UP:
        APP_LOG(APP_LOG_LEVEL_DEBUG, "inbox received max up: %li", tuple->value->int32);
        currentUpstreamInBits = (uint32_t)tuple->value->int32;
        break;
      case MAX_DOWN:
        APP_LOG(APP_LOG_LEVEL_DEBUG, "inbox received max down: %li", tuple->value->int32);
        currentDownstreamInBits = (uint32_t)tuple->value->int32;
        break;
      case AVAILABLE_UP:
        APP_LOG(APP_LOG_LEVEL_DEBUG, "inbox received available up: %li", tuple->value->int32);
        availableUpstreamInBytes = (uint32_t)tuple->value->int32;
        break;
      case AVAILABLE_DOWN:
        APP_LOG(APP_LOG_LEVEL_DEBUG, "inbox received available down: %li", tuple->value->int32);
        availableDownstreamInBytes = (uint32_t)tuple->value->int32;
        break;
      case UP_TIME:
        APP_LOG(APP_LOG_LEVEL_DEBUG, "inbox received up time: %li", tuple->value->int32);
        upTime = (uint32_t)tuple->value->int32;
        break;
    }
    tuple = dict_read_next(iterator);
  }
  updateBandwidthStream(currentUpstreamInBits, availableUpstreamInBytes, ROW_UPSTREAM);
  updateBandwidthStream(currentDownstreamInBits, availableDownstreamInBytes, ROW_DOWNSTREAM);
  updateUpTime(upTime);
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
