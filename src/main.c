#include <pebble.h>
#include "windowManager.h"
#include "appMessageManager.h"

static void timeChanged() {
  time_t temp = time(NULL);
  struct tm *tick_time = localtime(&temp);
  char bufferTime[] = "------";
  if (clock_is_24h_style() == true) {
    strftime(bufferTime, sizeof("------"), "%H%M%S", tick_time);
  } else {
   strftime(bufferTime, sizeof("------"), "%I%M%S", tick_time);
  }
  updateDate(bufferTime, ROW_TIME);
}

static void dateChanged() {
  time_t temp = time(NULL);
  struct tm *tick_time = localtime(&temp);
  char bufferDate[] = "------";
  strftime(bufferDate, sizeof("------"), "%d%m%y", tick_time);
  updateDate(bufferDate, ROW_DATE);
}

static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  if (units_changed == SECOND_UNIT) {
    timeChanged();
  }
  if (units_changed == DAY_UNIT || units_changed == MONTH_UNIT || units_changed == YEAR_UNIT) {
    dateChanged();
  }
}

static void main_window_load(Window *window) {
  window_set_background_color(window, GColorBlack);
  initWindow(window);
  initAppMessageManager();
  dateChanged();
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
  tick_timer_service_unsubscribe();
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
