// English text for DAY_MASTERS (same order: 甲 → 癸).
export interface DayMasterText {
  image: string;
  nickname: string;
  essence: string;
  strengths: [string, string];
  cautions: [string, string];
  love: string;
  work: string;
  relations: string;
  self: string;
}

export const DAY_MASTERS_EN: DayMasterText[] = [
  {
    image: 'Great Tree',
    nickname: 'The Tall, Straight Tree',
    essence: 'Once you decide "this is what I want," you keep growing toward it. People tend to lean on you, and before you know it you are the one giving everyone shade.',
    strengths: ['Staying power once you set a goal, and a core that does not bend', 'Natural leadership that pulls people along when they are stuck'],
    cautions: ['When you are sure your way is right, other opinions may have a hard time getting in', 'You find it hard to admit weakness and tend to carry things alone'],
    love: 'You read as someone who faces the person you like head-on. Trust matters more to you than playing games, and a strong urge to protect may come out.',
    work: 'You read as someone who grows in places with clear goals. The more you are trusted with, the more you shine — though having your pace disrupted may bother you a little.',
    relations: 'You easily end up as the one leading the group. Being relied on feels good, but you may forget that you can rely on others too.',
    self: 'Your inner strength is your charm. On the flip side, you may be a little too strict with yourself about "doing it properly."',
  },
  {
    image: 'Wildflower',
    nickname: 'The Flexible Wildflower',
    essence: 'Even when the wind blows, you bend instead of breaking and keep blooming. You read people well and blend into any room.',
    strengths: ['Flexibility to adapt to people and situations', 'Patience to build trust slowly and value connections'],
    cautions: ['Because you adapt so well, your true feelings can get pushed to the back', 'Your mood may be swayed by the atmosphere around you'],
    love: 'You read as someone who is good at staying close to your partner’s feelings. Because of that, there may be moments you want to check, "How do you feel about me?"',
    work: 'You tend to shine as the person connecting people within a team. You are great in support roles, but it may sting when that work goes unnoticed.',
    relations: 'A natural mediator who fits in with almost anyone — though all that consideration can wear you out.',
    self: 'Tougher than you look. "Soft but unbreakable" may be your keyword.',
  },
  {
    image: 'Sun',
    nickname: 'The Sunshine Type',
    essence: 'The room lights up just because you are in it. Your feelings show on your face, and that honesty draws people in.',
    strengths: ['Brightness and drive that get others on board', 'Openness to express your feelings honestly'],
    cautions: ['You warm up fast — and may cool down fast too', 'Deciding on momentum can leave you stuck on the details later'],
    love: 'You read as someone whose feelings show as soon as you think "I like them." You fall fast, and your love stories may start dramatically.',
    work: 'You tend to shine on stage or when starting something new. When routine drags on, you may have energy to spare.',
    relations: 'Your circle of friends grows naturally. Because you are bright with everyone, sharing deep worries may be harder.',
    self: 'Your brightness is real. Still, the quiet moments when you are alone may matter more than you think.',
  },
  {
    image: 'Candle',
    nickname: 'The Candle That Lights Hearts',
    essence: 'You look calm, but you carry a warm flame inside. You notice small details and quietly stay close to people’s hearts.',
    strengths: ['Sharp eyes for small changes in how people feel', 'A quiet, long-lasting passion for what you love'],
    cautions: ['Your emotional waves rarely show, so you can wear yourself out alone', 'Overthinking can slow down your first step'],
    love: 'You read as someone who burns brightly inside once in love. You may care a lot about whether your feelings are getting through.',
    work: 'You tend to shine when digging deep into one thing or supporting people’s feelings. Small groups may suit you better than big ones.',
    relations: 'You value a few deep relationships. Having "the one person I can talk to" steadies you a lot.',
    self: 'Your strength is your ability to feel. Because you move by feeling, time to listen to your inner voice keeps you balanced.',
  },
  {
    image: 'Mountain',
    nickname: 'The Steady Mountain',
    essence: 'You are not easily shaken, and people feel safe around you. Others gather around you and tend to rely on you.',
    strengths: ['Calm judgment and unwavering stability', 'The capacity to accept and hold people'],
    cautions: ['You can be slow to move and miss the moment for change', 'You rarely say what you really think, which can cause misunderstandings'],
    love: 'You read as someone who gets to know a person slowly. Once you trust them, you cherish them for a long time — a steady kind of love.',
    work: 'The more you build up step by step, the more you are valued. Sudden changes of direction or races against time may tire you.',
    relations: 'People come to you for advice. You listen a lot, so it helps to have places where you get to talk too.',
    self: 'Your strength is "not changing." New steps may feel just right when you try them in small sizes.',
  },
  {
    image: 'Field',
    nickname: 'The Nurturing Earth',
    essence: 'You are good at slowly growing people and things. Practical and caring, you often find yourself looking after someone.',
    strengths: ['A caring nature that supports others’ growth', 'Practical power to turn things into reality step by step'],
    cautions: ['You may worry too much and plan too far ahead for others', 'You put others first and forget to care for yourself'],
    love: 'You read as someone who loves by nurturing. You tend to seek a relationship that feels safe and want to think seriously about the future.',
    work: 'You tend to shine supporting a team by organizing plans and systems. Work with fuzzy goals may feel unsettling.',
    relations: 'Trusted as the caretaker. Sometimes try being the one who asks for help.',
    self: 'You combine kindness and realism. Be as kind to yourself as you are to others.',
  },
  {
    image: 'Steel',
    nickname: 'The Trailblazing Steel',
    essence: 'A crisp doer who acts the moment you decide. You have a strong sense of justice and dislike anything crooked.',
    strengths: ['Speed to decide even when others hesitate', 'Honesty to speak clearly, and the drive to follow through'],
    cautions: ['Wanting things black or white can make your words land harshly', 'You may rush to conclusions before explaining your feelings'],
    love: 'You read as someone who is clear: if you like them, you like them. Vague relationships are hard for you, and you may act to change the situation yourself.',
    work: 'You tend to shine when decisions or reforms are needed. Because speed is your strength, building consensus may feel like a chore.',
    relations: 'A reliable person who says what needs saying. Thinking about "how it lands" more than "what is right" will win you even more allies.',
    self: 'You value living by your principles. Practicing "oh well, that’s fine" now and then may make life easier.',
  },
  {
    image: 'Jewel',
    nickname: 'The Jewel That Shines With Polish',
    essence: 'You have delicate senses and a strong eye for beauty. You care about details and value your own sense of "just right."',
    strengths: ['Uncompromising attention to detail and aesthetics', 'Taste to tell good from bad'],
    cautions: ['You can be easily hurt and remember what was said for a long time', 'Seeking perfection can make you strict with yourself and others'],
    love: 'You read as someone sensitive to whether you are being cherished. You may prefer to observe someone well before getting closer.',
    work: 'You tend to shine in work where quality and taste matter. Sloppy processes or clashing values may drain you.',
    relations: 'You treasure a few people you trust. Someone who shares your "favorites" makes you shine.',
    self: 'Sensitivity is a talent. Like a jewel that shines when polished, experience will become your charm.',
  },
  {
    image: 'Ocean',
    nickname: 'The Free-Flowing Ocean',
    essence: 'Big-hearted and curious, you can flow anywhere your interest takes you. You dislike being tied down and value your own pace.',
    strengths: ['A wide range that lets you dive into new worlds', 'Easygoing ideas that are not trapped by small details'],
    cautions: ['Your interest moves fast and you may get distracted halfway', 'Valuing freedom can make promises feel confining'],
    love: 'You read as someone who feels best in a relationship where both people respect each other’s freedom. Strong possessiveness may feel suffocating.',
    work: 'You tend to grow where you have a lot of discretion and room to try new things. Workplaces full of small rules may feel cramped.',
    relations: 'You know all kinds of people. Because you do not stay in one place, deep bonds may grow slowly.',
    self: 'You trust the "flow." Go with it, but check your destination now and then and you will go even further.',
  },
  {
    image: 'Rain',
    nickname: 'The Gentle Raindrop',
    essence: 'Quietly but surely, you nourish the people around you. Rich in sensitivity, you pick up feelings that are never put into words.',
    strengths: ['Sensitivity and kindness that read people’s feelings', 'Deep thinking that grasps the essence of things'],
    cautions: ['You swallow what you want to say and tend to bottle it up', 'Thinking about others’ feelings can make decisions slow'],
    love: 'You read as someone who would rather be understood than spell feelings out. You long for a bond where words are not needed, but misunderstandings may build up.',
    work: 'You quietly shine in research, thinking and supporting roles. You may be trusted more behind the scenes than in the spotlight.',
    relations: 'A kind person who really listens. Writing hard things down before saying them may be just right for you.',
    self: 'You carry a rich inner world. Time alone that fills your heart may be your energy source.',
  },
];
