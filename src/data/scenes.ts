import { getMemory } from "./memories";

export type SceneType =
  | "opening"
  | "chapter"
  | "photo"
  | "photo-pair"
  | "chat"
  | "video"
  | "quote"
  | "letter"
  | "location"
  | "ending";

export interface StoryScene {
  id: string;
  type: SceneType;
  chapterId: string;
  title?: string;
  subtitle?: string;
  text?: string;
  speaker?: string;
  time?: string;
  date?: string;
  location?: string;
  image?: string;
  images?: string[];
  video?: string;
  poster?: string;
  alignment?: "left" | "center" | "right";
  theme?: "dark" | "warm" | "light";
  caption?: string;
}

const photo = (id: string) => getMemory(id)!;

function photoScenes(collection: string, chapterId: string, label: string) {
  return Array.from({ length: collection === "cute-you" ? 17 : collection === "travel" ? 3 : collection === "ordinary" ? 5 : 7 }, (_, index) => {
    const id = `${collection}-${String(index + 1).padStart(2, "0")}`;
    return { id, type: "photo" as const, chapterId, title: `${label} · ${String(index + 1).padStart(2, "0")}`, image: photo(id).src, alignment: "center" as const, theme: index % 3 === 1 ? "dark" as const : "warm" as const };
  });
}

const shared = (index: number, chapterId: string) => {
  const id = `shared-us-${String(index).padStart(2, "0")}`;
  return { id, type: "photo" as const, chapterId, title: `我与淑淑 · ${String(index).padStart(2, "0")}`, image: photo(id).src, alignment: "center" as const, theme: index % 2 === 0 ? "dark" as const : "warm" as const };
};

export const scenes: StoryScene[] = [
  { id: "opening-01", type: "opening", chapterId: "opening", title: "我们共同拍摄的", subtitle: "一部未完电影", text: "A PRIVATE FILM · 2024—2026", alignment: "left", theme: "dark" },
  { id: "prologue-01", type: "chapter", chapterId: "prologue", title: "我们还不认识彼此的时候", subtitle: "CHAPTER 00 · PROLOGUE", text: "故事没有一个盛大的开场。它从一次材料沟通开始，在很多个普通日子里，慢慢变成了我们。", alignment: "center", theme: "warm" },
  shared(1, "prologue"),
  { id: "first-meeting-01", type: "chapter", chapterId: "first-meeting", title: "从一件小事开始靠近", subtitle: "CHAPTER 01 · FIRST MEETING", text: "最开始，我们只是一起把事情做好。后来才发现，有些事情一旦一起经历，就会留下比结果更久的东西。", alignment: "center", theme: "warm" },
  shared(2, "first-meeting"),
  shared(3, "first-meeting"),
  { id: "conversations-01", type: "chapter", chapterId: "conversations", title: "有些话，只对你说", subtitle: "CHAPTER 02 · CONVERSATIONS", text: "聊天不是证据，是两个人如何把一天交给彼此的声音。我们只留下那些让故事往前走的句子。", alignment: "center", theme: "dark" },
  { id: "chat-01", type: "chat", chapterId: "conversations", speaker: "你", time: "23:47", text: "这个材料怎么改？", title: "SELECTED DIALOGUE 01", alignment: "center", theme: "dark" },
  shared(4, "conversations"),
  { id: "chat-02", type: "chat", chapterId: "conversations", speaker: "我", time: "23:48", text: "我把草稿拿给你看，我们一起商量。", title: "SELECTED DIALOGUE 02", alignment: "center", theme: "dark" },
  shared(5, "conversations"),
  { id: "conversation-quote", type: "quote", chapterId: "conversations", title: "有些话，我只对你说", text: "从“这个材料怎么改”，到“宝宝晚安”。称呼变了，生活也逐渐有了一个可以回去说话的地方。", alignment: "center", theme: "warm" },
  { id: "cute-you-01-chapter", type: "chapter", chapterId: "cute-you", title: "可爱的你", subtitle: "CHAPTER 03 · CUTE YOU", text: "这一章没有复杂的故事，只想把你可爱的每一个瞬间，好好放在这里。", alignment: "center", theme: "warm" },
  ...photoScenes("cute-you", "cute-you", "可爱的你"),
  { id: "places-01", type: "chapter", chapterId: "places", title: "我们去过的地方", subtitle: "CHAPTER 04 · PLACES", text: "城市不是地图上的一个点。它是那天的天气、走过的路，以及你站在我身边的样子。", alignment: "center", theme: "dark" },
  { id: "places-location", type: "location", chapterId: "places", title: "SOMEWHERE TOGETHER", location: "与你同行", subtitle: "TRAVEL", text: "只要和你一起，一段路也值得记住。", alignment: "center", theme: "dark" },
  ...photoScenes("travel", "places", "旅行"),
  { id: "place-text", type: "quote", chapterId: "places", title: "路会记得", text: "我们把一段路走得很慢，好像这样就能多留一会儿。后来照片会褪色，天气会改变，可是一起走过的方向不会。", alignment: "center", theme: "warm" },
  { id: "ordinary-01", type: "chapter", chapterId: "ordinary-days", title: "最值得记住的普通日子", subtitle: "CHAPTER 05 · ORDINARY DAYS", text: "后来我才发现，真正被我记住的，大多是这些没有被认真记录的日子。", alignment: "center", theme: "warm" },
  ...photoScenes("ordinary", "ordinary-days", "普通日子"),
  { id: "ordinary-quote", type: "quote", chapterId: "ordinary-days", title: "它们不隆重", text: "一起吃饭、散步、看书、等下课。没有特殊纪念意义的聊天，也没有准备好的姿势。它们不隆重，但很像生活本身。", alignment: "center", theme: "warm" },
  { id: "letter-01", type: "letter", chapterId: "letter", title: "写给我最重要的宝贝", subtitle: "A LETTER FOR YOU · 01", text: "我想把我们从一开始到现在的很多片段，按照时间一点点捋下来，像重新走一遍我们一起走过的路。", alignment: "center", theme: "warm" },
  { id: "letter-02", type: "letter", chapterId: "letter", subtitle: "A LETTER FOR YOU · 02", text: "最早的时候，我们之间还没有那么多现在这样亲密的称呼。那时候我们聊先进班集体，聊材料怎么改，聊草稿做好了没有。现在想起来，那些话不像情话，却是我们之间很真实的开始。", alignment: "center", theme: "warm" },
  { id: "letter-03", type: "letter", chapterId: "letter", subtitle: "A LETTER FOR YOU · 03", text: "后来运动会那几天，操场、签到、点名、班长、团支书，还有那些一边破防一边发出来的表情包，把那段时间弄得很有画面感。我们都在同一个学校里，被差不多的通知和事情弄得有点烦，却又因为能和对方吐槽几句，觉得这件事没那么难熬。", alignment: "center", theme: "dark" },
  { id: "letter-04", type: "letter", chapterId: "letter", subtitle: "A LETTER FOR YOU · 04", text: "我一直觉得，真正的喜欢就是分享欲。看到好看的天想给你看，遇到好笑的事想跟你说，项目有进展想告诉你，论文被返修也想第一时间和你讲。内容不一定多重要，可是想告诉你这件事本身很重要。", alignment: "center", theme: "warm" },
  { id: "letter-05", type: "letter", chapterId: "letter", subtitle: "A LETTER FOR YOU · 05", text: "我也想和你一起过很多普通日子。一起吃饭，一起走一段路，一起等下课，一起吐槽某门课很离谱，一起看天，也一起在事情做完以后松一口气。我们不用急着把每一天都过成电影里的样子，认真过好每一个普通日子，就已经很好。", alignment: "center", theme: "warm" },
  { id: "letter-06", type: "letter", chapterId: "letter", subtitle: "A LETTER FOR YOU · 06", text: "如果这是一部电影，配乐大概是某天傍晚我们听过的那首偶然的歌，灯光是从南门到宿舍那段路灯的暖黄色，节奏就是我们之间不紧不慢的对话——有空就回，有事就说，有想念就发。", alignment: "center", theme: "dark" },
  { id: "letter-07", type: "letter", chapterId: "letter", subtitle: "A LETTER FOR YOU · 07", text: "而这部电影最动人的地方，大概就是：从第一帧开始，你就在。\n\n七夕快乐，宝贝。我想和你一起演下去", alignment: "center", theme: "warm" },
  { id: "now-01", type: "chapter", chapterId: "now", title: "故事还在继续", subtitle: "CHAPTER 06 · NOW", text: "我们已经一起走过一段路，下一段也还在拍摄中。", alignment: "center", theme: "warm" },
  shared(6, "now"),
  shared(7, "now"),
  { id: "ending-01", type: "ending", chapterId: "ending", title: "TO BE CONTINUED", subtitle: "下一幕仍在拍摄中", text: "A PRIVATE FILM · MADE FOR TWO", alignment: "center", theme: "dark" },
];

export const chapterOrder = ["opening", "prologue", "first-meeting", "conversations", "cute-you", "places", "ordinary-days", "letter", "now", "ending"];

export const chapterLabels: Record<string, string> = {
  opening: "片头",
  prologue: "序幕",
  "first-meeting": "初识",
  "cute-you": "可爱的你",
  conversations: "对话",
  places: "旅行",
  "ordinary-days": "普通日子",
  letter: "写给你",
  now: "现在",
  ending: "故事还在继续",
};
