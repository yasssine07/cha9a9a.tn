"use client"

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react'
import {
    getLastBudgets, getLastTransactions, getReachedBudgets,
    getTotalTransactionAmount, getTotalTransactionCount,
    getUserBudgetData, getFinancialSummary, getSavingsGoalsByUser
} from '../actions';
import Wrapper from '../components/Wrapper';
import {
    CircleDollarSign, Landmark, PiggyBank, TrendingUp,
    TrendingDown, Wallet, Target
} from 'lucide-react';
import {
    Bar, BarChart, CartesianGrid, ResponsiveContainer,
    Tooltip, XAxis, YAxis, Cell
} from 'recharts';
import { Budget, Transaction, SavingsGoal } from '@/type';
import BudgetItem from '../components/BudgetItem';
import Link from 'next/link';
import TransactionItem from '../components/TransactionItem';

const DashboardPage = () => {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [budgetData, setBudgetData] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [reachedBudgetsRatio, setReachedBudgetsRatio] = useState<string>("0/0");

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const email = user?.primaryEmailAddress?.emailAddress as string
            if (email) {
                const [
                    financialSummary,
                    count,
                    reached,
                    budgetsData,
                    lastTransactions,
                    lastBudgets,
                    goals
                ] = await Promise.all([
                    getFinancialSummary(email),
                    getTotalTransactionCount(email),
                    getReachedBudgets(email),
                    getUserBudgetData(email),
                    getLastTransactions(email),
                    getLastBudgets(email),
                    getSavingsGoalsByUser(email)
                ]);

                setSummary(financialSummary)
                setTotalCount(count)
                setReachedBudgetsRatio(reached)
                setBudgetData(budgetsData)
                setTransactions(lastTransactions)
                setBudgets(lastBudgets)
                setSavingsGoals(goals)
                setIsLoading(false)
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données:", error);
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [user?.primaryEmailAddress?.emailAddress])

    return (
        <Wrapper>
            {isLoading ? (
                <div className='flex justify-center items-center py-20'>
                    <span className="loading loading-spinner loading-lg text-accent"></span>
                </div>
            ) : (
                <div className="animate-fade-in">
                    {/* Main stats */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                        <div className='glass-card p-5 flex flex-col'>
                            <div className='flex justify-between items-start'>
                                <span className='text-gray-400 text-sm'>Solde Net</span>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${(summary?.netBalance || 0) >= 0 ? 'bg-success/15' : 'bg-error/15'}`}>
                                    {(summary?.netBalance || 0) >= 0 ?
                                        <TrendingUp className='w-5 h-5 text-success' /> :
                                        <TrendingDown className='w-5 h-5 text-error' />}
                                </div>
                            </div>
                            <span className={`text-2xl font-bold mt-2 ${(summary?.netBalance || 0) >= 0 ? 'text-success' : 'text-error'}`}>
                                {summary?.netBalance || 0} TND
                            </span>
                        </div>

                        <div className='glass-card p-5 flex flex-col'>
                            <div className='flex justify-between items-start'>
                                <span className='text-gray-400 text-sm'>Total Revenus</span>
                                <div className='w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center'>
                                    <Wallet className='w-5 h-5 text-success' />
                                </div>
                            </div>
                            <span className='text-2xl font-bold mt-2 text-success'>
                                +{summary?.totalIncome || 0} TND
                            </span>
                        </div>

                        <div className='glass-card p-5 flex flex-col'>
                            <div className='flex justify-between items-start'>
                                <span className='text-gray-400 text-sm'>Total Dépenses</span>
                                <div className='w-9 h-9 rounded-xl bg-error/15 flex items-center justify-center'>
                                    <CircleDollarSign className='w-5 h-5 text-error' />
                                </div>
                            </div>
                            <span className='text-2xl font-bold mt-2 text-error'>
                                -{summary?.totalExpenses || 0} TND
                            </span>
                        </div>

                        <div className='glass-card p-5 flex flex-col'>
                            <div className='flex justify-between items-start'>
                                <span className='text-gray-400 text-sm'>Transactions</span>
                                <div className='w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center'>
                                    <PiggyBank className='w-5 h-5 text-accent' />
                                </div>
                            </div>
                            <span className='text-2xl font-bold mt-2 text-accent'>
                                {totalCount}
                            </span>
                        </div>
                    </div>

                    {/* Budget utilization + Savings */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                        <div className='glass-card p-5'>
                            <div className='flex justify-between items-center mb-3'>
                                <h3 className='text-sm text-gray-400'>Utilisation des budgets</h3>
                                <span className='text-lg font-bold text-accent'>{summary?.budgetUtilization || 0}%</span>
                            </div>
                            <progress
                                className={`progress w-full h-3 ${(summary?.budgetUtilization || 0) > 90 ? 'progress-error' : (summary?.budgetUtilization || 0) > 70 ? 'progress-warning' : 'progress-accent'}`}
                                value={summary?.budgetUtilization || 0}
                                max="100"
                            ></progress>
                            <div className='flex justify-between mt-2 text-xs text-gray-500'>
                                <span>Budgets atteints: {reachedBudgetsRatio}</span>
                                <span>{summary?.totalBudgets || 0} budget(s)</span>
                            </div>
                        </div>

                        <div className='glass-card p-5'>
                            <div className='flex justify-between items-center mb-3'>
                                <h3 className='text-sm text-gray-400'>Progression épargne</h3>
                                <Link href="/epargne" className='btn btn-xs btn-ghost text-accent'>
                                    Voir tout →
                                </Link>
                            </div>
                            {savingsGoals.length > 0 ? (
                                <div className='space-y-2'>
                                    {savingsGoals.slice(0, 3).map(goal => {
                                        const pct = goal.targetAmount > 0 ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100) : 0;
                                        return (
                                            <div key={goal.id}>
                                                <div className='flex justify-between text-sm'>
                                                    <span>{goal.emoji} {goal.name}</span>
                                                    <span className='text-accent'>{pct}%</span>
                                                </div>
                                                <progress className='progress progress-accent w-full h-1.5' value={pct} max="100"></progress>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className='text-center text-gray-500 text-sm py-4'>
                                    <Target className='w-8 h-8 mx-auto mb-2 opacity-50' />
                                    Aucun objectif d&apos;épargne
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='w-full md:flex gap-4'>
                        {/* Chart + Transactions */}
                        <div className='md:w-2/3 space-y-4'>
                            <div className='glass-card p-5'>
                                <h3 className='text-lg font-semibold mb-3'>
                                    Statistiques (en TND)
                                </h3>
                                {budgetData.length > 0 ? (
                                    <ResponsiveContainer height={250} width="100%">
                                        <BarChart data={budgetData}>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="budgetName" stroke="#888" fontSize={12} />
                                            <YAxis stroke="#888" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--b1))',
                                                    border: '1px solid hsl(var(--bc) / 0.1)',
                                                    borderRadius: '12px',
                                                    fontSize: '13px',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                                }}
                                                itemStyle={{ color: 'hsl(var(--bc))' }}
                                            />
                                            <Bar name="Budget" dataKey="totalBudgetAmount" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                                            <Bar name="Dépensé" dataKey="totalTransactionsAmount" fill="#f87171" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='text-center text-gray-500 py-10'>Aucune donnée à afficher</div>
                                )}
                            </div>

                            <div className='glass-card p-5'>
                                <div className='flex justify-between items-center mb-3'>
                                    <h3 className='text-lg font-semibold'>Dernières Transactions</h3>
                                    <Link href="/transactions" className='btn btn-xs btn-ghost text-accent'>
                                        Voir tout →
                                    </Link>
                                </div>
                                {transactions.length > 0 ? (
                                    <ul className='divide-y divide-base-300'>
                                        {transactions.map((transaction) => (
                                            <TransactionItem
                                                key={transaction.id}
                                                transaction={transaction}
                                            />
                                        ))}
                                    </ul>
                                ) : (
                                    <div className='text-center text-gray-500 py-6 text-sm'>Aucune transaction</div>
                                )}
                            </div>
                        </div>

                        {/* Budgets sidebar */}
                        <div className='md:w-1/3 mt-4 md:mt-0'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='text-lg font-semibold'>Derniers Budgets</h3>
                                <Link href="/budjets" className='btn btn-xs btn-ghost text-accent'>
                                    Voir tout →
                                </Link>
                            </div>
                            <ul className="grid grid-cols-1 gap-4">
                                {budgets.length > 0 ? budgets.map((budget) => (
                                    <Link href={`/manage/${budget.id}`} key={budget.id}>
                                        <BudgetItem budget={budget} enableHover={1} />
                                    </Link>
                                )) : (
                                    <div className='glass-card p-6 text-center text-gray-500 text-sm'>
                                        <Landmark className='w-8 h-8 mx-auto mb-2 opacity-50' />
                                        Aucun budget créé
                                    </div>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </Wrapper>
    )
}

export default DashboardPage