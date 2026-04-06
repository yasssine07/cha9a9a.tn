"use client"

import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { addIncome, deleteIncome, getIncomesByPeriod } from '../actions'
import { Income } from '@/type'
import IncomeItem from '../components/IncomeItem'
import Notification from '../components/Notification'
import EmojiPicker from 'emoji-picker-react'
import { Plus, TrendingUp, Wallet } from 'lucide-react'

const RevenusPage = () => {
    const { user } = useUser()
    const [incomes, setIncomes] = useState<Income[]>([])
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState("")

    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [type, setType] = useState("REGULAR")
    const [recurring, setRecurring] = useState(false)
    const [selectedEmoji, setSelectedEmoji] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [period, setPeriod] = useState("last30")

    const handleEmojiSelect = (emojiObject: { emoji: string }) => {
        setSelectedEmoji(emojiObject.emoji)
        setShowEmojiPicker(false)
    }

    const fetchIncomes = async (p: string) => {
        if (user?.primaryEmailAddress?.emailAddress) {
            setLoading(true)
            try {
                const data = await getIncomesByPeriod(user.primaryEmailAddress.emailAddress, p)
                setIncomes(data as Income[])
            } catch (err) {
                console.error("Erreur:", err)
            } finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        fetchIncomes(period)
    }, [user?.primaryEmailAddress?.emailAddress])

    const handleAddIncome = async () => {
        try {
            const amountNum = parseFloat(amount)
            if (isNaN(amountNum) || amountNum <= 0) {
                setNotification("Le montant doit être un nombre positif.")
                return
            }
            if (!description.trim()) {
                setNotification("Veuillez ajouter une description.")
                return
            }

            await addIncome(
                user?.primaryEmailAddress?.emailAddress as string,
                description,
                amountNum,
                type,
                recurring,
                selectedEmoji || '💰'
            )

            fetchIncomes(period)
            const modal = document.getElementById("income_modal") as HTMLDialogElement
            if (modal) modal.close()

            setNotification("Revenu ajouté avec succès !")
            setDescription("")
            setAmount("")
            setSelectedEmoji("")
            setType("REGULAR")
            setRecurring(false)
        } catch (error) {
            setNotification(`Erreur: ${error}`)
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm("Supprimer ce revenu ?")) {
            try {
                await deleteIncome(id)
                fetchIncomes(period)
                setNotification("Revenu supprimé.")
            } catch (error) {
                console.error(error)
            }
        }
    }

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const regularIncome = incomes.filter(i => i.type === "REGULAR").reduce((sum, i) => sum + i.amount, 0)
    const unexpectedIncome = incomes.filter(i => i.type === "UNEXPECTED").reduce((sum, i) => sum + i.amount, 0)

    return (
        <Wrapper>
            {notification && (
                <Notification message={notification} onclose={() => setNotification("")} />
            )}

            {/* Stats cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div className='glass-card p-5 flex items-center justify-between'>
                    <div>
                        <span className='text-gray-400 text-sm'>Total Revenus</span>
                        <div className='text-2xl font-bold text-success'>{totalIncome} TND</div>
                    </div>
                    <Wallet className='w-9 h-9 text-success/50' />
                </div>
                <div className='glass-card p-5 flex items-center justify-between'>
                    <div>
                        <span className='text-gray-400 text-sm'>Revenus Réguliers</span>
                        <div className='text-2xl font-bold text-info'>{regularIncome} TND</div>
                    </div>
                    <TrendingUp className='w-9 h-9 text-info/50' />
                </div>
                <div className='glass-card p-5 flex items-center justify-between'>
                    <div>
                        <span className='text-gray-400 text-sm'>Revenus Imprévus</span>
                        <div className='text-2xl font-bold text-warning'>{unexpectedIncome} TND</div>
                    </div>
                    <TrendingUp className='w-9 h-9 text-warning/50' />
                </div>
            </div>

            {/* Actions bar */}
            <div className='flex justify-between items-center mb-6'>
                <button
                    className="btn btn-accent rounded-lg gap-2"
                    onClick={() =>
                        (document.getElementById("income_modal") as HTMLDialogElement).showModal()
                    }
                >
                    <Plus className='w-4 h-4' />
                    Nouveau Revenu
                </button>

                <select
                    className='select select-bordered select-sm'
                    value={period}
                    onChange={(e) => {
                        setPeriod(e.target.value)
                        fetchIncomes(e.target.value)
                    }}
                >
                    <option value="last7">7 derniers jours</option>
                    <option value="last30">30 derniers jours</option>
                    <option value="last90">90 derniers jours</option>
                    <option value="last365">365 derniers jours</option>
                </select>
            </div>

            {/* Income list */}
            <div className='glass-card p-5'>
                {loading ? (
                    <div className='flex justify-center py-10'>
                        <span className="loading loading-spinner loading-md"></span>
                    </div>
                ) : incomes.length === 0 ? (
                    <div className='empty-state py-10'>
                        <Wallet className='w-12 h-12 text-gray-500 mb-3' />
                        <span className='text-gray-500'>Aucun revenu enregistré pour cette période.</span>
                    </div>
                ) : (
                    <ul className='divide-y divide-base-300'>
                        {incomes.map((income) => (
                            <IncomeItem
                                key={income.id}
                                income={income}
                                onDelete={handleDelete}
                            />
                        ))}
                    </ul>
                )}
            </div>

            {/* Add Income Modal */}
            <dialog id="income_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg mb-1">Ajouter un revenu</h3>
                    <p className="text-gray-500 text-sm mb-4">Enregistrez vos revenus réguliers ou imprévus</p>

                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            value={description}
                            placeholder="Description (ex: Salaire, Freelance...)"
                            onChange={(e) => setDescription(e.target.value)}
                            className="input input-bordered"
                        />

                        <input
                            type="number"
                            value={amount}
                            placeholder="Montant (TND)"
                            onChange={(e) => setAmount(e.target.value)}
                            className="input input-bordered"
                        />

                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="select select-bordered"
                        >
                            <option value="REGULAR">💼 Revenu régulier</option>
                            <option value="UNEXPECTED">⚡ Revenu imprévu</option>
                        </select>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={recurring}
                                onChange={(e) => setRecurring(e.target.checked)}
                                className="checkbox checkbox-accent checkbox-sm"
                            />
                            <span className="text-sm">Revenu récurrent (mensuel)</span>
                        </label>

                        <button
                            className="btn btn-sm"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            {selectedEmoji || "Choisir un emoji 💰"}
                        </button>

                        {showEmojiPicker && (
                            <div className="flex justify-center">
                                <EmojiPicker onEmojiClick={handleEmojiSelect} />
                            </div>
                        )}

                        <button onClick={handleAddIncome} className="btn btn-accent rounded-lg">
                            Ajouter le revenu
                        </button>
                    </div>
                </div>
            </dialog>
        </Wrapper>
    )
}

export default RevenusPage
