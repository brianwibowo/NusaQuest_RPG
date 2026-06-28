/**
 * ==========================================================================
 * NusaQuest RPG — Location Data (Jakarta)
 * ==========================================================================
 *
 * Mock data for 8 tourism locations in Jakarta.
 * Each location has real GPS coordinates for Leaflet map markers.
 *
 * In production (Tahun 2+), this data will come from Supabase.
 * ==========================================================================
 */

import type { Location } from "@/types";

/**
 * Tourism locations in Jakarta.
 * Coordinates are based on actual GPS positions.
 */
export const LOCATIONS: Location[] = [
  {
    id: "loc_kota_tua",
    name: {
      id: "Kota Tua Jakarta",
      en: "Jakarta Old Town",
    },
    description: {
      id: "Kawasan bersejarah peninggalan era kolonial Belanda (Batavia). Terdapat Museum Fatahillah, Museum Bank Indonesia, dan berbagai bangunan bersejarah.",
      en: "Historic area from the Dutch colonial era (Batavia). Home to Fatahillah Museum, Bank Indonesia Museum, and various heritage buildings.",
    },
    category: "wisata_sejarah",
    latitude: -6.1352,
    longitude: 106.8133,
    imageUrl: "/images/locations/kota_tua.jpg",
    questIds: ["quest_kota_tua_history", "quest_kota_tua_photo"],
    umkmIds: ["umkm_kopi_tua"],
    address: {
      id: "Jl. Taman Fatahillah No.1, Pinangsia, Tamansari, Jakarta Barat",
      en: "Fatahillah Square No.1, Pinangsia, Tamansari, West Jakarta",
    },
  },
  {
    id: "loc_setu_babakan",
    name: {
      id: "Setu Babakan",
      en: "Setu Babakan Cultural Village",
    },
    description: {
      id: "Perkampungan Budaya Betawi yang melestarikan tradisi, kuliner, kesenian, dan arsitektur khas suku Betawi.",
      en: "Betawi Cultural Village preserving traditions, cuisine, arts, and architecture of the Betawi ethnic group.",
    },
    category: "wisata_budaya",
    latitude: -6.3407,
    longitude: 106.8274,
    imageUrl: "/images/locations/setu_babakan.jpg",
    questIds: ["quest_betawi_culture", "quest_betawi_culinary"],
    umkmIds: ["umkm_bir_pletok", "umkm_kerak_telor"],
    address: {
      id: "Jl. Moch. Kahfi II, Srengseng Sawah, Jagakarsa, Jakarta Selatan",
      en: "Moch. Kahfi II Street, Srengseng Sawah, Jagakarsa, South Jakarta",
    },
  },
  {
    id: "loc_monas",
    name: {
      id: "Monumen Nasional (Monas)",
      en: "National Monument (Monas)",
    },
    description: {
      id: "Simbol kemerdekaan Indonesia setinggi 132 meter. Di dalamnya terdapat museum sejarah perjuangan kemerdekaan.",
      en: "Indonesia's 132-meter independence symbol. Inside is a museum about the independence struggle history.",
    },
    category: "wisata_sejarah",
    latitude: -6.1754,
    longitude: 106.8272,
    imageUrl: "/images/locations/monas.jpg",
    questIds: ["quest_monas_history"],
    umkmIds: [],
    address: {
      id: "Jl. Medan Merdeka Barat, Gambir, Jakarta Pusat",
      en: "Medan Merdeka Barat Street, Gambir, Central Jakarta",
    },
  },
  {
    id: "loc_ragunan",
    name: {
      id: "Taman Margasatwa Ragunan",
      en: "Ragunan Zoo",
    },
    description: {
      id: "Kebun binatang tertua di Indonesia seluas 140 hektar. Habitat bagi berbagai satwa khas Nusantara dan taman hijau yang asri.",
      en: "Indonesia's oldest zoo spanning 140 hectares. Habitat for various native Nusantara wildlife and lush green parks.",
    },
    category: "ekowisata",
    latitude: -6.3125,
    longitude: 106.8201,
    imageUrl: "/images/locations/ragunan.jpg",
    questIds: ["quest_eco_ragunan"],
    umkmIds: [],
    address: {
      id: "Jl. Harsono RM No.1, Ragunan, Pasar Minggu, Jakarta Selatan",
      en: "Harsono RM Street No.1, Ragunan, Pasar Minggu, South Jakarta",
    },
  },
  {
    id: "loc_mangrove_pik",
    name: {
      id: "Hutan Mangrove PIK",
      en: "PIK Mangrove Forest",
    },
    description: {
      id: "Kawasan konservasi mangrove di pesisir utara Jakarta. Wisata edukatif tentang pentingnya ekosistem mangrove bagi lingkungan.",
      en: "Mangrove conservation area on Jakarta's northern coast. Educational tourism about the importance of mangrove ecosystems.",
    },
    category: "ekowisata",
    latitude: -6.1016,
    longitude: 106.7365,
    imageUrl: "/images/locations/mangrove_pik.jpg",
    questIds: ["quest_eco_mangrove"],
    umkmIds: [],
    address: {
      id: "Jl. Garden House, Kamal Muara, Penjaringan, Jakarta Utara",
      en: "Garden House Street, Kamal Muara, Penjaringan, North Jakarta",
    },
  },
  {
    id: "loc_taman_mini",
    name: {
      id: "Taman Mini Indonesia Indah",
      en: "Beautiful Indonesia Miniature Park",
    },
    description: {
      id: "Taman rekreasi yang menampilkan keragaman budaya Indonesia melalui anjungan provinsi, museum, dan wahana edukasi.",
      en: "Recreation park showcasing Indonesia's cultural diversity through provincial pavilions, museums, and educational attractions.",
    },
    category: "wisata_budaya",
    latitude: -6.3024,
    longitude: 106.8951,
    imageUrl: "/images/locations/taman_mini.jpg",
    questIds: ["quest_taman_mini_culture"],
    umkmIds: ["umkm_suvenir_nusantara"],
    address: {
      id: "Jl. Raya Taman Mini, Cipayung, Jakarta Timur",
      en: "Taman Mini Main Road, Cipayung, East Jakarta",
    },
  },
  {
    id: "loc_glodok",
    name: {
      id: "Pecinan Glodok",
      en: "Glodok Chinatown",
    },
    description: {
      id: "Kawasan Pecinan tertua di Jakarta. Perpaduan budaya Tionghoa-Betawi yang kaya akan kuliner, arsitektur klenteng, dan tradisi.",
      en: "Jakarta's oldest Chinatown district. A blend of Chinese-Betawi culture rich in cuisine, temple architecture, and traditions.",
    },
    category: "wisata_kuliner",
    latitude: -6.1490,
    longitude: 106.8132,
    imageUrl: "/images/locations/glodok.jpg",
    questIds: ["quest_glodok_culinary"],
    umkmIds: ["umkm_kue_keranjang", "umkm_bakmi_legendaris"],
    address: {
      id: "Jl. Pancoran, Glodok, Tamansari, Jakarta Barat",
      en: "Pancoran Street, Glodok, Tamansari, West Jakarta",
    },
  },
  {
    id: "loc_taman_suropati",
    name: {
      id: "Taman Suropati",
      en: "Suropati Park",
    },
    description: {
      id: "Taman kota bersejarah di jantung Menteng. Terdapat patung-patung ASEAN dan suasana hijau yang tenang di tengah keramaian kota.",
      en: "A historic city park in the heart of Menteng. Features ASEAN sculptures and a calm green atmosphere amidst the city bustle.",
    },
    category: "ekowisata",
    latitude: -6.1993,
    longitude: 106.8370,
    imageUrl: "/images/locations/taman_suropati.jpg",
    questIds: ["quest_eco_suropati"],
    umkmIds: [],
    address: {
      id: "Jl. Taman Suropati, Menteng, Jakarta Pusat",
      en: "Taman Suropati Street, Menteng, Central Jakarta",
    },
  },
];
