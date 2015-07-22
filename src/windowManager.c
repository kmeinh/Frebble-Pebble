#include "windowManager.h"

TextLayer *textGrid[NUM_Y][NUM_X];
  
void initWindow(Window *window) {
  
  for (int y = 0; y < NUM_Y; y++) {
    for (int x = 0; x < NUM_X; x++) {
      TextLayer *label = text_layer_create(GRect(x * GRID_WIDTH, y * GRID_HEIGHT, GRID_WIDTH, GRID_HEIGHT));
      text_layer_set_text_alignment(label, GTextAlignmentCenter);
      text_layer_set_text(label, "A");
      //text_layer_set_font(label, fonts_get_system_font(FONT_KEY_GOTHIC_28));
      layer_add_child(window_get_root_layer(window), (Layer*) label);
      textGrid[y][x] = label;
    }
  }
}

void deinitWindow(Window *window) {
  for (int y = 0; y < NUM_Y; y++) {
    for (int x = 0; x < NUM_X; x++) {
      text_layer_destroy(textGrid[y][x]);
    }
  }
}