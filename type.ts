
export interface Budget {
    id: string;
    createdAt: Date;
    name: string;
    amount: number;
    emoji: string | null;
    transactions?: Transaction[];
}

export interface Transaction {
    id: string;
    amount: number;
    emoji: string | null;
    description: string
    createdAt: Date;
    budgetName?: string;
    budgetId?: string | null;
}

export interface Income {
    id: string;
    description: string;
    amount: number;
    type: "REGULAR" | "UNEXPECTED";
    recurring: boolean;
    emoji: string | null;
    createdAt: Date;
}

export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: Date | null;
    category: string | null;
    emoji: string | null;
    createdAt: Date;
}