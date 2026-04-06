import Link from "next/link";
import Navbar from "./components/Navbar";
import {
  Landmark,
  TrendingUp,
  PiggyBank,
  BarChart3,
  Shield,
  Bell,
  ArrowRight,
  Wallet,
  Target,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Wallet className="w-7 h-7" />,
      title: "Gestion des Budgets",
      description:
        "Créez et suivez vos budgets par catégorie avec des barres de progression visuelles.",
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Suivi des Revenus",
      description:
        "Enregistrez vos revenus réguliers et imprévus pour une vue complète de vos finances.",
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: "Objectifs d'Épargne",
      description:
        "Définissez des objectifs d'épargne et suivez votre progression en temps réel.",
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: "Analyses Visuelles",
      description:
        "Graphiques détaillés revenus vs dépenses, tendances et rapports personnalisés.",
    },
    {
      icon: <Bell className="w-7 h-7" />,
      title: "Alertes Intelligentes",
      description:
        "Notifications en cas de dépassement de budget ou d'étapes d'objectifs atteintes.",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Sécurité Maximale",
      description:
        "Vos données financières sont protégées avec un chiffrement de niveau bancaire.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Créez votre compte",
      description: "Inscription rapide et sécurisée en quelques secondes.",
    },
    {
      number: "02",
      title: "Ajoutez vos budgets",
      description: "Définissez vos catégories de dépenses et vos plafonds.",
    },
    {
      number: "03",
      title: "Suivez vos finances",
      description: "Visualisez vos dépenses, revenus et objectifs en temps réel.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-5 md:px-[10%] py-20 md:py-32">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float delay-300"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            <span className="text-sm text-accent">Plateforme de gestion financière</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight animate-slide-up">
            Prenez le contrôle{" "}
            <span className="text-gradient">total</span>
            <br />
            de vos finances
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto animate-slide-up delay-200">
            Suivez vos budgets, revenus et objectifs d&apos;épargne en toute
            simplicité avec notre plateforme intuitive et sécurisée.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-slide-up delay-300">
            <Link
              href="/sign-up"
              className="btn btn-accent btn-lg rounded-xl gap-2 shadow-lg shadow-accent/25"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-in"
              className="btn btn-outline btn-lg rounded-xl"
            >
              Se connecter
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-xl mx-auto animate-fade-in delay-500">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">100%</div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">Gratuit</div>
            </div>
            <div className="text-center border-x border-base-300">
              <div className="text-2xl md:text-3xl font-bold text-accent">Sécurisé</div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">Chiffrement AES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">Temps réel</div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">Suivi instantané</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-5 md:px-[10%] py-20 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Tout ce dont vous avez{" "}
            <span className="text-gradient">besoin</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-lg mx-auto">
            Une suite complète d&apos;outils pour maîtriser vos finances personnelles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-6 group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 md:px-[10%] py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Comment ça{" "}
            <span className="text-gradient">marche</span> ?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              <div className="text-6xl font-black text-accent/10 group-hover:text-accent/20 transition-colors">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mt-2">{step.title}</h3>
              <p className="text-gray-400 text-sm mt-2">{step.description}</p>
              {index < 2 && (
                <ChevronRight className="hidden md:block absolute -right-6 top-8 w-8 h-8 text-accent/30" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-5 md:px-[10%] py-20">
        <div className="glass-card p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 gradient-accent"></div>
          <PiggyBank className="w-16 h-16 text-accent mx-auto mb-6 animate-float" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à maîtriser vos finances ?
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            Rejoignez Cha9a9ty.tn et commencez à suivre vos budgets, revenus et
            objectifs d&apos;épargne dès aujourd&apos;hui.
          </p>
          <Link
            href="/sign-up"
            className="btn btn-accent btn-lg rounded-xl gap-2 shadow-lg shadow-accent/25"
          >
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base-300 px-5 md:px-[10%] py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex text-xl items-center font-bold">
            Cha9a9ty<span className="text-gradient">.tn</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Cha9a9ty.tn. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Confidentialité</span>
            <span>Conditions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}