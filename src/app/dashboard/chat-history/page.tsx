"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Calendar } from "@/lib/icons";
import Link from "next/link";

export default function ChatHistoryPage() {
  const router = useRouter();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = React.useState("");

  const allChats = useQuery(
    api.chatQueries.getUserChatSessions,
    user?.id ? { userId: user.id } : "skip"
  );

  const filteredChats = React.useMemo(() => {
    if (!allChats) return [];
    if (!searchQuery.trim()) return allChats;

    const query = searchQuery.toLowerCase();
    return allChats.filter(
      (chat) =>
        chat.title.toLowerCase().includes(query) ||
        chat.projectName.toLowerCase().includes(query) ||
        chat.messages.some((msg: any) =>
          msg.content.toLowerCase().includes(query)
        )
    );
  }, [allChats, searchQuery]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Chat History</h1>
        <p className="text-foreground/60">View and resume your previous conversations</p>
      </div>

      <div className="flex gap-4">
        {/* Sidebar - Chat List */}
        <div className="w-80 border border-border rounded-lg bg-secondary/10 p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-foreground/40" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {filteredChats && filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <Link
                  key={chat._id}
                  href={`/dashboard/appbuilder-chat/${chat._id}`}
                  className="block"
                >
                  <Card
                    className={`p-3 cursor-pointer hover:bg-secondary/20 transition-colors ${
                      chat.isActive ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{chat.title}</div>
                    <div className="text-xs text-foreground/60 mb-1">
                      {chat.projectName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground/40">
                      <Calendar className="h-3 w-3" />
                      {formatDate(chat.createdAt)}
                    </div>
                    {chat.messages.length > 0 && (
                      <div className="text-xs text-foreground/50 mt-2 line-clamp-1">
                        {chat.messages[chat.messages.length - 1].content.substring(0, 50)}
                        ...
                      </div>
                    )}
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center text-foreground/60 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No chats yet</p>
                <p className="text-sm mt-2">
                  Start a chat from AppBuilderPrompts after generating prompts
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <Card className="p-8">
            <div className="text-center text-foreground/60">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Select a chat to view</p>
              <p className="text-sm">
                Choose a conversation from the sidebar to continue where you left off
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

