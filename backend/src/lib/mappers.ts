export function mapLocation(loc: any) {
  if (!loc) return null;
  return {
    ...loc,
    name: { id: loc.nameId, en: loc.nameEn },
    description: { id: loc.descId, en: loc.descEn },
    address: loc.addressId ? { id: loc.addressId, en: loc.addressEn } : null,
    questIds: loc.quests?.map((q: any) => q.id) || [],
    umkmIds: loc.umkms?.map((u: any) => u.id) || []
  };
}

export function mapBattle(b: any) {
  if (!b) return null;
  return {
    ...b,
    title: { id: b.titleId, en: b.titleEn },
    questions: b.questions?.map((q: any) => ({
      ...q,
      question: { id: q.questionId, en: q.questionEn },
      options: q.optionsId ? { id: q.optionsId, en: q.optionsEn } : { id: [], en: [] },
      answer: { id: q.answerId, en: q.answerEn }
    }))
  };
}

export function mapQuest(q: any) {
  if (!q) return null;
  const estVal = q.estimatedTimeId ? { id: q.estimatedTimeId, en: q.estimatedTimeEn } : null;
  return {
    ...q,
    title: { id: q.titleId, en: q.titleEn },
    description: { id: q.descId, en: q.descEn },
    estimatedTime: estVal,
    estimatedDuration: estVal,
    location: mapLocation(q.location),
    objectives: q.objectives?.map((obj: any) => ({
      ...obj,
      description: { id: obj.descId, en: obj.descEn }
    })),
    battle: mapBattle(q.battle)
  };
}

export function mapStory(s: any) {
  if (!s) return null;
  return {
    ...s,
    title: { id: s.titleId, en: s.titleEn },
    content: { id: s.contentId, en: s.contentEn }
  };
}

export function mapUmkm(u: any) {
  if (!u) return null;
  return {
    ...u,
    description: { id: u.descId, en: u.descEn }
  };
}
