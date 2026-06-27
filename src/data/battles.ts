/**
 * ==========================================================================
 * NusaQuest RPG — Battle / Challenge Data (Jakarta)
 * ==========================================================================
 *
 * Mock data for 3 knowledge-based battles with quiz questions.
 * Questions are factual and educational about Jakarta's culture,
 * history, and cuisine.
 *
 * In production (Tahun 2+), this data will come from Supabase.
 * ==========================================================================
 */

import type { Battle } from "@/types";

export const BATTLES: Battle[] = [
  // ===== HISTORICAL BATTLE — Batavia Quiz =====
  {
    id: "battle_batavia_quiz",
    title: {
      id: "Kuis Sejarah Batavia",
      en: "Batavia History Quiz",
    },
    type: "knowledge",
    description: {
      id: "Uji pengetahuanmu tentang sejarah Batavia dan Kota Tua Jakarta!",
      en: "Test your knowledge about the history of Batavia and Jakarta Old Town!",
    },
    questions: [
      {
        id: "q_batavia_1",
        question: {
          id: "Siapa pendiri kota Batavia?",
          en: "Who founded the city of Batavia?",
        },
        options: [
          { id: "Jan Pieterszoon Coen", en: "Jan Pieterszoon Coen" },
          { id: "Herman Willem Daendels", en: "Herman Willem Daendels" },
          { id: "Thomas Stamford Raffles", en: "Thomas Stamford Raffles" },
          { id: "Cornelis de Houtman", en: "Cornelis de Houtman" },
        ],
        correctIndex: 0,
        explanation: {
          id: "Jan Pieterszoon Coen mendirikan Batavia pada tahun 1619 setelah menghancurkan kota Jayakarta.",
          en: "Jan Pieterszoon Coen founded Batavia in 1619 after destroying the city of Jayakarta.",
        },
      },
      {
        id: "q_batavia_2",
        question: {
          id: "Apa nama asli kota Jakarta sebelum menjadi Batavia?",
          en: "What was Jakarta's original name before it became Batavia?",
        },
        options: [
          { id: "Sunda Kelapa", en: "Sunda Kelapa" },
          { id: "Jayakarta", en: "Jayakarta" },
          { id: "Priok", en: "Priok" },
          { id: "Pakuan", en: "Pakuan" },
        ],
        correctIndex: 1,
        explanation: {
          id: "Nama Jayakarta diberikan oleh Fatahillah pada tahun 1527 setelah mengalahkan Portugis. Sebelumnya bernama Sunda Kelapa.",
          en: "The name Jayakarta was given by Fatahillah in 1527 after defeating the Portuguese. It was previously called Sunda Kelapa.",
        },
      },
      {
        id: "q_batavia_3",
        question: {
          id: "Museum Fatahillah dulunya berfungsi sebagai apa?",
          en: "What was the original function of the Fatahillah Museum?",
        },
        options: [
          { id: "Istana gubernur", en: "Governor's palace" },
          { id: "Balai Kota Batavia", en: "Batavia City Hall" },
          { id: "Benteng pertahanan", en: "Defense fortress" },
          { id: "Gudang VOC", en: "VOC warehouse" },
        ],
        correctIndex: 1,
        explanation: {
          id: "Gedung Museum Fatahillah dibangun pada tahun 1710 dan berfungsi sebagai Balai Kota (Stadhuis) Batavia.",
          en: "The Fatahillah Museum building was built in 1710 and served as the Batavia City Hall (Stadhuis).",
        },
      },
    ],
    timeLimit: 60,
    rewardXp: 150,
    rewardPoints: 75,
    passingScore: 2,
  },

  // ===== CULTURAL BATTLE — Betawi Quiz =====
  {
    id: "battle_betawi_quiz",
    title: {
      id: "Kuis Budaya Betawi",
      en: "Betawi Culture Quiz",
    },
    type: "knowledge",
    description: {
      id: "Seberapa dalam pengetahuanmu tentang budaya Betawi?",
      en: "How deep is your knowledge about Betawi culture?",
    },
    questions: [
      {
        id: "q_betawi_1",
        question: {
          id: "Apa nama tarian khas Betawi yang menggunakan topeng?",
          en: "What is the name of the Betawi dance that uses masks?",
        },
        options: [
          { id: "Tari Topeng Betawi", en: "Betawi Mask Dance" },
          { id: "Tari Jaipong", en: "Jaipong Dance" },
          { id: "Tari Saman", en: "Saman Dance" },
          { id: "Tari Kecak", en: "Kecak Dance" },
        ],
        correctIndex: 0,
        explanation: {
          id: "Tari Topeng Betawi adalah kesenian tari tradisional khas Betawi yang menggunakan topeng kayu berwarna-warni.",
          en: "The Betawi Mask Dance is a traditional Betawi dance art that uses colorful wooden masks.",
        },
      },
      {
        id: "q_betawi_2",
        question: {
          id: "Apa nama rumah tradisional khas Betawi?",
          en: "What is the name of the traditional Betawi house?",
        },
        options: [
          { id: "Rumah Joglo", en: "Joglo House" },
          { id: "Rumah Kebaya", en: "Kebaya House" },
          { id: "Rumah Gadang", en: "Gadang House" },
          { id: "Rumah Tongkonan", en: "Tongkonan House" },
        ],
        correctIndex: 1,
        explanation: {
          id: "Rumah Kebaya adalah rumah tradisional Betawi yang atapnya menyerupai lipatan kebaya. Banyak ditemukan di kawasan Setu Babakan.",
          en: "The Kebaya House is a traditional Betawi house whose roof resembles the folds of a kebaya. Many can be found in the Setu Babakan area.",
        },
      },
      {
        id: "q_betawi_3",
        question: {
          id: "Ondel-ondel dalam budaya Betawi melambangkan apa?",
          en: "What do ondel-ondel represent in Betawi culture?",
        },
        options: [
          { id: "Hiburan anak-anak", en: "Children's entertainment" },
          { id: "Penolak bala (pelindung)", en: "Evil repellent (protector)" },
          { id: "Simbol kemakmuran", en: "Symbol of prosperity" },
          { id: "Patung dewa", en: "Deity statue" },
        ],
        correctIndex: 1,
        explanation: {
          id: "Ondel-ondel awalnya merupakan boneka besar yang dipercaya sebagai penolak bala atau roh jahat dalam tradisi Betawi.",
          en: "Ondel-ondel were originally large puppets believed to ward off evil spirits in Betawi tradition.",
        },
      },
    ],
    timeLimit: 60,
    rewardXp: 120,
    rewardPoints: 60,
    passingScore: 2,
  },

  // ===== CULINARY BATTLE — Jakarta Cuisine Quiz =====
  {
    id: "battle_culinary_quiz",
    title: {
      id: "Kuis Kuliner Jakarta",
      en: "Jakarta Cuisine Quiz",
    },
    type: "culinary",
    description: {
      id: "Tunjukkan pengetahuanmu tentang kuliner khas Jakarta dan Betawi!",
      en: "Show your knowledge about Jakarta and Betawi cuisine!",
    },
    questions: [
      {
        id: "q_culinary_1",
        question: {
          id: "Bahan utama kerak telor adalah?",
          en: "What is the main ingredient of kerak telor?",
        },
        options: [
          { id: "Beras ketan dan telur bebek", en: "Glutinous rice and duck egg" },
          { id: "Tepung beras dan telur ayam", en: "Rice flour and chicken egg" },
          { id: "Nasi putih dan telur puyuh", en: "White rice and quail egg" },
          { id: "Beras merah dan telur asin", en: "Brown rice and salted egg" },
        ],
        correctIndex: 0,
        explanation: {
          id: "Kerak telor dibuat dari beras ketan putih yang dimasak dengan telur bebek, lalu diberi kelapa sangrai dan bumbu rempah.",
          en: "Kerak telor is made from white glutinous rice cooked with duck egg, then topped with roasted coconut and spice seasoning.",
        },
      },
      {
        id: "q_culinary_2",
        question: {
          id: "Apa nama minuman rempah khas Betawi yang tidak mengandung alkohol?",
          en: "What is the name of the non-alcoholic Betawi spice drink?",
        },
        options: [
          { id: "Bir Pletok", en: "Bir Pletok" },
          { id: "Bajigur", en: "Bajigur" },
          { id: "Bandrek", en: "Bandrek" },
          { id: "Sekoteng", en: "Sekoteng" },
        ],
        correctIndex: 0,
        explanation: {
          id: "Bir Pletok adalah minuman tradisional Betawi berbahan rempah seperti jahe, serai, dan kayu manis. Tidak mengandung alkohol meskipun namanya 'bir'.",
          en: "Bir Pletok is a traditional Betawi drink made from spices like ginger, lemongrass, and cinnamon. It contains no alcohol despite its name.",
        },
      },
      {
        id: "q_culinary_3",
        question: {
          id: "Soto Betawi biasanya menggunakan kuah berbahan dasar apa?",
          en: "Soto Betawi typically uses a broth made from what base?",
        },
        options: [
          { id: "Santan dan susu", en: "Coconut milk and milk" },
          { id: "Kaldu ayam murni", en: "Pure chicken broth" },
          { id: "Air asam jawa", en: "Tamarind water" },
          { id: "Kuah kacang", en: "Peanut sauce" },
        ],
        correctIndex: 0,
        explanation: {
          id: "Soto Betawi memiliki ciri khas kuah yang kaya dan gurih karena menggunakan campuran santan dan susu (atau susu evaporasi).",
          en: "Soto Betawi is characterized by its rich and savory broth made from a blend of coconut milk and milk (or evaporated milk).",
        },
      },
    ],
    timeLimit: 45,
    rewardXp: 100,
    rewardPoints: 50,
    passingScore: 2,
  },
];
