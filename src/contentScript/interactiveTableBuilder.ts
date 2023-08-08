interface TableAction {
  type: string;
  payload: string;
  url: string;
  targetElement: string;
}

class DataStore {
  private data: string[][] = [];
  private headers: string[] = [];
  private actions: TableAction[] = [];

  addRow(row: string[]): void {
    this.data.push(row);
  }

  setHeaders(headers: string[]): void {
    this.headers = headers;
  }

  get dataStore(): string[][] {
    return this.data;
  }

  get headersStore(): string[] {
    return this.headers;
  }

  get actionsStore(): TableAction[] {
    return this.actions;
  }

  trackAction(action: string, payload: string, targetElement: string): void {
    try {
      this.actions.push({
        type: action,
        payload,
        url: window.location.href,
        targetElement,
      });
    } catch (e) {
      console.error(e);
    }
  }

  // More methods can be added later to export to CSV, etc.
}

const dataStore = new DataStore();

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

if (document.readyState === "complete") {
  watchTables();
} else {
  window.addEventListener("load", watchTables);
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

function extractHeaders(table: HTMLTableElement): string[] {
  const thead = table.querySelector("thead");
  if (!thead) return [];
  return extractTheadContent(thead);
}

function extractRowData(row: HTMLTableRowElement): string[] {
  const rowData: string[] = [];
  const cells = row.querySelectorAll("td");

  cells.forEach((cell) => rowData.push(cell.textContent || ""));

  return rowData;
}

export default {};
