#include "configManager.h"

uint32_t refreshCycle = 5;

void initConfigValuesFromPersistentStorage(){
  if (persist_exists(REFRESH_CYCLE)){
    refreshCycle = persist_read_int(REFRESH_CYCLE);
  }
}

uint32_t getRefreshCycle(){
  return refreshCycle;
}

void setRefreshCycle(uint32_t newRefreshCycle){
  refreshCycle = newRefreshCycle;
  persist_write_int(REFRESH_CYCLE,refreshCycle);
}
