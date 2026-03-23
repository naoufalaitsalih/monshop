/** Identifiant de catégorie boutique (ex. sandals, ou slug personnalisé). */
export type Category = string;

/** Élément d’un pack : produit catalogue ou ligne manuelle (hors catalogue). */
export type PackItem =
  | { type: "existing"; productId: string }
  | { type: "custom"; name: string; priceMad: number; image: string };

export type Product = {
  id: string;
  slug: string;
  category: Category;
  /** Prix affiché (promo ou standard), en MAD */
  priceMad: number;
  /** Prix barré si promo (doit être > priceMad) */
  compareAtPriceMad?: number;
  image: string;
  images: string[];
  sizes: string[];
  nameFr: string;
  nameAr: string;
  shortDescriptionFr: string;
  shortDescriptionAr: string;
  longDescriptionFr: string;
  longDescriptionAr: string;
  isNew?: boolean;
  isPromo?: boolean;
  /** Bundle */
  isPack?: boolean;
  packItems?: PackItem[];
  /** @deprecated migré vers packItems — conservé pour JSON ancien */
  packItemIds?: string[];
  packDiscountPercent?: number;
};

/** Produit affiché comme pack (catégorie dédiée ou ancien flag isPack). */
export function isPackProduct(
  p: Pick<Product, "category" | "isPack">
): boolean {
  return p.category === "pack" || p.isPack === true;
}

function normalizePackItem(item: PackItem): PackItem | null {
  if (item.type === "existing") {
    const id = String(item.productId ?? "").trim();
    return id ? { type: "existing", productId: id } : null;
  }
  const name = String(item.name ?? "").trim();
  const priceMad = Math.max(0, Number(item.priceMad) || 0);
  const image = String(item.image ?? "").trim();
  if (!name || priceMad <= 0 || !image) return null;
  return { type: "custom", name, priceMad, image };
}

export function normalizeProduct(p: Product): Product {
  let category: Category = String(p.category ?? "sandals").trim() || "sandals";
  if (p.isPack === true && category !== "pack") {
    category = "pack";
  }
  const isPack = category === "pack";

  const rawImages = Array.isArray(p.images) ? p.images : [];
  const fromField = p.image?.trim() ? [p.image.trim()] : [];
  const merged = [...rawImages.map((x) => String(x).trim()).filter(Boolean), ...fromField];
  const images = [...new Set(merged)];
  const image = images[0] ?? "";

  let packItems: PackItem[] | undefined;
  if (isPack) {
    if (Array.isArray(p.packItems) && p.packItems.length > 0) {
      packItems = p.packItems
        .map((x) => normalizePackItem(x as PackItem))
        .filter(Boolean) as PackItem[];
    } else if (Array.isArray(p.packItemIds) && p.packItemIds.length > 0) {
      packItems = p.packItemIds.map((id) => ({
        type: "existing" as const,
        productId: String(id),
      }));
    }
  }

  const sizes = isPack ? ["TU"] : p.sizes?.length ? p.sizes : ["TU"];

  return {
    ...p,
    category,
    image,
    images: images.length > 0 ? images : image ? [image] : [],
    sizes,
    isPack: isPack || undefined,
    packItems: isPack && packItems && packItems.length > 0 ? packItems : undefined,
    packItemIds: undefined,
    packDiscountPercent: undefined,
    compareAtPriceMad: isPack ? undefined : p.compareAtPriceMad,
    isPromo: isPack ? undefined : p.isPromo,
  };
}

export const products: Product[] = [
  {
    id: "1",
    slug: "sandales-cuir-nude-casablanca",
    category: "sandals",
    priceMad: 459,
    compareAtPriceMad: 579,
    isPromo: true,
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
      "https://images.unsplash.com/photo-1515347619252-60a238075493?w=800&q=80",
    ],
    sizes: ["36", "37", "38", "39", "40"],
    nameFr: "Sandales cuir nude — Casablanca",
    nameAr: "صندل جلدي بيج — الدار البيضاء",
    shortDescriptionFr:
      "Nuance nude chic, idéale avec un caftan léger ou une tenue de ville à la corniche.",
    shortDescriptionAr:
      "لون بيج أنيق، ينسجم مع قفطان خفيف أو إطلالة يومية على الكورنيش.",
    longDescriptionFr:
      "Conçues pour les longues journées entre rendez-vous et sorties entre amies, ces sandales en cuir souple allient tenue et confort. Leur ligne épurée sublime les pieds sans voler la vedette à votre tenue : parfaites pour un mariage en journée à Marrakech, une réception à Rabat ou une terrasse à Casablanca. Semelle légèrement amortie, brides ajustables et finitions dorées discrètes pour une touche luxe accessible.",
    longDescriptionAr:
      "مصممة لأيام طويلة بين المواعيد والخروج مع الصديقات، تجمع هذه الصنادل الجلدية بين الثبات والراحة. خطها البسيط يبرز القدمين دون أن يطغى على الزي: مناسبة لحفل زفاف نهاري بمراكش، أو استقبال بالرباط، أو جلسة على شرفة بالدار البيضاء. نعل مُرَن قليلاً، أحزمة قابلة للضبط، وتفاصيل ذهبية خفيفة بلمسة فاخرة.",
  },
  {
    id: "2",
    slug: "sandales-plates-dorees-rabat",
    category: "sandals",
    priceMad: 419,
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    ],
    sizes: ["36", "37", "38", "39", "40"],
    nameFr: "Sandales plates dorées — Rabat",
    nameAr: "صندل مسطح ذهبي — الرباط",
    shortDescriptionFr:
      "Reflets dorés et silhouette minimaliste : l’accessoire qui habille une tenue simple pour les fêtes.",
    shortDescriptionAr:
      "لمعة ذهبية وقصة بسيطة: الإكسسوار الذي يرقي إطلالة بسيطة للأعياد والمناسبات.",
    longDescriptionFr:
      "Inspirées des lumières des soirées sur les toits-terrasses, ces sandales plates jouent la carte du glamour sans excès. La bride métallisée capte la lumière naturelle du soleil marocain et se marie aussi bien avec un pantalon tailleur qu’avec une robe fluide. Idéales pour les couscous du vendredi, les fêtes de fin d’année ou un dîner habillé à Rabat : légères, stables et faciles à chausser du matin au soir.",
    longDescriptionAr:
      "مستوحاة من أضواء السهرات على التراس، تمنح هذه الصنادل المسطحة لمسة بريق دون مبالغة. الحزام المعدني يلتقط ضوء الشمس المغربية ويتناغم مع بنطلون أنيق أو فستان منسدل. مثالية لجمعة العائلة، أعياد نهاية السنة، أو عشاء راقٍ بالرباط: خفيفة، ثابتة، وسهلة الارتداء من الصباح إلى المساء.",
  },
  {
    id: "3",
    slug: "mules-velours-emeraude-mariage",
    category: "sandals",
    priceMad: 529,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
      "https://images.unsplash.com/photo-1515347619252-60a238075493?w=800&q=80",
    ],
    sizes: ["36", "37", "38", "39", "41"],
    nameFr: "Mules velours émeraude — Édition mariages",
    nameAr: "ميول مخملي زمردي — طبعة أعراس",
    shortDescriptionFr:
      "Velours profond et coupe mule : l’élégance des cérémonies marocaines revisitée en version moderne.",
    shortDescriptionAr:
      "مخمل غامق وقصة ميول: أناقة الحفلات المغربية بروح عصرية.",
    longDescriptionFr:
      "Pièce signature de la saison, cette mule en velours émeraude a été pensée pour les mariages, les fiançailles et les grandes tablées familiales. La teinte jewel sublime les broderies et les bijoux traditionnels tout en restant portée avec un costume occidental. Talon bloc confortable pour danser jusqu’au bout de la nuit, doublure respirante pour les mois chauds. Une valeur sûre pour briller aux côtés d’une takchita ou d’une robe de soirée.",
    longDescriptionAr:
      "قطعة مميزة للموسم، صممت هذه الميول المخملية الزمردية للأعراس والخطوبة والولائم العائلية. اللون الثمين يبرز التطريز والمجوهرات التقليدية ويناسب أيضاً الزي العصري. كعب عريض مريح للرقص حتى آخر الليل، وبطانة تسمح بالتهوية في الحر. خيار مضمون بجانب التكشيطة أو فستان السهرة.",
  },
  {
    id: "4",
    slug: "sandales-tressees-medina",
    category: "sandals",
    priceMad: 349,
    image:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
    ],
    sizes: ["36", "37", "38", "39"],
    nameFr: "Sandales tressées — Esprit Médina",
    nameAr: "صندل مجدول — روح المدينة العتيقة",
    shortDescriptionFr:
      "Détail tressé artisanal, esprit boho-luxe pour flâner dans la médina ou au bord de mer.",
    shortDescriptionAr:
      "تفصيل مجدول بلمسة حرفية، أسلوب بوهو فاخر للتنزه في المدينة أو على البحر.",
    longDescriptionFr:
      "Un clin d’œil aux savoir-faire marocains et aux textures naturelles : le tressage apporte du caractère à une semelle plate ultra confortable. À porter avec un jean blanc, une djellaba légère ou une jupe en lin pour un look vacances à Essaouira ou Agadir. Faciles à glisser dans un cabas pour un week-end au riad : ce modèle incarne l’élégance décontractée des femmes qui aiment mixer tradition et modernité.",
    longDescriptionAr:
      "إحاء للحرف المغربية والخامات الطبيعية: النسيج المجدول يضفي طابعاً على نعل مسطح مريح جداً. تُرتدى مع جينز أبيض أو جلابة خفيفة أو تنورة كتان لإطلالة عطلة في الصويرة أو أكادير. سهلة الإلقاء في الحقيبة لعطلة في الرياض: هذا الطراز يجسد الأناقة غير الرسمية لمن تحب دمج الأصالة والحداثة.",
  },
  {
    id: "5",
    slug: "sac-bandouliere-cuir-camel-marrakech",
    category: "bags",
    priceMad: 749,
    compareAtPriceMad: 899,
    isPromo: true,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
      "https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Sac bandoulière cuir camel — Marrakech",
    nameAr: "حقيبة كتف جلد كاميل — مراكش",
    shortDescriptionFr:
      "Cuir grainé, forme structurée : le sac de tous les jours, du bureau aux dîners entre amies.",
    shortDescriptionAr:
      "جلد حبيبي وشكل مُهيكل: حقيبة اليوميات من العمل إلى العشاء مع الصديقات.",
    longDescriptionFr:
      "Investissement malin dans une garde-robe marocaine où le camel se marie avec tout, des tons terre aux couleurs vives des caftans. Bandoulière ajustable, poche zippée à l’intérieur et fermoir magnétique discret. Assez compact pour les scooters et taxis, assez spacieux pour téléphone, portefeuille et petite trousse maquillage. Pensé pour les trajets Casa–Mohammedia ou les journées shopping à Marrakech, il vieillit magnifiquement avec le cuir.",
    longDescriptionAr:
      "استثمار ذكي في خزانة تتناغم فيها درجات الكاميل مع كل شيء، من الألوان الترابية إلى الألوان الزاهية للقفاطن. حزام كتف قابل للتعديل، جيب داخلي بسحاب، وإغلاق مغناطيسي أنيق. بحجم عملي للدراجات والسيارات، وفيه مساحة للهاتف والمحفظة وصغيرة مكياج. مناسب لنقل الدار البيضاء–المحمدية أو يوم تسوق بمراكش، ويتحسن مظهر الجلد مع الوقت.",
  },
  {
    id: "6",
    slug: "grand-tote-canvas-minimal",
    category: "bags",
    priceMad: 359,
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      "https://images.unsplash.com/photo-1564422170191-7c1cfa53fd06?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Grand tote canvas — Ligne minimal",
    nameAr: "حقيبة توت كبيرة كانفاس — خط بسيط",
    shortDescriptionFr:
      "Volume généreux pour cours, plage ou carry-on week-end : chic et pratique.",
    shortDescriptionAr:
      "حجم واسع للدراسة أو الشاطئ أو حقيبة نهاية الأسبوع: أنيقة وعملية.",
    longDescriptionFr:
      "Le tote indispensable quand on enchaîne fac, bureau et courses du quartier. Toile épaisse résistante, anses longues pour porter sur l’épaule même avec une veste, renfort en bas pour ne pas perdre la forme. On l’adore avec une tenue monochrome pour un contraste net, ou avec des imprimés pour un esprit summer à Tanger. Facile à entretenir, il devient vite le sac « fourre-tout élégant » de toute la famille.",
    longDescriptionAr:
      "حقيبة لا غنى عنها بين الجامعة والعمل ومشتريات الحي. قماش سميك متين، مقابض طويلة تُحمل على الكتف حتى مع السترة، وتعزيز في القاعدة ليحافظ على الشكل. تليق مع إطلعة أحادية اللون لتباين واضح، أو مع طبعات لروح صيفية بطنجة. سهلة العناية، وتصبح سريعاً حقيبة «كل شيء بأناقة» للعائلة.",
  },
  {
    id: "7",
    slug: "pochette-soiree-satin-nouveau",
    category: "bags",
    priceMad: 289,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd9770fae3a?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd9770fae3a?w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Pochette satin — Soirées & henna",
    nameAr: "حقيبة يد ساتان — سهرات وحنة",
    shortDescriptionFr:
      "Brillance satinée pour accompagner vos tenues de fête, mariages et cérémonies.",
    shortDescriptionAr:
      "لمعة ساتان لتكمل إطلالات الحفلات والأعراس والمناسبات.",
    longDescriptionFr:
      "La petite sœur indispensable de vos robes de soirée : format pochette rigide ou souple selon la lumière, chaînette amovible pour porter en bandoulière lors des danses. Pensée pour les événements où l’on veut voyager léger tout en ayant style : téléphone, rouge à lèvres, carte et parfum de poche suffisent. Une alliée pour les fêtes de mariage marocaines, les soirées rooftop et les dîners où chaque détail compte.",
    longDescriptionAr:
      "الرفيق الصغير الضروري لفساتين السهرة: حجم كلاتش مع لمعان ناعم، سلسلة قابلة للفصل للحمل على الكتف أثناء الرقص. مصممة لمناسبات تريدين فيها السفر خفيفاً مع الحفاظ على الأناقة: هاتف، أحمر شفاه، بطاقة، وعطر صغير يكفي. رفيقة لأفراح الزفاف المغربية، وسهرات التراس، والعشاء حيث يهم كل تفصيل.",
  },
  {
    id: "8",
    slug: "cabas-cannage-ivoire-luxe",
    category: "bags",
    priceMad: 689,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      "https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Cabas cannage ivoire — Resort luxe",
    nameAr: "حقيبة كاناج عاجي — منتجع فاخر",
    shortDescriptionFr:
      "Motif cannage et tons ivoire : l’accessoire statement pour brunches et escapades.",
    shortDescriptionAr:
      "نقش كاناج وألوان عاجية: إكسسوار لافت للبرانش والعطلات القصيرة.",
    longDescriptionFr:
      "Inspiré des maisons de luxe et des resorts méditerranéens, ce cabas structure votre silhouette avec une allure « old money » très actuelle au Maroc. Anses en cuir, corps rigide pour ne pas s’affaisser, format idéal pour serviette, bouteille d’eau et magazine. Parfait pour un dimanche à la Marina, un goûter à la Palmeraie ou un shooting photo lifestyle. Un classique qui élève même un simple jean et tee-shirt blanc.",
    longDescriptionAr:
      "مستوحى من دور الأزياء الفاخرة والمنتجعات المتوسطية، يمنح هذا الكاباس قواماً بأسلوب «الثراء الهادئ» رائج في المغرب. مقابض جلد، هيكل صلب لا ينهار، وحجم مناسب للحقيبة والماء والمجلة. مثالي لأحد في المارينا، أو قهوة بالبالميراي، أو جلسة تصوير لايف ستايل. كلاسيكي يرقي حتى الجينز والتيشيرت الأبيض.",
  },
  {
    id: "9",
    slug: "lunettes-oversize-camelia",
    category: "sunglasses",
    priceMad: 299,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
      "https://images.unsplash.com/photo-1577803645773-f3453a2617e8?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Lunettes oversize — Camélia",
    nameAr: "نظارات كبيرة — كاميليا",
    shortDescriptionFr:
      "Monture généreuse et verres dégradés : star des sorties ensoleillées toute l’année.",
    shortDescriptionAr:
      "إطار واسع وعدسات متدرجة: نجمة الخروج تحت الشمس طوال السنة.",
    longDescriptionFr:
      "Sous le soleil intense des villes marocaines, les oversize ne sont pas qu’un détail mode : elles protègent le contour des yeux et du haut des joues. Monture acétate légère, charnières renforcées, verres catégorie 3. À associer avec un chapeau de paille pour la plage d’Asilah ou un tailleur pour un déplacement pro à bord d’un taxi. L’effet « célébrité incognito » garanti.",
    longDescriptionAr:
      "تحت شمس المدن المغربية القوية، النظارات الواسعة ليست للموضة فقط: تحمي محيط العينين والخدين. إطار أسيتات خفيف، مفصلات معززة، عدسات فئة 3. تُنسق مع قبعة قش للشاطئ بأصيلة أو بدلة لالتقاط تاكسي للعمل. مفعول «نجمية بهدوء» مضمون.",
  },
  {
    id: "10",
    slug: "lunettes-aviateur-miroir-promo",
    category: "sunglasses",
    priceMad: 249,
    compareAtPriceMad: 339,
    isPromo: true,
    image:
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80",
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80",
      "https://images.unsplash.com/photo-1511499003728-8c4171be1e9e?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Aviateur miroir — Édition promo",
    nameAr: "أفياتور عاكس — طبعة تخفيض",
    shortDescriptionFr:
      "Look pilote iconique, verres miroir : attitude assurée sur la route ou en terrasse.",
    shortDescriptionAr:
      "أسلوب الطيار الأيقوني، عدسات عاكسة: ثقة على الطريق أو في المقهى الخارجي.",
    longDescriptionFr:
      "Le modèle intemporel qui traverse les générations, revisité avec des verres miroir pour un style affirmé. Branches fines dorées, nez ajustable pour différents types de visages. Parfait pour la conduite sur autoroute ou les après-midis sur la Corniche : réduction des reflets et protection UV complète. Une pièce forte à prix doux pendant la promo — idéal pour offrir ou se faire plaisir sans attendre.",
    longDescriptionAr:
      "الطراز الخالد عبر الأجيال، بإصدار بعدسات عاكسة لأسلوب واضح. ذراعان ذهبيان رفيعان، أنف قابل للتعديل لأشكال وجوه مختلفة. مثالي للقيادة على الطريق السريع أو بعد الظهر على الكورنيش: تقليل وهج وحماية كاملة من الأشعة. قطعة قوية بسعر لطيف أثناء العرض — مناسبة للهدية أو الترفيه عن النفس دون انتظار.",
  },
  {
    id: "11",
    slug: "lunettes-cateye-noires-agadir",
    category: "sunglasses",
    priceMad: 279,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1577803645773-f3453a2617e8?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1577803645773-f3453a2617e8?w=800&q=80",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Lunettes cat-eye — Agadir",
    nameAr: "نظارات عين القطة — أكادير",
    shortDescriptionFr:
      "Angle cat-eye pour structurer le regard : féminin, graphique, intemporel.",
    shortDescriptionAr:
      "زاوية عين القطة لإطار العين: أنثوي، رسومي، خالد.",
    longDescriptionFr:
      "Le cat-eye sculpte instantanément les traits et apporte une touche rétro très glamour, particulièrement flatteuse sur les visages ronds ou ovales. Noir profond pour un contraste chic avec les tenues claires des étés à Agadir ou Fès. Léger sur le nez, compatible avec lentilles de contact. À glisser dans l’étui fourni avant de ranger dans le sac : prêt pour toutes vos escapades.",
    longDescriptionAr:
      "عين القطة تشكل الملامح فوراً بلمسة رجعية فاخرة، وتليق خصوصاً بالوجوه المستديرة أو البيضاوية. أسود عميق لتباين أنيق مع الملابس الفاتحة في صيف أكادير أو فاس. خفيف على الأنف، مناسب مع العدسات اللاصقة. يُوضع في الحافظة المرفقة قبل وضعه في الحقيبة: جاهز لكل الرحلات.",
  },
  {
    id: "12",
    slug: "solaires-rectangulaires-city",
    category: "sunglasses",
    priceMad: 269,
    image:
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80",
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80",
      "https://images.unsplash.com/photo-1511499003728-8c4171be1e9e?w=800&q=80",
    ],
    sizes: ["TU"],
    nameFr: "Solaires rectangulaires — City",
    nameAr: "نظارات شمسية مستطيلة — سيتي",
    shortDescriptionFr:
      "Lignes nettes, esthétique années 90 : le complément des tenues street & bureau.",
    shortDescriptionAr:
      "خطوط حادة، جمال تسعينات: تكملة إطلالات الشارع والمكتب.",
    longDescriptionFr:
      "Pour celles qui aiment un look structuré et contemporain, la monture rectangulaire affine le visage et fonctionne avec blazer, jean large ou ensemble coordonné. Verres neutres pour une vision naturelle des couleurs, idéale en ville entre deux rendez-vous. Un accessoire qui fait « sérieuse mais stylée » sans effort, du tram de Rabat aux cafés de Gueliz.",
    longDescriptionAr:
      "لمن تحب إطلالة منظمة ومعاصرة، الإطار المستطيل يضيق الوجه وينسجم مع البليزر أو الجينز الواسع أو الطقم المتناسق. عدسات محايدة لرؤية طبيعية للألوان، مثالية في المدينة بين موعدين. إكسسوار يوحي ب«جدية وأناقة» بلا عناء، من الترام بالرباط إلى المقاهي بكليز.",
  },
  {
    id: "13",
    slug: "robe-lin-ivoire-riad",
    category: "dresses",
    priceMad: 949,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
      "https://images.unsplash.com/photo-1612336305889-34af6a62c636?w=800&q=80",
      "https://images.unsplash.com/photo-1539008835657-9e8c476b6cdb?w=800&q=80",
    ],
    sizes: ["XS", "S", "M", "L"],
    nameFr: "Robe lin ivoire — Riad",
    nameAr: "فستان كتان عاجي — الرياض",
    shortDescriptionFr:
      "Lin respirant et coupe fluide : l’alliée des journées chaudes et des ftours en terrasse.",
    shortDescriptionAr:
      "كتان يسمح بالتهوية وقصة منسدلة: رفيقة الأيام الحارة وإفطار التراس.",
    longDescriptionFr:
      "Quand la chaleur monte, le lin devient votre meilleur ami : matière naturelle qui régule la température et gagne en souplesse à chaque lavage. Cette robe ivoire se porte avec sandales plates pour un look médina décontracté, ou avec talons et ceinture dorée pour un dîner habillé. Parfaite pour les brunchs du dimanche, les baby showers ou une séance photo dans un riad : une base élégante que vous revisiterez saison après saison.",
    longDescriptionAr:
      "عندما يشتد الحر، يصبح الكتان أفضل صديق: خامة طبيعية تضبط الحرارة وتلين مع كل غسلة. يُرتدى هذا الفستان العاجي مع صندل مسطح لإطلالة مدينة مرتاحة، أو مع كعب وحزام ذهبي لعشاء راقٍ. مثالي لبرانش الأحد، أو حفلات استقبال المولود، أو جلسة تصوير في الرياض: قاعدة أنيقة تعيدين اكتشافها كل موسم.",
  },
  {
    id: "14",
    slug: "robe-satin-noir-midnight",
    category: "dresses",
    priceMad: 1249,
    compareAtPriceMad: 1399,
    isPromo: true,
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f0a39adb62?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f0a39adb62?w=800&q=80",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
      "https://images.unsplash.com/photo-1539008835657-9e8c476b6cdb?w=800&q=80",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    nameFr: "Robe satin noir — Midnight",
    nameAr: "فستان ساتان أسود — ميدنايت",
    shortDescriptionFr:
      "Satin profond et coupe sculptée : la robe des grandes soirées et des célébrations.",
    shortDescriptionAr:
      "ساتان غامق وقصة محددة: فستان السهرات الكبرى والاحتفالات.",
    longDescriptionFr:
      "Une robe qui ne passe jamais inaperçue : le satin capte la lumière des bougies et des néons pour un rendu cinématographique. Dos structuré, longueur midi ou maxi selon la pointure choisie dans notre guide tailles. Pensée pour les mariages, les galas et les fêtes de fin d’année au Maroc : associez bijoux dorés et clutch minimal pour un total look luxe. Promo limitée sur cette pièce iconique.",
    longDescriptionAr:
      "فستان لا يمر دون أن يلفت النظر: الساتان يلتقط ضوء الشموع والإضاءة لإطلالة سينمائية. ظهر مُهيكل، وطول حسب المقاس من دليل المقاسات. مُفكر لأعراس، حفلات، ونهاية السنة في المغرب: نسّقي مع مجوهرات ذهبية وكلتش بسيط لإطلالة فاخرة. تخفيض لفترة محدودة على هذه القطعة الأيقونية.",
  },
  {
    id: "15",
    slug: "robe-longue-terracotta-aid",
    category: "dresses",
    priceMad: 1099,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1598550471889-29a0c5fd5d0b?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1598550471889-29a0c5fd5d0b?w=800&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    nameFr: "Robe longue terracotta — Édition Aid",
    nameAr: "فستان طويل تراكوتا — طبعة العيد",
    shortDescriptionFr:
      "Teinte chaude inspirée de la terre cuite : rayonnante pour l’Aid et les réceptions familiales.",
    shortDescriptionAr:
      "لون دافئ مستوحى من الطين المحروق: متألقة للعيد والولائم العائلية.",
    longDescriptionFr:
      "Cette robe longue célèbre les couleurs du patrimoine architectural marocain tout en restant résolument moderne. Épaules structurées ou manches fluides selon la variante portée, taille marquée pour une silhouette longiligne. On l’imagine avec sandales dorées pour l’Aid al-Fitr ou al-Adha, ou pour un henna day où vous voulez être la plus photographiée. Tissu premium avec doublure confortable pour éviter les transparences au flash.",
    longDescriptionAr:
      "يحتفي هذا الفستان الطويل بألوان التراث المعماري المغربي مع بقاء عصري. كتفان محددان أو أكمام منسدلة حسب التصميم، خصر محدد لقامة طويلة. يُتخيل مع صندل ذهبي لعيد الفطر أو الأضحى، أو يوم حنة تريدين فيه أن تكوني الأكثر تصويراً. قماش فاخر مع بطانة مريحة لتفادي الشفافية مع الفلاش.",
  },
  {
    id: "16",
    slug: "robe-cocktail-doree-mariages",
    category: "dresses",
    priceMad: 1399,
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f0a39adb62?w=800&q=80",
    ],
    sizes: ["XS", "S", "M", "L"],
    nameFr: "Robe cocktail dorée — Mariages",
    nameAr: "فستان كوكتيل ذهبي — أعراس",
    shortDescriptionFr:
      "Broderies et reflets dorés : pensée pour les témoins, invitées d’honneur et soirées maghrebines.",
    shortDescriptionAr:
      "تطريز ولمعات ذهبية: مصممة لشهود العرس والمدعوات المميزات والسهرات المغاربية.",
    longDescriptionFr:
      "Quand la musique gnawa ou chaabi résonne et que la piste s’anime, cette robe vous assure une présence lumineuse sans voler la vedette à la mariée. Broderies contrôlées, décolleté équilibré, fente latérale optionnelle pour bouger librement. Pensée pour les mariages marocains multi-jours : henna, cérémonie civile ou soirée dancing. Retouches possibles chez votre couturière de confiance pour un tombé parfait sur vos mensurations.",
    longDescriptionAr:
      "عندما تعلو أصوات الكناوة أو الشعبي وتتحرك الساحة، تمنحك هذه الفستان حضوراً مشرقاً دون أن تطغى على العروس. تطريز متوازن، ياقة متناسقة، شق جانبي اختياري للحرية في الحركة. مُفكرة لأعراس مغربية متعددة الأيام: حنة، زفاف مدني، أو سهرة رقص. يمكن تعديلها عند خياطتكم المفضلة لقصة مثالية على مقاساتكم.",
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
  return getRelatedProductsFromList(products, category, excludeId, limit);
}

export function getRelatedProductsFromList(
  list: Product[],
  category: Category,
  excludeId: string,
  limit = 3
) {
  return list
    .filter((p) => p.category === category && p.id !== excludeId)
    .slice(0, limit);
}
