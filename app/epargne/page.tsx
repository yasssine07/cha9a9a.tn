"use client"

import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { addSavingsGoal, deleteSavingsGoal, getSavingsGoalsByUser, updateSavingsGoalProgress } from '../actions'
import { SavingsGoal } from '@/type'
import SavingsGoalItem from '../components/SavingsGoalItem'
import Notification from '../components/Notification'
import EmojiPicker from 'emoji-picker-react'
import { Plus, Target, TrendingUp, PiggyBank } from 'lucide-react'

const EpargnePage = () => {
    const { user } = useUser()
    const [goals, setGoals] = useState<SavingsGoal[]>([])
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState("")

    const [name, setName] = useState("")
    const [targetAmount, setTargetAmount] = useState("")
    const [deadline, setDeadline] = useState("")
    const [category, setCategory] = useState("")
    const [selectedEmoji, setSelectedEmoji] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    const [fundAmount, setFundAmount] = useState("")
    const [selectedGoalId, setSelectedGoalId] = useState("")

    const handleEmojiSelect = (emojiObject: { emoji: string }) => {
        setSelectedEmoji(emojiObject.emoji)
        setShowEmojiPicker(false)
    }

    const fetchGoals = async () => {
        if (user?.primaryEmailAddress?.emailAddress) {
            setLoading(true)
            try {
                const data = await getSavingsGoalsByUser(user.primaryEmailAddress.emailAddress)
                setGoals(data)
            } catch (err) {
                console.error("Erreur:", err)
            } finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        fetchGoals()
    }, [user?.primaryEmailAddress?.emailAddress])

    const handleAddGoal = async () => {
        try {
            const target = parseFloat(targetAmount)
            if (isNaN(target) || target <= 0) {
                setNotification("Le montant cible doit être positif.")
                return
            }
            if (!name.trim()) {
                setNotification("Veuillez donner un nom à votre objectif.")
                return
            }

            await addSavingsGoal(
                user?.primaryEmailAddress?.emailAddress as string,
                name,
                target,
                deadline || null,
                category || 'Général',
                selectedEmoji || '🎯'
            )

            fetchGoals()
            const modal = document.getElementById("goal_modal") as HTMLDialogElement
            if (modal) modal.close()

            setNotification("Objectif d'épargne créé !")
            setName("")
            setTargetAmount("")
            setDeadline("")
            setCategory("")
            setSelectedEmoji("")
        } catch (error) {
            setNotification(`Erreur: ${error}`)
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm("Supprimer cet objectif d'épargne ?")) {
            try {
                await deleteSavingsGoal(id)
                fetchGoals()
                setNotification("Objectif supprimé.")
            } catch (error) {
                console.error(error)
            }
        }
    }

    const handleOpenFundModal = (goalId: string) => {
        setSelectedGoalId(goalId)
        setFundAmount("")
        const modal = document.getElementById("fund_modal") as HTMLDialogElement
        if (modal) modal.showModal()
    }

    const handleAddFunds = async () => {
        try {
            const amt = parseFloat(fundAmount)
            if (isNaN(amt) || amt <= 0) {
                setNotification("Montant invalide.")
                return
            }

            await updateSavingsGoalProgress(selectedGoalId, amt)
            fetchGoals()

            const modal = document.getElementById("fund_modal") as HTMLDialogElement
            if (modal) modal.close()
            setNotification(`${amt} TND ajoutés à votre épargne !`)
        } catch (error) {
            setNotification(`Erreur: ${error}`)
        }
    }

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
    const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length
    const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

    return (
        <Wrapper>
            {notification && (
                <Notification message={notification} onclose={() => setNotification("")} />
            )}

            {/* Stats cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                <div className='glass-card p-5 flex items-center justify-between'>
                    <div>
                        <span className='text-gray-400 text-sm'>Objectifs</span>
                        <div className='text-2xl font-bold'>{goals.length}</div>
                    </div>
                    <Target className='w-9 h-9 text-accent/50' />
                </div>
                <div className='glass-card p-5 flex items-center justify-between'>
                    <div>
                        <span className='text-gray-400 text-sm'>Total Épargné</span>
                        <div className='text-2xl font-bold text-success'>{totalSaved} TND</div>
                    </div>
                    <PiggyBank className='w-9 h-9 text-success/50' />
                </div>
                <div className='glass-card p-5 flex items-center justify-between'>
                    <div>
                        <span className='text-gray-400 text-sm'>Objectif Total</span>
                        <div className='text-2xl font-bold text-accent'>{totalTarget} TND</div>
                    </div>
                    <TrendingUp className='w-9 h-9 text-accent/50' />
                </div>
                <div className='glass-card p-5 flex items-center justify-between'>
                    <div>
                        <span className='text-gray-400 text-sm'>Atteints</span>
                        <div className='text-2xl font-bold text-success'>{completedGoals}/{goals.length}</div>
                    </div>
                    <div className="radial-progress text-accent text-xs" style={{ "--value": overallProgress, "--size": "2.5rem" } as React.CSSProperties}>
                        {overallProgress}%
                    </div>
                </div>
            </div>

            {/* Action bar */}
            <div className='flex justify-between items-center mb-6'>
                <button
                    className="btn btn-accent rounded-lg gap-2"
                    onClick={() =>
                        (document.getElementById("goal_modal") as HTMLDialogElement).showModal()
                    }
                >
                    <Plus className='w-4 h-4' />
                    Nouvel Objectif
                </button>
            </div>

            {/* Goals list */}
            {loading ? (
                <div className='flex justify-center py-10'>
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            ) : goals.length === 0 ? (
                <div className='glass-card p-10'>
                    <div className='empty-state'>
                        <Target className='w-12 h-12 text-gray-500 mb-3' />
                        <span className='text-gray-500'>Aucun objectif d&apos;épargne. Créez-en un !</span>
                    </div>
                </div>
            ) : (
                <div className='grid md:grid-cols-2 gap-4'>
                    {goals.map((goal) => (
                        <SavingsGoalItem
                            key={goal.id}
                            goal={goal}
                            onDelete={handleDelete}
                            onAddFunds={handleOpenFundModal}
                        />
                    ))}
                </div>
            )}

            {/* Add Goal Modal */}
            <dialog id="goal_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg mb-1">Nouvel objectif d&apos;épargne</h3>
                    <p className="text-gray-500 text-sm mb-4">Définissez un objectif pour motiver votre épargne</p>

                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            value={name}
                            placeholder="Nom de l'objectif (ex: Vacances, Voiture...)"
                            onChange={(e) => setName(e.target.value)}
                            className="input input-bordered"
                        />

                        <input
                            type="number"
                            value={targetAmount}
                            placeholder="Montant cible (TND)"
                            onChange={(e) => setTargetAmount(e.target.value)}
                            className="input input-bordered"
                        />

                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="input input-bordered"
                            placeholder="Date limite (optionnel)"
                        />

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="select select-bordered"
                        >
                            <option value="">Catégorie</option>
                            <option value="Voyage">🌍 Voyage</option>
                            <option value="Véhicule">🚗 Véhicule</option>
                            <option value="Logement">🏠 Logement</option>
                            <option value="Éducation">📚 Éducation</option>
                            <option value="Urgence">🚨 Fonds d&apos;urgence</option>
                            <option value="Retraite">👴 Retraite</option>
                            <option value="Autre">📦 Autre</option>
                        </select>

                        <button
                            className="btn btn-sm"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            {selectedEmoji || "Choisir un emoji 🎯"}
                        </button>

                        {showEmojiPicker && (
                            <div className="flex justify-center">
                                <EmojiPicker onEmojiClick={handleEmojiSelect} />
                            </div>
                        )}

                        <button onClick={handleAddGoal} className="btn btn-accent rounded-lg">
                            Créer l&apos;objectif
                        </button>
                    </div>
                </div>
            </dialog>

            {/* Add Funds Modal */}
            <dialog id="fund_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg mb-4">💰 Ajouter à l&apos;épargne</h3>
                    <div className="flex flex-col gap-3">
                        <input
                            type="number"
                            value={fundAmount}
                            placeholder="Montant à ajouter (TND)"
                            onChange={(e) => setFundAmount(e.target.value)}
                            className="input input-bordered"
                        />
                        <button onClick={handleAddFunds} className="btn btn-success rounded-lg">
                            Ajouter les fonds
                        </button>
                    </div>
                </div>
            </dialog>
        </Wrapper>
    )
}

export default EpargnePage
