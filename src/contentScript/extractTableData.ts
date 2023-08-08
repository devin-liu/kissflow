import { TableData } from "../types";

// Download file
const downloadFile = (url: string, filename: string) => {
  chrome.downloads.download({ url, filename });
};

// Function to extract tables
export const extractTables = (): TableData[] => {
  // TODO:: add support for different table container types
  const tables = document.querySelectorAll("table");
  const results: TableData[] = [];

  tables.forEach((table, index) => {
    const headers: string[] = [];
    const rows: string[][] = [];

    // Extract headers
    // TODO:: add support for different header types
    table.querySelectorAll("th").forEach((header) => {
      headers.push(header.textContent?.trim() || "");
    });

    // Extract rows
    // TODO:: add support for different row types
    table.querySelectorAll("tr").forEach((row, rowIndex) => {
      if (rowIndex === 0) return; // Skip the header row
      const rowArray: string[] = [];
      row.querySelectorAll("td").forEach((cell) => {
        rowArray.push(cell.textContent?.trim() || "");
      });
      rows.push(rowArray);
    });

    // Show header in console
    console.log(
      `Table ${
        index + 1
      }: Is this the correct header information?\n${headers.join(", ")}`
    );

    // Show row in console
    console.log(`Table ${index + 1}: Is this the correct row information?`);

    results.push(rows);
  });

  return results;
};

// When content script is injected
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("content script received message", request);
  if (request.action === "extractTables") {
    const tables = extractTables();
    sendResponse(tables);
  }
});

// Listen to tab close event and send to background
window.addEventListener("unload", () => {
  chrome.runtime.sendMessage({ action: "tabClosed" });
});
