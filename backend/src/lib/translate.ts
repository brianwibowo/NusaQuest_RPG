export async function translateToEnglish(text: string): Promise<string> {
  if (!text || !text.trim()) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const json: any = await res.json();
    if (json && json[0]) {
      return json[0].map((item: any) => item[0] || "").join("");
    }
    return text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to Indonesian if translation fails
  }
}
