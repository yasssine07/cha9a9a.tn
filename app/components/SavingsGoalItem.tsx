import { SavingsGoal } from '@/type';
import { Trash2, Target } from 'lucide-react';
import React from 'react'

interface SavingsGoalItemProps {
    goal: SavingsGoal;
    onDelete?: (id: string) => void;
    onAddFunds?: (id: string) => void;
}

const SavingsGoalItem: React.FC<SavingsGoalItemProps> = ({ goal, onDelete, onAddFunds }) => {
    const progressPercent = goal.targetAmount > 0
        ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
        : 0;

    const isCompleted = goal.currentAmount >= goal.targetAmount;

    const daysRemaining = goal.deadline
        ? Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

    return (
        <div className={`p-5 glass-card list-none ${isCompleted ? 'border-success/50' : ''}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`text-2xl h-12 w-12 rounded-xl flex justify-center items-center ${isCompleted ? 'bg-success/15' : 'bg-accent/15'}`}>
                        {goal.emoji || '🎯'}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{goal.name}</h3>
                        {goal.category && (
                            <span className="badge badge-sm badge-ghost">{goal.category}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onAddFunds && !isCompleted && (
                        <button
                            onClick={() => onAddFunds(goal.id)}
                            className='btn btn-sm btn-accent btn-outline rounded-lg'
                        >
                            + Ajouter
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(goal.id)}
                            className='btn btn-sm btn-ghost text-error hover:bg-error/10'
                        >
                            <Trash2 className='w-4 h-4' />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress */}
            <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{goal.currentAmount} TND épargnés</span>
                <span className="font-semibold text-accent">{goal.targetAmount} TND</span>
            </div>

            <progress
                className={`progress ${isCompleted ? 'progress-success' : 'progress-accent'} w-full h-3`}
                value={progressPercent}
                max="100"
            ></progress>

            <div className="flex justify-between items-center mt-3">
                <span className={`text-sm font-bold ${isCompleted ? 'text-success' : 'text-accent'}`}>
                    {progressPercent}%
                    {isCompleted && ' ✅ Objectif atteint !'}
                </span>
                {daysRemaining !== null && !isCompleted && (
                    <span className={`text-xs ${daysRemaining <= 7 ? 'text-warning' : 'text-gray-500'}`}>
                        {daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Échéance dépassée'}
                    </span>
                )}
            </div>
        </div>
    )
}

export default SavingsGoalItem
