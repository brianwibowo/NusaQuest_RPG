/**
 * ==========================================================================
 * NusaQuest RPG — UMKM Data (Jakarta)
 * ==========================================================================
 *
 * Mock data for 5 UMKM businesses in Jakarta.
 * UMKM are integrated into quests as merchant partners.
 *
 * In production (Tahun 2+), this data will come from Supabase.
 * ==========================================================================
 */

import type { Umkm } from "@/types";

export const UMKM_LIST: Umkm[] = [
  {
    id: "umkm_kerak_telor",
    name: "Kerak Telor Mpok Siti",
    description: {
      id: "Pembuat kerak telor legendaris di Setu Babakan. Resep turun-temurun keluarga Betawi sejak tahun 1970-an.",
      en: "Legendary kerak telor maker at Setu Babakan. A Betawi family recipe passed down since the 1970s.",
    },
    category: "kuliner",
    products: ["Kerak Telor Original", "Kerak Telor Spesial", "Nasi Uduk Betawi"],
    locationId: "loc_setu_babakan",
    imageUrl: "/images/umkm/kerak_telor.jpg",
    rating: 4.8,
    voucherAvailable: true,
    questIds: ["quest_betawi_culinary"],
  },
  {
    id: "umkm_bir_pletok",
    name: "Bir Pletok Bang Jali",
    description: {
      id: "Produsen bir pletok tradisional Betawi. Minuman rempah khas Jakarta tanpa alkohol yang menyegarkan.",
      en: "Traditional Betawi bir pletok producer. A refreshing, non-alcoholic Jakarta spice drink.",
    },
    category: "kuliner",
    products: ["Bir Pletok Original", "Bir Pletok Jahe", "Sirup Rempah"],
    locationId: "loc_setu_babakan",
    imageUrl: "/images/umkm/bir_pletok.jpg",
    rating: 4.5,
    voucherAvailable: false,
    questIds: ["quest_betawi_culinary"],
  },
  {
    id: "umkm_kopi_tua",
    name: "Kopi Tua Batavia",
    description: {
      id: "Kedai kopi bersejarah di kawasan Kota Tua. Menyajikan kopi tubruk dan kopi susu khas Batavia di bangunan heritage.",
      en: "A historic coffee shop in the Old Town area. Serving traditional tubruk coffee and Batavia-style café au lait in a heritage building.",
    },
    category: "kuliner",
    products: ["Kopi Tubruk", "Kopi Susu Batavia", "Roti Buaya"],
    locationId: "loc_kota_tua",
    imageUrl: "/images/umkm/kopi_tua.jpg",
    rating: 4.6,
    voucherAvailable: false,
    questIds: ["quest_kota_tua_history"],
  },
  {
    id: "umkm_bakmi_legendaris",
    name: "Bakmi Aboen Glodok",
    description: {
      id: "Bakmi legendaris di Pecinan Glodok sejak tahun 1960. Racikan bumbu khas Tionghoa-Betawi yang tak berubah selama puluhan tahun.",
      en: "Legendary bakmi in Glodok Chinatown since 1960. A unique Chinese-Betawi seasoning recipe unchanged for decades.",
    },
    category: "kuliner",
    products: ["Bakmi Goreng", "Bakmi Kuah", "Pangsit Goreng"],
    locationId: "loc_glodok",
    imageUrl: "/images/umkm/bakmi_glodok.jpg",
    rating: 4.7,
    voucherAvailable: true,
    questIds: ["quest_glodok_culinary"],
  },
  {
    id: "umkm_suvenir_nusantara",
    name: "Galeri Suvenir Nusantara",
    description: {
      id: "Toko suvenir yang menjual kerajinan tangan dari berbagai daerah di Indonesia. Tersedia batik, wayang, miniatur rumah adat, dan lainnya.",
      en: "Souvenir shop selling handicrafts from across Indonesia. Available: batik, wayang puppets, traditional house miniatures, and more.",
    },
    category: "suvenir",
    products: ["Batik Tulis", "Miniatur Rumah Adat", "Wayang Kulit", "Gantungan Kunci"],
    locationId: "loc_taman_mini",
    imageUrl: "/images/umkm/suvenir_nusantara.jpg",
    rating: 4.3,
    voucherAvailable: false,
    questIds: ["quest_taman_mini_culture"],
  },
];
