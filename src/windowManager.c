#include "windowManager.h"
#include "math.h"

TextLayer *textGrid[NUM_Y][NUM_X];
static InverterLayer *downStreamInverterLayer;
static InverterLayer *upStreamInverterLayer;
char textBuffer[NUM_Y][NUM_X][2];

Window *s_main_window;

void initWindow(Window *window) {
  // TextLayer
  for (int y = 0; y < NUM_Y; y++) {
    for (int x = 0; x < NUM_X; x++) {
      TextLayer *label = text_layer_create(GRect(x * GRID_WIDTH, (y * GRID_HEIGHT) - 4, GRID_WIDTH, GRID_HEIGHT));
      text_layer_set_text_color(label, GColorWhite);
      text_layer_set_background_color(label, GColorClear);
      text_layer_set_font(label, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
      text_layer_set_text_alignment(label, GTextAlignmentCenter);
      text_layer_set_text(label, "A");
      layer_add_child(window_get_root_layer(window), (Layer*) label);
      textGrid[y][x] = label;
      textBuffer[y][x][1] = '\0';
    }
  }
  // InverterLayer
  downStreamInverterLayer = inverter_layer_create(GRect(0, GRID_HEIGHT * ROW_DOWNSTREAM, NUM_X * GRID_WIDTH, GRID_HEIGHT));
  upStreamInverterLayer = inverter_layer_create(GRect(0, GRID_HEIGHT * ROW_UPSTREAM, NUM_X * GRID_WIDTH, GRID_HEIGHT));
  layer_add_child(window_get_root_layer(window), inverter_layer_get_layer(downStreamInverterLayer));
  layer_add_child(window_get_root_layer(window), inverter_layer_get_layer(upStreamInverterLayer));
}

void updateBandwidthStream(uint32_t bandwidthInBits, uint32_t availableInBytes, int row) {

  int y = row;
  char formattedBandwidth[6];

  float percentage = ((availableInBytes / (float)(bandwidthInBits/8.0)));
  drawBars(percentage, row);

  formatBandWidthInBitsForDisplay(formattedBandwidth, bandwidthInBits);

  for (int x = 1; x < NUM_X; x++) {
    textBuffer[y][x][0] = formattedBandwidth[x - 1];
    text_layer_set_text(textGrid[y][x], textBuffer[y][x]);
  }
  text_layer_set_text(textGrid[y][0], "");
}

void updateDate(char *formattedTime, int row) {
  int y = row;
  for (int x = 0; x < NUM_X; x++) {
    textBuffer[y][x][0] = formattedTime[x];
    text_layer_set_text(textGrid[y][x], textBuffer[y][x]);
  }
}

void drawBars(float percentage, int row) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "percentage: %d, row: %d", (int)(percentage * SCREEN_WIDTH), row);
  if (row == ROW_UPSTREAM) {
    layer_remove_from_parent(inverter_layer_get_layer(upStreamInverterLayer));
    upStreamInverterLayer = inverter_layer_create(GRect(0, GRID_HEIGHT * ROW_UPSTREAM, (percentage * SCREEN_WIDTH), GRID_HEIGHT));
    layer_add_child(window_get_root_layer(s_main_window), inverter_layer_get_layer(upStreamInverterLayer)); 
  } else {
    layer_remove_from_parent(inverter_layer_get_layer(downStreamInverterLayer));
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
    snprintf(stream, 6, "%03dNB", (int) roundf(kb/1024));
  }  
}

void deinitWindow(Window *window) {
  for (int y = 0; y < NUM_Y; y++) {
    for (int x = 0; x < NUM_X; x++) {
      text_layer_destroy(textGrid[y][x]);
    }
  }
  inverter_layer_destroy(downStreamInverterLayer);
  inverter_layer_destroy(upStreamInverterLayer);
}