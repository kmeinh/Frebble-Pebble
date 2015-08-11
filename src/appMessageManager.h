#pragma once

#include <pebble.h>
#include "windowManager.h"
#include "configManager.h"

enum {
  MAX_UP = 0,
  MAX_DOWN = 1,
  AVAILABLE_UP = 2,
  AVAILABLE_DOWN = 3,
  UPTIME = 4,
  CONNECTION_STATUS = 5,
  REFRESH_CYCLE = 6,
  WANCIC_URL = 7,
  WANIPC_URL = 8,
  AUTOMATIC_DISCOVERY = 9,
  FRITZ_IP = 10,
  FRITZ_PORT = 11,
  MESSAGE_TYPE = 12,
  ERROR_STRING = 13
};

enum {
  SET_SERVICE_DATA = 0,
  SET_CONFIG_DATA = 1,
  GET_SERVICE_DATA = 2,
  SET_ERROR = 3
};

void initAppMessageManager();
static void inbox_received_callback(DictionaryIterator *iterator, void *context);
static void inbox_dropped_callback(AppMessageResult reason, void *context);
static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context);
static void outbox_sent_callback(DictionaryIterator *iterator, void *context);
static void parseServiceData(DictionaryIterator *iterator);
static void parseConfigData(DictionaryIterator *iterator);
static void parseError(DictionaryIterator *iterator);