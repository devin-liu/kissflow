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
    chrome.history.getVisits({ url: tab.url }, (visitItems) => {
      console.log("visitItems", visitItems);
      const lastVisit = visitItems[visitItems.length - 1];
      if (!lastVisit?.visitTime) return;
      const lastVisitTime = lastVisit.visitTime;
      const now = Date.now();
      const timeSinceLastVisit = now - lastVisitTime;
      console.log("timeSinceLastVisit", timeSinceLastVisit);
    });

    const thisUrl = new URL(tab.url);

    chrome.history.search(
      {
        text: thisUrl.hostname,
        endTime: Date.now(),
        maxResults: 100,
      },
      (historyItems) => {
        console.log("like tab historyItems", historyItems);
      }
    );
  }
  chrome.history.search(
    {
      text: "",
      startTime: 0,
      maxResults: 100,
    },
    (historyItems) => {
      console.log("historyItems", historyItems);
    }
  );
});

chrome.tabs.onRemoved.addListener((tabId) => {
  endTimer(tabId);
});

chrome.history.onVisited.addListener((historyItem) => {
  console.log("NewhistoryItem", historyItem);

  chrome.history.search(
    {
      text: "",
      endTime: Date.now(),
      maxResults: 20,
    },
    (historyItems) => {
      console.log("like tab last 20 historyItems", historyItems);
    }
  );
  // todo: query all relevant history items and send to OpenAI
  // try to predict next tab
});

export {};
