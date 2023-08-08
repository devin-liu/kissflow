import DataStore from "../DataStore";
import { TableData } from "../types";

let dataStore = new DataStore();

chrome.action.onClicked.addListener((tab) => {
  if (tab.id === undefined || tab.url === undefined) return;
  console.log("clicked tablemanager");
  // Inject content script
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["contentScript.bundle.js"],
    })
    .then(() => {
      if (!tab.id || typeof tab.url !== "string") return;
      const tabId = tab.id;
      const tabUrl = tab.url;
      chrome.tabs.sendMessage(
        tabId,
        { action: "extractTables" },
        (tables: TableData[]) => {
          if (!tables) return;
          tables.forEach((table, index) => {
            // Create CSV
            let csvContent = table.join(",") + "\n";

            // Create Blob and URL
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);

            // Construct filename
            const domain = new URL(tabUrl).hostname;
            const date = new Date().toISOString();
            const filename = `${domain}_${date}_table_${index + 1}.csv`;

            // Download the file
            chrome.downloads.download({ url, filename });
          });
        }
      );
    });
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "tabClosed") {
    // Handle tab close if needed
  }

  if (request.action === "updateDataStore") {
    // Handle data store update
    dataStore = request.data;
  }

  if (
    request.action === "previewDataStore" ||
    request.action === "updateDataStore"
  ) {
    // send dataStore to content script postmessage
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;
      const tab = tabs[0];
      if (!tab.id) return;
      chrome.tabs.sendMessage(tab.id, {
        action: "previewDataStore",
        data: dataStore,
      });
    });
  }
});

export {};
