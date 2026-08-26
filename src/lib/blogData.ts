export interface BlogPost {
  _id: string;
  postTitle: string;
  shortDesc: string;
  postDesc: string;
  postImgUrl?: string;
  postAuthorId?: {
    _id?: string;
    username?: string;
    email?: string;
  };
  category?: string[] | string;
  hashTags?: string[] | string;
  views?: number;
  likes?: number;
  readTime?: string;
  createdAt: string;
}

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
  {
    _id: "guide-kashmir-willow-bat-care",
    postTitle: "The Complete Guide to Seasoning & Knocking Kashmir Willow Bats",
    shortDesc: "Learn how to properly oil, knock in, and protect your handcrafted Kashmir willow bat for maximum stroke power and durability.",
    postDesc: `### Why Knocking-In is Essential for Kashmir Willow
Kashmir willow (*Salix alba caerulea*) is renowned for its incredible tensile strength, punch, and natural moisture balance. However, fresh out of the craftsman's workshop in Sangam or Anantnag, the wood fibers are relatively soft and compressed unevenly. 

Before facing a leather match ball or heavy wind ball, your bat must undergo systematic **knocking-in and seasoning**.

---

### Step 1: Raw Linseed Oil Application
- Apply **one teaspoon** of raw linseed oil to the face and edges of the blade.
- Avoid oiling the splice, handle, or stickers.
- Wipe away excess oil with a soft cotton cloth.
- Let the bat rest horizontally in a cool, dry room for **24 hours**.

---

### Step 2: Progressive Edge & Toe Knocking
- Use a wooden bat mallet or pro knocking ball.
- Angle the mallet at **45 degrees** to gently compress the edges.
- Never hit the absolute corner directly at 90 degrees as this can cause hairline splinters.
- Spend at least **4 to 6 hours** spread across 3 days for thorough compression.

---

### Step 3: Net Session Testing & Anti-Scuff Sheet
- Begin net practice with old, soft leather balls.
- Inspect the face for seam indentations.
- Apply a clear anti-scuff sheet and fiberglass edge tape for valley moisture protection.`,
    postImgUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
    postAuthorId: { username: "Tariq Ahmad (Bat Specialist)" },
    category: ["Cricket Willow", "Equipment Care"],
    hashTags: ["#KashmirWillow", "#BatKnocking", "#CricketTips"],
    views: 1420,
    likes: 89,
    readTime: "5 min read",
    createdAt: "2026-08-20T10:30:00.000Z",
  },
  {
    _id: "guide-football-studs-kashmir-turf",
    postTitle: "Turf vs Hard Ground: Choosing the Right Football Studs for Kashmir Grounds",
    shortDesc: "A breakdown of FG, AG, and TF boots engineered to handle natural grass, artificial turf, and winter ground conditions in the Valley.",
    postDesc: `### Understanding Ground Dynamics in Kashmir
From synthetic turf pitches in Srinagar to natural grass fields in Baramulla and Anantnag, Kashmiri footballers face distinct surface variations throughout the seasons.

---

### 1. Artificial Grass (AG) & Turf (TF)
Artificial turf generates higher friction and heat. Standard firm-ground studs can stick and increase the risk of knee torsion.
- **TF (Turf Trainers)**: Dense rubber mini-studs for short-pile synthetic pitches.
- **AG (Artificial Ground)**: Hollow, circular conical studs that distribute pressure evenly and allow rapid pivot turns.

---

### 2. Firm Ground (FG) for Natural Grass
- Moulded chevron or bladed studs designed for dry, natural grass.
- Ideal during spring and summer tournament leagues in Kashmir stadiums.

---

### Pro Maintenance in Wet Weather
Always remove dried mud with a soft brush and avoid drying boots near heaters or direct fire, as rapid heat cracks the synthetic microfibers.`,
    postImgUrl: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80",
    postAuthorId: { username: "Farhan Khan (UEFA B Coach)" },
    category: ["Football", "Footwear Guide"],
    hashTags: ["#FootballStuds", "#KashmirFootball", "#SportifyGear"],
    views: 980,
    likes: 64,
    readTime: "4 min read",
    createdAt: "2026-08-18T14:15:00.000Z",
  },
  {
    _id: "guide-badminton-string-tension-valley",
    postTitle: "Mastering Badminton String Tension: High Tension vs Control in Valley Climate",
    shortDesc: "How Kashmir's altitude and cold temperatures impact string elasticity, racket frame longevity, and shuttle flight.",
    postDesc: `### Altitude, Cold Air & String Tension
Badminton enthusiasts in Srinagar and higher altitude districts frequently report string snapping in winter. Cold air makes nylon and synthetic multifilament strings brittle.

---

### Recommended Tension Range
- **Beginner / Recreational**: 20 – 22 lbs (Enormous sweet spot and effortless repulsion).
- **Intermediate Club Players**: 23 – 25 lbs (Great blend of smash power and net touch).
- **Advanced Tournament Players**: 26 – 28 lbs (Pinpoint control, sharp drops, and steep smashes).

---

### Winter Care Rule of Thumb
During sub-zero months in Kashmir, drop your string tension by **1 to 2 lbs** to prevent frame warping and premature string snapping.`,
    postImgUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
    postAuthorId: { username: "Aadil Mir (Badminton Pro)" },
    category: ["Badminton", "Racket Tech"],
    hashTags: ["#BadmintonKashmir", "#StringTension", "#YonexPro"],
    views: 750,
    likes: 48,
    readTime: "3 min read",
    createdAt: "2026-08-15T09:00:00.000Z",
  },
  {
    _id: "guide-winter-athletic-training-kashmir",
    postTitle: "Winter Athletic Training in Kashmir: Layering, Hydration & Cold Warmups",
    shortDesc: "Expert physical trainer advice on staying injury-free, maintaining cardio endurance, and choosing thermo apparel during sub-zero mornings.",
    postDesc: `### Overcoming the Winter Chill
Training in Kashmir winters requires smart thermal regulation and gradual warmup protocols to prevent muscle strains and respiratory strain.

---

### The 3-Layer Rule
1. **Base Layer**: Moisture-wicking compression top and tights to draw sweat away from the skin.
2. **Thermal Mid Layer**: Lightweight fleece or breathable windcheater to trap body heat.
3. **Outer Shell**: Water-repellent hooded jacket for frosty morning runs.

---

### Extended Dynamic Warm-Up
Cold muscles are less elastic. Increase your warmup time from 5 minutes to **15-20 minutes**, incorporating leg swings, high knees, inchworms, and progressive jogging before explosive sprints.`,
    postImgUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    postAuthorId: { username: "Dr. Danish Rafiq (Sports Physio)" },
    category: ["Fitness & Training", "Winter Health"],
    hashTags: ["#WinterFitness", "#KashmirAthletes", "#ThermoWear"],
    views: 1120,
    likes: 95,
    readTime: "6 min read",
    createdAt: "2026-08-12T11:45:00.000Z",
  },
  {
    _id: "story-history-of-sangam-kashmir-willow",
    postTitle: "History of Sangam & Anantnag Willow: Why Pro Athletes Choose Kashmir Bats",
    shortDesc: "Discover the 100-year legacy of Kashmir bat making, traditional cleft clefting, and modern computer-controlled profile shaping.",
    postDesc: `### A Century-Old Heritage Along the Jhelum River
The banks of the Jhelum River between Sangam, Bijbehara, and Anantnag produce over 80% of India's cricket willow bats. Introduced in the 19th century, *Salix alba* thrived in Kashmir's unique river valley microclimate.

---

### The Art of Cleft Selection
- **Grade 1+ Super Willow**: Clean grains, zero blemishes, compressed for light pickup.
- **Grain Count & Density**: 6 to 10 straight grains indicating balanced spring and longevity.
- **Modern Profile**: Duckbill and full-spine profiles designed for modern T20 power hitting.

---

### International Recognition
Today, international cricketers across Test-playing nations rely on Kashmir willow for international matches and franchise leagues, showcasing Kashmir's master craftsmen to the global stage.`,
    postImgUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
    postAuthorId: { username: "Sportify Editorial Desk" },
    category: ["Kashmir Sports", "Heritage & Craft"],
    hashTags: ["#SangamWillow", "#KashmirPride", "#CricketHistory"],
    views: 1890,
    likes: 142,
    readTime: "5 min read",
    createdAt: "2026-08-08T16:20:00.000Z",
  },
  {
    _id: "guide-gym-belts-wrist-wraps-powerlifting",
    postTitle: "Top 5 Weightlifting Belts & Wrist Wraps for Maximum Power & Safety",
    shortDesc: "How to properly brace your core, protect your lumbar spine during heavy squats and deadlifts, and choose between lever and prong belts.",
    postDesc: `### The Science of Intra-Abdominal Pressure (IAP)
A weightlifting belt is not a back brace; it is a rigid wall for your abs to push against, creating maximum intra-abdominal pressure and stabilizing your spine under heavy barbell loads.

---

### Lever Belts vs Double-Prong Belts
- **Lever Belts**: Instant 1-second lock and release. Best for dedicated powerlifters.
- **Double-Prong Belts**: Traditional leather durability with micro-adjustments for squats vs deadlifts.

---

### Wrist Wraps for Heavy Bench & Overhead Press
Heavy pressing forces the wrist into hyperextension. Rigid 18-inch and 24-inch thumb-loop wraps maintain neutral wrist alignment and transfer force directly into the barbell.`,
    postImgUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80",
    postAuthorId: { username: "Bilal Wani (Strength Coach)" },
    category: ["Fitness & Training", "Gym Gear"],
    hashTags: ["#Powerlifting", "#GymBelts", "#KashmirGym"],
    views: 890,
    likes: 58,
    readTime: "4 min read",
    createdAt: "2026-08-05T13:10:00.000Z",
  },
];

export const getBlogImageUrl = (url?: string): string => {
  if (!url) return "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
  if (url.startsWith("/")) return `${apiUrl}${url}`;
  return `${apiUrl}/uploads/${url}`;
};

export const formatBlogDate = (dateStr?: string): string => {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
};

export const calculateReadTime = (text?: string): string => {
  if (!text) return "3 min read";
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 180);
  return `${Math.max(1, minutes)} min read`;
};
