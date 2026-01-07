import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-ft-card',
  imports: [NgIf],
  templateUrl: './ft-card.component.html',
  styleUrl: './ft-card.component.scss',
})
export class FtCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
}
