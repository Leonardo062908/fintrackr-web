import { Component, OnInit } from '@angular/core';
import { FtPageHeaderComponent } from '../../shared/ui/pageheader/ft-page-header/ft-page-header.component';
import { TransactionsService } from '../../core/service/transactions.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import {
  Transaction,
  TransactionType,
} from '../../core/models/transaction.model';

@Component({
  selector: 'app-transactions',
  imports: [FtPageHeaderComponent, CommonModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  transactions$!: Observable<Transaction[]>;

  constructor(private transactionsService: TransactionsService) {}

  ngOnInit(): void {
    this.transactions$ = this.transactionsService.getTransactions();
  }
}
