import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ft-page-header',
  imports: [],
  templateUrl: './ft-page-header.component.html',
  styleUrl: './ft-page-header.component.scss',
})
export class FtPageHeaderComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
}
