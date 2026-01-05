import { Component } from '@angular/core';
import { FtCardComponent } from '../../shared/ui/cards/ft-card.component';
import { FtPageHeaderComponent } from '../../shared/ui/pageheader/ft-page-header/ft-page-header.component';

@Component({
  selector: 'app-dashboard',
  imports: [FtCardComponent, FtPageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
