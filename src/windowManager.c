#include "windowManager.h"

TextLayer *textGrid[NUM_Y][NUM_X];
char textBuffer[NUM_Y][NUM_X][2];
  
void initWindow(Window *window) {
  
  for (int y = 0; y < NUM_Y; y++) {
    for (int x = 0; x < NUM_X; x++) {
      TextLayer *label = text_layer_create(GRect(x * GRID_WIDTH, (y * GRID_HEIGHT) - 4, GRID_WIDTH, GRID_HEIGHT));
      text_layer_set_font(label, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
      text_layer_set_text_alignment(label, GTextAlignmentCenter);
      text_layer_set_text(label, "A");
      layer_add_child(window_get_root_layer(window), (Layer*) label);
      textGrid[y][x] = label;
      textBuffer[y][x][1] = '\0';
    }
  }
}

void updateDownStream(int downStreamInBits) {
  
  int y = 2;
  for (int x = 1; x < NUM_X; x++) {
    textBuffer[y][x][0] = downStream[x - 1];
    APP_LOG(APP_LOG_LEVEL_DEBUG, "%s", textBuffer[y][x]);
    text_layer_set_text(textGrid[y][x], textBuffer[y][x]);
  }
  text_layer_set_text(textGrid[y][0], "");
}

void updateTime() {

}

void deinitWindow(Window *window) {
  for (int y = 0; y < NUM_Y; y++) {
    for (int x = 0; x < NUM_X; x++) {
      text_layer_destroy(textGrid[y][x]);
    }
  }
}