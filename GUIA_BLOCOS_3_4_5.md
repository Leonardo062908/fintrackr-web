# 🎓 Guia de Implementação - Blocos 3, 4 e 5

Este guia te acompanha passo a passo, explicando **o que** fazer, **por que** fazer e **como** fazer, para que você aprenda enquanto implementa.

---

## 📦 Bloco 3 — Mini Design System (UI Compartilhada)

### 🎯 Objetivo

Criar componentes reutilizáveis para evitar repetição de código HTML/SCSS e manter consistência visual.

### 💡 Por que isso é importante?

- **DRY (Don't Repeat Yourself)**: Evita copiar/colar código
- **Consistência**: Todos os cards terão o mesmo visual
- **Manutenibilidade**: Mudar o estilo de todos os cards em um só lugar
- **Escalabilidade**: Fácil criar novos cards sem escrever CSS do zero

### 📚 Conceitos que você vai aprender:

- **Standalone Components**: Componentes que não precisam de módulos
- **@Input()**: Passar dados do componente pai para o filho
- **ng-content**: Projeção de conteúdo (slot do Angular)
- **View Encapsulation**: Como o Angular isola estilos

---

### 🛠️ Passo a Passo

#### 1. Criar a estrutura de pastas

```bash
# Criar a pasta shared/ui
mkdir -p src/app/shared/ui
```

**O que está acontecendo?**

- `shared/` = código compartilhado entre features
- `ui/` = componentes de interface do usuário
- Estrutura organizada facilita encontrar componentes

---

#### 2. Criar o FtCardComponent

```bash
ng generate component shared/ui/ft-card --standalone --skip-tests
```

**O que está acontecendo?**

- `--standalone`: Componente independente (não precisa de módulo)
- `--skip-tests`: Pula criação de arquivo de teste (você pode criar depois)

**Arquivos criados:**

- `ft-card.component.ts` - Lógica do componente
- `ft-card.component.html` - Template HTML
- `ft-card.component.scss` - Estilos

---

#### 3. Implementar o FtCardComponent

**3.1. No arquivo `ft-card.component.ts`:**

```typescript
import { Component, Input } from "@angular/core";

@Component({
  selector: "ft-card",
  imports: [],
  templateUrl: "./ft-card.component.html",
  styleUrl: "./ft-card.component.scss",
})
export class FtCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
}
```

**O que está acontecendo?**

- `@Input() title?: string` = Propriedade opcional que recebe do componente pai
- `?` = Opcional (TypeScript)
- `@Input()` = Decorator que marca como propriedade de entrada

**Por que opcional?**

- Nem todo card precisa de título
- Flexibilidade de uso

---

**3.2. No arquivo `ft-card.component.html`:**

```html
<div class="ft-card">
  <div class="ft-card__header" *ngIf="title || subtitle">
    <h3 class="ft-card__title" *ngIf="title">{{ title }}</h3>
    <p class="ft-card__subtitle" *ngIf="subtitle">{{ subtitle }}</p>
  </div>
  <div class="ft-card__content">
    <ng-content></ng-content>
  </div>
</div>
```

**O que está acontecendo?**

- `*ngIf="title || subtitle"` = Renderiza só se tiver título OU subtítulo
- `{{ title }}` = Interpolação (mostra o valor da variável)
- `<ng-content></ng-content>` = **Projeção de conteúdo** - onde o conteúdo filho vai aparecer

**Exemplo de uso:**

```html
<ft-card title="Meu Card">
  <p>Este conteúdo vai aparecer no ng-content</p>
</ft-card>
```

---

**3.3. No arquivo `ft-card.component.scss`:**

```scss
.ft-card {
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: var(--ft-glass-bg);
  border: 1px solid var(--ft-glass-border);
  backdrop-filter: var(--ft-glass-blur);
  transition: all 0.2s ease;

  &:hover {
    background: var(--ft-surface-elevated);
    border-color: var(--ft-border-light);
  }
}

.ft-card__header {
  margin-bottom: 1rem;
}

.ft-card__title {
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
  color: var(--ft-text);
  font-weight: 600;
}

.ft-card__subtitle {
  font-size: 0.9rem;
  margin: 0;
  color: var(--ft-text-secondary);
}

.ft-card__content {
  // Conteúdo projetado via ng-content
}
```

**O que está acontecendo?**

- Usa variáveis CSS (`--ft-*`) definidas no `styles.scss`
- BEM naming (`ft-card__header`) = Metodologia de nomenclatura CSS
- `&:hover` = SCSS para `.ft-card:hover`
- `transition` = Animação suave ao passar o mouse

---

#### 4. Criar o FtPageHeaderComponent (Opcional mas Recomendado)

```bash
ng generate component shared/ui/ft-page-header --standalone --skip-tests
```

**4.1. `ft-page-header.component.ts`:**

```typescript
import { Component, Input } from "@angular/core";

@Component({
  selector: "ft-page-header",
  imports: [],
  templateUrl: "./ft-page-header.component.html",
  styleUrl: "./ft-page-header.component.scss",
})
export class FtPageHeaderComponent {
  @Input() title!: string; // ! = obrigatório
  @Input() subtitle?: string;
}
```

**O que está acontecendo?**

- `title!: string` = Obrigatório (TypeScript não permite undefined)
- `subtitle?` = Opcional

---

**4.2. `ft-page-header.component.html`:**

```html
<header class="ft-page-header">
  <h1 class="ft-page-header__title">{{ title }}</h1>
  <p class="ft-page-header__subtitle" *ngIf="subtitle">{{ subtitle }}</p>
</header>
```

---

**4.3. `ft-page-header.component.scss`:**

```scss
.ft-page-header {
  margin-bottom: 2rem;

  &__title {
    font-size: 2rem;
    margin-bottom: 0.25rem;
    color: var(--ft-text);
  }

  &__subtitle {
    color: var(--ft-text-secondary);
    font-size: 0.95rem;
    margin: 0;
  }
}
```

---

#### 5. Refatorar o DashboardComponent

**5.1. Importar os componentes no `dashboard.component.ts`:**

```typescript
import { Component } from "@angular/core";
import { FtCardComponent } from "../../shared/ui/ft-card/ft-card.component";
import { FtPageHeaderComponent } from "../../shared/ui/ft-page-header/ft-page-header.component";

@Component({
  selector: "app-dashboard",
  imports: [FtCardComponent, FtPageHeaderComponent], // Adicionar aqui
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent {}
```

**O que está acontecendo?**

- Standalone components precisam ser importados explicitamente
- `imports: []` = Array de componentes/diretivas que este componente usa

---

**5.2. Atualizar `dashboard.component.html`:**

```html
<section class="dashboard">
  <ft-page-header title="FinTrackr" subtitle="Organize seus gastos, metas e investimentos em único lugar!"> </ft-page-header>

  <div class="dashboard-grid">
    <ft-card title="Resumo do mês">
      <p>Aqui vai entrar o saldo, receitas e despesas do mês.</p>
    </ft-card>

    <ft-card title="Próximos passos">
      <ul>
        <li>Importar CSV de transações</li>
        <li>Configurar metas mensais</li>
        <li>Criar categorias personalizadas</li>
      </ul>
    </ft-card>
  </div>
</section>
```

**O que está acontecendo?**

- Substituímos HTML repetitivo por componentes reutilizáveis
- Conteúdo dentro de `<ft-card>` vai para o `<ng-content>`
- Código mais limpo e semântico

---

**5.3. Simplificar `dashboard.component.scss`:**

```scss
.dashboard {
  width: 100%;
}

.dashboard-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
```

**O que está acontecendo?**

- Removemos estilos que agora estão nos componentes compartilhados
- Mantemos apenas estilos específicos do dashboard (grid)

---

#### 6. Testar e Commitar

```bash
# Verificar se compila
ng serve

# Se estiver tudo ok, commitar
git add .
git commit -m "feat: add shared ui components (card, page header)"
```

---

## 🗺️ Bloco 4 — Mapear o Esqueleto das Features

### 🎯 Objetivo

Criar a estrutura de rotas e páginas placeholder para ter uma visão completa do app antes de implementar funcionalidades.

### 💡 Por que isso é importante?

- **Visão geral**: Ver como o app vai ficar estruturado
- **Navegação**: Testar fluxo entre páginas
- **Planejamento**: Identificar o que falta implementar
- **UX**: Usuário vê que o app está em desenvolvimento

### 📚 Conceitos que você vai aprender:

- **Lazy Loading**: Carregar componentes sob demanda
- **RouterLink**: Navegação declarativa
- **RouterLinkActive**: Destacar rota atual
- **Child Routes**: Rotas filhas dentro de um layout

---

### 🛠️ Passo a Passo

#### 1. Criar os componentes de features

```bash
# Criar todos de uma vez
ng generate component features/transactions --standalone --skip-tests
ng generate component features/goals --standalone --skip-tests
ng generate component features/settings --standalone --skip-tests
```

**O que está acontecendo?**

- Cada feature = uma área funcional do app
- Standalone = pode ser lazy loaded depois
- Estrutura organizada por domínio de negócio

---

#### 2. Implementar cada componente placeholder

**2.1. `transactions.component.ts`:**

```typescript
import { Component } from "@angular/core";
import { FtPageHeaderComponent } from "../../shared/ui/ft-page-header/ft-page-header.component";

@Component({
  selector: "app-transactions",
  imports: [FtPageHeaderComponent],
  templateUrl: "./transactions.component.html",
  styleUrl: "./transactions.component.scss",
})
export class TransactionsComponent {}
```

**2.2. `transactions.component.html`:**

```html
<section class="transactions">
  <ft-page-header title="Transações" subtitle="Gerencie suas receitas e despesas"> </ft-page-header>

  <div class="transactions__placeholder">
    <p>Em construção 🚧</p>
  </div>
</section>
```

**2.3. `transactions.component.scss`:**

```scss
.transactions {
  width: 100%;
}

.transactions__placeholder {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--ft-text-secondary);
  font-size: 1.1rem;
}
```

**Repita o mesmo padrão para `goals` e `settings`** (mude apenas título/subtítulo)

---

#### 3. Atualizar as rotas (`app.routes.ts`)

```typescript
import { Routes } from "@angular/router";
import { MainLayoutComponent } from "./core/layout/main-layout.component";

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "dashboard",
  },
  {
    path: "",
    component: MainLayoutComponent,
    children: [
      {
        path: "dashboard",
        loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
      },
      {
        path: "transactions",
        loadComponent: () => import("./features/transactions/transactions.component").then((m) => m.TransactionsComponent),
      },
      {
        path: "goals",
        loadComponent: () => import("./features/goals/goals.component").then((m) => m.GoalsComponent),
      },
      {
        path: "settings",
        loadComponent: () => import("./features/settings/settings.component").then((m) => m.SettingsComponent),
      },
    ],
  },
];
```

**O que está acontecendo?**

- `loadComponent: () => import(...)` = **Lazy Loading**
- Componente só é carregado quando a rota é acessada
- Reduz bundle inicial do app
- `children: []` = Rotas filhas dentro do layout

---

#### 4. Adicionar navegação no header

**4.1. Atualizar `main-layout.component.ts`:**

```typescript
import { Component } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: "app-main-layout",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./main-layout.component.html",
  styleUrl: "./main-layout.component.scss",
})
export class MainLayoutComponent {}
```

**O que está acontecendo?**

- `RouterLink` = Diretiva para navegação
- `RouterLinkActive` = Adiciona classe quando rota está ativa

---

**4.2. Atualizar `main-layout.component.html`:**

```html
<header class="main-header">
  <div class="header-content">
    <div class="logo">
      <h1>FinTrackr</h1>
    </div>
    <nav class="main-nav">
      <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
      <a routerLink="/transactions" routerLinkActive="active">Transações</a>
      <a routerLink="/goals" routerLinkActive="active">Metas</a>
      <a routerLink="/settings" routerLinkActive="active">Configurações</a>
    </nav>
    <div class="header-actions">
      <!-- Espaço reservado para user menu / ícone -->
    </div>
  </div>
</header>

<main class="main-content">
  <div class="content-container">
    <router-outlet />
  </div>
</main>
```

**O que está acontecendo?**

- `routerLink="/dashboard"` = Caminho da rota
- `routerLinkActive="active"` = Adiciona classe `active` quando rota está ativa
- `<router-outlet />` = Onde o componente da rota atual é renderizado

---

**4.3. Adicionar estilos da navegação (`main-layout.component.scss`):**

```scss
.main-nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;

  a {
    color: var(--ft-text-secondary);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    padding: 0.5rem 0;
    transition: color 0.2s ease;
    position: relative;

    &:hover {
      color: var(--ft-text);
    }

    &.active {
      color: var(--ft-primary);

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--ft-primary);
      }
    }
  }

  @media (max-width: 768px) {
    gap: 1rem;
    font-size: 0.85rem;
  }
}
```

**O que está acontecendo?**

- `&.active` = Quando tem classe `active`
- `&::after` = Pseudo-elemento para linha embaixo do link ativo
- Responsivo: gap menor no mobile

---

#### 5. Testar e Commitar

```bash
# Testar navegação
ng serve

# Navegar entre as rotas e verificar:
# - Links funcionando
# - Rota ativa destacada
# - Layout mantido em todas as páginas

git add .
git commit -m "feat: add base routes and placeholder pages"
```

---

## 📊 Bloco 5 — Modelos + Dados Mockados no Dashboard

### 🎯 Objetivo

Criar estruturas de dados tipadas e simular dados reais no dashboard, preparando para integração com backend.

### 💡 Por que isso é importante?

- **Type Safety**: TypeScript garante tipos corretos
- **Desenvolvimento Frontend**: Trabalhar sem backend
- **Estrutura de Dados**: Definir contratos antes da API
- **Testes**: Validar UI com dados conhecidos

### 📚 Conceitos que você vai aprender:

- **Interfaces/Models**: Estruturas de dados TypeScript
- **Observables**: Programação reativa (RxJS)
- **Dependency Injection**: Injetar serviços
- **Async Pipe**: Renderizar dados assíncronos no template

---

### 🛠️ Passo a Passo

#### 1. Criar estrutura de pastas

```bash
mkdir -p src/app/core/models
mkdir -p src/app/core/services
```

**O que está acontecendo?**

- `core/models` = Modelos compartilhados
- `core/services` = Serviços compartilhados
- Organização por responsabilidade

---

#### 2. Criar os modelos

**2.1. `transaction.model.ts`:**

```typescript
export enum TransactionType {
  Income = "Income",
  Expense = "Expense",
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId?: string;
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: Date;
  createdAt: Date;
}
```

**O que está acontecendo?**

- `enum` = Conjunto de constantes nomeadas
- `interface` = Contrato de estrutura de dados
- `?` = Propriedade opcional
- Tipos definidos = TypeScript valida em tempo de compilação

---

**2.2. `goal.model.ts`:**

```typescript
export enum GoalType {
  MonthlyExpenseLimit = "MonthlyExpenseLimit",
  MonthlyIncomeTarget = "MonthlyIncomeTarget",
  AccountBalance = "AccountBalance",
}

export enum GoalStatus {
  Active = "Active",
  Achieved = "Achieved",
  Failed = "Failed",
}

export interface Goal {
  id: string;
  accountId?: string;
  categoryId?: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  month: number;
  year: number;
  status: GoalStatus;
  createdAt: Date;
}
```

---

**2.3. `monthly-summary.model.ts`:**

```typescript
export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  month: number;
  year: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}
```

**O que está acontecendo?**

- Interface composta de outras interfaces
- Estrutura de dados para dashboard
- Tipos aninhados = dados complexos tipados

---

#### 3. Criar o serviço de mock

**3.1. `dashboard-mock.service.ts`:**

```typescript
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { MonthlySummary } from "../models/monthly-summary.model";
import { Goal } from "../models/goal.model";

@Injectable({
  providedIn: "root",
})
export class DashboardMockService {
  getMonthlySummary(): Observable<MonthlySummary> {
    // Simular delay de API (opcional)
    return of({
      totalIncome: 5000,
      totalExpenses: 3200,
      balance: 1800,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      categoryBreakdown: [
        { categoryId: "1", categoryName: "Alimentação", amount: 800, percentage: 25 },
        { categoryId: "2", categoryName: "Moradia", amount: 1500, percentage: 47 },
        { categoryId: "3", categoryName: "Transporte", amount: 400, percentage: 12.5 },
        { categoryId: "4", categoryName: "Lazer", amount: 500, percentage: 15.6 },
      ],
    });
  }

  getNextActions(): Observable<string[]> {
    return of(["Importar CSV de transações", "Configurar metas mensais", "Criar categorias personalizadas", "Conectar conta bancária"]);
  }

  getActiveGoals(): Observable<Goal[]> {
    return of([
      {
        id: "1",
        categoryId: "1",
        type: "MonthlyExpenseLimit" as any,
        targetAmount: 1000,
        currentAmount: 800,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: "Active" as any,
        createdAt: new Date(),
      },
    ]);
  }
}
```

**O que está acontecendo?**

- `@Injectable({ providedIn: 'root' })` = Singleton (uma instância para toda app)
- `Observable<T>` = Stream de dados assíncronos (RxJS)
- `of(...)` = Cria Observable que emite valor imediatamente
- `return of(...)` = Retorna Observable com dados mockados

**Por que Observable?**

- Simula comportamento de API (assíncrono)
- Fácil trocar por HTTP depois
- Angular trabalha bem com Observables

---

#### 4. Usar o serviço no DashboardComponent

**4.1. Atualizar `dashboard.component.ts`:**

```typescript
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { FtCardComponent } from "../../shared/ui/ft-card/ft-card.component";
import { FtPageHeaderComponent } from "../../shared/ui/ft-page-header/ft-page-header.component";
import { DashboardMockService } from "../../core/services/dashboard-mock.service";
import { MonthlySummary } from "../../core/models/monthly-summary.model";

@Component({
  selector: "app-dashboard",
  imports: [FtCardComponent, FtPageHeaderComponent],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
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
```

**O que está acontecendo?**

- `implements OnInit` = Lifecycle hook (executa quando componente inicia)
- `ngOnInit()` = Método chamado após componente ser criado
- `constructor(...)` = Dependency Injection (Angular injeta serviço)
- `private dashboardService` = Propriedade privada (só usada dentro da classe)
- `$` no final = Convenção para Observables

---

**4.2. Atualizar `dashboard.component.html`:**

```html
<section class="dashboard">
  <ft-page-header title="FinTrackr" subtitle="Organize seus gastos, metas e investimentos em único lugar!"> </ft-page-header>

  <div class="dashboard-grid">
    <ft-card title="Resumo do mês">
      <div *ngIf="monthlySummary$ | async as summary">
        <div class="summary-item">
          <span class="summary-label">Receitas:</span>
          <span class="summary-value income">{{ summary.totalIncome | currency:'BRL' }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Despesas:</span>
          <span class="summary-value expense">{{ summary.totalExpenses | currency:'BRL' }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Saldo:</span>
          <span class="summary-value" [class.positive]="summary.balance >= 0" [class.negative]="summary.balance < 0"> {{ summary.balance | currency:'BRL' }} </span>
        </div>
      </div>
    </ft-card>

    <ft-card title="Próximos passos">
      <ul *ngIf="nextActions$ | async as actions">
        <li *ngFor="let action of actions">{{ action }}</li>
      </ul>
    </ft-card>
  </div>
</section>
```

**O que está acontecendo?**

- `monthlySummary$ | async` = **Async Pipe** (subscreve Observable e renderiza valor)
- `as summary` = Cria variável local com o valor
- `*ngIf` = Renderiza só se tiver valor
- `*ngFor` = Loop sobre array
- `| currency:'BRL'` = Pipe para formatar moeda
- `[class.positive]` = Binding de classe condicional

**Por que async pipe?**

- Gerencia subscription automaticamente
- Unsubscribes quando componente é destruído
- Evita memory leaks

---

**4.3. Adicionar estilos (`dashboard.component.scss`):**

```scss
.dashboard {
  width: 100%;
}

.dashboard-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--ft-border);

  &:last-child {
    border-bottom: none;
    font-weight: 600;
    font-size: 1.1rem;
    padding-top: 1rem;
    margin-top: 0.5rem;
    border-top: 1px solid var(--ft-border);
  }
}

.summary-label {
  color: var(--ft-text-secondary);
  font-size: 0.9rem;
}

.summary-value {
  font-weight: 600;
  color: var(--ft-text);

  &.income {
    color: var(--ft-accent);
  }

  &.expense {
    color: var(--ft-accent-error);
  }

  &.positive {
    color: var(--ft-accent);
  }

  &.negative {
    color: var(--ft-accent-error);
  }
}
```

---

#### 5. Testar e Commitar

```bash
# Verificar se compila e dados aparecem
ng serve

# Verificar no navegador:
# - Valores formatados como moeda
# - Cores corretas (verde para receitas, vermelho para despesas)
# - Lista de ações aparecendo

git add .
git commit -m "feat: add core models and mocked dashboard data"
```

---

## 🎓 Resumo dos Conceitos Aprendidos

### Bloco 3:

- ✅ Standalone Components
- ✅ @Input() para passar dados
- ✅ ng-content para projeção
- ✅ BEM naming convention
- ✅ Variáveis CSS reutilizáveis

### Bloco 4:

- ✅ Lazy Loading de rotas
- ✅ RouterLink e RouterLinkActive
- ✅ Child Routes
- ✅ Navegação declarativa

### Bloco 5:

- ✅ Interfaces e Enums TypeScript
- ✅ Observables e RxJS
- ✅ Dependency Injection
- ✅ Async Pipe
- ✅ Pipes do Angular (currency)
- ✅ Directives (*ngIf, *ngFor)

---

## 🚀 Próximos Passos (Depois dos Blocos)

1. **Integração com Backend**: Trocar `of()` por `http.get()`
2. **Loading States**: Mostrar spinner enquanto carrega
3. **Error Handling**: Tratar erros de API
4. **Formulários**: Criar transações, metas, etc.
5. **Validação**: Validar inputs do usuário

---

**Boa sorte com a implementação! 🎉**

Se tiver dúvidas durante o processo, me chame que eu explico!
