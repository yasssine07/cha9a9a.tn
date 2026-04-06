import { Income } from '@/type';
import { Trash2, Repeat, Zap } from 'lucide-react';
import React from 'react'
import FormattedDate from './FormattedDate';

interface IncomeItemProps {
    income: Income;
    onDelete?: (id: string) => void;
}

const IncomeItem: React.FC<IncomeItemProps> = ({ income, onDelete }) => {
    return (
        <li className='flex justify-between items-center py-3'>
            <div className='flex items-center gap-3'>
                <div className='bg-success/15 text-xl h-10 w-10 rounded-xl flex justify-center items-center'>
                    {income.emoji || '💰'}
                </div>
                <div className='flex flex-col'>
                    <span className='font-semibold'>{income.description}</span>
                    <div className='flex items-center gap-2'>
                        <span className={`badge badge-sm ${income.type === 'REGULAR' ? 'badge-info' : 'badge-warning'}`}>
                            {income.type === 'REGULAR' ? (
                                <><Repeat className='w-3 h-3 mr-1' /> Régulier</>
                            ) : (
                                <><Zap className='w-3 h-3 mr-1' /> Imprévu</>
                            )}
                        </span>
                        <span className='text-gray-500 text-xs'>
                            <FormattedDate date={income.createdAt} />
                        </span>
                    </div>
                </div>
            </div>
            <div className='flex items-center gap-3'>
                <span className='text-lg font-bold text-success'>+{income.amount} TND</span>
                {onDelete && (
                    <button
                        onClick={() => onDelete(income.id)}
                        className='btn btn-sm btn-ghost text-error hover:bg-error/10'
                    >
                        <Trash2 className='w-4 h-4' />
                    </button>
                )}
            </div>
        </li>
    )
}

export default IncomeItem
