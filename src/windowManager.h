#pragma once

#include <pebble.h>
  
#define NUM_X 6
#define NUM_Y 6

#define SCREEN_WIDTH 144

#define DOWNSTREAM_SYMBOL ""
#define UPSTREAM_SYMBOL ""
  
#define GRID_HEIGHT 28
#define GRID_WIDTH 24

enum {
	ROW_TIME = 0,
	ROW_DATE = 1,
	ROW_DOWNSTREAM = 2,
	ROW_UPSTREAM = 3
};

Window *s_main_window;

void initWindow(Window *window);
void deinitWindow(Window *window);
void updateBandwidthStream(uint32_t bandwidthInBits, uint32_t availableInBytes, int row);
void formatBandWidthInBitsForDisplay(char* stream, uint32_t bandwidthInBits);
void updateDate(char *formattedTime, int row);
void drawBars(float percentage, int row);
void drawBatteryStatue(float percentage);