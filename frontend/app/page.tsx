import { Sparkles, Edit3, Link2, Brain, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              Synapse
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Features
            </a>
            <a href="#use-cases" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Use Cases
            </a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Pricing
            </a>
            <Link href="/auth/signin" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Sign In
            </Link>
            <Link href="/auth/signin" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="w-12 h-12 text-primary-600" />
            <Brain className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Where ideas
            <br />
            <span className="text-primary-600">connect.</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Synapse is where learning meets creation. Connect your knowledge, insights, and creativity with AI agents that understand how you think.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signin" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-lg font-medium">
              Start Free Trial
            </Link>
            <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition text-lg font-medium border border-slate-200 dark:border-slate-700">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            The #1 personalized AI learning and creation agent
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
              <Link2 className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Save anything from anywhere
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Supports PDFs, webpages, YouTube videos, podcasts, audio recordings, Office documents, and more.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Your insights, not just from AI
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              It learns from your highlights, notes, and annotations while you read, watch, or listen.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
              <Edit3 className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Generation is just the beginning
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Every AI report opens as a fully editable document. Review, rewrite, and refine freely.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Everything connected in one space
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              From saving materials and gaining insights to lasting creation in one connected space.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="container mx-auto px-6 py-20 bg-white dark:bg-slate-800">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How people are using Synapse
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Creators */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              For creators
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Turning scattered ideas and materials into meaningful stories can feel overwhelming. Synapse helps you uncover hidden themes, connect ideas, and shape your insights.
            </p>
            <p className="text-primary-600 font-semibold">
              Create with confidence.
            </p>
          </div>

          {/* Researchers */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              For researchers
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Distilling key insights from piles of sources takes time and focus. Synapse brings everything together, synthesizing your findings into clear, persuasive reports.
            </p>
            <p className="text-primary-600 font-semibold">
              Present with influence.
            </p>
          </div>

          {/* Students */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              For students
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Facing endless readings and dense literature can feel exhausting. Synapse turns complex materials into clear understanding, transforming heavy texts.
            </p>
            <p className="text-primary-600 font-semibold">
              Learn with ease.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-10 h-10 text-white" />
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to connect your ideas?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of creators, researchers, and students using Synapse.
          </p>
          <Link href="/auth/signin" className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition text-lg font-medium">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary-600" />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              Synapse
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            © 2026 Synapse. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
