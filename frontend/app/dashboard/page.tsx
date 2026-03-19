"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Home,
  FolderOpen,
  BarChart3,
  FileText,
  Settings,
  Brain,
  Search,
  Bell,
} from "lucide-react";

const navItems = [
  { section: "General", items: [
    { icon: Home, label: "Dashboard", active: true },
    { icon: FolderOpen, label: "All Boards" },
  ]},
  { section: "Analysis", items: [
    { icon: BarChart3, label: "Statistics" },
    { icon: FileText, label: "Reports" },
  ]},
  { section: "System", items: [
    { icon: Settings, label: "Settings" },
  ]},
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary-500 animate-pulse" />
          <span className="text-lg text-secondary-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-secondary-50">
      {/* Sidebar */}
      <aside className="w-[250px] bg-white border-r border-secondary-200 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-5 border-b border-secondary-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-secondary-900">Synapse</h1>
              <p className="text-xs text-secondary-500">Knowledge Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2 px-4">
                {section.section}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <a
                      href="#"
                      className={`nav-item ${item.active ? "active" : ""}`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-secondary-200">
          <div className="flex items-center gap-3">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {session.user?.name?.[0] || "U"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-secondary-500 truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[250px]">
        {/* Top Bar */}
        <header className="bg-white border-b border-secondary-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-secondary-900">Dashboard</h1>
                <p className="text-sm text-secondary-500 mt-0.5">Welcome to Synapse</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-64 bg-secondary-50 border border-secondary-200 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                {/* Notifications */}
                <button className="relative p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50 rounded-lg">
                  <Bell className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary-900 mb-1">
              Welcome back, {session.user?.name?.split(" ")[0] || "there"}!
            </h2>
            <p className="text-secondary-600">
              Here&apos;s an overview of your knowledge base
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="metric-icon bg-primary-50">
                  <FolderOpen className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600 mb-1">Total Boards</p>
                  <p className="text-3xl font-bold text-secondary-900">12</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-4">
                <div className="metric-icon bg-green-50">
                  <FileText className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600 mb-1">Total Notes</p>
                  <p className="text-3xl font-bold text-secondary-900">156</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-4">
                <div className="metric-icon bg-purple-50">
                  <BarChart3 className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600 mb-1">Categories</p>
                  <p className="text-3xl font-bold text-secondary-900">8</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-4">
                <div className="metric-icon bg-amber-50">
                  <Settings className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-secondary-900">24h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Activity Overview */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Activity Overview</h3>
                <button className="btn-outline text-sm">View All</button>
              </div>
              <div className="h-48 flex items-end justify-between gap-2 px-4">
                {[40, 55, 45, 60, 75, 65, 80].map((height, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary-500 rounded-t-sm transition-all hover:bg-primary-600"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-secondary-400">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Boards */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Recent Boards</h3>
                <button className="btn-outline text-sm">See All</button>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Research Notes", items: 24, color: "bg-blue-500" },
                  { title: "Content Ideas", items: 18, color: "bg-amber-500" },
                  { title: "Learning Path", items: 12, color: "bg-green-500" },
                  { title: "Project Alpha", items: 45, color: "bg-purple-500" },
                ].map((board, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-secondary-100 last:border-0">
                    <div className={`w-8 h-8 ${board.color} rounded-lg flex items-center justify-center`}>
                      <FolderOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">{board.title}</p>
                    </div>
                    <span className="text-sm text-secondary-500">{board.items} items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
