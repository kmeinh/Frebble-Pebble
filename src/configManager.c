#include "configManager.h"

uint32_t refreshCycle = 5;
int timerTicksUntilUpdate = 0;
bool shouldUpdate = true;

void initConfigValuesFromPersistentStorage(){
  	if (persist_exists(REFRESH_CYCLE)){
  	  refreshCycle = persist_read_int(REFRESH_CYCLE);
  	}
  	if (persist_exists(ENABLE_AUTOMATIC_REFRESH)){
  		shouldUpdate = persist_read_bool(ENABLE_AUTOMATIC_REFRESH);
  	}
}

uint32_t getRefreshCycle(){
	return refreshCycle;
}

void setShouldUpdateFlag(bool flag) {
	shouldUpdate = flag;
	persist_write_bool(ENABLE_AUTOMATIC_REFRESH, shouldUpdate);
}

void setRefreshCycle(uint32_t newRefreshCycle){
  	refreshCycle = newRefreshCycle;
  	persist_write_int(REFRESH_CYCLE,refreshCycle);
  	setTimerTicksUntilUpdate(0);
}

int getTimerTicksUntilUpdate(){
  		if (shouldUpdate) {
		return timerTicksUntilUpdate;
	} else {
		//
		// If we should not update, return a number that is higher then 0
		return 1;
	}
}

void setTimerTicksUntilUpdate(int updatedTimerTicksUntilUpdate){
  	timerTicksUntilUpdate = updatedTimerTicksUntilUpdate;
}