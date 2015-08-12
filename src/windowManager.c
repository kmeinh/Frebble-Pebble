#include "windowManager.h"
#include "math.h"
//date time
TextLayer *dateTimeGrid[2][NUM_X];
char dateTimeBuffer[2][NUM_X][2];

//normal mode
TextLayer *textGrid[NUM_Y][NUM_X];
char normalTextBuffer[NUM_Y][NUM_X][2];
int currentDisplayMode;
static InverterLayer *downStreamInverterLayer;
static InverterLayer *upStreamInverterLayer;

//error mode
TextLayer *errorGrid[2];
char errorTextBuffer[2][80];

Window *s_main_window;

void initWindow(Window *window, int displayMode) {
  deinitWindow(window);
  switch (displayMode){
    case ERROR:
    initErrorWindow(window);
    break;
    case NORMAL:
    initNormalWindow(window);
    break;
    default:
    APP_LOG(APP_LOG_LEVEL_ERROR, "Unknown display mode %d. Window destroyed.",displayMode);
  }
  currentDisplayMode = displayMode;
}

void initDateTime(Window *window){
  for (int y = 0; y < 2; y++) {
    for (int x = 0; x < NUM_X; x++) {
      TextLayer *label = text_layer_create(GRect(x * GRID_WIDTH, (y * GRID_HEIGHT) - 4, GRID_WIDTH, GRID_HEIGHT));
      text_layer_set_text_color(label, GColorWhite);
      text_layer_set_background_color(label, GColorClear);
      text_layer_set_font(label, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
      text_layer_set_text_alignment(label, GTextAlignmentCenter);
      text_layer_set_text(label, "");
      layer_add_child(window_get_root_layer(window), (Layer*) label);
      dateTimeGrid[y][x] = label;
      dateTimeBuffer[y][x][1] = '\0';
    }
  }
}

static void initNormalWindow(Window *window){
  accel_tap_service_unsubscribe();

  // TextLayer
  for (int y = 2; y < NUM_Y; y++) {
    for (int x = 0; x < NUM_X; x++) {
      TextLayer *label = text_layer_create(GRect(x * GRID_WIDTH, (y * GRID_HEIGHT) - 4, GRID_WIDTH, GRID_HEIGHT));
      text_layer_set_text_color(label, GColorWhite);
      text_layer_set_background_color(label, GColorClear);
      text_layer_set_font(label, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
      text_layer_set_text_alignment(label, GTextAlignmentCenter);
      text_layer_set_text(label, "");
      layer_add_child(window_get_root_layer(window), (Layer*) label);
      textGrid[y][x] = label;
      normalTextBuffer[y][x][1] = '\0';
    }
  }
  // InverterLayer
  downStreamInverterLayer = inverter_layer_create(GRect(0, GRID_HEIGHT * ROW_DOWNSTREAM, 0, GRID_HEIGHT));
  upStreamInverterLayer = inverter_layer_create(GRect(0, GRID_HEIGHT * ROW_UPSTREAM, 0, GRID_HEIGHT));
  layer_add_child(window_get_root_layer(window), inverter_layer_get_layer(downStreamInverterLayer));
  layer_add_child(window_get_root_layer(window), inverter_layer_get_layer(upStreamInverterLayer));
}

static void initErrorWindow(Window *window){
  accel_tap_service_subscribe(tap_handler);

  TextLayer *errorString = text_layer_create(GRect(0,((ROW_DOWNSTREAM)*GRID_HEIGHT)-8,GRID_WIDTH*NUM_X,3*GRID_HEIGHT+12));
  text_layer_set_text_color(errorString, GColorWhite);
  text_layer_set_background_color(errorString, GColorClear);
  text_layer_set_font(errorString, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  text_layer_set_text_alignment(errorString, GTextAlignmentCenter);
  text_layer_set_text(errorString,"");
  layer_add_child(window_get_root_layer(window), (Layer*) errorString);
  errorGrid[0]=errorString;

  TextLayer *shakeString = text_layer_create(GRect(0,((ROW_UPTIME)*GRID_HEIGHT)-4,GRID_WIDTH*NUM_X,GRID_HEIGHT+4));
  text_layer_set_text_color(shakeString, GColorWhite);
  text_layer_set_background_color(shakeString, GColorClear);
  text_layer_set_font(shakeString, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
  text_layer_set_text_alignment(shakeString, GTextAlignmentCenter);
  text_layer_set_text(shakeString,"");
  layer_add_child(window_get_root_layer(window), (Layer*) shakeString);
  errorGrid[1]=shakeString;

  snprintf(errorTextBuffer[1],80,"ShakeToRetry");
  text_layer_set_text(errorGrid[1],errorTextBuffer[1]);  
}

static void tap_handler(AccelAxisType axis, int32_t direction){
  APP_LOG(APP_LOG_LEVEL_DEBUG,"tapped");
  DictionaryIterator *iterator;
  app_message_outbox_begin(&iterator);
  dict_write_int8(iterator,MESSAGE_TYPE,GET_SERVICE_DATA);
  app_message_outbox_send();
}


void updateUpTime(uint32_t upTime) {
  if (currentDisplayMode!=NORMAL){
    initWindow(s_main_window,NORMAL);
  }
  int y = ROW_UPTIME;
  char displayableUptime[7];
  formatUpTimeInSecondsForDisplay(displayableUptime, upTime);
  for (int x = 0; x < NUM_X; x++) {
    normalTextBuffer[y][x][0] = displayableUptime[x];
    text_layer_set_text(textGrid[y][x], normalTextBuffer[y][x]);
  }
}

void formatUpTimeInSecondsForDisplay(char *time, uint32_t upTime) {
  if (upTime < 60) {
    snprintf(time, 7, "%05lis", upTime);
  } else if (upTime < 3600) {
    snprintf(time, 7, "%02lim%02lis", (upTime / 60), (upTime % 60));
  } else if (upTime < 86400) {
    snprintf(time, 7, "%02lih%02lim", (upTime / 3600) , ((upTime % 3600) / 60));
  } else if (upTime < 604800) {
    snprintf(time, 7, "%02lid%02lih", (upTime / 86400) , ((upTime % 86400) / 3600));
  } else if (upTime < 60480000) {
    snprintf(time, 7, "%02liw%02lid", (upTime / 604800) , ((upTime % 604800) / 86400));
  } else {
    snprintf(time, 7, "%05liw", (upTime / 604800));
  }
}

void updateBandwidthStream(uint32_t bandwidthInBits, uint32_t availableInBytes, int row) {
  if (currentDisplayMode!=NORMAL){
    initWindow(s_main_window,NORMAL);
  }
  int y = row;
  char formattedBandwidth[6];

  float percentage = ((availableInBytes / (float)(bandwidthInBits/8.0)));
  drawBars(percentage, row);

  formatBandWidthInBitsForDisplay(formattedBandwidth, bandwidthInBits);

  for (int x = 1; x < NUM_X; x++) {
    normalTextBuffer[y][x][0] = formattedBandwidth[x - 1];
    text_layer_set_text(textGrid[y][x], normalTextBuffer[y][x]);
  }
  text_layer_set_text(textGrid[y][0], ((row == ROW_UPSTREAM) ? UPSTREAM_SYMBOL : DOWNSTREAM_SYMBOL));
}

void updateDate(char *formattedDate) {
  int y = ROW_DATE;
  for (int x = 0; x < NUM_X; x++) {
    dateTimeBuffer[y][x][0] = formattedDate[x];
    text_layer_set_text(dateTimeGrid[y][x], dateTimeBuffer[y][x]);
  }
}

void updateTime(char *formattedTime) {
  int y = ROW_TIME;
  for (int x = 0; x < NUM_X; x++) {
    dateTimeBuffer[y][x][0] = formattedTime[x];
    text_layer_set_text(dateTimeGrid[y][x], dateTimeBuffer[y][x]);
  }
}

void drawBars(float percentage, int row) {
  if (currentDisplayMode!=NORMAL){
    initWindow(s_main_window,NORMAL);
  }
  APP_LOG(APP_LOG_LEVEL_DEBUG, "percentage: %d, row: %d", (int)(percentage * SCREEN_WIDTH), row);
  if (row == ROW_UPSTREAM) {
    layer_remove_from_parent(inverter_layer_get_layer(upStreamInverterLayer));
    inverter_layer_destroy(upStreamInverterLayer);
    upStreamInverterLayer = inverter_layer_create(GRect(0, GRID_HEIGHT * ROW_UPSTREAM, (percentage * SCREEN_WIDTH), GRID_HEIGHT));
    layer_add_child(window_get_root_layer(s_main_window), inverter_layer_get_layer(upStreamInverterLayer)); 
  } else {
    layer_remove_from_parent(inverter_layer_get_layer(downStreamInverterLayer));
    inverter_layer_destroy(downStreamInverterLayer);
    downStreamInverterLayer = inverter_layer_create(GRect(0, GRID_HEIGHT * ROW_DOWNSTREAM, (percentage * SCREEN_WIDTH), GRID_HEIGHT));
    layer_add_child(window_get_root_layer(s_main_window), inverter_layer_get_layer(downStreamInverterLayer)); 
  }
  // layer_set_frame(inverter_layer_get_layer(upStreamInverterLayer), GRect(0, GRID_HEIGHT * ROW_DOWNSTREAM, (int)(percentage * SCREEN_WIDTH), GRID_HEIGHT));
} 

void formatBandWidthInBitsForDisplay(char* stream, uint32_t bandwidthInBits) {

  double byte = bandwidthInBits / 8.0;
  double kb = byte / 1024.0;

  if (kb < 1000) {
    // display: 500KB
    snprintf(stream, 6, "%03dKB", ((int) roundf(kb)));
  } else if (kb < 10000) {
    // display 1.5MB
    snprintf(stream, 6, "%1d.%1dMB", (int)(roundf(10 * (kb/1024.0)) / 10), (((int)((kb/1024) * 10))%10));
  } else {
    // display: 010MB
    snprintf(stream, 6, "%03dMB", (int) roundf(kb/1024));
  }  
}

void displayConnectionStatus(char* status) {
  if (currentDisplayMode!=NORMAL){
    initWindow(s_main_window,NORMAL);
  }
  int y = ROW_STATUS;
  for (int x = 0; x < NUM_X; x++) {
    normalTextBuffer[y][x][0] = status[x];
    text_layer_set_text(textGrid[y][x], normalTextBuffer[y][x]);
  }
}

void displayErrorString(char* error) {
  if (currentDisplayMode!=ERROR){
    initWindow(s_main_window,ERROR);
  }
  snprintf(errorTextBuffer[0],80,error);
  text_layer_set_text(errorGrid[0],errorTextBuffer[0]);

}

void deinitWindow(Window *window) {
  switch (currentDisplayMode){
    case ERROR:
      deinitErrorWindow(window);
      break;
    case NORMAL:
      deinitNormalWinow(window);
      break;
  }
}

static void deinitErrorWindow(Window *window){
  for (int i = 0; i < 2;i++){
    text_layer_destroy(errorGrid[i]);
  }
}

static void deinitNormalWinow(Window *window){
  for (int y = 0; y < NUM_Y; y++) {
    for (int x = 0; x < NUM_X; x++) {
      text_layer_destroy(textGrid[y][x]);
    }
  }
  inverter_layer_destroy(downStreamInverterLayer);
  inverter_layer_destroy(upStreamInverterLayer);
}