"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import EmojiPicker from "emoji-picker-react";
import { addBudget, getBudgetsByUser } from "../actions";
import Notification from "../components/Notification";
import { Budget } from "@/type";
import Link from "next/link";
import BudgetItem from "../components/BudgetItem";
import { Landmark, Plus, Search } from "lucide-react";

const BudjetsPage = () => {
  const { user } = useUser();
  const [budgetName, setBudgetName] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState<string>("");
  const closeNotification = () => setNotification("");

  const handleEmojiSelect = (emojiObject: { emoji: string }) => {
    setSelectedEmoji(emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleAddBudget = async () => {
    try {
      const amount = parseFloat(budgetAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Le montant doit être un nombre positif.");
      }

      await addBudget(
        user?.primaryEmailAddress?.emailAddress as string,
        budgetName,
        amount,
        selectedEmoji || '📊'
      );

      fetchBudgets();
      const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
      if (modal) modal.close();

      setNotification("Nouveau budget créé avec succès.");
      setBudgetName("");
      setBudgetAmount("");
      setSelectedEmoji("");
      setShowEmojiPicker(false);
    } catch (error) {
      setNotification(`Erreur : ${error}`);
    }
  };

  const fetchBudgets = async () => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setLoading(true);
      try {
        const userBudgets = await getBudgetsByUser(
          user.primaryEmailAddress.emailAddress
        );
        setBudgets(userBudgets);
      } catch (error) {
        setNotification(`Erreur lors de la récupération des budgets: ${error}`);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user?.primaryEmailAddress?.emailAddress]);

  const filteredBudgets = budgets.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => {
    return sum + (b.transactions?.reduce((s, t) => s + t.amount, 0) || 0);
  }, 0);

  return (
    <Wrapper>
      {notification && (
        <Notification message={notification} onclose={closeNotification} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-sm">Total Budgets</span>
            <div className="text-2xl font-bold text-accent">{totalBudget} TND</div>
          </div>
          <Landmark className="w-9 h-9 text-accent/50" />
        </div>
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-sm">Total Dépensé</span>
            <div className="text-2xl font-bold text-error">{totalSpent} TND</div>
          </div>
          <Landmark className="w-9 h-9 text-error/50" />
        </div>
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-sm">Restant</span>
            <div className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-success' : 'text-error'}`}>
              {totalBudget - totalSpent} TND
            </div>
          </div>
          <Landmark className="w-9 h-9 text-success/50" />
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <button
          className="btn btn-accent rounded-lg gap-2"
          onClick={() =>
            (document.getElementById("my_modal_3") as HTMLDialogElement).showModal()
          }
        >
          <Plus className="w-4 h-4" />
          Nouveau Budget
        </button>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un budget..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered input-sm pl-9 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Budget grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-md text-accent"></span>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="glass-card p-10">
          <div className="empty-state">
            <Landmark className="w-12 h-12 text-gray-500 mb-3" />
            <span className="text-gray-500">
              {searchTerm ? "Aucun budget trouvé." : "Aucun budget créé. Commencez par en créer un !"}
            </span>
          </div>
        </div>
      ) : (
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBudgets.map((budget) => (
            <Link href={`/manage/${budget.id}`} key={budget.id}>
              <BudgetItem budget={budget} enableHover={1} />
            </Link>
          ))}
        </ul>
      )}

      {/* Add Budget Modal */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Créer un budget</h3>
          <p className="text-gray-500 text-sm mb-4">Définissez un plafond de dépenses par catégorie</p>
          <div className="w-full flex flex-col gap-3">
            <input
              type="text"
              value={budgetName}
              placeholder="Nom du budget"
              onChange={(e) => setBudgetName(e.target.value)}
              className="input input-bordered"
              required
            />

            <input
              type="number"
              value={budgetAmount}
              placeholder="Montant (TND)"
              onChange={(e) => setBudgetAmount(e.target.value)}
              className="input input-bordered"
              required
            />

            <button
              className="btn btn-sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {selectedEmoji || "Sélectionner un emoji 🫵"}
            </button>

            {showEmojiPicker && (
              <div className="flex justify-center items-center my-2">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}

            <button onClick={handleAddBudget} className="btn btn-accent rounded-lg">
              Créer le budget
            </button>
          </div>
        </div>
      </dialog>
    </Wrapper>
  );
};

export default BudjetsPage;