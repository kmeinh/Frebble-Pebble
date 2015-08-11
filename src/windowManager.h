#pragma once

#include <pebble.h>
#include <string.h>
#include "appMessageManager.h"
  
#define NUM_X 6
#define NUM_Y 6

#define SCREEN_WIDTH 144

#define DOWNSTREAM_SYMBOL "D:"
#define UPSTREAM_SYMBOL "U:"
  
#define GRID_HEIGHT 28
#define GRID_WIDTH 24

//display mode
enum {
	ERROR = 0,
	NORMAL = 1
};

//rows for normal grid view
enum {
	ROW_TIME = 0,
	ROW_DATE = 1,
	ROW_DOWNSTREAM = 2,
	ROW_UPSTREAM = 3,
	ROW_STATUS = 4,
	ROW_UPTIME = 5
};

Window *s_main_window;
int currentDisplayMode;

void initWindow(Window *window, int displayMode);
void initDateTime(Window *window);
static void initNormalWindow(Window *window);
static void initErrorWindow(Window *window);
void deinitWindow(Window *window);
static void deinitNormalWinow(Window *window);
void updateBandwidthStream(uint32_t bandwidthInBits, uint32_t availableInBytes, int row);
void updateUpTime(uint32_t upTime);
void formatBandWidthInBitsForDisplay(char* stream, uint32_t bandwidthInBits);
void formatUpTimeInSecondsForDisplay(char *time, uint32_t upTime);
void updateDate(char *formattedTime);
void updateTime(char *formattedTime);
void drawBars(float percentage, int row);
void displayConnectionStatus(char* status);
void displayErrorString(char* error);
static void deinitErrorWindow(Window *window);
static void tap_handler(AccelAxisType axis, int32_t direction);