import { Sparkles, Edit3, Link2, Brain, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Brain className="w-8 h-8 text-primary-500" />
              <div>
                <span className="text-xl font-semibold text-secondary-900">Synapse</span>
                <p className="text-xs text-secondary-500">Knowledge Management</p>
              </div>
            </Link>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-secondary-600 hover:text-secondary-900 transition">
                Features
              </a>
              <a href="#use-cases" className="text-secondary-600 hover:text-secondary-900 transition">
                Use Cases
              </a>
              <a href="#pricing" className="text-secondary-600 hover:text-secondary-900 transition">
                Pricing
              </a>
              <Link href="/auth/signin" className="text-secondary-600 hover:text-secondary-900 transition">
                Sign In
              </Link>
              <Link href="/auth/signin" className="btn-primary flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="w-12 h-12 text-primary-500" />
            <Brain className="w-12 h-12 text-purple-500" />
          </div>
          <h1 className="text-5xl font-bold text-secondary-900 mb-6">
            Where ideas
            <br />
            <span className="text-primary-500">connect.</span>
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
            Synapse is where learning meets creation. Connect your knowledge, insights, and creativity with AI agents that understand how you think.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signin" className="btn-primary flex items-center gap-2 text-lg px-6 py-3">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="btn-outline text-lg px-6 py-3">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary-900 mb-4">
            The #1 personalized AI learning and creation agent
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="card hover:shadow-md transition">
            <div className="metric-icon bg-primary-50 mb-4">
              <Link2 className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Save anything from anywhere
            </h3>
            <p className="text-secondary-600">
              Supports PDFs, webpages, YouTube videos, podcasts, audio recordings, Office documents, and more.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card hover:shadow-md transition">
            <div className="metric-icon bg-amber-50 mb-4">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Your insights, not just from AI
            </h3>
            <p className="text-secondary-600">
              It learns from your highlights, notes, and annotations while you read, watch, or listen.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card hover:shadow-md transition">
            <div className="metric-icon bg-green-50 mb-4">
              <Edit3 className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Generation is just the beginning
            </h3>
            <p className="text-secondary-600">
              Every AI report opens as a fully editable document. Review, rewrite, and refine freely.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card hover:shadow-md transition">
            <div className="metric-icon bg-purple-50 mb-4">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Everything connected in one space
            </h3>
            <p className="text-secondary-600">
              From saving materials and gaining insights to lasting creation in one connected space.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary-900 mb-4">
            How people are using Synapse
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Creators */}
          <div className="card bg-secondary-50 border-secondary-200">
            <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
              For creators
            </h3>
            <p className="text-secondary-600 mb-4">
              Turning scattered ideas and materials into meaningful stories can feel overwhelming. Synapse helps you uncover hidden themes, connect ideas, and shape your insights.
            </p>
            <p className="text-primary-500 font-semibold">
              Create with confidence.
            </p>
          </div>

          {/* Researchers */}
          <div className="card bg-secondary-50 border-secondary-200">
            <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
              For researchers
            </h3>
            <p className="text-secondary-600 mb-4">
              Distilling key insights from piles of sources takes time and focus. Synapse brings everything together, synthesizing your findings into clear, persuasive reports.
            </p>
            <p className="text-purple-500 font-semibold">
              Present with influence.
            </p>
          </div>

          {/* Students */}
          <div className="card bg-secondary-50 border-secondary-200">
            <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
              For students
            </h3>
            <p className="text-secondary-600 mb-4">
              Facing endless readings and dense literature can feel exhausting. Synapse turns complex materials into clear understanding, transforming heavy texts.
            </p>
            <p className="text-orange-500 font-semibold">
              Learn with ease.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-12 text-center">
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
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-500 rounded-lg hover:bg-primary-50 transition text-lg font-medium"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-secondary-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary-500" />
              <span className="text-lg font-semibold text-secondary-900">
                Synapse
              </span>
            </div>
            <p className="text-secondary-500">
              © 2026 Synapse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
