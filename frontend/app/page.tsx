import { Zap, ArrowRight, Sparkles, Users, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/icon.jpg?v=2" alt="Synapse" className="w-14 h-10 rounded-xl shadow-md" />
              <div>
                <span className="text-xl font-bold text-neutral-900">Synapse</span>
                <p className="text-xs text-neutral-500">Knowledge Management</p>
              </div>
            </Link>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-neutral-600 hover:text-black transition-colors">
                Features
              </a>
              <a href="#use-cases" className="text-neutral-600 hover:text-black transition-colors">
                Use Cases
              </a>
              <Link href="/auth/signin" className="text-neutral-600 hover:text-black transition-colors">
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
      <section className="container mx-auto px-6 py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full text-black text-sm font-medium mb-8 shadow-sm">
            <Sparkles className="w-4 h-4" />
            AI-Powered Knowledge Platform
          </div>
          <h1 className="text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Where ideas
            <br />
            <span className="text-black">connect</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto">
            Synapse brings your notes, research, and ideas together in one connected space.
            Powered by AI to help you learn faster and create better.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signin" className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="btn-outline text-lg px-8 py-3">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Everything connected in one place
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Powerful features designed to help you capture, organize, and connect your knowledge.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center mb-4">
              <img src="/icon.jpg?v=2" alt="Synapse" className="w-10 h-8 rounded-lg" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              AI-Powered Insights
            </h3>
            <p className="text-neutral-600">
              Get intelligent suggestions and connections between your notes, powered by advanced AI.
            </p>
          </div>
          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-neutral-800" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Smart Organization
            </h3>
            <p className="text-neutral-600">
              Automatically categorize and tag your content. Find what you need instantly.
            </p>
          </div>
          <div className="card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Collaborate Together
            </h3>
            <p className="text-neutral-600">
              Share boards and notes with your team. Build knowledge together in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Built for curious minds
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card border-l-4 border-l-black">
              <Lightbulb className="w-8 h-8 text-black mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                For creators
              </h3>
              <p className="text-neutral-600">
                Capture灵感 moments, organize ideas, and turn scattered thoughts into polished content.
              </p>
            </div>
            <div className="card border-l-4 border-l-neutral-900">
              <Zap className="w-8 h-8 text-neutral-900 mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                For researchers
              </h3>
              <p className="text-neutral-600">
                Connect findings across papers, see relationships between concepts, and accelerate discovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-light rounded-3xl p-16 text-center shadow-lg border border-neutral-200">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="w-12 h-12 text-black" />
            <img src="/icon.jpg?v=2" alt="Synapse" className="w-16 h-12 rounded-xl shadow-md" />
          </div>
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Ready to connect your ideas?
          </h2>
          <p className="text-neutral-600 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of creators, researchers, and students using Synapse to build their knowledge.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-primary text-white rounded-xl hover:shadow-lg transition text-lg font-semibold"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/icon.jpg?v=2" alt="Synapse" className="w-10 h-8 rounded-lg" />
              <span className="text-lg font-bold text-neutral-900">
                Synapse
              </span>
            </div>
            <p className="text-neutral-500">
              © 2026 Synapse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
