import { Budget } from "@/type";
import React from "react";
import { AlertTriangle } from "lucide-react";

interface BudgetItemProps {
    budget: Budget;
    enableHover?: number;
}

const BudgetItem: React.FC<BudgetItemProps> = ({ budget, enableHover }) => {
    const transactionCount = budget.transactions ? budget.transactions.length : 0;
    const totalTransactionAmount = budget.transactions
        ? budget.transactions.reduce(
            (sum, transaction) => sum + transaction.amount, 0)
        : 0

    const remainingAmount = budget.amount - totalTransactionAmount

    const progressValue =
        totalTransactionAmount > budget.amount
            ? 100
            : (totalTransactionAmount / budget.amount) * 100

    const isOverBudget = totalTransactionAmount >= budget.amount;
    const isNearLimit = progressValue >= 80 && !isOverBudget;

    const hoverClasse = enableHover === 1 ? "card-hover cursor-pointer" : "";

    const progressColor = isOverBudget
        ? "progress-error"
        : isNearLimit
            ? "progress-warning"
            : "progress-accent";

    return (
        <li className={`p-5 glass-card list-none ${hoverClasse}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-accent/15 text-2xl h-12 w-12 rounded-xl flex justify-center items-center">
                        {budget.emoji}
                    </div>
                    <div className="flex flex-col ml-3">
                        <span className="font-bold text-lg">{budget.name}</span>
                        <span className="text-gray-500 text-sm">
                            {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
                <div className="text-xl font-bold text-accent">{budget.amount} TND</div>
            </div>

            {isOverBudget && (
                <div className="flex items-center gap-2 mt-3 text-error text-sm bg-error/10 rounded-lg px-3 py-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Budget dépassé !</span>
                </div>
            )}

            {isNearLimit && !isOverBudget && (
                <div className="flex items-center gap-2 mt-3 text-warning text-sm bg-warning/10 rounded-lg px-3 py-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Attention : {Math.round(progressValue)}% utilisé</span>
                </div>
            )}

            <div className="flex justify-between items-center mt-3 text-gray-500 text-sm">
                <span>{totalTransactionAmount} TND dépensés</span>
                <span className={remainingAmount < 0 ? 'text-error' : ''}>
                    {remainingAmount >= 0 ? `${remainingAmount} TND restants` : `${Math.abs(remainingAmount)} TND dépassé`}
                </span>
            </div>

            <div>
                <progress
                    className={`progress ${progressColor} w-full mt-3 h-2`}
                    value={progressValue}
                    max="100"
                ></progress>
            </div>
        </li>
    )
};

export default BudgetItem;