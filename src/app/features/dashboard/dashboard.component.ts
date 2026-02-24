import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FtCardComponent } from '../../shared/ui/cards/ft-card/ft-card.component';
import { FtPageHeaderComponent } from '../../shared/ui/pageheader/ft-page-header/ft-page-header.component';
import { Observable } from 'rxjs';
import { DashboardMockService } from '../../core/services/dashboard-mock.service';
import { MonthlySummary } from '../../core/models/monthly-summary.model';

@Component({
  selector: 'app-dashboard',
  imports: [FtCardComponent, FtPageHeaderComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  monthlySummary$!: Observable<MonthlySummary>;
  nextActions$!: Observable<string[]>;

  constructor(private dashboardService: DashboardMockService) {}

  ngOnInit(): void {
    this.monthlySummary$ = this.dashboardService.getMonthlySummary();
    this.nextActions$ = this.dashboardService.getNextActions();
  }
}
