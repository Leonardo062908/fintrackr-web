import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FtCardComponent } from '../../shared/ui/cards/ft-card.component';
import { FtPageHeaderComponent } from '../../shared/ui/pageheader/ft-page-header/ft-page-header.component';

@Component({
  selector: 'app-dashboard',
  imports: [FtCardComponent, FtPageHeaderComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
