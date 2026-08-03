export interface MemoryChat {
  id: string;
  date: string;
  time?: string;
  speaker: "你" | "我";
  content: string;
  chapter: string;
  relatedImage?: string;
}

// Keep only the lines that move the story forward; replace this list with real chat excerpts.
export const chats: MemoryChat[] = [
  { id: "chat-001", date: "2024.10", time: "", speaker: "我", content: "这个材料怎么改？", chapter: "first-meeting", relatedImage: "park-together" },
  { id: "chat-002", date: "2024.10", time: "", speaker: "你", content: "感觉做得很好。", chapter: "first-meeting", relatedImage: "park-together" },
  { id: "chat-003", date: "2024.10", time: "", speaker: "你", content: "刚刚碰到的是不是我？", chapter: "conversations" },
  { id: "chat-004", date: "2024.10", time: "", speaker: "我", content: "都溜了就剩你了。", chapter: "conversations" },
  { id: "chat-005", date: "2025.06", time: "", speaker: "你", content: "幸好有你在，不会太孤单。", chapter: "conversations" },
  { id: "chat-006", date: "2025.11", time: "", speaker: "我", content: "我在现在和以后很爱你。", chapter: "conversations", relatedImage: "travel-together" },
  { id: "chat-007", date: "2026.02", time: "", speaker: "你", content: "好想你。", chapter: "conversations" },
  { id: "chat-008", date: "2026.02", time: "", speaker: "我", content: "我们梦里见。", chapter: "conversations" },
];

export const chatsFor = (chapter: string) => chats.filter((chat) => chat.chapter === chapter);
