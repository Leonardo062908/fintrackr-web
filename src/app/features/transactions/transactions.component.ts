import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import {
  Transaction,
  TransactionType,
} from '../../core/models/transaction.model';
import { TransactionsService } from '../../core/service/transactions.service';
import { FtPageHeaderComponent } from '../../shared/ui/pageheader/ft-page-header/ft-page-header.component';

@Component({
  selector: 'app-transactions',
  imports: [FtPageHeaderComponent, CommonModule, RouterLink],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  transactions$!: Observable<Transaction[]>;

  readonly transactionTypeIncome = TransactionType.Income;
  readonly transactionTypeExpense = TransactionType.Expense;

  constructor(private transactionsService: TransactionsService) {}

  ngOnInit(): void {
    this.transactions$ = this.transactionsService.getTransactions();
  }
}
