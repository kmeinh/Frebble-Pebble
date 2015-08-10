#include <pebble.h>
#include "appMessageManager.h"


void initConfigValuesFromPersistentStorage();
uint32_t getDefaultTimerTicks();
void setDefaultTimerTicks(uint32_t newDefaultTimerTicks);