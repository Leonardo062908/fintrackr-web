import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TransactionsService } from '../../core/service/transactions.service';
import { FtPageHeaderComponent } from '../../shared/ui/pageheader/ft-page-header/ft-page-header.component';

@Component({
  selector: 'app-transaction-delete',
  imports: [RouterLink, FtPageHeaderComponent],
  templateUrl: './transaction-delete.component.html',
  styleUrl: './transaction-delete.component.scss',
})
export class TransactionDeleteComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transactionsService = inject(TransactionsService);

  transactionId: string | null = null;
  description = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/transactions']);
      return;
    }
    const t = this.transactionsService.getTransaction(id);
    if (!t) {
      void this.router.navigate(['/transactions']);
      return;
    }
    this.transactionId = id;
    this.description = t.description;
  }

  confirm(): void {
    if (this.transactionId) {
      this.transactionsService.deleteTransaction(this.transactionId);
    }
    void this.router.navigate(['/transactions']);
  }
}
