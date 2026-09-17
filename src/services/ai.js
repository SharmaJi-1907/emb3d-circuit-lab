/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — AI answer matching (D1, D17)
═══════════════════════════════════════════════════════════════════ */

// Keywords for each stored answer in CircuitLabData.aiResponses (D1).
// Whole words; a trailing "s" is ignored, and keywords of 5+ letters also
// match longer words ("blink" → "blinking"). On a tie the earlier topic wins,
// so specific topics come first and the general ones (LED, Arduino) last.
const AI_TOPICS = [
  { answer: 'SPI vs I2C',                                 keys: ['spi', 'mosi', 'miso', 'vs', 'versus', 'difference', 'compare'] },
  { answer: 'How do I wire an I2C sensor to Arduino?',   keys: ['i2c', 'sda', 'scl', 'twi'] },
  { answer: 'PWM frequency',                              keys: ['pwm', 'duty', 'analogwrite'] },
  { answer: 'Explain how an ESP32 works',                 keys: ['esp32', 'wifi', 'bluetooth'] },
  { answer: 'What resistor do I need for an LED at 5V?', keys: ['resistor', 'resistance', 'ohm', 'led'] },
  { answer: 'Generate Arduino blink code',                keys: ['blink', 'led', 'arduino', 'sketch'] },
  { answer: 'How do I connect the RESET pin?',            keys: ['reset', 'rst', 'rstdisbl', 'autoreset'] },
  // `specific: true` topics are about one question, not one part, so they are
  // checked before the part card — otherwise "NE555" and "ESP32" in the question
  // would always return the part's spec card instead (D17). They need 2 keyword
  // hits, so a passing mention ("an LED at 5V") does not trigger them.
  { answer: 'What is the timing equation for NE555 Astable Mode?', specific: true,
    keys: ['astable', 'monostable', 'ne555', '555', 'timing', 'equation', 'formula'] },
  { answer: 'Can ESP32 pins tolerate 5V signals?', specific: true,
    keys: ['tolerate', 'tolerant', '5v', 'levelshifter', 'shifter', 'divider'] },
];

// How many of a topic's keywords appear in the question's words.
function topicHits(topic, words) {
  return topic.keys.filter(k => words.some(w => w === k || (k.length >= 5 && w.startsWith(k)))).length;
}

// The best-scoring topic from `list`, or null when nothing matches.
function bestTopic(list, words, minHits = 1) {
  let best = null;
  let bestHits = minHits - 1;
  for (const topic of list) {
    const hits = topicHits(topic, words);
    if (hits > bestHits) { best = topic; bestHits = hits; }
  }
  return best;
}

export function getAIResponse(query) {
  const q = query.toLowerCase();
  const words = (q.match(/[a-z0-9]+/g) || []).map(w => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w));
  const compact = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

  // A question clearly about one topic comes first, even when it names a part:
  // "the timing equation for NE555 Astable Mode" wants the equation, not the
  // NE555 spec card (D17).
  const specific = bestTopic(AI_TOPICS.filter(t => t.specific), words, 2);
  if (specific) return CircuitLabData.aiResponses[specific.answer];

  // Then a named part: "MPU-6050", "mpu6050" and "mpu 6050" all match
  const comp = CircuitLabData.components.find(c =>
    compact(q).includes(compact(c.name)) || compact(q).includes(compact(c.id))
  );
  if (comp) {
    return `**${comp.name}** by ${comp.manufacturer}

**Key Specs:**
- Package: ${comp.package}
- Voltage: ${comp.voltage}
- Pins: ${comp.pins}
${comp.frequency ? `- Clock: ${comp.frequency}` : ''}
${comp.flash ? `- Flash: ${comp.flash}` : ''}

**Supported Protocols:** ${comp.protocols.join(', ')}

**Description:** ${comp.description}

Would you like to see the pinout, datasheet, or a wiring example?`;
  }

  // Then the stored answer whose keywords appear most often
  const best = bestTopic(AI_TOPICS, words);
  if (best) return CircuitLabData.aiResponses[best.answer];

  return `I can help with that! Here are some related topics:

- **Component selection** for your use case
- **Wiring diagrams** and connection guides
- **Code examples** for popular microcontrollers
- **Troubleshooting** common issues

Could you be more specific about what you're trying to build? For example:
- What microcontroller are you using?
- What sensors or modules are involved?
- What's the expected behavior?`;
}
