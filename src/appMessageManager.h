#pragma once

#include <pebble.h>
#include "windowManager.h"

enum {
  MAX_UP = 0,
  MAX_DOWN = 1,
  AVAILABLE_UP = 2,
  AVAILABLE_DOWN = 3,
  UP_TIME = 4
};

void initAppMessageManager();
static void inbox_received_callback(DictionaryIterator *iterator, void *context);
static void inbox_dropped_callback(AppMessageResult reason, void *context);
static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context);
static void outbox_sent_callback(DictionaryIterator *iterator, void *context);