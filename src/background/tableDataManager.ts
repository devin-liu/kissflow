import { TableData } from "../types/table";

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
            let csvContent = table.headers.join(",") + "\n";
            table.rows.forEach((row) => {
              csvContent += row.join(",") + "\n";
            });

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
});

export {};
