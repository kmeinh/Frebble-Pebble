#include <pebble.h>
#include "appMessageManager.h"


void initConfigValuesFromPersistentStorage();
uint32_t getRefreshCycle();
void setRefreshCycle(uint32_t newDefaultTimerTicks);