"use client"

import { Transaction } from '@/type'
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { getTransactionsByEmailAndPeriod } from '../actions'
import Wrapper from '../components/Wrapper'
import TransactionItem from '../components/TransactionItem'
import { ArrowDownUp, Search } from 'lucide-react'

const TransactionsPage = () => {
    const { user } = useUser()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [period, setPeriod] = useState("last30")

    const fetchTransactions = async (p: string) => {
        if (user?.primaryEmailAddress?.emailAddress) {
            setLoading(true)
            try {
                const transactionsData = await getTransactionsByEmailAndPeriod(
                    user.primaryEmailAddress.emailAddress, p
                )
                setTransactions(transactionsData)
            } catch (err) {
                console.error("Erreur:", err)
            } finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        fetchTransactions(period)
    }, [user?.primaryEmailAddress?.emailAddress])

    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.budgetName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalSpent = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)

    return (
        <Wrapper>
            {/* Stats */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div className='glass-card p-5'>
                    <span className='text-gray-400 text-sm'>Transactions</span>
                    <div className='text-2xl font-bold text-accent'>{filteredTransactions.length}</div>
                </div>
                <div className='glass-card p-5'>
                    <span className='text-gray-400 text-sm'>Total Dépensé</span>
                    <div className='text-2xl font-bold text-error'>{totalSpent} TND</div>
                </div>
                <div className='glass-card p-5'>
                    <span className='text-gray-400 text-sm'>Moyenne / Transaction</span>
                    <div className='text-2xl font-bold text-warning'>
                        {filteredTransactions.length > 0
                            ? Math.round(totalSpent / filteredTransactions.length)
                            : 0} TND
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className='flex flex-col sm:flex-row justify-between gap-3 mb-6'>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-bordered input-sm pl-9 w-full sm:w-64"
                    />
                </div>

                <select
                    className='select select-bordered select-sm'
                    value={period}
                    onChange={(e) => {
                        setPeriod(e.target.value)
                        fetchTransactions(e.target.value)
                    }}
                >
                    <option value="last7">7 derniers jours</option>
                    <option value="last30">30 derniers jours</option>
                    <option value="last90">90 derniers jours</option>
                    <option value="last365">365 derniers jours</option>
                </select>
            </div>

            {/* Transaction list */}
            <div className='glass-card p-5'>
                {loading ? (
                    <div className='flex justify-center items-center py-10'>
                        <span className="loading loading-spinner loading-md text-accent"></span>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className='empty-state py-10'>
                        <ArrowDownUp className='w-12 h-12 text-gray-500 mb-3' />
                        <span className='text-gray-500 text-sm'>
                            {searchTerm ? "Aucune transaction trouvée." : "Aucune transaction pour cette période."}
                        </span>
                    </div>
                ) : (
                    <ul className='divide-y divide-base-300'>
                        {filteredTransactions.map((transaction) => (
                            <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </Wrapper>
    )
}

export default TransactionsPage