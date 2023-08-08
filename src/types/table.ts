export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface TableDataMessage {
  action: "extractTables";
}

export interface TableDataResponse {
  tables: TableData[];
}
