export interface TableAction {
  type: string;
  payload: string;
  url: string;
  targetElement: string;
}

export type TableData = string[][];

export interface TableDataMessage {
  action: "extractTables";
}

export interface TableDataResponse {
  tables: TableData;
}

export interface ChromePortTableDataResponse {
  action: "extractTables";
  data: TableDataResponse;
}

export interface ChromePortTableAction {
  action: "tableAction";
  data: TableAction;
}

// previewDataStore
export interface PreviewDataStoreMessage {
  action: "previewDataStore";
}

export interface PreviewDataStoreResponse {
  data: TableData;
}

// updateDataStore
export interface UpdateDataStoreMessage {
  action: "updateDataStore";
  data: TableData;
}

export interface UpdateDataStoreResponse {
  data: TableData;
}
