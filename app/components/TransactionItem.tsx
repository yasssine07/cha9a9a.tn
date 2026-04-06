import { Transaction } from '@/type';
import Link from 'next/link';
import React from 'react'
import FormattedDate from './FormattedDate';

interface TransactionItemProps {
    transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {

    return (
        <li key={transaction.id} className='flex justify-between items-center text-sm'>
            <div className='my-4'>
                <button className='btn btn-ghost hover:bg-transparent cursor-default'>
                    <div className="badge badge-accent">- {transaction.amount} TND</div>
                    {transaction.budgetName}
                </button>
            </div>
            <div className='md:hidden flex flex-col items-end'>
                <span className='font-bold text-sm text-center'>{transaction.description}</span>
                <span className='text-xs opacity-70'>
                    <FormattedDate date={transaction.createdAt} type="datetime" />
                </span>
            </div>


            <div className='hidden md:flex'>
                <span className='font-bold'>
                    {transaction.description}
                </span>
            </div>

            <div className='hidden md:flex opacity-70'>
                <FormattedDate date={transaction.createdAt} type="datetime" />
            </div>

            <div className='hidden md:flex'>
                <Link href={`/manage/${transaction.budgetId}`}  className='btn'>
                Voir plus
                </Link>
            </div>



        </li>
    )
}

export default TransactionItem