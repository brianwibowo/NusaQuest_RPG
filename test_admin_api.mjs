#!/usr/bin/env node
/**
 * SinopiQuest Admin API Integration Test
 * Tests all CRUD endpoints: Locations, Stories, UMKM, Songs, Quests, Users
 * Run: node test_admin_api.mjs
 */

const BASE = "http://localhost:3001/api";

// Generate a test JWT token manually (same secret as backend default)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jwt = require("./backend/node_modules/jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_that_is_at_least_32_characters_long";
const TOKEN = jwt.sign(
  { userId: "test-admin-id", email: "sultanapri86@gmail.com", role: "super_admin" },
  JWT_SECRET,
  { expiresIn: "1h" }
);

const AUTH = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

const results = [];
let createdIds = {};

function log(section, test, status, detail = "") {
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
  results.push({ section, test, status, detail });
  console.log(`${icon} [${section}] ${test}${detail ? " — " + detail : ""}`);
}

async function req(method, path, body = null) {
  const opts = { method, headers: AUTH };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, ok: res.ok, data };
}

// ═══════════════════════════════════════════════════
// 1. LOKASI WISATA
// ═══════════════════════════════════════════════════
async function testLocations() {
  const S = "Lokasi Wisata";

  // GET all
  const list = await req("GET", "/locations");
  log(S, "GET /locations", list.ok ? "PASS" : "FAIL", `Status ${list.status}, ${Array.isArray(list.data) ? list.data.length + " items" : "unexpected format"}`);

  // POST create
  const newLoc = await req("POST", "/locations", {
    nameId: "TEST Candi Borobudur",
    nameEn: "TEST Borobudur Temple",
    descId: "Candi Buddha terbesar di dunia",
    descEn: "Largest Buddhist temple in the world",
    category: "wisata_sejarah",
    latitude: -7.6079,
    longitude: 110.2038,
    imageUrl: "",
    addressId: "Magelang, Jawa Tengah",
    addressEn: "Magelang, Central Java",
  });
  if (newLoc.ok && newLoc.data?.id) {
    createdIds.location = newLoc.data.id;
    log(S, "POST /locations (create)", "PASS", `ID: ${newLoc.data.id}`);
  } else {
    log(S, "POST /locations (create)", "FAIL", JSON.stringify(newLoc.data));
  }

  // GET by ID
  if (createdIds.location) {
    const detail = await req("GET", `/locations/${createdIds.location}`);
    log(S, "GET /locations/:id", detail.ok ? "PASS" : "FAIL", `nameId: ${detail.data?.nameId}`);
  }

  // PUT update
  if (createdIds.location) {
    const upd = await req("PUT", `/locations/${createdIds.location}`, {
      nameId: "TEST Candi Borobudur (Updated)",
      nameEn: "TEST Borobudur Temple (Updated)",
      descId: "Candi Buddha terbesar di dunia - diperbarui",
      descEn: "Largest Buddhist temple - updated",
      category: "wisata_sejarah",
      latitude: -7.6079,
      longitude: 110.2038,
      imageUrl: "",
      addressId: "Magelang, Jawa Tengah",
      addressEn: "Magelang, Central Java",
    });
    log(S, "PUT /locations/:id (update)", upd.ok ? "PASS" : "FAIL", upd.ok ? `Updated nameId: ${upd.data?.nameId}` : JSON.stringify(upd.data));
  }

  // POST missing required field
  const bad = await req("POST", "/locations", { nameId: "Only name" });
  log(S, "POST /locations (missing fields)", bad.ok ? "WARN" : "PASS", `Status ${bad.status} — should reject incomplete data`);
}

// ═══════════════════════════════════════════════════
// 2. KISAH CERITA (Stories)
// ═══════════════════════════════════════════════════
async function testStories() {
  const S = "Cerita";

  const list = await req("GET", "/stories");
  log(S, "GET /stories", list.ok ? "PASS" : "FAIL", `Status ${list.status}, ${Array.isArray(list.data) ? list.data.length + " items" : "unexpected"}`);

  const newStory = await req("POST", "/stories", {
    id: "story_test_legenda",
    titleId: "TEST Legenda Ratu Kidul",
    titleEn: "TEST Legend of the South Sea Queen",
    contentId: "Dikisahkan di pantai selatan Jawa...",
    contentEn: "A tale from the southern coast of Java...",
    category: "legenda",
    imageUrl: "",
    locationId: createdIds.location || "",
    unlockedByQuestId: "",
  });
  if (newStory.ok && newStory.data?.id) {
    createdIds.story = newStory.data.id;
    log(S, "POST /stories (create)", "PASS", `ID: ${newStory.data.id}`);
  } else {
    log(S, "POST /stories (create)", "FAIL", JSON.stringify(newStory.data));
  }

  if (createdIds.story) {
    const upd = await req("PUT", `/stories/${createdIds.story}`, {
      titleId: "TEST Legenda Ratu Kidul (Updated)",
      titleEn: "TEST Legend Updated",
      contentId: "Konten diperbarui.",
      contentEn: "Updated content.",
      category: "legenda",
      imageUrl: "",
      locationId: createdIds.location || "",
      unlockedByQuestId: "",
    });
    log(S, "PUT /stories/:id (update)", upd.ok ? "PASS" : "FAIL", upd.ok ? "Updated OK" : JSON.stringify(upd.data));
  }
}

// ═══════════════════════════════════════════════════
// 3. UMKM LOKAL
// ═══════════════════════════════════════════════════
async function testUmkm() {
  const S = "UMKM";

  const list = await req("GET", "/umkm");
  log(S, "GET /umkm", list.ok ? "PASS" : "FAIL", `Status ${list.status}, ${Array.isArray(list.data) ? list.data.length + " items" : "unexpected"}`);

  const newUmkm = await req("POST", "/umkm", {
    id: "umkm_test_bakmi",
    name: "TEST Warung Bakmi Jawa",
    descId: "Bakmi legendaris di Yogyakarta",
    descEn: "Legendary Javanese noodle shop",
    category: "kuliner",
    products: ["Bakmi Ayam", "Es Teh", "Keripik Tempe"],
    imageUrl: "",
    rating: 4.8,
    voucherAvailable: true,
    locationId: createdIds.location || "",
  });
  if (newUmkm.ok && newUmkm.data?.id) {
    createdIds.umkm = newUmkm.data.id;
    log(S, "POST /umkm (create)", "PASS", `ID: ${newUmkm.data.id}`);
  } else {
    log(S, "POST /umkm (create)", "FAIL", JSON.stringify(newUmkm.data));
  }

  if (createdIds.umkm) {
    const upd = await req("PUT", `/umkm/${createdIds.umkm}`, {
      name: "TEST Warung Bakmi Updated",
      descId: "Diperbarui",
      descEn: "Updated",
      category: "kuliner",
      products: ["Bakmi Goreng"],
      imageUrl: "",
      rating: 4.9,
      voucherAvailable: false,
      locationId: createdIds.location || "",
    });
    log(S, "PUT /umkm/:id (update)", upd.ok ? "PASS" : "FAIL", upd.ok ? "Updated OK" : JSON.stringify(upd.data));
  }
}

// ═══════════════════════════════════════════════════
// 4. LAGU BGM (Songs)
// ═══════════════════════════════════════════════════
async function testSongs() {
  const S = "Lagu BGM";

  const list = await req("GET", "/songs");
  log(S, "GET /songs", list.ok ? "PASS" : "FAIL", `Status ${list.status}, ${Array.isArray(list.data) ? list.data.length + " items" : "unexpected"}`);

  const newSong = await req("POST", "/songs", {
    name: "TEST Gamelan Nusantara",
    fileUrl: "https://example.com/test_gamelan.mp3",
    isActive: false,
  });
  if (newSong.ok && newSong.data?.id) {
    createdIds.song = newSong.data.id;
    log(S, "POST /songs (create)", "PASS", `ID: ${newSong.data.id}`);
  } else {
    log(S, "POST /songs (create)", "FAIL", JSON.stringify(newSong.data));
  }

  if (createdIds.song) {
    const upd = await req("PUT", `/songs/${createdIds.song}`, {
      name: "TEST Gamelan Updated",
      fileUrl: "https://example.com/test_gamelan_v2.mp3",
      isActive: true,
    });
    log(S, "PUT /songs/:id (update)", upd.ok ? "PASS" : "FAIL", upd.ok ? "Updated OK" : JSON.stringify(upd.data));
  }
}

// ═══════════════════════════════════════════════════
// 5. MISI (Quests) — Most complex
// ═══════════════════════════════════════════════════
async function testQuests() {
  const S = "Misi (Quest)";

  const list = await req("GET", "/quests");
  log(S, "GET /quests", list.ok ? "PASS" : "FAIL", `Status ${list.status}, ${Array.isArray(list.data) ? list.data.length + " items" : "unexpected"}`);

  const newQuest = await req("POST", "/quests", {
    id: "quest_test_eco_mangrove",
    titleId: "TEST Tanam Bakau Pesisir",
    titleEn: "TEST Plant Coastal Mangroves",
    descId: "Bantu melestarikan hutan mangrove pesisir",
    descEn: "Help preserve coastal mangrove forests",
    type: "eco",
    difficulty: "medium",
    requiredLevel: 2,
    availableLevels: [1, 2, 3],
    estimatedTimeId: "45 menit",
    estimatedTimeEn: "45 minutes",
    imageUrl: "",
    locationId: createdIds.location || "",
    relatedUmkmId: createdIds.umkm || null,
    battleId: null,
    objectives: [
      { descId: "Kunjungi area mangrove", descEn: "Visit mangrove area", type: "visit_location", sortOrder: 0 },
      { descId: "Ambil foto mangrove", descEn: "Take a photo of mangrove", type: "take_photo", sortOrder: 1 },
    ],
    reward: {
      xp: 200,
      points: 100,
      badgeId: "badge_eco_warrior",
      voucherId: null,
      collectibleId: null,
      storyUnlockId: createdIds.story || null,
    },
  });
  if (newQuest.ok && newQuest.data?.id) {
    createdIds.quest = newQuest.data.id;
    log(S, "POST /quests (create with objectives + reward)", "PASS", `ID: ${newQuest.data.id}`);
  } else {
    log(S, "POST /quests (create)", "FAIL", JSON.stringify(newQuest.data));
  }

  // GET detail
  if (createdIds.quest) {
    const detail = await req("GET", `/quests/${createdIds.quest}`);
    const objCount = detail.data?.objectives?.length || 0;
    const hasReward = !!detail.data?.reward;
    log(S, "GET /quests/:id (detail)", detail.ok ? "PASS" : "FAIL",
      `objectives: ${objCount}, reward: ${hasReward ? "yes (xp=" + detail.data.reward.xp + ")" : "no"}`);
  }

  // PUT update
  if (createdIds.quest) {
    const upd = await req("PUT", `/quests/${createdIds.quest}`, {
      titleId: "TEST Tanam Bakau (Updated)",
      titleEn: "TEST Plant Mangroves (Updated)",
      descId: "Deskripsi diperbarui",
      descEn: "Description updated",
      type: "eco",
      difficulty: "hard",
      requiredLevel: 3,
      availableLevels: [2, 3, 4, 5],
      estimatedTimeId: "60 menit",
      estimatedTimeEn: "60 minutes",
      imageUrl: "",
      locationId: createdIds.location || "",
      relatedUmkmId: null,
      battleId: null,
      objectives: [
        { descId: "Kunjungi pantai", descEn: "Visit beach", type: "visit_location", sortOrder: 0 },
      ],
      reward: {
        xp: 300,
        points: 150,
        badgeId: null,
        voucherId: null,
        collectibleId: null,
        storyUnlockId: null,
      },
    });
    log(S, "PUT /quests/:id (update)", upd.ok ? "PASS" : "FAIL", upd.ok ? "Updated difficulty=hard, xp=300" : JSON.stringify(upd.data));
  }
}

// ═══════════════════════════════════════════════════
// 6. PENGGUNA (Users) — read-only + role change
// ═══════════════════════════════════════════════════
async function testUsers() {
  const S = "Pengguna";

  const list = await req("GET", "/users");
  log(S, "GET /users", list.ok ? "PASS" : "FAIL", `Status ${list.status}, ${Array.isArray(list.data) ? list.data.length + " items" : "unexpected"}`);

  // Test unauthorized access (no token)
  const noAuth = await fetch(`${BASE}/users`);
  log(S, "GET /users (no token)", noAuth.status === 401 ? "PASS" : "FAIL", `Status ${noAuth.status} — expected 401`);
}

// ═══════════════════════════════════════════════════
// 7. CLEANUP — Delete all test data
// ═══════════════════════════════════════════════════
async function cleanup() {
  const S = "Cleanup";

  if (createdIds.quest) {
    const r = await req("DELETE", `/quests/${createdIds.quest}`);
    log(S, "DELETE quest", r.ok ? "PASS" : "FAIL", r.ok ? "Deleted" : JSON.stringify(r.data));
  }
  if (createdIds.song) {
    const r = await req("DELETE", `/songs/${createdIds.song}`);
    log(S, "DELETE song", r.ok ? "PASS" : "FAIL", r.ok ? "Deleted" : JSON.stringify(r.data));
  }
  if (createdIds.umkm) {
    const r = await req("DELETE", `/umkm/${createdIds.umkm}`);
    log(S, "DELETE umkm", r.ok ? "PASS" : "FAIL", r.ok ? "Deleted" : JSON.stringify(r.data));
  }
  if (createdIds.story) {
    const r = await req("DELETE", `/stories/${createdIds.story}`);
    log(S, "DELETE story", r.ok ? "PASS" : "FAIL", r.ok ? "Deleted" : JSON.stringify(r.data));
  }
  if (createdIds.location) {
    const r = await req("DELETE", `/locations/${createdIds.location}`);
    log(S, "DELETE location", r.ok ? "PASS" : "FAIL", r.ok ? "Deleted" : JSON.stringify(r.data));
  }
}

// ═══════════════════════════════════════════════════
// RUNNER
// ═══════════════════════════════════════════════════
async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   SinopiQuest Admin API Integration Tests   ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  await testLocations();
  console.log("");
  await testStories();
  console.log("");
  await testUmkm();
  console.log("");
  await testSongs();
  console.log("");
  await testQuests();
  console.log("");
  await testUsers();
  console.log("");
  await cleanup();

  // Summary
  console.log("\n══════════════════════════════════════════════");
  console.log("RINGKASAN HASIL:");
  const pass = results.filter(r => r.status === "PASS").length;
  const fail = results.filter(r => r.status === "FAIL").length;
  const warn = results.filter(r => r.status === "WARN").length;
  console.log(`  ✅ PASS: ${pass}`);
  console.log(`  ❌ FAIL: ${fail}`);
  console.log(`  ⚠️  WARN: ${warn}`);
  console.log(`  TOTAL: ${results.length} tests`);
  console.log("══════════════════════════════════════════════");

  if (fail > 0) {
    console.log("\nDETAIL FAILURES:");
    results.filter(r => r.status === "FAIL").forEach(r => {
      console.log(`  ❌ [${r.section}] ${r.test}: ${r.detail}`);
    });
  }
}

main().catch(console.error);
