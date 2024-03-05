import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DownloadFile } from '../../common/download-file';
import { ClientFileService } from '../../services/client-file/client-file.service';

@Component({
  selector: 'client-file',
  standalone: true,
  templateUrl: './client-file.component.html',
  styleUrls: ['./client-file.component.scss']
})
export class ClientFileComponent implements OnInit {
  @ViewChild('downloadAnchor', { static: true }) anchorTag!:
    ElementRef<HTMLAnchorElement>;

  downloadFileObservable: Subscription;

  constructor(private clientFileService: ClientFileService) {
    this.downloadFileObservable = this.clientFileService.downloadFileSubject
      .subscribe((downloadFile) => { this.handleFileDownload(downloadFile) });
  }

  ngOnInit(): void {
  }

  handleFileDownload(downloadFile: DownloadFile): void {
    const tag = this.anchorTag.nativeElement;

    tag.setAttribute(
      'href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(downloadFile.contents));
    tag.setAttribute('download', downloadFile.fileName);
    tag.click();
  }
}
