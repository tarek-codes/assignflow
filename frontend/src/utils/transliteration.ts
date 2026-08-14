/**
 * High-Accuracy Bengali Name Transliteration & LLM Translator Utility
 * Combines an extensive dictionary of Bengali names/titles, a syllabic Avro-style parser,
 * and optional Groq LLM API integration.
 */

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";

// Extensive Bengali Name & Title Dictionary
const NAME_DICTIONARY: Record<string, string> = {
  // First & Middle Names
  "samiul": "সামিউল",
  "sami": "সামি",
  "samir": "সমীর",
  "hasan": "হাসান",
  "hassan": "হাসান",
  "hossain": "হোসেন",
  "hossen": "হোসেন",
  "husein": "হোসেন",
  "tarek": "তারেক",
  "tareq": "তারেক",
  "tanvir": "তানভীর",
  "tanbeer": "তানভীর",
  "ahmed": "আহমেদ",
  "ahmad": "আহমেদ",
  "mahmud": "মাহমুদ",
  "mahmood": "মাহমুদ",
  "rahman": "রহমান",
  "rehman": "রহমান",
  "sadia": "সাদিয়া",
  "islam": "ইসলাম",
  "nusrat": "নুসরাত",
  "jahan": "জাহান",
  "ariful": "আরিফুল",
  "haque": "হক",
  "hoque": "হক",
  "hakim": "হাকিম",
  "fariha": "ফারিহা",
  "tabassum": "তাবাসসুম",
  "rafiqul": "রফিকুল",
  "rafiq": "রফিক",
  "chowdhury": "চৌধুরী",
  "choudhury": "চৌধুরী",
  "sarah": "সারাহ",
  "jenkins": "জেনকিন্স",
  "john": "জন",
  "doe": "ডো",
  "md": "মো:",
  "md.": "মো:",
  "mohammad": "মোহাম্মদ",
  "muhammad": "মুহাম্মদ",
  "mohammed": "মোহাম্মদ",
  "mostafa": "মোস্তফা",
  "mustafa": "মুস্তফা",
  "kazi": "কাজী",
  "khan": "খান",
  "ali": "আলী",
  "mia": "মিয়া",
  "miah": "মিয়া",
  "siddique": "সিদ্দিকী",
  "siddiqui": "সিদ্দিকী",
  "roy": "রায়",
  "das": "দাস",
  "sharma": "শর্মা",
  "gupta": "গুপ্ত",
  "sheikh": "শেখ",
  "begum": "বেগম",
  "akter": "আক্তার",
  "akther": "আক্তার",
  "sultana": "সুলতানা",
  "khatun": "খাতুন",
  "ferdaus": "ফেরদৌস",
  "ferdous": "ফেরদৌস",
  "alam": "আলম",
  "karim": "করিম",
  "kabir": "কবীর",
  "uddin": "উদ্দীন",
  "zaman": "জামান",
  "ahsan": "আহসান",
  "sharif": "শরীফ",
  "sohel": "সোহেল",
  "shakil": "শাকিল",
  "saiful": "সাইফুল",
  "nazmul": "নাজমুল",
  "kamrul": "কামরুল",
  "ashraful": "আশরাফুল",
  "khaled": "খালেদ",
  "shahid": "শহীদ",
  "zahed": "জাহেদ",
  "nabil": "নাবিল",
  "sakib": "সাকিব",
  "shakib": "সাকিব",
  "tamim": "তামিম",
  "mushfiq": "মুশফিক",
  "mahfuz": "মাহফুজ",
  "farhan": "ফারহান",
  "noman": "নোমান",
  "imran": "ইমরান",
  "adnan": "আদনান",
  "arman": "আরমান",
  "faisal": "ফয়সাল",
  "foysal": "ফয়সাল",
  "rubel": "রুবেল",
  "sumon": "সুমন",
  "sohag": "সোহাগ",
  "ripon": "রিপন",
  "rasel": "রাসেল",
  "tania": "তানিয়া",
  "sumaiya": "সুমাইয়া",
  "mim": "মিম",
  "nila": "নীলা",
  "rina": "রিনা",
  "shanta": "শান্তা",
  "tasnim": "তাসনিম",
  "mou": "মৌ",
  "toma": "তমা",
  "keya": "কেয়া",
  "sharmin": "শারমিন",
  "shirin": "শিরিন",
  "admin": "অ্যাডমিন",
  "system": "সিস্টেম",
  "teacher": "শিক্ষক",
  "student": "শিক্ষার্থী",
  "dr.": "ডঃ",
  "mr.": "জনাব",
  "mrs.": "বেগম",
  "ms.": "মিস",
};

/**
 * Syllabic Parser converting English name tokens to proper Bengali Kar vowel structures
 * (e.g., "Samiul" -> S (স) + a (া) + m (ম) + i (ি) + u (ু) + l (ল) = "সামিউল")
 */
function parseSyllabicBangla(word: string): string {
  const w = word.toLowerCase().trim();
  if (!w) return "";

  const consonants: Record<string, string> = {
    th: "থ", ph: "ফ", sh: "শ", ch: "চ", kh: "খ", gh: "ঘ", bh: "ভ", dh: "ধ",
    b: "ব", c: "ক", d: "দ", f: "ফ", g: "গ", h: "হ", j: "জ", k: "ক",
    l: "ল", m: "ম", n: "ন", p: "প", q: "ক", r: "র", s: "স", t: "ত",
    v: "ভ", w: "ও", x: "ক্স", y: "য়", z: "জ"
  };

  const initialVowels: Record<string, string> = {
    aa: "আ", a: "আ", i: "ই", ee: "ঈ", u: "উ", oo: "ঊ", e: "এ", oi: "ঐ", o: "ও", ou: "ঔ"
  };

  const vowelKars: Record<string, string> = {
    aa: "া", a: "া", i: "ি", ee: "ী", u: "ু", oo: "ূ", e: "ে", oi: "ৈ", o: "ো", ou: "ৌ"
  };

  let res = "";
  let i = 0;
  let lastWasConsonant = false;

  while (i < w.length) {
    // Check 2-letter consonant pair
    if (i < w.length - 1) {
      const pair = w.substring(i, i + 2);
      if (consonants[pair]) {
        res += consonants[pair];
        lastWasConsonant = true;
        i += 2;
        continue;
      }
    }

    const char = w[i];

    // Check single consonant
    if (consonants[char]) {
      res += consonants[char];
      lastWasConsonant = true;
      i++;
      continue;
    }

    // Check 2-letter vowel pair
    if (i < w.length - 1) {
      const vPair = w.substring(i, i + 2);
      if (lastWasConsonant && vowelKars[vPair]) {
        res += vowelKars[vPair];
        lastWasConsonant = false;
        i += 2;
        continue;
      } else if (!lastWasConsonant && initialVowels[vPair]) {
        res += initialVowels[vPair];
        lastWasConsonant = false;
        i += 2;
        continue;
      }
    }

    // Check single vowel
    if (lastWasConsonant && vowelKars[char]) {
      // Avoid extra 'a' kar if preceded by certain patterns
      if (char === 'a' && i === w.length - 1) {
        // Trailing 'a' in names like "Hasan"
        lastWasConsonant = false;
        i++;
        continue;
      }
      res += vowelKars[char];
      lastWasConsonant = false;
      i++;
      continue;
    } else if (!lastWasConsonant && initialVowels[char]) {
      res += initialVowels[char];
      lastWasConsonant = false;
      i++;
      continue;
    }

    res += char;
    lastWasConsonant = false;
    i++;
  }

  return res;
}

/**
 * Translates full user names accurately into Bengali script
 */
export function translateUserName(name?: string, lang: "en" | "bn" = "en"): string {
  if (!name || lang === "en") return name || "";

  const tokens = name.trim().split(/\s+/);
  const translatedTokens = tokens.map((token) => {
    const cleanToken = token.toLowerCase().replace(/[^a-z0-9.]/g, "");
    if (NAME_DICTIONARY[cleanToken]) {
      return NAME_DICTIONARY[cleanToken];
    }
    const noDot = cleanToken.replace(/\./g, "");
    if (NAME_DICTIONARY[noDot]) {
      return NAME_DICTIONARY[noDot];
    }
    return parseSyllabicBangla(token);
  });

  return translatedTokens.join(" ");
}

/**
 * Translates general detail texts
 */
export function translateDetailText(text?: string, lang: "en" | "bn" = "en"): string {
  if (!text || lang === "en") return text || "";
  const key = text.trim().toLowerCase();
  return NAME_DICTIONARY[key] || translateUserName(text, lang);
}

/**
 * Optional Groq LLM API caller for dynamic high-accuracy Bengali transliteration of complex names
 */
export async function fetchGroqNameTranslation(englishName: string): Promise<string> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a specialized English-to-Bengali name transliteration system. Return ONLY the Bengali transliteration of the provided English name in proper Bengali script. Do not output quote marks, explanations, or any extra text.",
          },
          {
            role: "user",
            content: englishName,
          },
        ],
        temperature: 0.1,
        max_tokens: 30,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const translated = data?.choices?.[0]?.message?.content?.trim();
      if (translated) return translated;
    }
  } catch (err) {
    console.warn("Groq API transliteration fallback:", err);
  }
  return translateUserName(englishName, "bn");
}
