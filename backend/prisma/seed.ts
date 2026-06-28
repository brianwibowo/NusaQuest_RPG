import { PrismaClient, LocationCategory, QuestType, QuestDifficulty, ObjectiveType, StoryCategory, BattleType, UmkmCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data to avoid conflicts on re-run
  await prisma.song.deleteMany({});
  await prisma.umkm.deleteMany({});
  await prisma.battleQuestion.deleteMany({});
  await prisma.battle.deleteMany({});
  await prisma.story.deleteMany({});
  await prisma.questObjective.deleteMany({});
  await prisma.questReward.deleteMany({});
  await prisma.quest.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Cleaned existing database records.");

  // ==========================================
  // 1. Seed Locations
  // ==========================================
  const locationsData = [
    {
      id: "loc_kota_tua",
      nameId: "Kota Tua Jakarta",
      nameEn: "Jakarta Old Town",
      descId: "Kawasan bersejarah peninggalan era kolonial Belanda (Batavia). Terdapat Museum Fatahillah, Museum Bank Indonesia, dan berbagai bangunan bersejarah.",
      descEn: "Historic area from the Dutch colonial era (Batavia). Home to Fatahillah Museum, Bank Indonesia Museum, and various heritage buildings.",
      category: LocationCategory.wisata_sejarah,
      latitude: -6.1352,
      longitude: 106.8133,
      imageUrl: "/images/locations/kota_tua.jpg",
      addressId: "Jl. Taman Fatahillah No.1, Pinangsia, Tamansari, Jakarta Barat",
      addressEn: "Fatahillah Square No.1, Pinangsia, Tamansari, West Jakarta",
    },
    {
      id: "loc_setu_babakan",
      nameId: "Setu Babakan",
      nameEn: "Setu Babakan Cultural Village",
      descId: "Perkampungan Budaya Betawi yang melestarikan tradisi, kuliner, kesenian, dan arsitektur khas suku Betawi.",
      descEn: "Betawi Cultural Village preserving traditions, cuisine, arts, and architecture of the Betawi ethnic group.",
      category: LocationCategory.wisata_budaya,
      latitude: -6.3407,
      longitude: 106.8274,
      imageUrl: "/images/locations/setu_babakan.jpg",
      addressId: "Jl. Moch. Kahfi II, Srengseng Sawah, Jagakarsa, Jakarta Selatan",
      addressEn: "Moch. Kahfi II Street, Srengseng Sawah, Jagakarsa, South Jakarta",
    },
    {
      id: "loc_monas",
      nameId: "Monumen Nasional (Monas)",
      nameEn: "National Monument (Monas)",
      descId: "Simbol kemerdekaan Indonesia setinggi 132 meter. Di dalamnya terdapat museum sejarah perjuangan kemerdekaan.",
      descEn: "Indonesia's 132-meter independence symbol. Inside is a museum about the independence struggle history.",
      category: LocationCategory.wisata_sejarah,
      latitude: -6.1754,
      longitude: 106.8272,
      imageUrl: "/images/locations/monas.jpg",
      addressId: "Jl. Medan Merdeka Barat, Gambir, Jakarta Pusat",
      addressEn: "Medan Merdeka Barat Street, Gambir, Central Jakarta",
    },
    {
      id: "loc_ragunan",
      nameId: "Taman Margasatwa Ragunan",
      nameEn: "Ragunan Zoo",
      descId: "Kebun binatang tertua di Indonesia seluas 140 hektar. Habitat bagi berbagai satwa khas Nusantara dan taman hijau yang asri.",
      descEn: "Indonesia's oldest zoo spanning 140 hectares. Habitat for various native Nusantara wildlife and lush green parks.",
      category: LocationCategory.ekowisata,
      latitude: -6.3125,
      longitude: 106.8201,
      imageUrl: "/images/locations/ragunan.jpg",
      addressId: "Jl. Harsono RM No.1, Ragunan, Pasar Minggu, Jakarta Selatan",
      addressEn: "Harsono RM Street No.1, Ragunan, Pasar Minggu, South Jakarta",
    },
    {
      id: "loc_mangrove_pik",
      nameId: "Hutan Mangrove PIK",
      nameEn: "PIK Mangrove Forest",
      descId: "Kawasan konservasi mangrove di pesisir utara Jakarta. Wisata edukatif tentang pentingnya ekosistem mangrove bagi lingkungan.",
      descEn: "Mangrove conservation area on Jakarta's northern coast. Educational tourism about the importance of mangrove ecosystems.",
      category: LocationCategory.ekowisata,
      latitude: -6.1016,
      longitude: 106.7365,
      imageUrl: "/images/locations/mangrove_pik.jpg",
      addressId: "Jl. Garden House, Kamal Muara, Penjaringan, Jakarta Utara",
      addressEn: "Garden House Street, Kamal Muara, Penjaringan, North Jakarta",
    },
    {
      id: "loc_taman_mini",
      nameId: "Taman Mini Indonesia Indah",
      nameEn: "Beautiful Indonesia Miniature Park",
      descId: "Taman rekreasi yang menampilkan keragaman budaya Indonesia melalui anjungan provinsi, museum, dan wahana edukasi.",
      descEn: "Recreation park showcasing Indonesia's cultural diversity through provincial pavilions, museums, and educational attractions.",
      category: LocationCategory.wisata_budaya,
      latitude: -6.3024,
      longitude: 106.8951,
      imageUrl: "/images/locations/taman_mini.jpg",
      addressId: "Jl. Raya Taman Mini, Cipayung, Jakarta Timur",
      addressEn: "Taman Mini Main Road, Cipayung, East Jakarta",
    },
    {
      id: "loc_glodok",
      nameId: "Pecinan Glodok",
      nameEn: "Glodok Chinatown",
      descId: "Kawasan Pecinan tertua di Jakarta. Perpaduan budaya Tionghoa-Betawi yang kaya akan kuliner, arsitektur klenteng, dan tradisi.",
      descEn: "Jakarta's oldest Chinatown district. A blend of Chinese-Betawi culture rich in cuisine, temple architecture, and traditions.",
      category: LocationCategory.wisata_kuliner,
      latitude: -6.1490,
      longitude: 106.8132,
      imageUrl: "/images/locations/glodok.jpg",
      addressId: "Jl. Pancoran, Glodok, Tamansari, Jakarta Barat",
      addressEn: "Pancoran Street, Glodok, Tamansari, West Jakarta",
    },
    {
      id: "loc_taman_suropati",
      nameId: "Taman Suropati",
      nameEn: "Suropati Park",
      descId: "Taman kota bersejarah di jantung Menteng. Terdapat patung-patung ASEAN dan suasana hijau yang tenang di tengah keramaian kota.",
      descEn: "A historic city park in the heart of Menteng. Features ASEAN sculptures and a calm green atmosphere amidst the city bustle.",
      category: LocationCategory.ekowisata,
      latitude: -6.1993,
      longitude: 106.8370,
      imageUrl: "/images/locations/taman_suropati.jpg",
      addressId: "Jl. Taman Suropati, Menteng, Jakarta Pusat",
      addressEn: "Taman Suropati Street, Menteng, Central Jakarta",
    },
  ];

  for (const loc of locationsData) {
    await prisma.location.create({ data: loc });
  }
  console.log(`📍 Created ${locationsData.length} locations.`);

  // ==========================================
  // 2. Seed UMKM
  // ==========================================
  const umkmData = [
    {
      id: "umkm_kerak_telor",
      name: "Kerak Telor Mpok Siti",
      descId: "Pembuat kerak telor legendaris di Setu Babakan. Resep turun-temurun keluarga Betawi sejak tahun 1970-an.",
      descEn: "Legendary kerak telor maker at Setu Babakan. A Betawi family recipe passed down since the 1970s.",
      category: UmkmCategory.kuliner,
      products: ["Kerak Telor Original", "Kerak Telor Spesial", "Nasi Uduk Betawi"],
      locationId: "loc_setu_babakan",
      imageUrl: "/images/umkm/kerak_telor.jpg",
      rating: 4.8,
      voucherAvailable: true,
    },
    {
      id: "umkm_bir_pletok",
      name: "Bir Pletok Bang Jali",
      descId: "Produsen bir pletok tradisional Betawi. Minuman rempah khas Jakarta tanpa alkohol yang menyegarkan.",
      descEn: "Traditional Betawi bir pletok producer. A refreshing, non-alcoholic Jakarta spice drink.",
      category: UmkmCategory.kuliner,
      products: ["Bir Pletok Original", "Bir Pletok Jahe", "Sirup Rempah"],
      locationId: "loc_setu_babakan",
      imageUrl: "/images/umkm/bir_pletok.jpg",
      rating: 4.5,
      voucherAvailable: false,
    },
    {
      id: "umkm_kopi_tua",
      name: "Kopi Tua Batavia",
      descId: "Kedai kopi bersejarah di kawasan Kota Tua. Menyajikan kopi tubruk dan kopi susu khas Batavia di bangunan heritage.",
      descEn: "A historic coffee shop in the Old Town area. Serving traditional tubruk coffee and Batavia-style café au lait in a heritage building.",
      category: UmkmCategory.kuliner,
      products: ["Kopi Tubruk", "Kopi Susu Batavia", "Roti Buaya"],
      locationId: "loc_kota_tua",
      imageUrl: "/images/umkm/kopi_tua.jpg",
      rating: 4.6,
      voucherAvailable: false,
    },
    {
      id: "umkm_bakmi_legendaris",
      name: "Bakmi Aboen Glodok",
      descId: "Bakmi legendaris di Pecinan Glodok sejak tahun 1960. Racikan bumbu khas Tionghoa-Betawi yang tak berubah selama puluhan tahun.",
      descEn: "Legendary bakmi in Glodok Chinatown since 1960. A unique Chinese-Betawi seasoning recipe unchanged for decades.",
      category: UmkmCategory.kuliner,
      products: ["Bakmi Goreng", "Bakmi Kuah", "Pangsit Goreng"],
      locationId: "loc_glodok",
      imageUrl: "/images/umkm/bakmi_glodok.jpg",
      rating: 4.7,
      voucherAvailable: true,
    },
    {
      id: "umkm_suvenir_nusantara",
      name: "Galeri Suvenir Nusantara",
      descId: "Toko suvenir yang menjual kerajinan tangan dari berbagai daerah di Indonesia. Tersedia batik, wayang, miniatur rumah adat, dan lainnya.",
      descEn: "Souvenir shop selling handicrafts from across Indonesia. Available: batik, wayang puppets, traditional house miniatures, and more.",
      category: UmkmCategory.suvenir,
      products: ["Batik Tulis", "Miniatur Rumah Adat", "Wayang Kulit", "Gantungan Kunci"],
      locationId: "loc_taman_mini",
      imageUrl: "/images/umkm/suvenir_nusantara.jpg",
      rating: 4.3,
      voucherAvailable: false,
    },
  ];

  for (const umkm of umkmData) {
    await prisma.umkm.create({ data: umkm });
  }
  console.log(`🛍️ Created ${umkmData.length} UMKM stores.`);

  // ==========================================
  // 3. Seed Stories
  // ==========================================
  const storiesData = [
    {
      id: "story_batavia",
      titleId: "Batavia: Kota yang Terlupakan",
      titleEn: "Batavia: The Forgotten City",
      contentId: "Pada tahun 1619, Jan Pieterszoon Coen membangun kota Batavia di atas reruntuhan Jayakarta. Kota ini menjadi pusat perdagangan VOC (Vereenigde Oostindische Compagnie) dan salah satu kota paling penting di Asia Tenggara selama era kolonial.\n\nKawasan Kota Tua Jakarta yang kita kenal saat ini merupakan jantung kota Batavia. Di sinilah berdiri Stadhuis (Balai Kota) yang kini menjadi Museum Fatahillah, gudang-gudang VOC, dan kanal-kanal yang menghubungkan pelabuhan Sunda Kelapa dengan pusat kota.\n\nMeskipun Batavia pernah dijuluki 'Permata Asia', kota ini juga menyimpan sejarah kelam perbudakan dan eksploitasi rempah-rempah. Setiap sudut Kota Tua menyimpan cerita tentang perjuangan, perdagangan, dan pertemuan budaya yang membentuk Jakarta modern.",
      contentEn: "In 1619, Jan Pieterszoon Coen built the city of Batavia on the ruins of Jayakarta. The city became the trading center of the VOC (Dutch East India Company) and one of the most important cities in Southeast Asia during the colonial era.\n\nThe Jakarta Old Town area we know today was the heart of Batavia. Here stood the Stadhuis (City Hall), now the Fatahillah Museum, VOC warehouses, and canals connecting Sunda Kelapa harbor to the city center.\n\nAlthough Batavia was once called the 'Jewel of Asia', the city also holds a dark history of slavery and spice exploitation. Every corner of Old Town holds stories of struggle, trade, and cultural encounters that shaped modern Jakarta.",
      category: StoryCategory.sejarah,
      imageUrl: "/images/stories/batavia.png",
      locationId: "loc_kota_tua",
      unlockedByQuestId: "quest_kota_tua_history",
    },
    {
      id: "story_betawi",
      titleId: "Betawi: Jiwa Asli Jakarta",
      titleEn: "Betawi: The Original Soul of Jakarta",
      contentId: "Suku Betawi adalah penduduk asli Jakarta yang terbentuk dari percampuran berbagai etnis: Melayu, Sunda, Jawa, Arab, Tionghoa, India, dan Portugis. Proses akulturasi ini berlangsung selama berabad-century dan menghasilkan budaya yang unik dan kaya.\n\nDi Setu Babakan, Perkampungan Budaya Betawi masih melestarikan tradisi yang mulai langka di Jakarta modern. Rumah Kebaya dengan arsitektur khasnya, Tari Topeng yang penuh makna, Ondel-ondel sebagai penolak bala, hingga kuliner legendaris seperti kerak telor dan bir pletok.\n\nBudaya Betawi bukan sekadar warisan masa lalu — ia adalah identitas hidup yang terus berkembang. Lenong, gambang kromong, dan silat Betawi masih mewarnai kehidupan masyarakat di perkampungan-perkampungan Betawi yang tersisa.",
      contentEn: "The Betawi are the native people of Jakarta, formed from a mixture of various ethnicities: Malay, Sundanese, Javanese, Arab, Chinese, Indian, and Portuguese. This acculturation process lasted for centuries, producing a unique and rich culture.\n\nAt Setu Babakan, the Betawi Cultural Village still preserves traditions that are becoming rare in modern Jakarta. The Kebaya House with its distinctive architecture, the meaningful Mask Dance, Ondel-ondel as evil repellents, and legendary cuisine like kerak telor and bir pletok.\n\nBetawi culture is not just a relic of the past — it is a living identity that continues to evolve. Lenong theater, gambang kromong music, and Betawi martial arts still color the lives of communities in the remaining Betawi villages.",
      category: StoryCategory.budaya,
      imageUrl: "/images/stories/betawi.png",
      locationId: "loc_setu_babakan",
      unlockedByQuestId: "quest_betawi_culture",
    },
    {
      id: "story_kuliner_betawi",
      titleId: "Cita Rasa Betawi: Dari Dapur ke Dunia",
      titleEn: "Betawi Flavors: From Kitchen to the World",
      contentId: "Kuliner Betawi merupakan cerminan dari keragaman etnis yang membentuk suku Betawi. Kerak telor, makanan khas yang dibuat dari beras ketan dan telur bebek, awalnya merupakan hidangan mewah yang hanya disajikan pada upacara adat.\n\nBir pletok, minuman rempah khas Betawi, lahir dari tradisi minum jamu dan pengaruh budaya Tionghoa. Meskipun namanya 'bir', minuman ini sama sekali tidak mengandung alkohol — nama 'pletok' berasal dari suara botol saat ditutup.\n\nSoto Betawi dengan kuah santan-susu yang kaya, nasi uduk yang gurih, dan dodol Betawi yang manis — semuanya menceritakan kisah tentang persilangan budaya yang harmonis dalam satu piring.",
      contentEn: "Betawi cuisine reflects the ethnic diversity that formed the Betawi people. Kerak telor, a dish made from glutinous rice and duck egg, was originally a luxurious dish served only at traditional ceremonies.\n\nBir pletok, a Betawi spice drink, was born from the jamu drinking tradition and Chinese cultural influence. Despite its name 'beer', this drink contains no alcohol — the name 'pletok' comes from the sound of a bottle being closed.\n\nSoto Betawi with its rich coconut milk-and-milk broth, savory nasi uduk, and sweet dodol Betawi — all tell stories of harmonious cultural crossroads on a single plate.",
      category: StoryCategory.kuliner,
      imageUrl: "/images/stories/kuliner_betawi.png",
      locationId: "loc_setu_babakan",
      unlockedByQuestId: "quest_betawi_culinary",
    },
    {
      id: "story_monas",
      titleId: "Monas: Tugu Api Kemerdekaan",
      titleEn: "Monas: The Flame of Independence",
      contentId: "Monumen Nasional (Monas) dirancang oleh arsitek Friedrich Silaban dan Soedarsono. Pembangunannya dimulai pada 17 Agustus 1961 dan baru selesai pada tahun 1975. Monas setinggi 132 meter ini menjadi simbol perjuangan kemerdekaan Indonesia.\n\nDi puncak Monas terdapat lidah api yang dilapisi emas seberat 35 kilogram, melambangkan semangat rakyat Indonesia yang tidak pernah padam. Di ruang bawah tanah, terdapat museum sejarah dengan 51 diorama yang menggambarkan perjalanan bangsa Indonesia dari masa prasejarah hingga kemerdekaan.\n\nTaman Monas sendiri merupakan ruang terbuka hijau terluas di Jakarta, menjadi tempat berkumpul masyarakat dari berbagai latar belakang — mencerminkan semangat persatuan yang menjadi fondasi bangsa.",
      contentEn: "The National Monument (Monas) was designed by architects Friedrich Silaban and Soedarsono. Construction began on August 17, 1961, and was completed in 1975. Standing 132 meters tall, Monas symbolizes Indonesia's independence struggle.\n\nAt the top of Monas is a flame covered with 35 kilograms of gold, symbolizing the never-extinguishing spirit of the Indonesian people. Underground, there is a history museum with 51 dioramas depicting Indonesia's journey from prehistory to independence.\n\nThe Monas park itself is Jakarta's largest open green space, serving as a gathering place for people from all backgrounds — reflecting the spirit of unity that forms the nation's foundation.",
      category: StoryCategory.sejarah,
      imageUrl: "/images/stories/monas.png",
      locationId: "loc_monas",
      unlockedByQuestId: "quest_monas_history",
    },
    {
      id: "story_mangrove",
      titleId: "Mangrove Jakarta: Benteng Terakhir Pesisir",
      titleEn: "Jakarta's Mangroves: The Coast's Last Fortress",
      contentId: "Kawasan mangrove di pesisir utara Jakarta merupakan benteng terakhir perlindungan pantai ibu kota dari abrasi dan banjir rob. Ekosistem mangrove berfungsi sebagai penahan gelombang, penyerap karbon, dan habitat bagi ratusan spesies burung dan ikan.\n\nSayangnya, luas hutan mangrove Jakarta terus menyusut akibat reklamasi dan pembangunan. Dari ribuan hektar yang pernah ada, kini hanya tersisa beberapa ratus hektar yang dilindungi.\n\nUpaya konservasi di kawasan PIK menjadi harapan baru. Program penanaman mangrove, edukasi lingkungan, dan ekowisata diharapkan dapat meningkatkan kesadaran masyarakat tentang pentingnya menjaga ekosistem pesisir untuk generasi mendatang.",
      contentEn: "The mangrove area on Jakarta's northern coast is the capital's last fortress protecting against coastal abrasion and tidal flooding. Mangrove ecosystems serve as wave breakers, carbon absorbers, and habitats for hundreds of bird and fish species.\n\nUnfortunately, Jakarta's mangrove forests continue to shrink due to reclamation and development. From the thousands of hectares that once existed, only a few hundred protected hectares remain.\n\nConservation efforts in the PIK area offer new hope. Mangrove planting programs, environmental education, and ecotourism are expected to raise public awareness about the importance of preserving coastal ecosystems for future generations.",
      category: StoryCategory.lingkungan,
      imageUrl: "/images/stories/mangrove.png",
      locationId: "loc_mangrove_pik",
      unlockedByQuestId: "quest_eco_mangrove",
    },
  ];

  for (const story of storiesData) {
    await prisma.story.create({ data: story });
  }
  console.log(`📜 Created ${storiesData.length} stories.`);

  // ==========================================
  // 4. Seed Quests, objectives & rewards
  // ==========================================
  const questsData = [
    {
      id: "quest_kota_tua_history",
      titleId: "Jejak Batavia: Rahasia Kota Tua",
      titleEn: "Batavia Trail: Old Town Secrets",
      descId: "Telusuri jejak sejarah Batavia di kawasan Kota Tua Jakarta. Kunjungi Museum Fatahillah, pecahkan teka-teki sejarah, dan buka cerita tersembunyi tentang masa kolonial Belanda.",
      descEn: "Trace the history of Batavia in Jakarta's Old Town. Visit the Fatahillah Museum, solve historical puzzles, and unlock hidden stories about the Dutch colonial era.",
      type: QuestType.main,
      difficulty: QuestDifficulty.medium,
      requiredLevel: 1,
      availableLevels: [1, 2, 3, 4, 5],
      estimatedTimeId: "45 menit",
      estimatedTimeEn: "45 minutes",
      imageUrl: "/images/quests/kota_tua.jpg",
      locationId: "loc_kota_tua",
      objectives: [
        { descId: "Kunjungi kawasan Kota Tua Jakarta", descEn: "Visit the Jakarta Old Town area", type: ObjectiveType.visit_location, sortOrder: 0 },
        { descId: "Jawab kuis tentang sejarah Batavia", descEn: "Answer the quiz about Batavia's history", type: ObjectiveType.answer_quiz, sortOrder: 1 },
        { descId: "Ambil foto di depan Museum Fatahillah", descEn: "Take a photo in front of Fatahillah Museum", type: ObjectiveType.take_photo, sortOrder: 2 },
      ],
      reward: {
        xp: 500,
        points: 200,
        badgeId: "badge_history_buff",
        storyUnlockId: "story_batavia",
      },
      battleId: "battle_batavia_quiz",
    },
    {
      id: "quest_betawi_culture",
      titleId: "Warisan Betawi: Budaya yang Hidup",
      titleEn: "Betawi Heritage: Living Culture",
      descId: "Jelajahi Perkampungan Budaya Betawi di Setu Babakan. Pelajari tradisi, kesenian, dan cara hidup suku Betawi yang masih lestari.",
      descEn: "Explore the Betawi Cultural Village at Setu Babakan. Learn about traditions, arts, and the enduring Betawi way of life.",
      type: QuestType.cultural,
      difficulty: QuestDifficulty.easy,
      requiredLevel: 1,
      availableLevels: [1, 2, 3, 4, 5],
      estimatedTimeId: "30 menit",
      estimatedTimeEn: "30 minutes",
      imageUrl: "/images/quests/setu_babakan.jpg",
      locationId: "loc_setu_babakan",
      objectives: [
        { descId: "Kunjungi Perkampungan Budaya Betawi", descEn: "Visit the Betawi Cultural Village", type: ObjectiveType.visit_location, sortOrder: 0 },
        { descId: "Jawab kuis tentang budaya Betawi", descEn: "Answer quiz about Betawi culture", type: ObjectiveType.answer_quiz, sortOrder: 1 },
      ],
      reward: {
        xp: 400,
        points: 150,
        badgeId: "badge_culture_keeper",
        storyUnlockId: "story_betawi",
      },
      battleId: "battle_betawi_quiz",
    },
    {
      id: "quest_betawi_culinary",
      titleId: "Jejak Kuliner: Rasa Betawi Legendaris",
      titleEn: "Culinary Trail: Legendary Betawi Flavors",
      descId: "Cicipi kuliner khas Betawi yang legendaris di kawasan Setu Babakan. Temukan kerak telor, bir pletok, dan makanan tradisional lainnya.",
      descEn: "Taste legendary Betawi cuisine in the Setu Babakan area. Discover kerak telor, bir pletok, and other traditional delicacies.",
      type: QuestType.culinary,
      difficulty: QuestDifficulty.easy,
      requiredLevel: 1,
      availableLevels: [1, 2, 3, 4, 5],
      estimatedTimeId: "30 menit",
      estimatedTimeEn: "30 minutes",
      imageUrl: "/images/quests/kuliner_betawi.jpg",
      locationId: "loc_setu_babakan",
      objectives: [
        { descId: "Kunjungi UMKM kuliner Betawi", descEn: "Visit a Betawi culinary UMKM", type: ObjectiveType.visit_location, sortOrder: 0 },
        { descId: "Coba produk kuliner lokal", descEn: "Try a local culinary product", type: ObjectiveType.buy_product, sortOrder: 1 },
        { descId: "Jawab kuis tentang kuliner Betawi", descEn: "Answer quiz about Betawi cuisine", type: ObjectiveType.answer_quiz, sortOrder: 2 },
      ],
      reward: {
        xp: 350,
        points: 180,
        voucherId: "voucher_kerak_telor",
        storyUnlockId: "story_kuliner_betawi",
      },
      battleId: "battle_culinary_quiz",
      relatedUmkmId: "umkm_kerak_telor",
    },
    {
      id: "quest_monas_history",
      titleId: "Pilar Kemerdekaan: Kisah Monas",
      titleEn: "Pillar of Independence: The Monas Story",
      descId: "Pelajari sejarah perjuangan kemerdekaan Indonesia di Monumen Nasional. Kunjungi museum di dalamnya dan pecahkan teka-teki sejarah.",
      descEn: "Learn about Indonesia's independence struggle at the National Monument. Visit the museum inside and solve historical puzzles.",
      type: QuestType.historical,
      difficulty: QuestDifficulty.medium,
      requiredLevel: 2,
      availableLevels: [2, 3, 4, 5],
      estimatedTimeId: "60 menit",
      estimatedTimeEn: "60 minutes",
      imageUrl: "/images/quests/monas.jpg",
      locationId: "loc_monas",
      objectives: [
        { descId: "Kunjungi Monumen Nasional", descEn: "Visit the National Monument", type: ObjectiveType.visit_location, sortOrder: 0 },
        { descId: "Jawab kuis tentang sejarah kemerdekaan", descEn: "Answer quiz about independence history", type: ObjectiveType.answer_quiz, sortOrder: 1 },
        { descId: "Ambil foto di depan Monas", descEn: "Take a photo in front of Monas", type: ObjectiveType.take_photo, sortOrder: 2 },
      ],
      reward: {
        xp: 450,
        points: 200,
        badgeId: "badge_independence",
        storyUnlockId: "story_monas",
      },
    },
    {
      id: "quest_eco_ragunan",
      titleId: "Misi Hijau: Penjaga Ragunan",
      titleEn: "Green Mission: Ragunan Guardian",
      descId: "Selesaikan tantangan ramah lingkungan di Taman Margasatwa Ragunan. Pelajari tentang satwa Nusantara dan pentingnya konservasi.",
      descEn: "Complete eco-friendly challenges at Ragunan Zoo. Learn about Nusantara wildlife and the importance of conservation.",
      type: QuestType.eco,
      difficulty: QuestDifficulty.easy,
      requiredLevel: 1,
      availableLevels: [1, 2, 3, 4, 5],
      estimatedTimeId: "45 menit",
      estimatedTimeEn: "45 minutes",
      imageUrl: "/images/quests/ragunan.jpg",
      locationId: "loc_ragunan",
      objectives: [
        { descId: "Kunjungi Taman Margasatwa Ragunan", descEn: "Visit Ragunan Zoo", type: ObjectiveType.visit_location, sortOrder: 0 },
        { descId: "Bawa tumbler/botol minum sendiri", descEn: "Bring your own tumbler/water bottle", type: ObjectiveType.eco_action, sortOrder: 1 },
        { descId: "Jawab kuis tentang satwa Nusantara", descEn: "Answer quiz about Nusantara wildlife", type: ObjectiveType.answer_quiz, sortOrder: 2 },
      ],
      reward: {
        xp: 400,
        points: 150,
        badgeId: "badge_eco_warrior",
      },
    },
    {
      id: "quest_eco_mangrove",
      titleId: "Misi Hijau: Pelindung Mangrove",
      titleEn: "Green Mission: Mangrove Protector",
      descId: "Jelajahi kawasan konservasi mangrove di PIK. Pelajari pentingnya ekosistem mangrove dan lakukan aksi pelestarian lingkungan.",
      descEn: "Explore the mangrove conservation area in PIK. Learn about the importance of mangrove ecosystems and take conservation actions.",
      type: QuestType.eco,
      difficulty: QuestDifficulty.medium,
      requiredLevel: 2,
      availableLevels: [2, 3, 4, 5],
      estimatedTimeId: "60 menit",
      estimatedTimeEn: "60 minutes",
      imageUrl: "/images/quests/mangrove.jpg",
      locationId: "loc_mangrove_pik",
      objectives: [
        { descId: "Kunjungi Hutan Mangrove PIK", descEn: "Visit PIK Mangrove Forest", type: ObjectiveType.visit_location, sortOrder: 0 },
        { descId: "Ikuti kegiatan penanaman mangrove atau bersih pantai", descEn: "Participate in mangrove planting or beach cleanup", type: ObjectiveType.eco_action, sortOrder: 1 },
      ],
      reward: {
        xp: 500,
        points: 200,
        badgeId: "badge_mangrove_hero",
        storyUnlockId: "story_mangrove",
      },
    },
    {
      id: "quest_kota_tua_photo",
      titleId: "Spot Foto: Kota Tua Instagramable",
      titleEn: "Photo Spot: Instagrammable Old Town",
      descId: "Temukan dan abadikan spot foto terbaik di kawasan Kota Tua Jakarta. Tunjukkan keindahan arsitektur kolonial yang masih terjaga.",
      descEn: "Find and capture the best photo spots in Jakarta's Old Town. Showcase the beauty of the preserved colonial architecture.",
      type: QuestType.photo,
      difficulty: QuestDifficulty.easy,
      requiredLevel: 1,
      availableLevels: [1, 2, 3, 4, 5],
      estimatedTimeId: "20 menit",
      estimatedTimeEn: "20 minutes",
      imageUrl: "/images/quests/kota_tua_photo.jpg",
      locationId: "loc_kota_tua",
      objectives: [
        { descId: "Ambil foto di 3 spot berbeda di Kota Tua", descEn: "Take photos at 3 different spots in Old Town", type: ObjectiveType.take_photo, sortOrder: 0 },
      ],
      reward: {
        xp: 200,
        points: 100,
        collectibleId: "collectible_kota_tua_frame",
      },
    },
    {
      id: "quest_glodok_culinary",
      titleId: "Wisata Rasa: Pecinan Glodok",
      titleEn: "Flavor Journey: Glodok Chinatown",
      descId: "Jelajahi Pecinan Glodok dan cicipi kuliner khas Tionghoa-Betawi. Dari bakmi legendaris hingga kue keranjang, nikmati perpaduan rasa yang unik.",
      descEn: "Explore Glodok Chinatown and taste Chinese-Betawi cuisine. From legendary bakmi to kue keranjang, enjoy the unique blend of flavors.",
      type: QuestType.culinary,
      difficulty: QuestDifficulty.easy,
      requiredLevel: 1,
      availableLevels: [1, 2, 3, 4, 5],
      estimatedTimeId: "30 menit",
      estimatedTimeEn: "30 minutes",
      imageUrl: "/images/quests/glodok.jpg",
      locationId: "loc_glodok",
      objectives: [
        { descId: "Kunjungi kawasan Pecinan Glodok", descEn: "Visit the Glodok Chinatown area", type: ObjectiveType.visit_location, sortOrder: 0 },
        { descId: "Coba kuliner khas di salah satu UMKM", descEn: "Try signature cuisine at one of the UMKM", type: ObjectiveType.buy_product, sortOrder: 1 },
        { descId: "Tulis ulasan tentang pengalamanmu", descEn: "Write a review about your experience", type: ObjectiveType.write_review, sortOrder: 2 },
      ],
      reward: {
        xp: 350,
        points: 150,
        voucherId: "voucher_bakmi",
      },
      relatedUmkmId: "umkm_bakmi_legendaris",
    },
    {
      id: "quest_taman_mini_culture",
      titleId: "Nusantara dalam Satu Langkah",
      titleEn: "Nusantara in One Step",
      descId: "Jelajahi keragaman budaya Indonesia di Taman Mini Indonesia Indah. Kunjungi anjungan provinsi dan pelajari keunikan setiap daerah.",
      descEn: "Explore Indonesia's cultural diversity at Taman Mini Indonesia Indah. Visit provincial pavilions and learn about each region's uniqueness.",
      type: QuestType.cultural,
      difficulty: QuestDifficulty.hard,
      requiredLevel: 3,
      availableLevels: [3, 4, 5],
      estimatedTimeId: "90 menit",
      estimatedTimeEn: "90 minutes",
      imageUrl: "/images/quests/taman_mini.jpg",
      locationId: "loc_taman_mini",
      objectives: [
        { descId: "Kunjungi minimal 3 anjungan provinsi", descEn: "Visit at least 3 provincial pavilions", type: ObjectiveType.visit_location, sortOrder: 0 },
        { descId: "Jawab kuis tentang kebudayaan Nusantara", descEn: "Answer quiz about Nusantara cultures", type: ObjectiveType.answer_quiz, sortOrder: 1 },
        { descId: "Beli suvenir khas daerah dari UMKM", descEn: "Buy a regional souvenir from a UMKM", type: ObjectiveType.buy_product, sortOrder: 2 },
      ],
      reward: {
        xp: 500,
        points: 250,
        badgeId: "badge_nusantara_explorer",
        collectibleId: "collectible_peta_nusantara",
      },
      relatedUmkmId: "umkm_suvenir_nusantara",
    },
    {
      id: "quest_eco_suropati",
      titleId: "Oase Hijau: Taman Suropati",
      titleEn: "Green Oasis: Suropati Park",
      descId: "Nikmati ketenangan Taman Suropati di tengah hiruk-pikuk Jakarta. Lakukan aksi ramah lingkungan dan pelajari sejarah taman bersejarah ini.",
      descEn: "Enjoy the tranquility of Suropati Park amidst Jakarta's hustle. Take eco-friendly actions and learn the history of this heritage park.",
      type: QuestType.eco,
      difficulty: QuestDifficulty.easy,
      requiredLevel: 1,
      availableLevels: [1, 2, 3, 4, 5],
      estimatedTimeId: "20 menit",
      estimatedTimeEn: "20 minutes",
      imageUrl: "/images/quests/suropati.jpg",
      locationId: "loc_taman_suropati",
      objectives: [
        { descId: "Kunjungi Taman Suropati", descEn: "Visit Suropati Park", type: ObjectiveType.visit_location, sortOrder: 0 },
        { descId: "Lakukan aksi bersih-bersih taman selama 10 menit", descEn: "Do a 10-minute park cleanup action", type: ObjectiveType.eco_action, sortOrder: 1 },
      ],
      reward: {
        xp: 300,
        points: 120,
        badgeId: "badge_green_guardian",
      },
    },
  ];

  for (const qData of questsData) {
    const { objectives, reward, battleId, ...questRest } = qData;
    const quest = await prisma.quest.create({
      data: {
        ...questRest,
        reward: {
          create: reward,
        },
        objectives: {
          create: objectives,
        },
      },
    });
    console.log(`⚔️ Created quest: ${quest.id}`);
  }

  // ==========================================
  // 5. Seed Battles (Quizzes)
  // ==========================================
  const battlesData = [
    {
      id: "battle_batavia_quiz",
      titleId: "Kuis Sejarah Batavia",
      titleEn: "Batavia History Quiz",
      type: BattleType.knowledge,
      descId: "Uji pengetahuanmu tentang sejarah Batavia dan Kota Tua Jakarta!",
      descEn: "Test your knowledge about the history of Batavia and Jakarta Old Town!",
      timeLimit: 60,
      rewardXp: 150,
      rewardPoints: 75,
      passingScore: 2,
      questId: "quest_kota_tua_history",
      questions: [
        {
          questionId: "Siapa pendiri kota Batavia?",
          questionEn: "Who founded the city of Batavia?",
          options: [
            { id: "Jan Pieterszoon Coen", en: "Jan Pieterszoon Coen" },
            { id: "Herman Willem Daendels", en: "Herman Willem Daendels" },
            { id: "Thomas Stamford Raffles", en: "Thomas Stamford Raffles" },
            { id: "Cornelis de Houtman", en: "Cornelis de Houtman" },
          ],
          correctIndex: 0,
          explanationId: "Jan Pieterszoon Coen mendirikan Batavia pada tahun 1619 setelah menghancurkan kota Jayakarta.",
          explanationEn: "Jan Pieterszoon Coen founded Batavia in 1619 after destroying the city of Jayakarta.",
          sortOrder: 0,
        },
        {
          questionId: "Apa nama asli kota Jakarta sebelum menjadi Batavia?",
          questionEn: "What was Jakarta's original name before it became Batavia?",
          options: [
            { id: "Sunda Kelapa", en: "Sunda Kelapa" },
            { id: "Jayakarta", en: "Jayakarta" },
            { id: "Priok", en: "Priok" },
            { id: "Pakuan", en: "Pakuan" },
          ],
          correctIndex: 1,
          explanationId: "Nama Jayakarta diberikan oleh Fatahillah pada tahun 1527 setelah mengalahkan Portugis. Sebelumnya bernama Sunda Kelapa.",
          explanationEn: "The name Jayakarta was given by Fatahillah in 1527 after defeating the Portuguese. It was previously called Sunda Kelapa.",
          sortOrder: 1,
        },
        {
          questionId: "Museum Fatahillah dulunya berfungsi sebagai apa?",
          questionEn: "What was the original function of the Fatahillah Museum?",
          options: [
            { id: "Istana gubernur", en: "Governor's palace" },
            { id: "Balai Kota Batavia", en: "Batavia City Hall" },
            { id: "Benteng pertahanan", en: "Defense fortress" },
            { id: "Gudang VOC", en: "VOC warehouse" },
          ],
          correctIndex: 1,
          explanationId: "Gedung Museum Fatahillah dibangun pada tahun 1710 dan berfungsi sebagai Balai Kota (Stadhuis) Batavia.",
          explanationEn: "The Fatahillah Museum building was built in 1710 and served as the Batavia City Hall (Stadhuis).",
          sortOrder: 2,
        },
      ],
    },
    {
      id: "battle_betawi_quiz",
      titleId: "Kuis Budaya Betawi",
      titleEn: "Betawi Culture Quiz",
      type: BattleType.knowledge,
      descId: "Seberapa dalam pengetahuanmu tentang budaya Betawi?",
      descEn: "How deep is your knowledge about Betawi culture?",
      timeLimit: 60,
      rewardXp: 120,
      rewardPoints: 60,
      passingScore: 2,
      questId: "quest_betawi_culture",
      questions: [
        {
          questionId: "Apa nama tarian khas Betawi yang menggunakan topeng?",
          questionEn: "What is the name of the Betawi dance that uses masks?",
          options: [
            { id: "Tari Topeng Betawi", en: "Betawi Mask Dance" },
            { id: "Tari Jaipong", en: "Jaipong Dance" },
            { id: "Tari Saman", en: "Saman Dance" },
            { id: "Tari Kecak", en: "Kecak Dance" },
          ],
          correctIndex: 0,
          explanationId: "Tari Topeng Betawi adalah kesenian tari tradisional khas Betawi yang menggunakan topeng kayu berwarna-warni.",
          explanationEn: "The Betawi Mask Dance is a traditional Betawi dance art that uses colorful wooden masks.",
          sortOrder: 0,
        },
        {
          questionId: "Apa nama rumah tradisional khas Betawi?",
          questionEn: "What is the name of the traditional Betawi house?",
          options: [
            { id: "Rumah Joglo", en: "Joglo House" },
            { id: "Rumah Kebaya", en: "Kebaya House" },
            { id: "Rumah Gadang", en: "Gadang House" },
            { id: "Rumah Tongkonan", en: "Tongkonan House" },
          ],
          correctIndex: 1,
          explanationId: "Rumah Kebaya adalah rumah tradisional Betawi yang atapnya menyerupai lipatan kebaya. Banyak ditemukan di kawasan Setu Babakan.",
          explanationEn: "The Kebaya House is a traditional Betawi house whose roof resembles the folds of a kebaya. Many can be found in the Setu Babakan area.",
          sortOrder: 1,
        },
        {
          questionId: "Ondel-ondel dalam budaya Betawi melambangkan apa?",
          questionEn: "What do ondel-ondel represent in Betawi culture?",
          options: [
            { id: "Hiburan anak-anak", en: "Children's entertainment" },
            { id: "Penolak bala (pelindung)", en: "Evil repellent (protector)" },
            { id: "Simbol kemakmuran", en: "Symbol of prosperity" },
            { id: "Patung dewa", en: "Deity statue" },
          ],
          correctIndex: 1,
          explanationId: "Ondel-ondel awalnya merupakan boneka besar yang dipercaya sebagai penolak bala atau roh jahat dalam tradisi Betawi.",
          explanationEn: "Ondel-ondel were originally large puppets believed to ward off evil spirits in Betawi tradition.",
          sortOrder: 2,
        },
      ],
    },
    {
      id: "battle_culinary_quiz",
      titleId: "Kuis Kuliner Jakarta",
      titleEn: "Jakarta Cuisine Quiz",
      type: BattleType.culinary,
      descId: "Tunjukkan pengetahuanmu tentang kuliner khas Jakarta dan Betawi!",
      descEn: "Show your knowledge about Jakarta and Betawi cuisine!",
      timeLimit: 45,
      rewardXp: 100,
      rewardPoints: 50,
      passingScore: 2,
      questId: "quest_betawi_culinary",
      questions: [
        {
          questionId: "Bahan utama kerak telor adalah?",
          questionEn: "What is the main ingredient of kerak telor?",
          options: [
            { id: "Beras ketan dan telur bebek", en: "Glutinous rice and duck egg" },
            { id: "Tepung beras dan telur ayam", en: "Rice flour and chicken egg" },
            { id: "Nasi putih dan telur puyuh", en: "White rice and quail egg" },
            { id: "Beras merah dan telur asin", en: "Brown rice and salted egg" },
          ],
          correctIndex: 0,
          explanationId: "Kerak telor dibuat dari beras ketan putih yang dimasak dengan telur bebek, lalu diberi kelapa sangrai dan bumbu rempah.",
          explanationEn: "Kerak telor is made from white glutinous rice cooked with duck egg, then topped with roasted coconut and spice seasoning.",
          sortOrder: 0,
        },
        {
          questionId: "Apa nama minuman rempah khas Betawi yang tidak mengandung alkohol?",
          questionEn: "What is the name of the non-alcoholic Betawi spice drink?",
          options: [
            { id: "Bir Pletok", en: "Bir Pletok" },
            { id: "Bajigur", en: "Bajigur" },
            { id: "Bandrek", en: "Bandrek" },
            { id: "Sekoteng", en: "Sekoteng" },
          ],
          correctIndex: 0,
          explanationId: "Bir Pletok adalah minuman tradisional Betawi berbahan rempah seperti jahe, serai, dan kayu manis. Tidak mengandung alkohol meskipun namanya 'bir'.",
          explanationEn: "Bir Pletok is a traditional Betawi drink made from spices like ginger, lemongrass, and cinnamon. It contains no alcohol despite its name.",
          sortOrder: 1,
        },
        {
          questionId: "Soto Betawi biasanya menggunakan kuah berbahan dasar apa?",
          questionEn: "Soto Betawi typically uses a broth made from what base?",
          options: [
            { id: "Santan dan susu", en: "Coconut milk and milk" },
            { id: "Kaldu ayam murni", en: "Pure chicken broth" },
            { id: "Air asam jawa", en: "Tamarind water" },
            { id: "Kuah kacang", en: "Peanut sauce" },
          ],
          correctIndex: 0,
          explanationId: "Soto Betawi memiliki ciri khas kuah yang kaya dan gurih karena menggunakan campuran santan dan susu (atau susu evaporasi).",
          explanationEn: "Soto Betawi is characterized by its rich and savory broth made from a blend of coconut milk and milk (or evaporated milk).",
          sortOrder: 2,
        },
      ],
    },
  ];

  for (const bData of battlesData) {
    const { questions, ...battleRest } = bData;
    const battle = await prisma.battle.create({
      data: {
        ...battleRest,
        questions: {
          create: questions.map((q) => ({
            ...q,
            options: q.options as any, // Cast for Prisma Json field
          })),
        },
      },
    });
    console.log(`⚔️ Created battle: ${battle.id}`);
  }

  // ==========================================
  // 6. Seed Songs
  // ==========================================
  const songsData = [
    {
      name: "Gamelan Jakarta Rhapsody",
      fileUrl: "/audio/bgm_gamelan.mp3",
      isActive: true,
    },
    {
      name: "Betawi Modern Beat",
      fileUrl: "/audio/bgm_modern.mp3",
      isActive: false,
    },
  ];

  for (const song of songsData) {
    await prisma.song.create({ data: song });
  }
  console.log(`🎵 Created ${songsData.length} BGM songs.`);

  // ==========================================
  // 7. Seed Admin User
  // ==========================================
  const adminEmail = process.env.ADMIN_EMAIL || "wira.nusa@gmail.com";
  const superAdmin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Wira Nusa (Super Admin)",
      role: "super_admin",
      profile: {
        create: {
          characterId: "explorer",
          level: 1,
          currentXp: 0,
          totalPoints: 0,
          gold: 100,
        },
      },
    },
  });
  console.log(`👑 Created Super Admin with email: ${adminEmail}`);

  console.log("🌱 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
