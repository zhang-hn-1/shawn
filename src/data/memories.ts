import sharedUs01 from "../../1.png";
import sharedUs02 from "../../2.png";

export type MemoryImage = {
  id: string;
  src: string;
  alt: string;
  date: string;
  location: string;
  caption: string;
  orientation: "landscape" | "portrait" | "square";
  chapter: string;
  featured?: boolean;
};

const collectionFiles = {
  "cute-you": [
    "0598b4508179c3a5420008e646f87d61.jpg", "0de0ff8a31d5595c43cc924bfaa9eeba.jpg", "2298365853643e5f9f53929b63b47256.jpg", "3014c0b3ede9587a2bbea941252d8f2e.jpg", "3542758ade4c47964f0e6b5028ef3aed.jpg", "3c6724f4bf7fd3f8f3ac9e4cbf684a7d.jpg", "4f7faacf15cd9a93a7332c8c1059f081.jpg", "593daf7d8e8900b82b76354fcdbd2564.jpg", "6a9d77e765f5c55f1c7cd2efe56ae079.jpg", "6d64400c56e65f3e3b99bbd3b1cad161.jpg", "8d8949e1f45911173f26225b63f162a5.jpg", "9e1de29e99ccae14e1de624dadec5f98.jpg", "a2219eca15e9d12cdfc2a63f6dda8a5a.jpg", "a5defc20f3ccc87474d51fee1d11ebc0.jpg", "bf6dfe7e59ab2f507631ebfb9ff18eb8.jpg", "e458ce11cf7f5f819997cd6df8d124a5.jpg", "fa76940c88a4900f7548e7f2b410142e.jpg",
  ],
  "shared-us": [
    "167aaca04d2061577e0863e4b8668aad.jpg", "4afa9f7ebeee2249e63910015869056d.jpg", "6f7656e258adb06c2a3fe6553312b52a.jpg", "9a7ca5c622d1e91171f1fa2ff0023fb6.jpg", "c73927f21df66ce27f5389e1bbdb5ebd.jpg", "eb3f4851ff0b6752795bc962fafd91c1.jpg", "fc1f6113216153d177460b4ff80d9119.jpg",
  ],
  travel: ["41fbc0460f6984d1d13a4c3f669182f9.jpg", "8a371b89f48f2f8248223aa86c126a87.jpg", "cc6331a50133dfc07d9726e4c2978c3a.jpg"],
  ordinary: ["2e6445d887691173f47f5aceff381c15.jpg", "830bce56dd65e871a5469ecaeeff6cd6.jpg", "da67da4aab9358a0cd2da00eb076b1f8.jpg", "dd5d021c25640f49ee7fe681fe59f544.jpg", "e08963c935bff675ea07d16f95a9d116.jpg"],
} as const;

export const memories: MemoryImage[] = Object.entries(collectionFiles).flatMap(([collection, files]) => files.map((file, index) => ({
  id: `${collection}-${String(index + 1).padStart(2, "0")}`,
  src: collection === "shared-us" && index === 0 ? sharedUs01 : collection === "shared-us" && index === 1 ? sharedUs02 : `/images/recollections/${collection}/${file}?v=20260803`,
  alt: `${collection === "cute-you" ? "可爱的你" : collection === "shared-us" ? "我与淑淑" : collection === "travel" ? "旅行" : "普通日子"} · ${String(index + 1).padStart(2, "0")}`,
  date: "",
  location: "",
  caption: "",
  orientation: "landscape" as const,
  chapter: collection,
})));

export function getMemory(id: string) {
  return memories.find((memory) => memory.id === id);
}
