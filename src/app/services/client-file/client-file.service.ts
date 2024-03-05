import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DownloadFile } from '../../common/download-file';

const DEFAULT_FILE_NAME = 'bronzor-reflect';

function createDownloadFile(fileName: string, contents: string): DownloadFile {
  return { fileName: fileName, contents: contents };
}

@Injectable({
  providedIn: 'root'
})
export class ClientFileService {
  private downloadCounter = 0;
  private fileContents = '';
  downloadFileSubject = new Subject<DownloadFile>();

  constructor() { }

  downloadFile(fileName?: string): void {
    if (fileName === undefined) {
      this.downloadCounter++;
    }

    // Publish a DownloadFile value, which will trigger an <a> tag to download
    // the file.
    fileName = (fileName === undefined) ?
      `${DEFAULT_FILE_NAME}-${this.downloadCounter}` : fileName;
    this.downloadFileSubject.next(
      createDownloadFile(fileName, this.fileContents));

    this.fileContents = '';
  }

  print(str: string): void {
    this.fileContents += `${str}\n`;
  }
}
