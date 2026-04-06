"use client"
import { addTransactionToBudget, deleteBudget, deleteTransaction, getTrasactionsByBudgetId } from '@/app/actions'
import BudgetItem from '@/app/components/BudgetItem'
import Wrapper from '@/app/components/Wrapper'
import { Budget } from '@/type'
import React, { useEffect, useState } from 'react'
import Notification from '@/app/components/Notification'
import { Send, Trash2, Plus } from 'lucide-react'
import { redirect } from 'next/navigation'
import FormattedDate from '@/app/components/FormattedDate'

const ManageBudgetPage = ({ params }: { params: Promise<{ budgetId: string }> }) => {
  const [budgetId, setBudgetId] = useState<string>('')
  const [budget, setBudget] = useState<Budget>()
  const [description, setDescription] = useState<string>('')
  const [amount, setAmount] = useState<string>('')

  const [notification, setNotification] = useState<string>("");
  const closeNotification = () => setNotification("")

  async function fetchBudgetData(budgetId: string) {
    try {
      if (budgetId) {
        const budgetData = await getTrasactionsByBudgetId(budgetId)
        setBudget(budgetData)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du budget:", error)
    }
  }

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params;
      setBudgetId(resolvedParams.budgetId)
      fetchBudgetData(resolvedParams.budgetId)
    }
    getId()
  }, [params])

  const handleAddTransaction = async () => {
    if (!amount || !description) {
      setNotification("Veuillez remplir tous les champs.")
      return;
    }

    try {
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error("Le montant doit être un nombre positif.");
      }
      await addTransactionToBudget(budgetId, amountNumber, description)

      setNotification(`Transaction ajoutée avec succès`)
      fetchBudgetData(budgetId)
      setAmount('')
      setDescription('')
    } catch (error) {
      setNotification(`Vous avez dépassé votre budget`)
    }
  }

  const handleDeleteBudget = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce budget et toutes ses transactions associées ?"
    )
    if (confirmed) {
      try {
        await deleteBudget(budgetId)
      } catch (error) {
        console.error("Erreur lors de la suppression du budget:", error);
      }
      redirect("/budjets")
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette transaction ?"
    )
    if (confirmed) {
      try {
        await deleteTransaction(transactionId)
        fetchBudgetData(budgetId)
        setNotification("Dépense supprimée")
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  }

  return (
    <Wrapper>
      {notification && (
        <Notification message={notification} onclose={closeNotification} />
      )}
      {budget && (
        <div className='flex md:flex-row flex-col gap-4'>
          <div className='md:w-1/3'>
            <BudgetItem budget={budget} enableHover={0} />

            <button
              onClick={handleDeleteBudget}
              className='btn btn-error btn-outline btn-sm mt-4 w-full rounded-lg gap-2'
            >
              <Trash2 className='w-4 h-4' />
              Supprimer le budget
            </button>

            {/* Add transaction form */}
            <div className='glass-card p-4 mt-4 space-y-3'>
              <h3 className='font-semibold text-sm text-gray-400'>Nouvelle dépense</h3>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                required
                className="input input-bordered input-sm w-full"
              />
              <input
                type="number"
                placeholder="Montant (TND)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="input input-bordered input-sm w-full"
              />
              <button
                onClick={handleAddTransaction}
                className="btn btn-accent btn-sm w-full rounded-lg gap-2"
              >
                <Plus className='w-4 h-4' />
                Ajouter la dépense
              </button>
            </div>
          </div>

          {/* Transactions table */}
          {budget?.transactions && budget.transactions.length > 0 ? (
            <div className="glass-card p-5 md:mt-0 mt-4 md:w-2/3 overflow-x-auto">
              <h3 className='font-semibold mb-3'>Transactions ({budget.transactions.length})</h3>
              <table className="table table-sm">
                <thead>
                  <tr className='text-gray-400'>
                    <th></th>
                    <th>Montant</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {budget?.transactions?.map((transaction) => (
                    <tr key={transaction.id} className='hover:bg-base-300/30'>
                      <td className='text-lg md:text-2xl'>{transaction.emoji}</td>
                      <td>
                        <div className="badge badge-error badge-sm">
                          - {transaction.amount} TND
                        </div>
                      </td>
                      <td>{transaction.description}</td>
                      <td className='text-gray-400 text-sm'>
                        <FormattedDate date={transaction.createdAt} type="date" />
                      </td>
                      <td className='text-gray-400 text-sm'>
                        <FormattedDate date={transaction.createdAt} type="time" options={{ hour: "2-digit", minute: "2-digit" }} />
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className='btn btn-xs btn-ghost text-error hover:bg-error/10'
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='md:w-2/3 glass-card p-10 flex flex-col items-center justify-center'>
              <Send strokeWidth={1.5} className='w-10 h-10 text-accent/50 mb-3' />
              <span className='text-gray-500'>Aucune transaction pour ce budget.</span>
              <span className='text-gray-500 text-sm mt-1'>Ajoutez votre première dépense !</span>
            </div>
          )}
        </div>
      )}
    </Wrapper>
  )
}

export default ManageBudgetPage