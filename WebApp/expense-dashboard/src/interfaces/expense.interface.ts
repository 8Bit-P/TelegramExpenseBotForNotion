export interface Expense {
    id: number,
    description: string,
    amount: number,
    date: Date,
    creation_date: Date,
    account: number,
    expense: boolean,
    tipo: string
}