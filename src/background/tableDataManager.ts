import DataStore from "../DataStore";
import { TableData } from "../types";

let dataStore = new DataStore();

chrome.action.onClicked.addListener((tab) => {
  if (tab.id === undefined || tab.url === undefined) return;

  // TODO:: move this to content script
  // send a message to the active tab and have content script run the download

  const tabUrl = tab.url;
  console.log("clicked tablemanager");
  // Create CSV
  const csvHeader = (dataStore.headersStore || []).join(",");
  const csvRows = (dataStore.dataStore || []).map((row) => row.join(","));
  let csvContent = csvHeader + "\n" + csvRows.join("\n");

  // Create Blob and URL
  const blob = new Blob([csvContent], { type: "text/csv" });

  // Construct filename
  const domain = new URL(tabUrl).hostname;
  // today's date in mm-dd-yyyy format
  const date = new Date().toLocaleDateString("en-US");
  const filename = `${domain}_${date}_table.csv`;

  // Download the file

  const reader = new FileReader();
  reader.onload = () => {
    const buffer = reader.result;
    // check for buffer being ArrayBufferLike
    if (!(buffer instanceof ArrayBuffer)) return;
    const blobUrl = `data:${blob.type};base64,${btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    )}`;

    // not really working
    chrome.downloads.download({
      url: blobUrl,
      filename,
      saveAs: true,
      conflictAction: "uniquify",
    });
  };
  reader.readAsArrayBuffer(blob);
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
