#include <pebble.h>
#include "windowManager.h"

static Window *s_main_window;

static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "tick");
}

static void main_window_load(Window *window) {
  initWindow(window);
}

static void main_window_unload(Window *window) {
  
}
  
static void init() {
  s_main_window = window_create();

  tick_timer_service_subscribe(SECOND_UNIT, tick_handler);

  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload
  });
  
  window_stack_push(s_main_window, true);
}

static void deinit() {
  deinitWindow(s_main_window);
  window_destroy(s_main_window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
