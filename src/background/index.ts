interface TabInfo {
  url: string;
  startTime: number;
}

const activeTabs: { [tabId: number]: TabInfo } = {};

const startTimer = (tabId: number, url: string) => {
  activeTabs[tabId] = {
    url: url,
    startTime: Date.now(),
  };
};

const endTimer = async (tabId: number) => {
  const tabInfo = activeTabs[tabId];
  if (!tabInfo) return;

  const visitDuration = Date.now() - tabInfo.startTime;
  const storageData = await chrome.storage.local.get("visitDurationMap");
  const visitDurationMap = storageData.visitDurationMap || {};

  visitDurationMap[tabInfo.url] = visitDuration;
  chrome.storage.local.set({ visitDurationMap });

  delete activeTabs[tabId];
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    startTimer(tabId, tab.url);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  endTimer(tabId);
});

export {};
