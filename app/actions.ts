"use server"

import prisma from "@/lib/prisma";
import { Budget, Transaction, Income, SavingsGoal } from "@/type";

// Helper: find or create user by email
async function findOrCreateUser(email: string) {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        user = await prisma.user.create({ data: { email } });
    }
    return user;
}

// ==================== USER ====================

export async function checkAndAddUser(email: string | undefined) {
    if (!email) return
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (!existingUser) {
            await prisma.user.create({
                data: { email }
            })
            console.log("Nouvel utilisateur ajouté dans la base de données")
        } else {
            console.log("Utilisateur déjà présent dans la base de données")
        }

    } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur:", error);
    }
}

// ==================== BUDGETS ====================

export async function addBudget(email: string, name: string, amount: number, selectedEmoji: string) {
    try {
        const user = await findOrCreateUser(email);

        await prisma.budget.create({
            data: {
                name,
                amount,
                emoji: selectedEmoji,
                userId: user.id
            }
        })
    } catch (error) {
        console.error('Erreur lors de l\'ajout du budget:', error);
        throw error
    }
}

export async function getBudgetsByUser(email: string) {
    try {
        await findOrCreateUser(email);

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                budgets: {
                    include: {
                        transactions: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!user) return [];
        return user.budgets
    } catch (error) {
        console.error('Erreur lors de la récupération des budgets:', error);
        throw error;
    }
}

export async function getTrasactionsByBudgetId(budgetId: string) {
    try {
        const budget = await prisma.budget.findUnique({
            where: { id: budgetId },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })
        if (!budget) {
            throw new Error('Budget non trouvé.');
        }
        return budget;
    } catch (error) {
        console.error('Erreur lors de la récupération des transactions:', error);
        throw error;
    }
}

// ==================== TRANSACTIONS ====================

export async function addTransactionToBudget(
    budgetId: string,
    amount: number,
    description: string
) {
    try {
        const budget = await prisma.budget.findUnique({
            where: { id: budgetId },
            include: { transactions: true }
        })

        if (!budget) {
            throw new Error('Budget non trouvé.');
        }

        const totalTransactions = budget.transactions.reduce((sum, transaction) => {
            return sum + transaction.amount
        }, 0)

        const totalWithNewTransaction = totalTransactions + amount

        if (totalWithNewTransaction > budget.amount) {
            throw new Error('Le montant total des transactions dépasse le montant du budget.');
        }

        await prisma.transaction.create({
            data: {
                amount,
                description,
                emoji: budget.emoji,
                budget: {
                    connect: { id: budget.id }
                }
            }
        })
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la transaction:', error);
        throw error;
    }
}

export const deleteBudget = async (budgetId: string) => {
    try {
        await prisma.transaction.deleteMany({
            where: { budgetId }
        })
        await prisma.budget.delete({
            where: { id: budgetId }
        })
    } catch (error) {
        console.error('Erreur lors de la suppression du budget:', error);
        throw error;
    }
}

export async function deleteTransaction(transactionId: string) {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        })

        if (!transaction) {
            throw new Error('Transaction non trouvée.');
        }

        await prisma.transaction.delete({
            where: { id: transactionId },
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de la transaction:', error);
        throw error;
    }
}

export async function getTransactionsByEmailAndPeriod(email: string, period: string) {
    try {
        const now = new Date();
        let dateLimit

        switch (period) {
            case 'last30':
                dateLimit = new Date(now)
                dateLimit.setDate(now.getDate() - 30);
                break
            case 'last90':
                dateLimit = new Date(now)
                dateLimit.setDate(now.getDate() - 90);
                break
            case 'last7':
                dateLimit = new Date(now)
                dateLimit.setDate(now.getDate() - 7);
                break
            case 'last365':
                dateLimit = new Date(now)
                dateLimit.setFullYear(now.getFullYear() - 1);
                break
            default:
                throw new Error('Période invalide.');
        }

        await findOrCreateUser(email);

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                budgets: {
                    include: {
                        transactions: {
                            where: {
                                createdAt: { gte: dateLimit }
                            },
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        })

        if (!user) return [];

        const transactions = user.budgets.flatMap(budjet =>
            budjet.transactions.map(transaction => ({
                ...transaction,
                budgetName: budjet.name,
                budgetId: budjet.id
            }))
        )

        return transactions
    } catch (error) {
        console.error('Erreur lors de la récupération des transactions:', error);
        throw error;
    }
}

// ==================== INCOME ====================

export async function addIncome(
    email: string,
    description: string,
    amount: number,
    type: string,
    recurring: boolean,
    emoji: string
) {
    try {
        const user = await findOrCreateUser(email);

        await prisma.income.create({
            data: {
                description,
                amount,
                type,
                recurring,
                emoji,
                userId: user.id
            }
        })
    } catch (error) {
        console.error('Erreur lors de l\'ajout du revenu:', error);
        throw error;
    }
}

export async function getIncomesByUser(email: string) {
    try {
        await findOrCreateUser(email);

        const incomes = await prisma.income.findMany({
            where: {
                user: { email }
            },
            orderBy: { createdAt: 'desc' }
        })

        return incomes;
    } catch (error) {
        console.error('Erreur lors de la récupération des revenus:', error);
        throw error;
    }
}

export async function getIncomesByPeriod(email: string, period: string) {
    try {
        const now = new Date();
        let dateLimit: Date;

        switch (period) {
            case 'last7':
                dateLimit = new Date(now);
                dateLimit.setDate(now.getDate() - 7);
                break;
            case 'last30':
                dateLimit = new Date(now);
                dateLimit.setDate(now.getDate() - 30);
                break;
            case 'last90':
                dateLimit = new Date(now);
                dateLimit.setDate(now.getDate() - 90);
                break;
            case 'last365':
                dateLimit = new Date(now);
                dateLimit.setFullYear(now.getFullYear() - 1);
                break;
            default:
                throw new Error('Période invalide.');
        }

        await findOrCreateUser(email);

        const incomes = await prisma.income.findMany({
            where: {
                user: { email },
                createdAt: { gte: dateLimit }
            },
            orderBy: { createdAt: 'desc' }
        })

        return incomes;
    } catch (error) {
        console.error('Erreur lors de la récupération des revenus:', error);
        throw error;
    }
}

export async function deleteIncome(incomeId: string) {
    try {
        await prisma.income.delete({
            where: { id: incomeId }
        })
    } catch (error) {
        console.error('Erreur lors de la suppression du revenu:', error);
        throw error;
    }
}

export async function getTotalIncomeAmount(email: string) {
    try {
        await findOrCreateUser(email);

        const result = await prisma.income.aggregate({
            where: { user: { email } },
            _sum: { amount: true }
        })

        return result._sum.amount || 0;
    } catch (error) {
        console.error('Erreur lors du calcul du total des revenus:', error);
        throw error;
    }
}

// ==================== SAVINGS GOALS ====================

export async function addSavingsGoal(
    email: string,
    name: string,
    targetAmount: number,
    deadline: string | null,
    category: string,
    emoji: string
) {
    try {
        const user = await findOrCreateUser(email);

        await prisma.savingsGoal.create({
            data: {
                name,
                targetAmount,
                currentAmount: 0,
                deadline: deadline ? new Date(deadline) : null,
                category,
                emoji,
                userId: user.id
            }
        })
    } catch (error) {
        console.error('Erreur lors de la création de l\'objectif d\'épargne:', error);
        throw error;
    }
}

export async function getSavingsGoalsByUser(email: string) {
    try {
        await findOrCreateUser(email);

        const goals = await prisma.savingsGoal.findMany({
            where: { user: { email } },
            orderBy: { createdAt: 'desc' }
        })

        return goals;
    } catch (error) {
        console.error('Erreur lors de la récupération des objectifs:', error);
        throw error;
    }
}

export async function updateSavingsGoalProgress(goalId: string, amount: number) {
    try {
        const goal = await prisma.savingsGoal.findUnique({
            where: { id: goalId }
        })

        if (!goal) throw new Error('Objectif non trouvé.');

        await prisma.savingsGoal.update({
            where: { id: goalId },
            data: { currentAmount: goal.currentAmount + amount }
        })
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'objectif:', error);
        throw error;
    }
}

export async function deleteSavingsGoal(goalId: string) {
    try {
        await prisma.savingsGoal.delete({
            where: { id: goalId }
        })
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'objectif:', error);
        throw error;
    }
}

// ==================== DASHBOARD ====================

export async function getTotalTransactionAmount(email: string) {
    try {
        await findOrCreateUser(email);

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                budgets: {
                    include: { transactions: true }
                }
            }
        })

        if (!user) return 0;

        const totalAmount = user.budgets.reduce((sum, budget) => {
            return sum + budget.transactions.reduce((budjeSum, transaction) => budjeSum + transaction.amount, 0)
        }, 0)

        return totalAmount
    } catch (error) {
        console.error("Erreur lors du calcul du montant total des transactions:", error);
        throw error;
    }
}

export async function getTotalTransactionCount(email: string) {
    try {
        await findOrCreateUser(email);

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                budgets: {
                    include: { transactions: true }
                }
            }
        })

        if (!user) return 0;

        const totalCount = user.budgets.reduce((count, budget) => {
            return count + budget.transactions.length
        }, 0)

        return totalCount
    } catch (error) {
        console.error("Erreur lors du comptage des transactions:", error);
        throw error;
    }
}

export async function getReachedBudgets(email: string) {
    try {
        await findOrCreateUser(email);

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                budgets: {
                    include: { transactions: true }
                }
            }
        })

        if (!user) return "0/0";

        const totalBudgets = user.budgets.length;
        const reachedBudgets = user.budgets.filter(budjet => {
            const totalTransactionsAmount = budjet.transactions
                .reduce((sum, transaction) => sum + transaction.amount, 0)
            return totalTransactionsAmount >= budjet.amount
        }).length

        return `${reachedBudgets}/${totalBudgets}`
    } catch (error) {
        console.error("Erreur lors du calcul des budgets atteints:", error);
        throw error;
    }
}

export async function getUserBudgetData(email: string) {
    try {
        await findOrCreateUser(email);

        const user = await prisma.user.findUnique({
            where: { email },
            include: { budgets: { include: { transactions: true } } },
        });

        if (!user) return [];

        const data = user.budgets.map(budget => {
            const totalTransactionsAmount = budget.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
            return {
                budgetName: budget.name,
                totalBudgetAmount: budget.amount,
                totalTransactionsAmount
            }
        })

        return data
    } catch (error) {
        console.error("Erreur lors de la récupération des données budgétaires:", error);
        throw error;
    }
}

export const getLastTransactions = async (email: string) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                budget: {
                    user: { email }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                budget: {
                    select: { name: true }
                }
            }
        })

        const transactionsWithBudgetName = transactions.map(transaction => ({
            ...transaction,
            budgetName: transaction.budget?.name || 'N/A',
        }));

        return transactionsWithBudgetName
    } catch (error) {
        console.error('Erreur lors de la récupération des dernières transactions: ', error);
        throw error;
    }
}

export const getLastBudgets = async (email: string) => {
    try {
        const budgets = await prisma.budget.findMany({
            where: { user: { email } },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: { transactions: true }
        })

        return budgets
    } catch (error) {
        console.error('Erreur lors de la récupération des derniers budgets: ', error);
        throw error;
    }
}

// ==================== FINANCIAL SUMMARY ====================

export async function getFinancialSummary(email: string) {
    try {
        await findOrCreateUser(email);

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                budgets: { include: { transactions: true } },
                incomes: true,
                savingsGoals: true
            }
        })

        if (!user) {
            return {
                totalIncome: 0,
                totalExpenses: 0,
                netBalance: 0,
                totalBudgets: 0,
                totalSavingsTarget: 0,
                totalSavingsCurrent: 0,
                budgetUtilization: 0
            }
        }

        const totalIncome = user.incomes.reduce((sum, income) => sum + income.amount, 0);
        const totalExpenses = user.budgets.reduce((sum, budget) => {
            return sum + budget.transactions.reduce((s, t) => s + t.amount, 0)
        }, 0);
        const totalBudgetAmount = user.budgets.reduce((sum, b) => sum + b.amount, 0);
        const totalSavingsTarget = user.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalSavingsCurrent = user.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

        return {
            totalIncome,
            totalExpenses,
            netBalance: totalIncome - totalExpenses,
            totalBudgets: user.budgets.length,
            totalSavingsTarget,
            totalSavingsCurrent,
            budgetUtilization: totalBudgetAmount > 0 ? Math.round((totalExpenses / totalBudgetAmount) * 100) : 0
        }
    } catch (error) {
        console.error('Erreur lors du résumé financier:', error);
        throw error;
    }
}
