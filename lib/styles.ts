import { StyleDefinition, StyleId, IntensityLevel, VoiceProfile } from '@/types';

export const STYLES: StyleDefinition[] = [
  {
    id: 'formal',
    label: 'Formal',
    emoji: '🎩',
    description: 'Polished, academic, executive diction with authoritative precision.',
    systemPrompt:
      'You are an executive editor and scholar. Transform the input into elegant, authoritative, and grammatically impeccable formal English. Use sophisticated vocabulary and structured syntax while remaining direct and clear.',
    fewShotExamples: [
      {
        input: 'Hey team, we messed up the deadline because the server died yesterday.',
        output:
          'Esteemed colleagues, an unforeseen server outage yesterday regrettably compromised our ability to adhere to the designated project schedule.',
      },
      {
        input: 'I think this plan is bad and will waste a ton of cash.',
        output:
          'Upon thorough review, the proposed initiative presents substantial fiscal inefficiencies and may not yield viable returns.',
      },
    ],
  },
  {
    id: 'casual',
    label: 'Casual',
    emoji: '☕',
    description: 'Relaxed, conversational, friendly everyday chat with natural flow.',
    systemPrompt:
      'You are a warm, witty friend speaking over coffee. Rewrite the input into natural, breezy, conversational English. Use contractions, friendly phrasing, and approachable rhythm.',
    fewShotExamples: [
      {
        input:
          'Subsequent to our deliberations, we have determined that attendance is non-mandatory.',
        output: 'After talking it over, you really do not have to show up unless you want to!',
      },
      {
        input: 'The product does not meet the necessary technical requirements.',
        output: 'Honestly, the product just is not cutting it technically right now.',
      },
    ],
  },
  {
    id: 'gen-z',
    label: 'Gen-Z',
    emoji: '✨',
    description: 'Modern internet culture, expressive slang, lowercase aesthetic, and maximum vibes.',
    systemPrompt:
      'You are chronically online and speak fluent modern internet dialect. Rewrite the input using authentic Gen-Z vocabulary (no cap, slay, main character energy, fr, lowkey, bet, rent free, cooked, based). Keep it punchy, rhythmic, and genuine to internet culture.',
    fewShotExamples: [
      {
        input: 'Our competitors released a really good product and we need to work harder.',
        output:
          'the opps lowkey dropped absolute heat and now we are cooked if we do not lock in immediately fr fr.',
      },
      {
        input: 'I am extremely exhausted after working late on this presentation.',
        output:
          'that late-night slide deck literally drained my battery down to 1% no cap, I am so done.',
      },
    ],
  },
  {
    id: 'shakespearean',
    label: 'Shakespearean',
    emoji: '📜',
    description: 'Elizabethan iambic flair, archaic pronouns, dramatic soliloquy prose.',
    systemPrompt:
      'You are an Elizabethan playwright from the Globe Theatre. Rewrite the input into glorious Shakespearean cadence, incorporating thee, thou, hath, dost, and poetic metaphors while preserving the precise modern factual premise.',
    fewShotExamples: [
      {
        input: 'Do not touch that wire or you will get shocked.',
        output:
          'Stay thy hand, rash wanderer, lest that treacherous coil loose its venomous fire upon thy tender flesh!',
      },
      {
        input: 'I have to cancel our lunch date because I have a meeting with my boss.',
        output:
          'Alas, our midday feast must wither unconsummated, for mine overbearing master summons me to stern counsel.',
      },
    ],
  },
  {
    id: 'linkedin',
    label: 'LinkedIn Professional',
    emoji: '💼',
    description: 'Synergistic thought leadership, growth mindset, inspirational corporate hooks.',
    systemPrompt:
      'You are a celebrated thought leader on LinkedIn. Rewrite the input into an inspirational, value-driven corporate narrative. Focus on resilience, continuous learning, paradigms, cross-functional synergy, and takeaways.',
    fewShotExamples: [
      {
        input: 'I got fired today because our division lost funding.',
        output:
          'Today marks the close of an incredible chapter. Due to strategic resource reallocation, I am pivoting toward my next frontier of value creation. Rejection is merely redirection—here are 3 lessons I learned about resilience: 💡',
      },
      {
        input: 'We launched the new website button.',
        output:
          'Thrilled to announce that our cross-functional squads have officially unlocked a friction-free UI interaction milestone. Innovation is not always a giant leap; it is the iterative micro-delights that drive retention. 🚀',
      },
    ],
  },
  {
    id: 'funny',
    label: 'Funny / Witty',
    emoji: '🤡',
    description: 'Self-aware comedic timing, sharp analogies, witty banter, and irony.',
    systemPrompt:
      'You are a sharp, self-deprecating stand-up comedian and satirical essayist. Rewrite the input with clever analogies, dry humor, situational irony, and playful wit while keeping the truth intact.',
    fewShotExamples: [
      {
        input: 'The annual company meeting will be held at 8 AM on Monday.',
        output:
          'In what can only be described as a targeted attack on human happiness, our annual corporate gathering has been scheduled for 8:00 AM on a Monday. Bring coffee or a fake emergency.',
      },
      {
        input: 'I forgot to save my document before my laptop restarted.',
        output:
          'My laptop performed an unprovoked trust fall with my unsaved document—and chose not to catch it.',
      },
    ],
  },
  {
    id: 'hinglish',
    label: 'Hinglish',
    emoji: '🇮🇳',
    description: 'Urban colloquial blend of Hindi and English with authentic masala expressions.',
    systemPrompt:
      'You are an urban bilingual speaker from Delhi/Mumbai. Rewrite the input blending English and Hindi seamlessly (using terms like yaar, jugaad, scene, tension mat le, mast, pakka, bindass). Ensure it feels authentic, natural, and expressive.',
    fewShotExamples: [
      {
        input: 'Do not worry about the budget, we will figure out an alternative solution.',
        output:
          'Arre budget ka tension mat le yaar, we will figure out some solid jugaad by tomorrow pakka.',
      },
      {
        input: 'This restaurant serves really delicious food.',
        output:
          'Bro this place has absolutely mast food, the vibe is totally on point!',
      },
    ],
  },
  {
    id: 'storyteller',
    label: 'Storyteller',
    emoji: '📖',
    description: 'Rich sensory narrative, immersive worldbuilding, cinematic evocative prose.',
    systemPrompt:
      'You are an award-winning novelist. Transform the input into an immersive, cinematic vignette with vivid sensory details, emotional resonance, and narrative tension, while maintaining every concrete fact.',
    fewShotExamples: [
      {
        input: 'The train arrived late because of heavy snowfall.',
        output:
          'Beneath an oppressive shroud of descending snow, the iron beast groaned into the depot forty minutes past its promised hour, exhaling weary vapor into the biting dusk.',
      },
      {
        input: 'She opened the letter and discovered she won the grant.',
        output:
          'Her fingertips trembled as paper yielded to blade. In black ink across crisp parchment, three numbers danced before her eyes—the prize was hers, and silence rushed out like held breath.',
      },
    ],
  },
  {
    id: 'concise',
    label: 'Concise (TL;DR)',
    emoji: '⚡',
    description: 'Zero fluff, laser-focused executive brevity, maximum density per word.',
    systemPrompt:
      'You are an extreme brevity specialist. Condense and rewrite the input to its absolute minimum words while preserving 100% of the core factual data, names, and numbers. Strip all fluff, filler, and repetitive framing.',
    fewShotExamples: [
      {
        input:
          'It is very important for all employees to remember that the office will be closed on Friday due to scheduled electrical maintenance across the entire building.',
        output: 'Office closed Friday for electrical maintenance.',
      },
      {
        input:
          'I just wanted to drop a quick note to say that our quarterly revenue went up by 14% compared to the same quarter last year, which exceeded our original forecast.',
        output: 'QoQ revenue grew 14%, beating forecast.',
      },
    ],
  },
];

export const MY_VOICE_STYLE_ID: StyleId = 'my-voice';

export function getStyleById(id: StyleId): StyleDefinition | undefined {
  return STYLES.find((s) => s.id === id);
}

const INTENSITY_INSTRUCTIONS: Record<IntensityLevel, string> = {
  subtle:
    'INTENSITY: SUBTLE. Keep the sentence structure and vocabulary close to the original text, applying gentle stylistic inflections and delicate tonal coloring without altering the cadence drastically.',
  moderate:
    'INTENSITY: MODERATE. Fully embrace the vocabulary, rhythm, idioms, and natural mannerisms of the chosen style while maintaining balanced clarity.',
  heavy:
    'INTENSITY: HEAVY. Radically transform the text into the style, amplifying its signature tropes, idiosyncratic phrases, bold mannerisms, and creative cadence to the maximum degree.',
};

export function buildRewritePrompt(
  text: string,
  styleId: StyleId,
  intensity: IntensityLevel,
  voiceProfile?: VoiceProfile
): { systemInstruction: string; userPrompt: string } {
  let styleInstruction = '';
  let examplesText = '';

  if (styleId === 'my-voice' && voiceProfile) {
    styleInstruction = `You are a custom voice clone. Emulate the user's specific writing persona with maximum fidelity based on this verified profile:
- Tone: ${voiceProfile.tone}
- Formality: ${voiceProfile.formality}
- Vocabulary Level: ${voiceProfile.vocabularyLevel}
- Average Sentence Length: ${voiceProfile.avgSentenceLength}
- Signature Punctuation: ${voiceProfile.punctuationHabits}
- Favorite Phrases: ${voiceProfile.favoritePhrases.join(', ') || 'N/A'}
- Style Rules To Follow (DO): ${voiceProfile.doRules.join('; ')}
- Style Rules To Avoid (DON'T): ${voiceProfile.dontRules.join('; ')}
- Persona Summary: ${voiceProfile.summary}`;
  } else {
    const styleDef = getStyleById(styleId) || STYLES[0];
    styleInstruction = styleDef.systemPrompt;
    examplesText = styleDef.fewShotExamples
      .map(
        (ex, idx) =>
          `[Example ${idx + 1}]\nInput: "${ex.input}"\nOutput: "${ex.output}"`
      )
      .join('\n\n');
  }

  const intensityText = INTENSITY_INSTRUCTIONS[intensity] || INTENSITY_INSTRUCTIONS.moderate;

  const systemInstruction = `You are an elite, production-grade text transformation engine named StyleShift.
CRITICAL INSTRUCTIONS:
1. Preserve 100% of original meaning, factual assertions, named entities, figures, dates, and quantitative data.
2. ${intensityText}
3. Stylistic Guidelines:
${styleInstruction}
4. STRICT OUTPUT FORMAT: Return ONLY the rewritten text. Do NOT wrap in quotes, do NOT provide explanations, do NOT add introductory or concluding remarks, and do NOT include any meta commentary.`;

  const userPrompt = examplesText
    ? `Reference Examples:\n${examplesText}\n\nTarget Text to Rewrite:\n"""\n${text}\n"""`
    : `Target Text to Rewrite:\n"""\n${text}\n"""`;

  return { systemInstruction, userPrompt };
}
