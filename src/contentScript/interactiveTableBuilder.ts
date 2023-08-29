import DataStore from "../DataStore";
import injectTablePreview from "../injectTablePreview";

const dataStore = new DataStore();

function trackTextInput(textInput: HTMLInputElement) {
  let beforeValue = "";
  let afterValue = "";

  // Debounce function
  const debounce = (
    func: { (): void; apply?: any },
    delay: number | undefined
  ) => {
    let timeout: string | number | NodeJS.Timeout | undefined;
    return function (...args: any) {
      clearTimeout(timeout);
      // @ts-ignore
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Event listener function
  const handleInput = (event: { target: any }) => {
    const inputElement = event.target;

    // When the user first interacts, save the before value
    if (beforeValue === "") {
      beforeValue = inputElement.value;
    }

    // Use the debounced function to save the after value
    const debouncedSaveAfter = debounce(() => {
      afterValue = inputElement.value;
      console.log("Before:", beforeValue);
      console.log("After:", afterValue);
      console.log("URL:", window.location.href);

      // Reset beforeValue for the next interaction
      beforeValue = "";
    }, 50);

    debouncedSaveAfter();
  };

  // Add event listeners
  textInput.addEventListener("input", handleInput);
}

// // watch for edits to text inputs
function watchTextEdits() {
  document.querySelectorAll("input").forEach((input) => {
    trackTextInput(input);
  });

  // A mutation observer that checks for new input elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLInputElement) {
          trackTextInput(node);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function watchTables() {
  console.log("interactiveTableBuilder.ts");
  // Add event listeners to existing tables
  document.querySelectorAll("table").forEach((table) => {
    table.addEventListener("click", handleTableClick);
  });

  // A mutation observer that checks for new table elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement && node.tagName === "TABLE") {
          node.addEventListener("click", handleTableClick);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function handleLoad() {
  watchTables();
  injectTablePreview();
  watchTextEdits();
}

if (document.readyState === "complete") {
  handleLoad();
} else {
  window.addEventListener("load", handleLoad);
}

function normalizeRowDataToTableHeaders(
  rowData: string[],
  headers: string[]
): string[] {
  const normalizedRowData: string[] = [];
  console.log("normalizeRowDataToTableHeaders", rowData, headers);
  headers.forEach((header) => {
    const index = headers.indexOf(header);
    normalizedRowData.push(rowData[index]);
  });

  return normalizedRowData;
}

// function that checks for table headers and adds them to the data store
function checkForHeaders(table: HTMLTableElement): void {
  const thead = table.querySelector("thead");
  if (!thead) return;
  const headers = extractTheadContent(thead);
  dataStore.setHeaders(headers);
  dataStore.trackAction(
    "setHeaders",
    headers.toString(),
    (thead.cloneNode() as HTMLTableSectionElement).outerHTML
  );
}

// function for if a header row is clicked, set headers
function handleHeaderClick(event: MouseEvent): void {
  console.log("handleHeaderClick", event.target);
  const target = event.target as HTMLElement;
  const row = target.closest("tr");

  if (!row) return;

  const theadElement = row.closest("thead");
  if (!theadElement) return;

  const headers = extractTheadContent(theadElement);
  dataStore.setHeaders(headers);
  dataStore.trackAction(
    "setHeaders",
    headers.toString(),
    (theadElement.cloneNode() as HTMLTableSectionElement).outerHTML
  );
}

function handleTableClick(event: MouseEvent): void {
  console.log("handleTableClick", event.target);
  const target = event.target as HTMLElement;
  const row = target.closest("tr");

  if (!row) return;

  const tableElement = row.closest("table");
  console.log("tableElement", tableElement);

  if (!tableElement) return;

  const noHeaders = !dataStore.headersStore.length;
  if (noHeaders) {
    checkForHeaders(tableElement);
  }

  // If a header row is clicked, return
  const theadElement = row.closest("thead");
  if (theadElement) {
    handleHeaderClick(event);
    return;
  }

  const rowData = extractRowData(row);
  console.log("rowData", rowData);

  dataStore.addRow(rowData);
  dataStore.trackAction(
    "addRow",
    rowData.toString(),
    (row.cloneNode() as HTMLTableRowElement).outerHTML
  );

  //   TODO:: normalize row data to headers
  //   const normalizedRowData = normalizeRowDataToTableHeaders(rowData, headers);
  //   dataStore.addRow(normalizedRowData);

  // send data to background script
  console.log("Sending data to background script");
  chrome.runtime.sendMessage({
    action: "updateDataStore",
    data: dataStore,
  });

  console.log("Stored headers:", dataStore.headersStore);
  console.log("Stored data:", dataStore.dataStore);
  console.log("Stored actions:", dataStore.actionsStore);
}

function extractTheadContent(thead: HTMLTableSectionElement): string[] {
  const headers: string[] = [];
  thead.querySelectorAll("th").forEach((header) => {
    headers.push(header.textContent?.trim() || "");
  });

  return headers;
}

function extractRowData(row: HTMLTableRowElement): string[] {
  const rowData: string[] = [];
  const cells = row.querySelectorAll("td");

  cells.forEach((cell) => rowData.push(cell.textContent || ""));

  return rowData;
}

export default {};
