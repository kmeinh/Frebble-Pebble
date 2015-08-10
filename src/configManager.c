#include "configManager.h"

uint32_t defaultTimerTicks = 5;
int automaticDiscovery = 1;
char wanipcUrl[1000]; 
char wancicUrl[1000];

void initConfigValuesFromPersistentStorage(){
  if (persist_exists(REFRESH_CYCLE)){
    defaultTimerTicks = persist_read_int(REFRESH_CYCLE);
  }
  if(persist_exists(WANCIC_URL)){
    persist_read_string(WANCIC_URL,wancicUrl,1000);
  }
  if(persist_exists(WANIPC_URL)){
    persist_read_string(WANIPC_URL,wanipcUrl,1000);
  }
  if(persist_exists(AUTOMATIC_DISCOVERY)){
    automaticDiscovery = persist_read_int(AUTOMATIC_DISCOVERY);
  }
}

uint32_t getDefaultTimerTicks(){
  return defaultTimerTicks;
}

void setDefaultTimerTicks(uint32_t newDefaultTimerTicks){
  defaultTimerTicks = newDefaultTimerTicks;
}