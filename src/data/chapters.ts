export type Chapter = {
  id: string;
  number: string;
  label: string;
  title: string;
  shortTitle: string;
};

export const chapters: Chapter[] = [
  { id: "prologue", number: "00", label: "PROLOGUE", title: "我们还不认识彼此的时候", shortTitle: "Prologue" },
  { id: "first-meeting", number: "01", label: "FIRST MEETING", title: "从一件小事开始靠近", shortTitle: "First Meeting" },
  { id: "conversations", number: "02", label: "CONVERSATIONS", title: "有些话，我只对你说", shortTitle: "Conversations" },
  { id: "places", number: "03", label: "PLACES", title: "我们去过的地方", shortTitle: "Places" },
  { id: "ordinary-days", number: "04", label: "ORDINARY DAYS", title: "最值得记住的普通日子", shortTitle: "Ordinary Days" },
  { id: "letter", number: "05", label: "LETTER", title: "写给你的一封长信", shortTitle: "Letter" },
  { id: "now", number: "06", label: "NOW", title: "故事还在继续", shortTitle: "Now" },
];
