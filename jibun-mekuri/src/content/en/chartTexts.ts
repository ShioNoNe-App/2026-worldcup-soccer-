// English text for chartTexts.ts.
import type { BranchRelation, StarGroup, StemRelation, TenGod } from '../../engine/bazi/analysis';

export const STAR_GROUPS_EN: Record<StarGroup, { name: string; stars: string; keyword: string; strong: string }> = {
  self: {
    name: 'Self stars',
    stars: 'Peer / Rob Wealth',
    keyword: 'Own pace',
    strong: 'A strong drive to hold your own views and stand on your own feet shows up.',
  },
  expression: {
    name: 'Expression stars',
    stars: 'Eating God / Hurting Officer',
    keyword: 'Expressiveness',
    strong: 'A strong power to turn feelings into words and forms shows up. Your ideas and taste may delight people.',
  },
  wealth: {
    name: 'Reality stars',
    stars: 'Indirect / Direct Wealth',
    keyword: 'Practical sense',
    strong: 'A strong, practical sense of balance for managing people and things shows up.',
  },
  authority: {
    name: 'Responsibility stars',
    stars: 'Seven Killings / Direct Officer',
    keyword: 'Responsibility',
    strong: 'A strong sense of responsibility to meet expectations and respect rules shows up.',
  },
  learning: {
    name: 'Learning stars',
    stars: 'Indirect / Direct Resource',
    keyword: 'Curiosity',
    strong: 'A strong interest in knowing and thinking shows up. You may want to dig deep until you are convinced.',
  },
};

export const ELEMENTS_EN: { name: string; image: string; many: string; none: string }[] = [
  {
    name: 'Wood',
    image: 'growth',
    many: 'Plenty of "grow and expand" energy. You may feel strongly drawn to new things.',
    none: 'No Wood in your chart. Growing at your own pace, without rushing, may suit you.',
  },
  {
    name: 'Fire',
    image: 'passion',
    many: 'Plenty of "burn and shine" energy. Your feelings show easily, and your fun vibe is charming.',
    none: 'No Fire in your chart. You may warm things quietly rather than showing heat outwardly.',
  },
  {
    name: 'Earth',
    image: 'stability',
    many: 'Plenty of "protect and nurture" energy. You feel steady and tend to support others.',
    none: 'No Earth in your chart. Being light on your feet, not tied to one place, may be very you.',
  },
  {
    name: 'Metal',
    image: 'decision',
    many: 'Plenty of "cut and decide" energy. Clear judgment may be your strength.',
    none: 'No Metal in your chart. You may be better at loose connections than drawing firm lines.',
  },
  {
    name: 'Water',
    image: 'wisdom',
    many: 'Plenty of "flow and think" energy. You may have flexible ideas and think deeply.',
    none: 'No Water in your chart. Moving and feeling first may suit you better than overthinking.',
  },
];

export const YEAR_THEMES_EN: Record<TenGod, { title: string; text: string; hint: string }> = {
  hikenn: {
    title: 'A year to stand on your own',
    text: 'What you want tends to become clear. Picture walking side by side with your peers.',
    hint: 'Keeping your own pace without comparing yourself to others gives you a tailwind.',
  },
  gouzai: {
    title: 'A year of friendly rivals',
    text: 'Rivals and friends can spark you in a good way. Momentum builds — just don’t compete too hard.',
    hint: 'Think "grow together" rather than "win."',
  },
  shokujin: {
    title: 'A year of growing joy',
    text: 'Your eyes turn to things you love and enjoy. The more natural you are, the more good things are born.',
    hint: 'Spend a little extra time on what feels fun.',
  },
  shoukan: {
    title: 'A year your individuality shines',
    text: 'Your senses and ideas sharpen. With more to say, how you say it becomes key.',
    hint: 'Wrap sharp words in soft ones.',
  },
  henzai: {
    title: 'A year of movement and meetings',
    text: 'People and things move actively. New connections and surprise chances may come.',
    hint: 'When invited, try saying yes lightly first.',
  },
  seizai: {
    title: 'A year steady effort pays off',
    text: 'What you’ve built tends to take shape. Good for steadying your life and work.',
    hint: 'Choose one steady habit and it will bear fruit more easily.',
  },
  henkan: {
    title: 'A year of challenge',
    text: 'Tough tasks and changes may come. Each one you overcome makes you stronger.',
    hint: 'Don’t overdo it — decide your rest days in advance.',
  },
  seikan: {
    title: 'A year trust grows',
    text: 'You may be given roles and responsibility. The more you deliver, the more trust you earn.',
    hint: 'If being "too proper" tires you, make time to relax.',
  },
  henin: {
    title: 'A year of inspiration',
    text: 'Intuition and original ideas sharpen. New learning and time alone to think may pay off.',
    hint: 'Note down what catches your interest — it may help later.',
  },
  inju: {
    title: 'A year of learning and recharging',
    text: 'Easy to absorb knowledge and receive support. Good for increasing your input.',
    hint: 'Lean on trusted people and books without holding back.',
  },
};

export const YEAR_BRANCH_NOTES_EN: Partial<Record<BranchRelation, string>> = {
  clash: 'Also, this year’s branch "clashes" with your day branch. Your surroundings and feelings may move a lot — the key is using change positively.',
  sixCombine: 'Also, this year’s branch "combines" with your day branch. It reads as a year when connections with people link up easily.',
  trine: 'Also, this year’s branch belongs to the same "trine" group as your day branch. It reads as a year that’s easy to ride the flow.',
  same: 'Also, this year’s branch is the same as your day branch. It reads as a year your true self comes out strongly.',
};

export const STEM_RELATION_TEXTS_EN: Record<StemRelation, { title: string; text: string; tip: string }> = {
  combine: {
    title: 'Drawn to each other (stem combination)',
    text: 'Your day stems form a "combination" — a pair that attracts. In fortune-telling, it’s read as a relationship where you naturally notice each other and feel calm together.',
    tip: 'Because getting close is easy, check now and then that you’re not adapting too much.',
  },
  same: {
    title: 'Two of a kind (same element)',
    text: 'Your day stems share the same element. It’s read as a relationship with similar values and pace, where you understand each other easily.',
    tip: 'Because you’re similar, when you clash, start from "we’re both right."',
  },
  iGenerate: {
    title: 'You give (generating cycle)',
    text: 'Your day stem "generates" theirs. It’s read as a relationship where you cheer on and support them.',
    tip: 'Since giving comes easily, also take care that you don’t wear yourself out.',
  },
  theyGenerate: {
    title: 'You’re supported (generating cycle)',
    text: 'Their day stem "generates" yours. It’s read as a relationship where you receive support and a sense of security.',
    tip: 'Return what you receive with a spoken "thank you" and you may grow closer.',
  },
  iControl: {
    title: 'You spark each other (controlling cycle)',
    text: 'Your day stem "controls" theirs. It’s read as a relationship where you tend to take the lead and bring stimulation to them.',
    tip: 'When you lead, asking about their pace makes it comfortable for both.',
  },
  theyControl: {
    title: 'You train each other (controlling cycle)',
    text: 'Their day stem "controls" yours. It’s read as a relationship that brings you stimulation and some tension, leading to growth.',
    tip: '"I feel a bit nervous around them" may mean you care. No need to force yourself to fit in.',
  },
};

export const BRANCH_RELATION_TEXTS_EN: Record<BranchRelation, string> = {
  sixCombine: 'Your day branches "combine." It reads as a pair whose daily rhythms and comfort zones fit well.',
  clash: 'Your day branches "clash." You have opposite sides — exciting, but you may bump heads. The key is enjoying the differences.',
  trine: 'Your day branches are in the same "trine" group. It reads as a pair that easily faces the same direction and cooperates.',
  same: 'Your day branches are the same. You have a lot in common and understand each other easily — but you may stumble in the same places.',
  neutral: 'Your day branches have no especially strong bond or clash. Your relationship is the kind that grows through everyday moments.',
};
