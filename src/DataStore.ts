import { TableAction, TableData } from "./types";

export default class DataStore {
    private data: TableData = [];
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