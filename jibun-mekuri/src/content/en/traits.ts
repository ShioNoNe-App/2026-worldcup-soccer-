// English text for TRAITS (keyed by trait id).
import type { PoleText, TraitId } from '../../engine/diagnosis/types';

export interface TraitText {
  label: string;
  pos: PoleText;
  neg: PoleText;
  mid: { keyword: string; summary: string };
}

export const TRAITS_EN: Record<TraitId, TraitText> = {
  love_pace: {
    label: 'How fast you fall',
    pos: {
      keyword: 'Falls at first sight',
      summary: 'Once you think "they’re nice," your heart moves all at once.',
      strength: 'You follow your sparks honestly and rarely miss the start of a romance',
      caution: 'You may build up expectations before you really know the person',
      tip: 'When your feelings rise, start by learning three things they love',
    },
    neg: {
      keyword: 'Love that grows slowly',
      summary: 'You fall little by little after getting to know someone.',
      strength: 'Once you fall, your feelings last and the relationship stays steady',
      caution: 'Being too careful may make you miss the timing',
      tip: 'Even at the "not sure yet" stage, it’s fine to see them more often',
    },
    mid: { keyword: 'Depends on the person', summary: 'Your pace in love changes with the person and the situation.' },
  },
  love_express: {
    label: 'How you show feelings',
    pos: {
      keyword: 'Says it straight',
      summary: 'You show your feelings openly in words and actions.',
      strength: 'Your feelings come across clearly, which reassures your partner',
      caution: 'You may move ahead faster than the other person’s pace',
      tip: 'After you tell them, enjoy the pause while you wait for their answer',
    },
    neg: {
      keyword: 'Hopes they’ll notice',
      summary: 'Your feelings may be big inside, but you show them modestly.',
      strength: 'You create a natural distance that puts no pressure on the other person',
      caution: 'Your feelings may not get through, and they may think you are not interested',
      tip: 'If words are hard, try saying "thank you" one more time than usual',
    },
    mid: { keyword: 'Shows it subtly', summary: 'You show your feelings through attitude and actions more than words.' },
  },
  love_reassure: {
    label: 'Feeling secure in love',
    pos: {
      keyword: 'Wants to check in',
      summary: 'Confirming how the other person feels helps you relax.',
      strength: 'You have a sensitive antenna for small changes in a relationship',
      caution: 'You may worry about replies and let anxiety grow on your own',
      tip: 'When you feel anxious, write down "what I actually know" and "what I’m imagining" separately',
    },
    neg: {
      keyword: 'Secure at own pace',
      summary: 'You stay at your own pace without being swayed by their reactions.',
      strength: 'You keep your own life even in love, so things rarely feel heavy',
      caution: 'To the other person, you may look a bit cool or distant',
      tip: 'Sometimes saying "I had fun" in words helps them feel secure too',
    },
    mid: { keyword: 'Calm enough', summary: 'Things may bother you a little, but you can settle yourself down.' },
  },
  love_distance: {
    label: 'Closeness as a couple',
    pos: {
      keyword: 'Always together',
      summary: 'You want to share as much time as possible with the person you love.',
      strength: 'You build a deep bond from the time you spend together',
      caution: 'When you can’t meet for a while, loneliness can grow big',
      tip: 'On days apart, find ways to share something — like watching the same thing',
    },
    neg: {
      keyword: 'Needs alone time too',
      summary: 'Even in love, you want to protect your own time and world.',
      strength: 'You can build an independent, breezy relationship',
      caution: 'Some partners may feel you are keeping your distance',
      tip: 'Tell them early — with the reason — that you need some time to yourself',
    },
    mid: { keyword: 'Balance of both', summary: 'You value both days together and days of your own.' },
  },
  love_lead: {
    label: 'Who steers in love',
    pos: {
      keyword: 'Likes to lead',
      summary: 'You want to plan the dates and decide where the relationship goes.',
      strength: 'You have the drive to move the relationship forward',
      caution: 'You may decide before asking what they want',
      tip: 'Offer two options and ask "which one?" — you lead, and they enjoy it too',
    },
    neg: {
      keyword: 'Happy to follow',
      summary: 'You feel more comfortable adapting or being led.',
      strength: 'You are flexible enough to welcome the other person’s preferences',
      caution: 'You may adapt so much that you can’t voice your own wishes',
      tip: 'Practice saying "I’d like ___" about small things',
    },
    mid: { keyword: 'Decide together', summary: 'Rather than one person deciding, you like to talk it through.' },
  },
  marriage_view: {
    label: 'Shape of the future',
    pos: {
      keyword: 'Values a secure home life',
      summary: 'In the future, you want to treasure a calm, secure daily life.',
      strength: 'You can build a solid partnership and shape a life together',
      caution: 'When "doing it right" gets strong, romance can slip down the list',
      tip: 'Start future talks lightly — like "what kind of weekends do you want?"',
    },
    neg: {
      keyword: 'Values a free style',
      summary: 'You care more about freedom and sparks than a set form.',
      strength: 'You are free from fixed ideas and can build a relationship that fits you both',
      caution: 'Putting off big talks may make your partner anxious',
      tip: 'Putting "I don’t want to be tied down" into specific words makes it easier to share',
    },
    mid: { keyword: 'Both matter', summary: 'Stability and sparks matter to you equally.' },
  },
  work_pace: {
    label: 'Speed of getting started',
    pos: {
      keyword: 'Acts first',
      summary: 'You move your hands before thinking and figure it out as you go.',
      strength: 'You move fast and improve by trying things small',
      caution: 'Skipping enough review can lead to rework later',
      tip: 'Before important decisions only, make a three-item checklist first',
    },
    neg: {
      keyword: 'Plans carefully',
      summary: 'You start after thinking through the big picture and the steps.',
      strength: 'You move with a clear outlook, so mistakes and rework are rare',
      caution: 'Too much preparation can delay the start',
      tip: 'Decide to "share it once it’s 60% clear" to balance care and speed',
    },
    mid: { keyword: 'Switches by situation', summary: 'You switch between acting fast and thinking first depending on the situation.' },
  },
  work_structure: {
    label: 'Where you thrive',
    pos: {
      keyword: 'Thrives with structure',
      summary: 'The clearer the method and goals, the better you perform.',
      strength: 'You understand rules and expectations and deliver reliably',
      caution: 'Work with fuzzy goals can bring anxiety and hesitation',
      tip: 'When instructions are vague, confirm "what done looks like" first',
    },
    neg: {
      keyword: 'Thrives with freedom',
      summary: 'You grow when trusted to choose your own way of working.',
      strength: 'You can get creative and invent new ways of doing things',
      caution: 'Being micromanaged can drain your motivation',
      tip: 'In exchange for freedom, agree on when you’ll share progress — trust will grow',
    },
    mid: { keyword: 'Some freedom', summary: 'You like a set framework with freedom in how you get there.' },
  },
  work_collab: {
    label: 'Distance from the team',
    pos: {
      keyword: 'Shines in a team',
      summary: 'Working with others fills you with energy.',
      strength: 'You get people involved and reach results no one could alone',
      caution: 'Long stretches of solo work can slow you down',
      tip: 'On solo days, a five-minute chat with someone in the morning gets you going',
    },
    neg: {
      keyword: 'Focuses solo',
      summary: 'You do your best work when quietly working alone.',
      strength: 'Deep focus lets you produce high-quality work',
      caution: 'You may ask for help late and carry too much alone',
      tip: 'Set a rule: "if I’m stuck for 30 minutes, I ask someone"',
    },
    mid: { keyword: 'Small team works best', summary: 'You feel best working in a small group you know well.' },
  },
  work_drive: {
    label: 'What motivates you',
    pos: {
      keyword: 'Fired up by challenges',
      summary: 'New challenges and visible results raise your motivation.',
      strength: 'You take on high goals without flinching',
      caution: 'Without stimulation, you may get bored',
      tip: 'Set "small personal records" in daily work to keep the challenge alive',
    },
    neg: {
      keyword: 'Fired up by building up',
      summary: 'You find meaning when steady effort takes shape.',
      strength: 'Your persistence earns deep trust over the long run',
      caution: 'Environments with big changes may stress you',
      tip: 'Start new things by "adding just one thing to the usual way"',
    },
    mid: { keyword: 'Fired up by helping', summary: 'You get motivated when you feel you’ve helped someone.' },
  },
  rel_role: {
    label: 'Your role in a group',
    pos: {
      keyword: 'The organizer',
      summary: 'You tend to set direction and plan things.',
      strength: 'When everyone is unsure, you can move the group forward',
      caution: 'While leading, you may take on too much alone',
      tip: 'Sometimes try saying "I’ll leave it to you this time!"',
    },
    neg: {
      keyword: 'The listener',
      summary: 'You tend to listen and quietly support others.',
      strength: 'You are deeply trusted as someone people can be honest with',
      caution: 'You rarely talk about yourself and may bottle things up',
      tip: 'Choose one person who listens to you — it helps keep your balance',
    },
    mid: { keyword: 'The mood maker', summary: 'You can change roles to match the mood of the room.' },
  },
  rel_circle: {
    label: 'How wide your circle is',
    pos: {
      keyword: 'Wide and fun',
      summary: 'You enjoy getting along with lots of different people.',
      strength: 'You can be a hub that connects people',
      caution: 'With a wide circle, time with each person may get thin',
      tip: 'Once a month, make a day to have a long talk with one person',
    },
    neg: {
      keyword: 'Few but deep',
      summary: 'You feel comfortable with a few close relationships.',
      strength: 'Once connected, you can trust each other for a long time',
      caution: 'Joining new circles takes a lot of energy',
      tip: 'Going to new places with someone you know makes it much easier',
    },
    mid: { keyword: 'Wide and deep', summary: 'You have both wide and deep relationships.' },
  },
  rel_conflict: {
    label: 'How you resolve friction',
    pos: {
      keyword: 'Talks it out now',
      summary: 'When something bothers you, you want to talk it through right away.',
      strength: 'You can solve problems before they grow',
      caution: 'If the other person isn’t ready, they may feel blamed',
      tip: 'Ask "do you have a minute to talk?" first — it helps them receive it',
    },
    neg: {
      keyword: 'Takes time first',
      summary: 'You want to calm down before you talk.',
      strength: 'You can talk calmly without getting emotional',
      caution: 'While waiting, you may end up never saying it',
      tip: 'Just say "I’d like to talk later" first, so they can wait for you',
    },
    mid: { keyword: 'Depends on who', summary: 'You change how you say things depending on the person and topic.' },
  },
  self_energy: {
    label: 'How you recharge',
    pos: {
      keyword: 'Recharges with people',
      summary: 'Talking with people and going out gives you energy.',
      strength: 'You draw energy and ideas from your connections',
      caution: 'You may pack your schedule and suddenly feel exhausted',
      tip: 'After a fun plan, leave the next day empty',
    },
    neg: {
      keyword: 'Recharges alone',
      summary: 'Your energy fills up during time alone.',
      strength: 'You can face your inner self and think deeply',
      caution: 'A run of social plans can drain you more than expected',
      tip: 'After seeing people, "book" some alone time for yourself',
    },
    mid: { keyword: 'Depends on the day', summary: 'You choose between people and alone time depending on your mood.' },
  },
  self_decide: {
    label: 'What decides for you',
    pos: {
      keyword: 'Decides by excitement',
      summary: 'In the end, you decide by how your heart moves.',
      strength: 'You are honest with your feelings and throw yourself into your choices',
      caution: 'When your mood shifts, doubts about your decision may appear',
      tip: 'When you decide, jot down why it excited you — it helps when you waver',
    },
    neg: {
      keyword: 'Decides by reasons',
      summary: 'You want to be convinced by reasons and evidence before deciding.',
      strength: 'You compare calmly and make choices with few regrets',
      caution: 'Gathering too much information can leave you unable to decide',
      tip: 'Limit yourself to three things to compare — deciding gets much easier',
    },
    mid: { keyword: 'Heart and head', summary: 'You decide with a balance of feelings and logic.' },
  },
  life_mode: {
    label: 'Your current life mode',
    pos: {
      keyword: 'Expanding mode',
      summary: 'A time to start new things and widen your world.',
      strength: 'You can soak up new encounters and experiences',
      caution: 'Spreading yourself too thin can leave everything half-done',
      tip: 'Write down three things you want to start, then pick just one',
    },
    neg: {
      keyword: 'Settling mode',
      summary: 'A time to treasure what you have and steady your footing.',
      strength: 'With solid ground, you’ll be ready for the next chance',
      caution: 'Avoiding change too much may make you pass on chances',
      tip: 'Instead of big changes, try "one new thing a month"',
    },
    mid: { keyword: 'Recharging mode', summary: 'A time to slow down and let yourself rest.' },
  },
};
