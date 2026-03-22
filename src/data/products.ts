export type Category = "sandals" | "bags" | "sunglasses" | "dresses";

export type Product = {
  id: string;
  slug: string;
  category: Category;
  priceMad: number;
  image: string;
  images: string[];
  sizes: string[];
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
};

export const products: Product[] = [
  {
    id: "1",
    slug: "sandales-cuir-nude",
    category: "sandals",
    priceMad: 459,
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
    ],
    sizes: ["36", "37", "38", "39", "40"],
    nameFr: "Sandales cuir nude",
    nameAr: "صندل جلدي بيج",
    descriptionFr:
      "Lanières fines en cuir véritable, semelle confortable. Parfait pour la ville et les soirées.",
    descriptionAr:
      "أشرطة رفيعة من جلد طبيعي، نعل مريح. مثالي للمدينة والسهرات.",
  },
  {
    id: "2",
    slug: "sandales-plates-dorees",
    category: "sandals",
    priceMad: 389,
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
    ],
    sizes: ["36", "37", "38", "39"],
    nameFr: "Sandales plates dorées",
    nameAr: "صندل مسطح ذهبي",
    descriptionFr:
      "Bride minimaliste et finition métallisée. Légères et élégantes.",
    descriptionAr:
      "حزام بسيط وتشطيب معدني لامع. خفيفة وأنيقة.",
  },
  {
    id: "3",
    slug: "sac-bandouliere-camel",
    category: "bags",
    priceMad: 699,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Sac bandoulière camel",
    nameAr: "حقيبة كتف كاميل",
    descriptionFr:
      "Cuir structuré, bandoulière ajustable. Compartiments intérieurs pour le quotidien.",
    descriptionAr:
      "جلد مُهيكل، حزام كتف قابل للتعديل. جيوب داخلية للاستخدام اليومي.",
  },
  {
    id: "4",
    slug: "tote-canvas-noir",
    category: "bags",
    priceMad: 329,
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Tote canvas noir",
    nameAr: "حقيبة يد كانفاس سوداء",
    descriptionFr:
      "Grand format, anses longues. Idéal travail ou week-end.",
    descriptionAr:
      "حجم كبير، مقابض طويلة. مثالية للعمل أو عطلة نهاية الأسبوع.",
  },
  {
    id: "5",
    slug: "lunettes-oversize-ecailles",
    category: "sunglasses",
    priceMad: 279,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Lunettes oversize écailles",
    nameAr: "نظارات كبيرة بنقشة سلحفاة",
    descriptionFr:
      "Verres polarisés, monture acétate. Protection UV400.",
    descriptionAr:
      "عدسات مستقطبة، إطار أسيتات. حماية UV400.",
  },
  {
    id: "6",
    slug: "lunettes-miroir-or",
    category: "sunglasses",
    priceMad: 319,
    image:
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80",
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Lunettes miroir or",
    nameAr: "نظارات عاكسة ذهبية",
    descriptionFr:
      "Style aviateur revisité, branches fines dorées.",
    descriptionAr:
      "أسلوب أفياتور معاد تصوره، ذراعان رفيعان باللون الذهبي.",
  },
  {
    id: "7",
    slug: "robe-lin-ivoire",
    category: "dresses",
    priceMad: 899,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
      "https://images.unsplash.com/photo-1612336305889-34af6a62c636?w=800&q=80",
    ],
    sizes: ["XS", "S", "M", "L"],
    nameFr: "Robe lin ivoire",
    nameAr: "فستان كتان عاجي",
    descriptionFr:
      "Coupe fluide, ceinture amovible. Parfaite pour les chaudes journées marocaines.",
    descriptionAr:
      "قصة انسيابية، حزام قابل للإزالة. مثالية لأيام الصيف في المغرب.",
  },
  {
    id: "8",
    slug: "robe-soiree-satin-noir",
    category: "dresses",
    priceMad: 1199,
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f0a39adb62?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f0a39adb62?w=800&q=80",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    nameFr: "Robe satin noir",
    nameAr: "فستان ساتان أسود",
    descriptionFr:
      "Dos nu, fente discrète. Élégance minimaliste pour vos soirées.",
    descriptionAr:
      "ظهر مكشوف، شق خفي. أناقة بسيطة لسهراتك.",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(
  category: Category,
  excludeId: string,
  limit = 3
) {
  return products
    .filter((p) => p.category === category && p.id !== excludeId)
    .slice(0, limit);
}
