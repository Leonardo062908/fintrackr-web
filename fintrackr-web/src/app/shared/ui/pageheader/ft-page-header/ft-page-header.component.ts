import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-ft-page-header',
  imports: [NgIf],
  templateUrl: './ft-page-header.component.html',
  styleUrl: './ft-page-header.component.scss',
})
export class FtPageHeaderComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
}
