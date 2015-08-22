#include <pebble.h>
#include "windowManager.h"
#include "appMessageManager.h"
#include "configManager.h"

static void timeChanged() {
  time_t temp = time(NULL);
  struct tm *tick_time = localtime(&temp);
  char bufferTime[] = "------";
  if (clock_is_24h_style() == true) {
    strftime(bufferTime, sizeof("------"), "%H%M%S", tick_time);
  } else {
   strftime(bufferTime, sizeof("------"), "%I%M%S", tick_time);
  }
  updateTime(bufferTime);
}

static void dateChanged() {
  time_t temp = time(NULL);
  struct tm *tick_time = localtime(&temp);
  char bufferDate[] = "------";
  strftime(bufferDate, sizeof("------"), "%d%m%y", tick_time);
  updateDate(bufferDate);
}

static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  // log memory usage
  //APP_LOG(APP_LOG_LEVEL_DEBUG, "Memory usage used: %d, free: %d", heap_bytes_used(), heap_bytes_free());
  if (units_changed == SECOND_UNIT) {
    timeChanged();
  }
  if (units_changed == DAY_UNIT || units_changed == MONTH_UNIT || units_changed == YEAR_UNIT) {
    dateChanged();
  }
  if (units_changed == SECOND_UNIT && currentDisplayMode!=ERROR) {
    if (getTimerTicksUntilUpdate() == 0) {
      refresh_data();
    } else{
      setTimerTicksUntilUpdate(getTimerTicksUntilUpdate()-1);
    }
  }
}

static void tap_handler(AccelAxisType axis, int32_t direction){
  APP_LOG(APP_LOG_LEVEL_DEBUG,"tapped");
  refresh_data();
}

static void main_window_load(Window *window) {
  window_set_background_color(window, GColorBlack);
  initDateTime(window);
  initWindow(window,NORMAL);
  dateChanged();
  timeChanged();
  accel_tap_service_subscribe(tap_handler);
}

static void main_window_unload(Window *window) {
  
}
  
static void init() {
  initAppMessageManager();
  
  initConfigValuesFromPersistentStorage();

  s_main_window = window_create();
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload
  });
  window_stack_push(s_main_window, true);

  tick_timer_service_subscribe(SECOND_UNIT, tick_handler);
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
