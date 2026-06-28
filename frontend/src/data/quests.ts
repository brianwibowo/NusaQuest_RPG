/**
 * ==========================================================================
 * NusaQuest RPG — Quest Data (Jakarta)
 * ==========================================================================
 *
 * Mock data for 10 quests across various types set in Jakarta.
 * Each quest has objectives, rewards, and links to locations/battles.
 *
 * In production (Tahun 2+), this data will come from Supabase.
 * ==========================================================================
 */

import type { Quest } from "@/types";

/**
 * Jakarta quests covering all major quest types.
 * Ordered by type: main → cultural → historical → culinary → eco → side.
 */
export const QUESTS: Quest[] = [
  // ===== MAIN QUEST =====
  {
    id: "quest_kota_tua_history",
    title: {
      id: "Jejak Batavia: Rahasia Kota Tua",
      en: "Batavia Trail: Old Town Secrets",
    },
    description: {
      id: "Telusuri jejak sejarah Batavia di kawasan Kota Tua Jakarta. Kunjungi Museum Fatahillah, pecahkan teka-teki sejarah, dan buka cerita tersembunyi tentang masa kolonial Belanda.",
      en: "Trace the history of Batavia in Jakarta's Old Town. Visit the Fatahillah Museum, solve historical puzzles, and unlock hidden stories about the Dutch colonial era.",
    },
    type: "main",
    status: "available",
    locationId: "loc_kota_tua",
    objectives: [
      {
        id: "obj_kota_tua_1",
        description: {
          id: "Kunjungi kawasan Kota Tua Jakarta",
          en: "Visit the Jakarta Old Town area",
        },
        type: "visit_location",
        completed: false,
      },
      {
        id: "obj_kota_tua_2",
        description: {
          id: "Jawab kuis tentang sejarah Batavia",
          en: "Answer the quiz about Batavia's history",
        },
        type: "answer_quiz",
        completed: false,
      },
      {
        id: "obj_kota_tua_3",
        description: {
          id: "Ambil foto di depan Museum Fatahillah",
          en: "Take a photo in front of Fatahillah Museum",
        },
        type: "take_photo",
        completed: false,
      },
    ],
    reward: {
      xp: 500,
      points: 200,
      badgeId: "badge_history_buff",
      storyUnlockId: "story_batavia",
    },
    requiredLevel: 1,
    estimatedDuration: { id: "45 menit", en: "45 minutes" },
    difficulty: "medium",
    battleId: "battle_batavia_quiz",
    imageUrl: "/images/quests/kota_tua.jpg",
  },

  // ===== CULTURAL QUEST =====
  {
    id: "quest_betawi_culture",
    title: {
      id: "Warisan Betawi: Budaya yang Hidup",
      en: "Betawi Heritage: Living Culture",
    },
    description: {
      id: "Jelajahi Perkampungan Budaya Betawi di Setu Babakan. Pelajari tradisi, kesenian, dan cara hidup suku Betawi yang masih lestari.",
      en: "Explore the Betawi Cultural Village at Setu Babakan. Learn about traditions, arts, and the enduring Betawi way of life.",
    },
    type: "cultural",
    status: "available",
    locationId: "loc_setu_babakan",
    objectives: [
      {
        id: "obj_betawi_1",
        description: {
          id: "Kunjungi Perkampungan Budaya Betawi",
          en: "Visit the Betawi Cultural Village",
        },
        type: "visit_location",
        completed: false,
      },
      {
        id: "obj_betawi_2",
        description: {
          id: "Jawab kuis tentang budaya Betawi",
          en: "Answer quiz about Betawi culture",
        },
        type: "answer_quiz",
        completed: false,
      },
    ],
    reward: {
      xp: 400,
      points: 150,
      badgeId: "badge_culture_keeper",
      storyUnlockId: "story_betawi",
    },
    requiredLevel: 1,
    estimatedDuration: { id: "30 menit", en: "30 minutes" },
    difficulty: "easy",
    battleId: "battle_betawi_quiz",
    imageUrl: "/images/quests/setu_babakan.jpg",
  },

  // ===== CULINARY QUEST =====
  {
    id: "quest_betawi_culinary",
    title: {
      id: "Jejak Kuliner: Rasa Betawi Legendaris",
      en: "Culinary Trail: Legendary Betawi Flavors",
    },
    description: {
      id: "Cicipi kuliner khas Betawi yang legendaris di kawasan Setu Babakan. Temukan kerak telor, bir pletok, dan makanan tradisional lainnya.",
      en: "Taste legendary Betawi cuisine in the Setu Babakan area. Discover kerak telor, bir pletok, and other traditional delicacies.",
    },
    type: "culinary",
    status: "available",
    locationId: "loc_setu_babakan",
    objectives: [
      {
        id: "obj_culinary_1",
        description: {
          id: "Kunjungi UMKM kuliner Betawi",
          en: "Visit a Betawi culinary UMKM",
        },
        type: "visit_location",
        completed: false,
      },
      {
        id: "obj_culinary_2",
        description: {
          id: "Coba produk kuliner lokal",
          en: "Try a local culinary product",
        },
        type: "buy_product",
        completed: false,
      },
      {
        id: "obj_culinary_3",
        description: {
          id: "Jawab kuis tentang kuliner Betawi",
          en: "Answer quiz about Betawi cuisine",
        },
        type: "answer_quiz",
        completed: false,
      },
    ],
    reward: {
      xp: 350,
      points: 180,
      voucherId: "voucher_kerak_telor",
      storyUnlockId: "story_kuliner_betawi",
    },
    requiredLevel: 1,
    estimatedDuration: { id: "30 menit", en: "30 minutes" },
    difficulty: "easy",
    battleId: "battle_culinary_quiz",
    relatedUmkmId: "umkm_kerak_telor",
    imageUrl: "/images/quests/kuliner_betawi.jpg",
  },

  // ===== HISTORICAL QUEST =====
  {
    id: "quest_monas_history",
    title: {
      id: "Pilar Kemerdekaan: Kisah Monas",
      en: "Pillar of Independence: The Monas Story",
    },
    description: {
      id: "Pelajari sejarah perjuangan kemerdekaan Indonesia di Monumen Nasional. Kunjungi museum di dalamnya dan pecahkan teka-teki sejarah.",
      en: "Learn about Indonesia's independence struggle at the National Monument. Visit the museum inside and solve historical puzzles.",
    },
    type: "historical",
    status: "available",
    locationId: "loc_monas",
    objectives: [
      {
        id: "obj_monas_1",
        description: {
          id: "Kunjungi Monumen Nasional",
          en: "Visit the National Monument",
        },
        type: "visit_location",
        completed: false,
      },
      {
        id: "obj_monas_2",
        description: {
          id: "Jawab kuis tentang sejarah kemerdekaan",
          en: "Answer quiz about independence history",
        },
        type: "answer_quiz",
        completed: false,
      },
      {
        id: "obj_monas_3",
        description: {
          id: "Ambil foto di depan Monas",
          en: "Take a photo in front of Monas",
        },
        type: "take_photo",
        completed: false,
      },
    ],
    reward: {
      xp: 450,
      points: 200,
      badgeId: "badge_independence",
      storyUnlockId: "story_monas",
    },
    requiredLevel: 2,
    estimatedDuration: { id: "60 menit", en: "60 minutes" },
    difficulty: "medium",
    imageUrl: "/images/quests/monas.jpg",
  },

  // ===== ECO QUESTS =====
  {
    id: "quest_eco_ragunan",
    title: {
      id: "Misi Hijau: Penjaga Ragunan",
      en: "Green Mission: Ragunan Guardian",
    },
    description: {
      id: "Selesaikan tantangan ramah lingkungan di Taman Margasatwa Ragunan. Pelajari tentang satwa Nusantara dan pentingnya konservasi.",
      en: "Complete eco-friendly challenges at Ragunan Zoo. Learn about Nusantara wildlife and the importance of conservation.",
    },
    type: "eco",
    status: "available",
    locationId: "loc_ragunan",
    objectives: [
      {
        id: "obj_eco_rag_1",
        description: {
          id: "Kunjungi Taman Margasatwa Ragunan",
          en: "Visit Ragunan Zoo",
        },
        type: "visit_location",
        completed: false,
      },
      {
        id: "obj_eco_rag_2",
        description: {
          id: "Bawa tumbler/botol minum sendiri",
          en: "Bring your own tumbler/water bottle",
        },
        type: "eco_action",
        completed: false,
      },
      {
        id: "obj_eco_rag_3",
        description: {
          id: "Jawab kuis tentang satwa Nusantara",
          en: "Answer quiz about Nusantara wildlife",
        },
        type: "answer_quiz",
        completed: false,
      },
    ],
    reward: {
      xp: 400,
      points: 150,
      badgeId: "badge_eco_warrior",
    },
    requiredLevel: 1,
    estimatedDuration: { id: "45 menit", en: "45 minutes" },
    difficulty: "easy",
    imageUrl: "/images/quests/ragunan.jpg",
  },
  {
    id: "quest_eco_mangrove",
    title: {
      id: "Misi Hijau: Pelindung Mangrove",
      en: "Green Mission: Mangrove Protector",
    },
    description: {
      id: "Jelajahi kawasan konservasi mangrove di PIK. Pelajari pentingnya ekosistem mangrove dan lakukan aksi pelestarian lingkungan.",
      en: "Explore the mangrove conservation area in PIK. Learn about the importance of mangrove ecosystems and take conservation actions.",
    },
    type: "eco",
    status: "available",
    locationId: "loc_mangrove_pik",
    objectives: [
      {
        id: "obj_eco_mgr_1",
        description: {
          id: "Kunjungi Hutan Mangrove PIK",
          en: "Visit PIK Mangrove Forest",
        },
        type: "visit_location",
        completed: false,
      },
      {
        id: "obj_eco_mgr_2",
        description: {
          id: "Ikuti kegiatan penanaman mangrove atau bersih pantai",
          en: "Participate in mangrove planting or beach cleanup",
        },
        type: "eco_action",
        completed: false,
      },
    ],
    reward: {
      xp: 500,
      points: 200,
      badgeId: "badge_mangrove_hero",
      storyUnlockId: "story_mangrove",
    },
    requiredLevel: 2,
    estimatedDuration: { id: "60 menit", en: "60 minutes" },
    difficulty: "medium",
    imageUrl: "/images/quests/mangrove.jpg",
  },

  // ===== SIDE QUESTS =====
  {
    id: "quest_kota_tua_photo",
    title: {
      id: "Spot Foto: Kota Tua Instagramable",
      en: "Photo Spot: Instagrammable Old Town",
    },
    description: {
      id: "Temukan dan abadikan spot foto terbaik di kawasan Kota Tua Jakarta. Tunjukkan keindahan arsitektur kolonial yang masih terjaga.",
      en: "Find and capture the best photo spots in Jakarta's Old Town. Showcase the beauty of the preserved colonial architecture.",
    },
    type: "photo",
    status: "available",
    locationId: "loc_kota_tua",
    objectives: [
      {
        id: "obj_photo_1",
        description: {
          id: "Ambil foto di 3 spot berbeda di Kota Tua",
          en: "Take photos at 3 different spots in Old Town",
        },
        type: "take_photo",
        completed: false,
      },
    ],
    reward: {
      xp: 200,
      points: 100,
      collectibleId: "collectible_kota_tua_frame",
    },
    requiredLevel: 1,
    estimatedDuration: { id: "20 menit", en: "20 minutes" },
    difficulty: "easy",
    imageUrl: "/images/quests/kota_tua_photo.jpg",
  },
  {
    id: "quest_glodok_culinary",
    title: {
      id: "Wisata Rasa: Pecinan Glodok",
      en: "Flavor Journey: Glodok Chinatown",
    },
    description: {
      id: "Jelajahi Pecinan Glodok dan cicipi kuliner khas Tionghoa-Betawi. Dari bakmi legendaris hingga kue keranjang, nikmati perpaduan rasa yang unik.",
      en: "Explore Glodok Chinatown and taste Chinese-Betawi cuisine. From legendary bakmi to kue keranjang, enjoy the unique blend of flavors.",
    },
    type: "culinary",
    status: "available",
    locationId: "loc_glodok",
    objectives: [
      {
        id: "obj_glodok_1",
        description: {
          id: "Kunjungi kawasan Pecinan Glodok",
          en: "Visit the Glodok Chinatown area",
        },
        type: "visit_location",
        completed: false,
      },
      {
        id: "obj_glodok_2",
        description: {
          id: "Coba kuliner khas di salah satu UMKM",
          en: "Try signature cuisine at one of the UMKM",
        },
        type: "buy_product",
        completed: false,
      },
      {
        id: "obj_glodok_3",
        description: {
          id: "Tulis ulasan tentang pengalamanmu",
          en: "Write a review about your experience",
        },
        type: "write_review",
        completed: false,
      },
    ],
    reward: {
      xp: 350,
      points: 150,
      voucherId: "voucher_bakmi",
    },
    requiredLevel: 1,
    estimatedDuration: { id: "30 menit", en: "30 minutes" },
    difficulty: "easy",
    relatedUmkmId: "umkm_bakmi_legendaris",
    imageUrl: "/images/quests/glodok.jpg",
  },
  {
    id: "quest_taman_mini_culture",
    title: {
      id: "Nusantara dalam Satu Langkah",
      en: "Nusantara in One Step",
    },
    description: {
      id: "Jelajahi keragaman budaya Indonesia di Taman Mini Indonesia Indah. Kunjungi anjungan provinsi dan pelajari keunikan setiap daerah.",
      en: "Explore Indonesia's cultural diversity at Taman Mini Indonesia Indah. Visit provincial pavilions and learn about each region's uniqueness.",
    },
    type: "cultural",
    status: "locked",
    locationId: "loc_taman_mini",
    objectives: [
      {
        id: "obj_tmii_1",
        description: {
          id: "Kunjungi minimal 3 anjungan provinsi",
          en: "Visit at least 3 provincial pavilions",
        },
        type: "visit_location",
        completed: false,
      },
      {
        id: "obj_tmii_2",
        description: {
          id: "Jawab kuis tentang kebudayaan Nusantara",
          en: "Answer quiz about Nusantara cultures",
        },
        type: "answer_quiz",
        completed: false,
      },
      {
        id: "obj_tmii_3",
        description: {
          id: "Beli suvenir khas daerah dari UMKM",
          en: "Buy a regional souvenir from a UMKM",
        },
        type: "buy_product",
        completed: false,
      },
    ],
    reward: {
      xp: 500,
      points: 250,
      badgeId: "badge_nusantara_explorer",
      collectibleId: "collectible_peta_nusantara",
    },
    requiredLevel: 3,
    estimatedDuration: { id: "90 menit", en: "90 minutes" },
    difficulty: "hard",
    relatedUmkmId: "umkm_suvenir_nusantara",
    imageUrl: "/images/quests/taman_mini.jpg",
  },
  {
    id: "quest_eco_suropati",
    title: {
      id: "Oase Hijau: Taman Suropati",
      en: "Green Oasis: Suropati Park",
    },
    description: {
      id: "Nikmati ketenangan Taman Suropati di tengah hiruk-pikuk Jakarta. Lakukan aksi ramah lingkungan dan pelajari sejarah taman bersejarah ini.",
      en: "Enjoy the tranquility of Suropati Park amidst Jakarta's hustle. Take eco-friendly actions and learn the history of this heritage park.",
    },
    type: "eco",
    status: "available",
    locationId: "loc_taman_suropati",
    objectives: [
      {
        id: "obj_suropati_1",
        description: {
          id: "Kunjungi Taman Suropati",
          en: "Visit Suropati Park",
        },
        type: "visit_location",
        completed: false,
      },
      {
        id: "obj_suropati_2",
        description: {
          id: "Lakukan aksi bersih-bersih taman selama 10 menit",
          en: "Do a 10-minute park cleanup action",
        },
        type: "eco_action",
        completed: false,
      },
    ],
    reward: {
      xp: 300,
      points: 120,
      badgeId: "badge_green_guardian",
    },
    requiredLevel: 1,
    estimatedDuration: { id: "20 menit", en: "20 minutes" },
    difficulty: "easy",
    imageUrl: "/images/quests/suropati.jpg",
  },
];
