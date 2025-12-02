import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ft-card',
  imports: [],
  templateUrl: './ft-card.component.html',
  styleUrl: './ft-card.component.scss',
})
export class FtCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
}
