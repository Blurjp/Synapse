"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Plus, Search, Grid3X3, List, MoreHorizontal, 
  Folder, Star, Clock, Users, Trash2, Settings,
  Brain, Sparkles, FileText, Video, BookOpen
} from "lucide-react";

interface Board {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  itemCount: number;
  collaborators: number;
  lastModified: string;
  isStarred: boolean;
}

const defaultBoards: Board[] = [
  {
    id: "1",
    title: "Research Notes",
    description: "Academic papers and research materials",
    icon: "📚",
    color: "bg-blue-500",
    itemCount: 24,
    collaborators: 2,
    lastModified: "2 hours ago",
    isStarred: true,
  },
  {
    id: "2",
    title: "Content Ideas",
    description: "Blog posts and social media content",
    icon: "💡",
    color: "bg-amber-500",
    itemCount: 18,
    collaborators: 1,
    lastModified: "5 hours ago",
    isStarred: false,
  },
  {
    id: "3",
    title: "Learning Path",
    description: "Courses and tutorials to complete",
    icon: "🎓",
    color: "bg-green-500",
    itemCount: 12,
    collaborators: 0,
    lastModified: "1 day ago",
    isStarred: true,
  },
  {
    id: "4",
    title: "Project Alpha",
    description: "Main project documentation",
    icon: "🚀",
    color: "bg-purple-500",
    itemCount: 45,
    collaborators: 4,
    lastModified: "3 days ago",
    isStarred: false,
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>(defaultBoards);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📝");
  const [selectedColor, setSelectedColor] = useState("bg-primary-500");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary-600 animate-pulse" />
          <span className="text-lg text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const filteredBoards = boards.filter((board) =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const starredBoards = filteredBoards.filter((b) => b.isStarred);
  const recentBoards = filteredBoards.filter((b) => !b.isStarred);

  const handleCreateBoard = () => {
    if (!newBoardTitle.trim()) return;

    const newBoard: Board = {
      id: Date.now().toString(),
      title: newBoardTitle,
      description: newBoardDescription,
      icon: selectedIcon,
      color: selectedColor,
      itemCount: 0,
      collaborators: 0,
      lastModified: "Just now",
      isStarred: false,
    };

    setBoards([newBoard, ...boards]);
    setShowCreateModal(false);
    setNewBoardTitle("");
    setNewBoardDescription("");
    setSelectedIcon("📝");
    setSelectedColor("bg-primary-500");
  };

  const toggleStar = (boardId: string) => {
    setBoards(
      boards.map((b) =>
        b.id === boardId ? { ...b, isStarred: !b.isStarred } : b
      )
    );
  };

  const iconOptions = ["📝", "📚", "💡", "🚀", "🎯", "📊", "🎨", "🔬", "💼", "🌟", "📌", "🗂️"];
  const colorOptions = [
    "bg-primary-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-red-500",
    "bg-cyan-500",
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">Synapse</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search boards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-primary-500 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-600 text-primary-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition ${
                    viewMode === "list"
                      ? "bg-white dark:bg-slate-600 text-primary-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-9 h-9 rounded-full"
                  />
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back, {session.user?.name?.split(" ")[0] || "there"}!
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Organize your knowledge, connect your ideas
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              New Board
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Folder className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{boards.length}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Boards</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{starredBoards.length}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Starred</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {boards.reduce((acc, b) => acc + b.itemCount, 0)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Items</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {boards.reduce((acc, b) => acc + b.collaborators, 0)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Collaborators</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Starred Boards */}
        {starredBoards.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Starred
            </h2>
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
              {starredBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  viewMode={viewMode}
                  onToggleStar={() => toggleStar(board.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Boards */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Recent
          </h2>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
            {recentBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                viewMode={viewMode}
                onToggleStar={() => toggleStar(board.id)}
              />
            ))}
          </div>

          {filteredBoards.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <Folder className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No boards found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {searchQuery ? "Try a different search term" : "Create your first board to get started"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  Create Board
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Create New Board
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Board Title
                  </label>
                  <input
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="e.g., Research Notes"
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    placeholder="What's this board about?"
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        className={`w-10 h-10 text-xl rounded-lg transition ${
                          selectedIcon === icon
                            ? "bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500"
                            : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full ${color} transition ${
                          selectedColor === color
                            ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-slate-900 dark:ring-white"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBoard}
                  disabled={!newBoardTitle.trim()}
                  className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Create Board
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Board Card Component
function BoardCard({
  board,
  viewMode,
  onToggleStar,
}: {
  board: Board;
  viewMode: "grid" | "list";
  onToggleStar: () => void;
}) {
  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition cursor-pointer group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-10 h-10 ${board.color} rounded-lg flex items-center justify-center text-xl`}>
              {board.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900 dark:text-white">{board.title}</h3>
              {board.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{board.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span>{board.itemCount} items</span>
              {board.collaborators > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {board.collaborators}
                </span>
              )}
              <span>{board.lastModified}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
            className="p-2 text-slate-400 hover:text-amber-500 transition"
          >
            <Star
              className={`w-5 h-5 ${board.isStarred ? "fill-amber-500 text-amber-500" : ""}`}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
      <div className={`${board.color} h-2`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 ${board.color} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
            {board.icon}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
            className="p-1.5 text-slate-400 hover:text-amber-500 transition opacity-0 group-hover:opacity-100"
          >
            <Star
              className={`w-5 h-5 ${board.isStarred ? "fill-amber-500 text-amber-500" : ""}`}
            />
          </button>
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{board.title}</h3>
        {board.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{board.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{board.itemCount} items</span>
          <div className="flex items-center gap-3">
            {board.collaborators > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {board.collaborators}
              </span>
            )}
            <span>{board.lastModified}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
