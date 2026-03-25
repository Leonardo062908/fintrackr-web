import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TransactionType } from '../../core/models/transaction.model';
import { TransactionsService } from '../../core/service/transactions.service';
import { FtPageHeaderComponent } from '../../shared/ui/pageheader/ft-page-header/ft-page-header.component';

const DEFAULT_ACCOUNT_ID = 'account-1';

@Component({
  selector: 'app-transaction-form',
  imports: [ReactiveFormsModule, RouterLink, FtPageHeaderComponent],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss',
})
export class TransactionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transactionsService = inject(TransactionsService);

  readonly transactionType = TransactionType;
  readonly form = this.fb.group({
    type: this.fb.nonNullable.control(
      TransactionType.Expense,
      Validators.required,
    ),
    amount: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
    description: this.fb.nonNullable.control('', Validators.required),
    transactionDate: this.fb.nonNullable.control('', Validators.required),
  });

  private editId: string | null = null;

  get isEditMode(): boolean {
    return this.editId !== null;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar transação' : 'Nova transação';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    const existing = this.transactionsService.getTransaction(id);
    if (!existing) {
      void this.router.navigate(['/transactions']);
      return;
    }
    this.editId = id;
    this.form.patchValue({
      type: existing.type,
      amount: existing.amount,
      description: existing.description,
      transactionDate: this.toDateInputValue(existing.transactionDate),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const transactionDate = new Date(v.transactionDate);
    if (this.editId) {
      this.transactionsService.updateTransaction(this.editId, {
        type: v.type,
        amount: v.amount!,
        description: v.description,
        transactionDate,
      });
    } else {
      this.transactionsService.addTransaction({
        accountId: DEFAULT_ACCOUNT_ID,
        type: v.type,
        amount: v.amount!,
        description: v.description,
        transactionDate,
      });
    }
    void this.router.navigate(['/transactions']);
  }

  private toDateInputValue(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
