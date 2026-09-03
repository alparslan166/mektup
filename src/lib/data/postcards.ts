export type PostcardItem = {
  id: string;
  title: string;
  image: string;
};

export type PostcardCategory = {
  id: string;
  name: string;
  items: PostcardItem[];
};

export const postcardCategories: PostcardCategory[] = [
  {
    id: "tr",
    name: "Türkiye Kartpostalları",
    items: [
      { id: "tr-0", title: "İstanbul", image: "/images/postcards/tr-0.svg" },
      { id: "tr-1", title: "Kapadokya", image: "/images/postcards/tr-1.svg" },
      { id: "tr-2", title: "Pamukkale", image: "/images/postcards/tr-2.svg" },
      { id: "tr-3", title: "Antalya", image: "/images/postcards/tr-3.svg" },
      { id: "tr-4", title: "Efes", image: "/images/postcards/tr-4.svg" },
      { id: "tr-5", title: "Karadeniz", image: "/images/postcards/tr-5.svg" },
      { id: "tr-6", title: "Boğaz", image: "/images/postcards/tr-6.svg" },
      { id: "tr-7", title: "Nemrut", image: "/images/postcards/tr-7.svg" },
    ],
  },
  {
    id: "love",
    name: "Seni Seviyorum Kartpostalları",
    items: [
      { id: "love-0", title: "Seni Seviyorum 1", image: "/images/postcards/love-0.svg" },
      { id: "love-1", title: "Seni Seviyorum 2", image: "/images/postcards/love-1.svg" },
      { id: "love-2", title: "Seni Seviyorum 3", image: "/images/postcards/love-2.svg" },
      { id: "love-3", title: "Seni Seviyorum 4", image: "/images/postcards/love-3.svg" },
      { id: "love-4", title: "Seni Seviyorum 5", image: "/images/postcards/love-4.svg" },
      { id: "love-5", title: "Seni Seviyorum 6", image: "/images/postcards/love-5.svg" },
      { id: "love-6", title: "Seni Seviyorum 7", image: "/images/postcards/love-6.svg" },
      { id: "love-7", title: "Seni Seviyorum 8", image: "/images/postcards/love-7.svg" },
    ],
  },
];

export const allPostcards: PostcardItem[] = postcardCategories.flatMap(
  (category) => category.items,
);

export function findPostcardById(id: string) {
  return allPostcards.find((card) => card.id === id);
}
