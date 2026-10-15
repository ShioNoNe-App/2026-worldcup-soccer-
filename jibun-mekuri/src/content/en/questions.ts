// English text for QUESTIONS (keyed by question id / option id).
// Options with ids 'unknown' / 'none' / 'skip' fall back to COMMON_OPTIONS_EN when not listed.
export interface QuestionText {
  text: string;
  sub?: string;
  options: Record<string, { label: string; reaction?: string; keyword?: string }>;
}

export const COMMON_OPTIONS_EN: Record<string, { label: string; reaction?: string }> = {
  unknown: { label: 'Not sure yet', reaction: 'That’s a valid answer too.' },
  none: { label: 'None of these', reaction: 'Got it — none of them fit.' },
  skip: { label: 'Prefer not to say' },
};

export const QUESTIONS_EN: Record<string, QuestionText> = {
  love_pace: {
    text: 'How does love usually start for you?',
    options: {
      intuitive: { label: 'I just get a feeling: "they’re nice"', reaction: 'Your spark sensor is sensitive!' },
      gradual: { label: 'It grows on me as we talk', reaction: 'A slow-and-steady type.' },
      depends: { label: 'It depends on the person' },
    },
  },
  love_express: {
    text: 'How do you usually show you like someone?',
    options: {
      words: { label: 'I say it straight out', reaction: 'Direct — so cool!' },
      actions: { label: 'Subtly, through attitude and actions' },
      wait: { label: 'I wait for them to make a move', reaction: 'Waiting takes courage too.' },
      rarely: { label: 'I’ve hardly ever said it' },
    },
  },
  love_reassure: {
    text: 'The person you like hasn’t replied for half a day. What’s going on in your head?',
    options: {
      check: { label: 'I keep checking my phone', reaction: 'Totally get it…' },
      bit: { label: 'A little curious, but I’m fine' },
      fine: { label: 'It barely bothers me', reaction: 'So easygoing!' },
    },
  },
  love_distance: {
    text: 'What’s your ideal time as a couple?',
    options: {
      together: { label: 'Together as much as possible' },
      balance: { label: 'A mix of “us” days and “me” days' },
      alone: { label: 'Alone time matters a lot to me', reaction: 'Your own world is precious.' },
    },
  },
  love_lead: {
    text: 'Who decides where to go on a date?',
    options: {
      me: { label: 'I want to decide', reaction: 'So dependable!' },
      together: { label: 'We decide together' },
      them: { label: 'I’d rather leave it to them' },
    },
  },
  marriage_timing: {
    text: 'How do you feel about marriage right now?',
    options: {
      want: { label: 'I want to someday', keyword: 'Marriage someday' },
      maybe: { label: 'I’d consider it with the right person' },
      notnow: { label: 'Not thinking about it now' },
      free: { label: 'I’m not attached to the idea of marriage' },
    },
  },
  marriage_view: {
    text: 'What do you want to treasure in a future with a partner?',
    options: {
      stable: { label: 'A calm, secure everyday life' },
      free: { label: 'Each other’s freedom and sparks' },
      both: { label: 'Both, equally' },
    },
  },
  crush_distance: {
    text: 'How close are you to the person you like right now?',
    options: {
      far: { label: 'Still admiring from afar', reaction: 'Just seeing them makes your heart race, right?' },
      some: { label: 'We talk now and then' },
      close: { label: 'We talk a lot / good friends' },
      date: { label: 'We’ve met up one-on-one', reaction: 'Ooh, things are moving!' },
    },
  },
  crush_far: {
    text: 'How could you start a conversation?',
    options: {
      topic: { label: 'Look for something in common' },
      intro: { label: 'Have someone introduce us' },
      wait: { label: 'Let it happen naturally' },
    },
  },
  crush_signal: {
    text: 'Do you think they can tell you like them?',
    options: {
      sent: { label: 'Probably, yes' },
      hidden: { label: 'Probably not' },
      hiding: { label: 'I’m hiding it on purpose', reaction: 'Hiding it is a strategy too…!' },
    },
  },
  crush_after_date: {
    text: 'How did you feel after meeting one-on-one?',
    options: {
      closer: { label: 'I want to get closer', reaction: 'Treasure that feeling.' },
      anxious: { label: 'Anxious — I can’t read their feelings' },
      slow: { label: 'It was fun, no need to rush' },
    },
  },
  closer_talk: {
    text: 'When talking with someone you like, you tend to…',
    options: {
      self: { label: 'Talk a lot about myself' },
      listen: { label: 'Mostly listen' },
      fun: { label: 'Try hard to make them laugh' },
      nervous: { label: 'Get nervous and tongue-tied', reaction: 'Nerves may mean you’re serious.' },
    },
  },
  partner_state: {
    text: 'What best describes your relationship with your partner now?',
    options: {
      stable: { label: 'Stable and comfortable', reaction: 'Sounds like a good relationship.' },
      uneasy: { label: 'Fun, but a little anxious too' },
      gap: { label: 'We’ve been missing each other more' },
      future: { label: 'Time to talk about the future' },
    },
  },
  partner_gap: {
    text: 'When you two are out of sync, what do you tend to do?',
    options: {
      talk: { label: 'Talk it over right away' },
      later: { label: 'Talk once I’ve calmed down' },
      hide: { label: 'Pretend it doesn’t bother me' },
      wait: { label: 'Wait for them to bring it up' },
    },
  },
  reunion_time: {
    text: 'How long has it been since you broke up?',
    options: {
      fresh: { label: 'Within a month' },
      mid: { label: 'Within six months' },
      long: { label: 'Longer than that' },
    },
  },
  reunion_reason: {
    text: 'What’s the main reason you’re thinking of getting back together?',
    options: {
      love: { label: 'I still love them' },
      lonely: { label: 'I feel very lonely' },
      regret: { label: 'I regret how we broke up' },
      unsure: { label: 'I’m not sure myself' },
    },
  },
  meet_place: {
    text: 'Where can you be yourself when meeting new people?',
    options: {
      party: { label: 'Big, lively gatherings' },
      small: { label: 'Small groups or introductions' },
      hobby: { label: 'Hobbies, classes or work' },
      online: { label: 'Apps or online' },
    },
  },
  love_pattern: {
    text: 'In love, when do you think "here we go again…"?',
    options: {
      over: { label: 'I fall too hard and get swept away' },
      adapt: { label: 'I adapt too much and get tired' },
      fade: { label: 'My feelings cool off quickly' },
      stall: { label: 'It ends before anything happens' },
      none: { label: 'Nothing comes to mind' },
    },
  },
  work_pace: {
    text: 'When you’re given a new task (at work or school), what do you do first?',
    options: {
      act: { label: 'Just start doing it', reaction: 'A quick-start type!' },
      plan: { label: 'Think through the big picture and steps', reaction: 'You draw the blueprint first.' },
      ask: { label: 'Go ask someone who knows' },
      depends: { label: 'It depends on the situation' },
    },
  },
  work_structure: {
    text: 'Where do you perform better?',
    options: {
      clear: { label: 'Clear methods and goals' },
      free: { label: 'Being trusted with lots of freedom' },
      half: { label: 'Somewhere in between' },
    },
  },
  work_collab: {
    text: 'When do you focus and get the best results?',
    options: {
      team: { label: 'Working together as a lively group' },
      small: { label: 'A small team I know well' },
      solo: { label: 'Quietly on my own', reaction: 'Strong focus mode.' },
    },
  },
  work_drive: {
    text: 'When do you think "Yes!" at work?',
    options: {
      challenge: { label: 'When I get to try something new' },
      achieve: { label: 'When I hit a goal' },
      help: { label: 'When I’ve helped someone' },
      craft: { label: 'When steady effort takes shape' },
    },
  },
  work_stress: {
    text: 'What drains you the most?',
    options: {
      micro: { label: 'Being micromanaged' },
      vague: { label: 'Fuzzy goals' },
      people: { label: 'Lots of tiptoeing around people' },
      routine: { label: 'Doing the same thing over and over' },
      change: { label: 'Frequent sudden changes' },
    },
  },
  career_now: {
    text: 'How do you feel about your career or path right now?',
    options: {
      grow: { label: 'I want to grow where I am' },
      change: { label: 'I’m considering a change of environment' },
      indie: { label: 'I’m interested in going independent or a side gig' },
      explore: { label: 'Still exploring', reaction: 'Exploring is a real step too.' },
    },
  },
  career_change_reason: {
    text: 'What’s the main reason you want a change?',
    options: {
      want: { label: 'There’s something else I want to do' },
      env: { label: 'The environment or relationships' },
      future: { label: 'Pay or future prospects' },
      unsure: { label: 'A vague worry about staying as I am' },
    },
  },
  work_role: {
    text: 'At work or school, what do people rely on you for?',
    options: {
      lead: { label: 'Setting direction and leading' },
      listen: { label: 'Giving advice and listening' },
      mood: { label: 'Brightening the mood' },
      accurate: { label: 'Accurate work and checking' },
    },
  },
  work_decide: {
    text: 'How do you make big decisions?',
    options: {
      gut: { label: 'On instinct, quickly' },
      compare: { label: 'Gather information and compare' },
      consult: { label: 'Ask someone I trust' },
      hesitate: { label: 'Agonize until the last minute', reaction: 'Hesitating means you care.' },
    },
  },
  challenge_brake: {
    text: 'When taking on a challenge, what tends to hold you back?',
    options: {
      eyes: { label: 'What others will think if I fail' },
      money: { label: 'Worries about money or living' },
      start: { label: 'Not knowing where to start' },
      none: { label: 'Not much holds me back', reaction: 'Full throttle!' },
    },
  },
  rel_role: {
    text: 'What’s your position in your group of friends?',
    options: {
      lead: { label: 'The organizer / planner' },
      listen: { label: 'The listener / advisor' },
      mood: { label: 'The mood maker', reaction: 'The one who lights up the room!' },
      varies: { label: 'It changes each time' },
    },
  },
  rel_circle: {
    text: 'Which is closer to how you do friendships?',
    options: {
      wide: { label: 'Wide, with lots of people' },
      deep: { label: 'Deep, with a few people' },
      both: { label: 'A bit of both' },
    },
  },
  rel_conflict: {
    text: 'When someone’s words bother you, you…',
    options: {
      now: { label: 'Tell them right then' },
      later: { label: 'Tell them after some time' },
      swallow: { label: 'Usually swallow it', reaction: 'Don’t bottle up too much.' },
      distance: { label: 'Keep a little distance' },
    },
  },
  family_distance: {
    text: 'Which is closest to your distance with family?',
    sub: 'You can skip this if you’d rather not answer.',
    options: {
      close: { label: 'We can talk about anything' },
      moderate: { label: 'A comfortable distance' },
      careful: { label: 'I’m a bit careful around them' },
      distance: { label: 'I want some distance right now' },
      skip: { label: 'Skip' },
    },
  },
  friend_now: {
    text: 'What’s been on your mind about friendships lately?',
    options: {
      closer: { label: 'There’s someone I want to be closer to' },
      tired: { label: 'Tiptoeing around people tires me' },
      new: { label: 'I want new friends' },
      none: { label: 'Nothing in particular' },
    },
  },
  self_energy: {
    text: 'After a tiring week, how do you recover on the weekend?',
    options: {
      friends: { label: 'Meet friends and talk' },
      home: { label: 'Relax at home alone', reaction: 'Home time is the best.' },
      out_alone: { label: 'Go out, but on my own' },
      depends: { label: 'It depends' },
    },
  },
  self_decide: {
    text: 'When you’re torn, what finally decides it?',
    options: {
      excite: { label: 'Whether it excites me' },
      reason: { label: 'Whether I can explain why' },
      others: { label: 'Whether it makes someone happy' },
    },
  },
  self_gap: {
    text: 'Is there a gap between how others see you and the real you?',
    options: {
      big: { label: 'A big one', reaction: 'Ooh, now I’m curious…!' },
      some: { label: 'A little' },
      none: { label: 'Hardly any' },
      unknown: { label: 'Not sure' },
    },
  },
  self_gap_kind: {
    text: 'What kind of gap?',
    options: {
      sensitive: { label: 'People see me as cheerful, but I’m actually sensitive' },
      soft: { label: 'People see me as reliable, but I want to be pampered' },
      passion: { label: 'People see me as quiet, but I’m actually passionate' },
      warm: { label: 'People see me as cool, but I’m actually warm-hearted' },
    },
  },
  life_mode: {
    text: 'Which is closer to how you feel about the coming year?',
    options: {
      expand: { label: 'I want to start something new', reaction: 'Nice, that’s exciting!' },
      settle: { label: 'I want to take care of what I have' },
      rest: { label: 'I want to rest a little', reaction: 'Resting is a real choice too.' },
    },
  },
  life_focus: {
    text: 'What do you most want to focus on right now?',
    options: {
      love: { label: 'Love and partnership' },
      work: { label: 'Work and learning' },
      relations: { label: 'Relationships' },
      self: { label: 'My mind and body' },
    },
  },
};
