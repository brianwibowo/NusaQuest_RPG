/**
 * ==========================================================================
 * NusaQuest RPG — Story Data (Jakarta)
 * ==========================================================================
 *
 * Mock data for 5 local stories about Jakarta's culture, history,
 * cuisine, and environment. Stories are unlocked by completing quests.
 *
 * In production (Tahun 2+), this data will come from Supabase.
 * ==========================================================================
 */

import type { Story } from "@/types";

export const STORIES: Story[] = [
  {
    id: "story_batavia",
    title: {
      id: "Batavia: Kota yang Terlupakan",
      en: "Batavia: The Forgotten City",
    },
    content: {
      id: "Pada tahun 1619, Jan Pieterszoon Coen membangun kota Batavia di atas reruntuhan Jayakarta. Kota ini menjadi pusat perdagangan VOC (Vereenigde Oostindische Compagnie) dan salah satu kota paling penting di Asia Tenggara selama era kolonial.\n\nKawasan Kota Tua Jakarta yang kita kenal saat ini merupakan jantung kota Batavia. Di sinilah berdiri Stadhuis (Balai Kota) yang kini menjadi Museum Fatahillah, gudang-gudang VOC, dan kanal-kanal yang menghubungkan pelabuhan Sunda Kelapa dengan pusat kota.\n\nMeskipun Batavia pernah dijuluki 'Permata Asia', kota ini juga menyimpan sejarah kelam perbudakan dan eksploitasi rempah-rempah. Setiap sudut Kota Tua menyimpan cerita tentang perjuangan, perdagangan, dan pertemuan budaya yang membentuk Jakarta modern.",
      en: "In 1619, Jan Pieterszoon Coen built the city of Batavia on the ruins of Jayakarta. The city became the trading center of the VOC (Dutch East India Company) and one of the most important cities in Southeast Asia during the colonial era.\n\nThe Jakarta Old Town area we know today was the heart of Batavia. Here stood the Stadhuis (City Hall), now the Fatahillah Museum, VOC warehouses, and canals connecting Sunda Kelapa harbor to the city center.\n\nAlthough Batavia was once called the 'Jewel of Asia', the city also holds a dark history of slavery and spice exploitation. Every corner of Old Town holds stories of struggle, trade, and cultural encounters that shaped modern Jakarta.",
    },
    category: "sejarah",
    imageUrl: "/images/stories/batavia.png",
    locationId: "loc_kota_tua",
    unlocked: false,
    unlockedByQuestId: "quest_kota_tua_history",
  },
  {
    id: "story_betawi",
    title: {
      id: "Betawi: Jiwa Asli Jakarta",
      en: "Betawi: The Original Soul of Jakarta",
    },
    content: {
      id: "Suku Betawi adalah penduduk asli Jakarta yang terbentuk dari percampuran berbagai etnis: Melayu, Sunda, Jawa, Arab, Tionghoa, India, dan Portugis. Proses akulturasi ini berlangsung selama berabad-century dan menghasilkan budaya yang unik dan kaya.\n\nDi Setu Babakan, Perkampungan Budaya Betawi masih melestarikan tradisi yang mulai langka di Jakarta modern. Rumah Kebaya dengan arsitektur khasnya, Tari Topeng yang penuh makna, Ondel-ondel sebagai penolak bala, hingga kuliner legendaris seperti kerak telor dan bir pletok.\n\nBudaya Betawi bukan sekadar warisan masa lalu — ia adalah identitas hidup yang terus berkembang. Lenong, gambang kromong, dan silat Betawi masih mewarnai kehidupan masyarakat di perkampungan-perkampungan Betawi yang tersisa.",
      en: "The Betawi are the native people of Jakarta, formed from a mixture of various ethnicities: Malay, Sundanese, Javanese, Arab, Chinese, Indian, and Portuguese. This acculturation process lasted for centuries, producing a unique and rich culture.\n\nAt Setu Babakan, the Betawi Cultural Village still preserves traditions that are becoming rare in modern Jakarta. The Kebaya House with its distinctive architecture, the meaningful Mask Dance, Ondel-ondel as evil repellents, and legendary cuisine like kerak telor and bir pletok.\n\nBetawi culture is not just a relic of the past — it is a living identity that continues to evolve. Lenong theater, gambang kromong music, and Betawi martial arts still color the lives of communities in the remaining Betawi villages.",
    },
    category: "budaya",
    imageUrl: "/images/stories/betawi.png",
    locationId: "loc_setu_babakan",
    unlocked: false,
    unlockedByQuestId: "quest_betawi_culture",
  },
  {
    id: "story_kuliner_betawi",
    title: {
      id: "Cita Rasa Betawi: Dari Dapur ke Dunia",
      en: "Betawi Flavors: From Kitchen to the World",
    },
    content: {
      id: "Kuliner Betawi merupakan cerminan dari keragaman etnis yang membentuk suku Betawi. Kerak telor, makanan khas yang dibuat dari beras ketan dan telur bebek, awalnya merupakan hidangan mewah yang hanya disajikan pada upacara adat.\n\nBir pletok, minuman rempah khas Betawi, lahir dari tradisi minum jamu dan pengaruh budaya Tionghoa. Meskipun namanya 'bir', minuman ini sama sekali tidak mengandung alkohol — nama 'pletok' berasal dari suara botol saat ditutup.\n\nSoto Betawi dengan kuah santan-susu yang kaya, nasi uduk yang gurih, dan dodol Betawi yang manis — semuanya menceritakan kisah tentang persilangan budaya yang harmonis dalam satu piring.",
      en: "Betawi cuisine reflects the ethnic diversity that formed the Betawi people. Kerak telor, a dish made from glutinous rice and duck egg, was originally a luxurious dish served only at traditional ceremonies.\n\nBir pletok, a Betawi spice drink, was born from the jamu drinking tradition and Chinese cultural influence. Despite its name 'beer', this drink contains no alcohol — the name 'pletok' comes from the sound of a bottle being closed.\n\nSoto Betawi with its rich coconut milk-and-milk broth, savory nasi uduk, and sweet dodol Betawi — all tell stories of harmonious cultural crossroads on a single plate.",
    },
    category: "kuliner",
    imageUrl: "/images/stories/kuliner_betawi.png",
    locationId: "loc_setu_babakan",
    unlocked: false,
    unlockedByQuestId: "quest_betawi_culinary",
  },
  {
    id: "story_monas",
    title: {
      id: "Monas: Tugu Api Kemerdekaan",
      en: "Monas: The Flame of Independence",
    },
    content: {
      id: "Monumen Nasional (Monas) dirancang oleh arsitek Friedrich Silaban dan Soedarsono. Pembangunannya dimulai pada 17 Agustus 1961 dan baru selesai pada tahun 1975. Monas setinggi 132 meter ini menjadi simbol perjuangan kemerdekaan Indonesia.\n\nDi puncak Monas terdapat lidah api yang dilapisi emas seberat 35 kilogram, melambangkan semangat rakyat Indonesia yang tidak pernah padam. Di ruang bawah tanah, terdapat museum sejarah dengan 51 diorama yang menggambarkan perjalanan bangsa Indonesia dari masa prasejarah hingga kemerdekaan.\n\nTaman Monas sendiri merupakan ruang terbuka hijau terluas di Jakarta, menjadi tempat berkumpul masyarakat dari berbagai latar belakang — mencerminkan semangat persatuan yang menjadi fondasi bangsa.",
      en: "The National Monument (Monas) was designed by architects Friedrich Silaban and Soedarsono. Construction began on August 17, 1961, and was completed in 1975. Standing 132 meters tall, Monas symbolizes Indonesia's independence struggle.\n\nAt the top of Monas is a flame covered with 35 kilograms of gold, symbolizing the never-extinguishing spirit of the Indonesian people. Underground, there is a history museum with 51 dioramas depicting Indonesia's journey from prehistory to independence.\n\nThe Monas park itself is Jakarta's largest open green space, serving as a gathering place for people from all backgrounds — reflecting the spirit of unity that forms the nation's foundation.",
    },
    category: "sejarah",
    imageUrl: "/images/stories/monas.png",
    locationId: "loc_monas",
    unlocked: false,
    unlockedByQuestId: "quest_monas_history",
  },
  {
    id: "story_mangrove",
    title: {
      id: "Mangrove Jakarta: Benteng Terakhir Pesisir",
      en: "Jakarta's Mangroves: The Coast's Last Fortress",
    },
    content: {
      id: "Kawasan mangrove di pesisir utara Jakarta merupakan benteng terakhir perlindungan pantai ibu kota dari abrasi dan banjir rob. Ekosistem mangrove berfungsi sebagai penahan gelombang, penyerap karbon, dan habitat bagi ratusan spesies burung dan ikan.\n\nSayangnya, luas hutan mangrove Jakarta terus menyusut akibat reklamasi dan pembangunan. Dari ribuan hektar yang pernah ada, kini hanya tersisa beberapa ratus hektar yang dilindungi.\n\nUpaya konservasi di kawasan PIK menjadi harapan baru. Program penanaman mangrove, edukasi lingkungan, dan ekowisata diharapkan dapat meningkatkan kesadaran masyarakat tentang pentingnya menjaga ekosistem pesisir untuk generasi mendatang.",
      en: "The mangrove area on Jakarta's northern coast is the capital's last fortress protecting against coastal abrasion and tidal flooding. Mangrove ecosystems serve as wave breakers, carbon absorbers, and habitats for hundreds of bird and fish species.\n\nUnfortunately, Jakarta's mangrove forests continue to shrink due to reclamation and development. From the thousands of hectares that once existed, only a few hundred protected hectares remain.\n\nConservation efforts in the PIK area offer new hope. Mangrove planting programs, environmental education, and ecotourism are expected to raise public awareness about the importance of preserving coastal ecosystems for future generations.",
    },
    category: "lingkungan",
    imageUrl: "/images/stories/mangrove.png",
    locationId: "loc_mangrove_pik",
    unlocked: false,
    unlockedByQuestId: "quest_eco_mangrove",
  },
];
