class DataStore {
  private data: string[][] = [];
  private headers: string[] = [];

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

function handleTableClick(event: MouseEvent): void {
  console.log("handleTableClick", event.target);
  const target = event.target as HTMLElement;
  const row = target.closest("tr");

  if (!row) return;

  // If a header row is clicked, set headers and return
  const theadElement = row.closest("thead");
  if (theadElement) {
    if (dataStore.headersStore.length) return;
    const headers = extractTheadContent(theadElement);
    dataStore.setHeaders(headers);
    return;
  }

  const tableElement = row.closest("table");

  console.log("tableElement", tableElement);

  if (!tableElement) return;

  const headers = extractHeaders(tableElement);
  const rowData = extractRowData(row);

  if (!dataStore.headersStore.length) {
    dataStore.setHeaders(headers);
  }
  dataStore.addRow(rowData);

  //   TODO:: normalize row data to headers
  //   const normalizedRowData = normalizeRowDataToTableHeaders(rowData, headers);
  //   dataStore.addRow(normalizedRowData);

  console.log("Stored data:", dataStore.headersStore, dataStore.dataStore);
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
  return extractTheadContent(thead!);
}

function extractRowData(row: HTMLTableRowElement): string[] {
  const rowData: string[] = [];
  const cells = row.querySelectorAll("td");

  cells.forEach((cell) => rowData.push(cell.textContent || ""));

  return rowData;
}

export default {};
