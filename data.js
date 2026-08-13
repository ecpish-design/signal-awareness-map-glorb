window.GLORB_DATA = (() => {
  const A = (n) => `assets/${n}.png`;

  const feelings = [
    { id: 'furious', label: 'Furious', asset: A(8), signal: 'overload' },
    { id: 'panicked', label: 'Panicked', asset: A(9), signal: 'overload' },
    { id: 'terrified', label: 'Terrified', asset: A(10), signal: 'overload' },
    { id: 'overwhelmed', label: 'Overwhelmed', asset: A(11), signal: 'overload' },
    { id: 'upset', label: 'Upset', asset: A(12), signal: 'rising' },
    { id: 'disrespected', label: 'Disrespected', asset: A(13), signal: 'rising' },
    { id: 'excited', label: 'Excited', asset: A(14), signal: 'rising' },
    { id: 'frustrated', label: 'Frustrated', asset: A(15), signal: 'rising' },
    { id: 'anxious', label: 'Anxious', asset: A(16), signal: 'rising' },
    { id: 'nervous', label: 'Nervous', asset: A(17), signal: 'rising' },
    { id: 'sad', label: 'Sad', asset: A(18), signal: 'low' },
    { id: 'embarrassed', label: 'Embarrassed', asset: A(19), signal: 'low' },
    { id: 'lonely', label: 'Lonely', asset: A(20), signal: 'low' },
    { id: 'bored', label: 'Bored', asset: A(21), signal: 'low' },
    { id: 'tired', label: 'Tired', asset: A(22), signal: 'low' },
    { id: 'unsure', label: 'Unsure', asset: A(23), signal: 'low' },
    { id: 'calm', label: 'Calm', asset: A(24), signal: 'steady' },
    { id: 'focused', label: 'Focused', asset: A(25), signal: 'steady' },
    { id: 'proud', label: 'Proud', asset: A(26), signal: 'steady' },
    { id: 'content', label: 'Content', asset: A(27), signal: 'steady' },
    { id: 'happy', label: 'Happy', asset: A(28), signal: 'steady' }
  ];

  const signals = {
    low: {
      id: 'low', label: 'LOW SIGNAL', overview: A(3), className: 'low',
      studentDescription: 'Things may feel lower, slower, heavier or harder to start.',
      adultDescription: 'Energy or attention may be reduced. Getting started, staying engaged or responding may take more effort.'
    },
    steady: {
      id: 'steady', label: 'STEADY SIGNAL', overview: A(4), className: 'steady',
      studentDescription: 'You have enough energy and space for what is happening right now.',
      adultDescription: 'The student currently has enough capacity for what is happening. This does not mean silent, still or perfectly calm.'
    },
    rising: {
      id: 'rising', label: 'RISING SIGNAL', overview: A(5), className: 'rising',
      studentDescription: 'Energy, tension or urgency may be building.',
      adultDescription: 'Activation, tension or urgency may be increasing. Early help can be useful here.'
    },
    overload: {
      id: 'overload', label: 'SIGNAL OVERLOAD', overview: A(6), className: 'overload',
      studentDescription: 'The feeling may be very big and thinking or talking can become harder.',
      adultDescription: 'Thinking, language, communication and flexible responding may become much harder.'
    }
  };

  const happensItems = {
    low: [
      { id: 'body-heavy', asset: A(34), visual: 'My body feels heavy', question: (f) => `When you feel ${f}, does your body feel heavy?` },
      { id: 'body-slouched', asset: A(35), visual: 'My body feels slouched', question: (f) => `When you feel ${f}, does your body feel slouched?` },
      { id: 'head-down', asset: A(36), visual: 'I put my head down', question: (f) => `When you feel ${f}, do you put your head down?` },
      { id: 'hard-start', asset: A(37), visual: 'It is hard to get started', question: (f) => `When you feel ${f}, is it hard to get started?` },
      { id: 'hard-think', asset: A(52), visual: 'It is hard to think clearly', question: (f) => `When you feel ${f}, is it hard to think clearly?` },
      { id: 'body-tired', asset: A(54), visual: 'I feel tired in my body', question: (f) => `When you feel ${f}, do you feel tired in your body?` }
    ],
    rising: [
      { id: 'heart-fast', asset: A(38), visual: 'My heart beats faster', question: (f) => `When you feel ${f}, does your heart beat faster?` },
      { id: 'breathing-fast', asset: A(39), visual: 'My breathing gets fast', question: (f) => `When you feel ${f}, does your breathing get fast?` },
      { id: 'face-hot', asset: A(42), visual: 'My face feels hot', question: (f) => `When you feel ${f}, does your face feel hot?` },
      { id: 'muscles-tight', asset: A(44), visual: 'My muscles get tight', question: (f) => `When you feel ${f}, do your muscles get tight?` },
      { id: 'hands-clench', asset: A(46), visual: 'My hands clench', question: (f) => `When you feel ${f}, do your hands clench?` },
      { id: 'head-busy', asset: A(51), visual: 'My head feels busy', question: (f) => `When you feel ${f}, does your head feel busy?` }
    ],
    overload: [
      { id: 'breathing-shaky', asset: A(40), visual: 'My breathing gets shaky', question: (f) => `When you feel ${f}, does your breathing get shaky?` },
      { id: 'face-hot', asset: A(42), visual: 'My face feels hot', question: (f) => `When you feel ${f}, does your face feel hot?` },
      { id: 'body-shakes', asset: A(47), visual: 'My body shakes or trembles', question: (f) => `When you feel ${f}, does your body shake or tremble?` },
      { id: 'freeze', asset: A(48), visual: 'I go still or freeze', question: (f) => `When you feel ${f}, do you go still or freeze?` },
      { id: 'hard-think', asset: A(52), visual: 'It is hard to think clearly', question: (f) => `When you feel ${f}, is it hard to think clearly?` },
      { id: 'hard-talk', asset: A(53), visual: 'It is hard to talk', question: (f) => `When you feel ${f}, is it hard to talk?` }
    ]
  };

  const actionItems = {
    low: [
      { id: 'stop-doing', asset: A(57), visual: 'Stop what I am doing', question: (f) => `When you feel ${f}, do you want to stop what you are doing?` },
      { id: 'stop-joining', asset: A(58), visual: 'Stop joining in', question: (f) => `When you feel ${f}, do you want to stop joining in?` },
      { id: 'be-by-myself', asset: A(59), visual: 'Be by myself', question: (f) => `When you feel ${f}, do you want to be by yourself?` },
      { id: 'go-quiet', asset: A(62), visual: 'Go quiet', question: (f) => `When you feel ${f}, do you want to go quiet?` },
      { id: 'curl-up', asset: A(67), visual: 'Curl up', question: (f) => `When you feel ${f}, do you want to curl up?` },
      { id: 'somewhere-quiet', asset: A(74), visual: 'Go somewhere quiet', question: (f) => `When you feel ${f}, do you want to go somewhere quiet?` }
    ],
    rising: [
      { id: 'move-away', asset: A(65), visual: 'Move away', question: (f) => `When you feel ${f}, do you want to move away?` },
      { id: 'walk-around', asset: A(66), visual: 'Walk around', question: (f) => `When you feel ${f}, do you want to walk around?` },
      { id: 'cover-ears', asset: A(68), visual: 'Cover my ears', question: (f) => `When you feel ${f}, do you want to cover your ears?` },
      { id: 'ask-help', asset: A(70), visual: 'Ask for help', question: (f) => `When you feel ${f}, do you want to ask for help?` },
      { id: 'somewhere-quiet', asset: A(74), visual: 'Go somewhere quiet', question: (f) => `When you feel ${f}, do you want to go somewhere quiet?` },
      { id: 'bathroom', asset: A(75), visual: 'Go to the toilet or bathroom', question: (f) => `When you feel ${f}, do you want to go to the toilet or bathroom?` }
    ],
    overload: [
      { id: 'leave-room', asset: A(60), visual: 'Leave the room', question: (f) => `When you feel ${f}, do you want to leave the room?` },
      { id: 'hide', asset: A(61), visual: 'Hide', question: (f) => `When you feel ${f}, do you want to hide?` },
      { id: 'cry', asset: A(63), visual: 'Cry', question: (f) => `When you feel ${f}, do you want to cry?` },
      { id: 'yell', asset: A(64), visual: 'Yell', question: (f) => `When you feel ${f}, do you want to yell?` },
      { id: 'cover-ears', asset: A(68), visual: 'Cover my ears', question: (f) => `When you feel ${f}, do you want to cover your ears?` },
      { id: 'not-talk', asset: A(73), visual: 'Not talk to anyone', question: (f) => `When you feel ${f}, do you want to stop talking to people?` }
    ]
  };

  const selfHelpItems = {
    low: [98, 101, 102, 111, 112, 113],
    steady: [102, 105, 106, 108, 113, 117],
    rising: [98, 99, 102, 104, 105, 117],
    overload: [98, 99, 104, 110, 113, 117]
  };

  const selfHelpCatalog = {
    98: { id: 'quiet-space', asset: A(98), visual: 'Quiet space helps', label: 'A quiet space', verb: 'having a quiet space' },
    99: { id: 'break', asset: A(99), visual: 'Taking a break helps', label: 'Take a break', verb: 'taking a break' },
    100: { id: 'water', asset: A(100), visual: 'Drinking water helps', label: 'Drink water', verb: 'drinking water' },
    101: { id: 'snack', asset: A(101), visual: 'Having a snack helps', label: 'Have a snack', verb: 'having a snack' },
    102: { id: 'move-body', asset: A(102), visual: 'Moving my body helps', label: 'Move my body', verb: 'moving your body' },
    103: { id: 'walk', asset: A(103), visual: 'Walking helps', label: 'Go for a walk', verb: 'walking' },
    104: { id: 'slow-breathing', asset: A(104), visual: 'Breathing slowly helps', label: 'Breathe slowly', verb: 'breathing slowly' },
    105: { id: 'fidget', asset: A(105), visual: 'Using a fidget helps', label: 'Use a fidget', verb: 'using a fidget' },
    106: { id: 'drawing', asset: A(106), visual: 'Drawing helps', label: 'Draw', verb: 'drawing' },
    107: { id: 'writing', asset: A(107), visual: 'Writing helps', label: 'Write', verb: 'writing' },
    108: { id: 'music', asset: A(108), visual: 'Listening to music helps', label: 'Listen to music', verb: 'listening to music' },
    109: { id: 'sit-elsewhere', asset: A(109), visual: 'Sitting somewhere else helps', label: 'Sit somewhere else', verb: 'sitting somewhere else' },
    110: { id: 'alone', asset: A(110), visual: 'Being by myself helps', label: 'Be by myself', verb: 'being by yourself' },
    111: { id: 'talk-someone', asset: A(111), visual: 'Talking to someone helps', label: 'Talk to someone', verb: 'talking to someone' },
    112: { id: 'familiar', asset: A(112), visual: 'Doing something familiar helps', label: 'Do something familiar', verb: 'doing something familiar' },
    113: { id: 'time', asset: A(113), visual: 'Having time helps', label: 'Have time', verb: 'having more time' },
    114: { id: 'squeeze', asset: A(114), visual: 'Squeezing something helps', label: 'Squeeze something', verb: 'squeezing something' },
    115: { id: 'stretch', asset: A(115), visual: 'Stretching helps', label: 'Stretch', verb: 'stretching' },
    116: { id: 'calm-card', asset: A(116), visual: 'Looking at a calm card or reminder helps', label: 'Use a reminder card', verb: 'looking at a reminder card' },
    117: { id: 'headphones', asset: A(117), visual: 'Headphones or blocking noise helps', label: 'Use headphones or block noise', verb: 'using headphones or blocking noise' }
  };

  const otherHelpItems = {
    low: [119, 122, 123, 124, 126, 137],
    steady: [123, 124, 125, 127, 128, 137],
    rising: [118, 120, 123, 125, 127, 137],
    overload: [118, 119, 120, 121, 127, 132, 133]
  };

  const otherHelpCatalog = {
    118: { id: 'give-space', asset: A(118), visual: 'Give me space', label: 'Give me space', action: 'gives you space' },
    119: { id: 'stay-nearby', asset: A(119), visual: 'Stay nearby', label: 'Stay nearby', action: 'stays nearby' },
    120: { id: 'fewer-words', asset: A(120), visual: 'Use fewer words', label: 'Use fewer words', action: 'uses fewer words' },
    121: { id: 'help-leave', asset: A(121), visual: 'Help me leave', label: 'Help me leave', action: 'helps you leave' },
    122: { id: 'help-start', asset: A(122), visual: 'Help me get started', label: 'Help me get started', action: 'helps you get started' },
    123: { id: 'give-time', asset: A(123), visual: 'Give me time', label: 'Give me time', action: 'gives you time' },
    124: { id: 'ask-need', asset: A(124), visual: 'Ask me what I need', label: 'Ask me what I need', action: 'asks what you need' },
    125: { id: 'give-choice', asset: A(125), visual: 'Give me a choice', label: 'Give me a choice', action: 'gives you a choice' },
    126: { id: 'check-later', asset: A(126), visual: 'Check on me later', label: 'Check on me later', action: 'checks on you later' },
    127: { id: 'make-quieter', asset: A(127), visual: 'Help make it quieter', label: 'Help make it quieter', action: 'helps make it quieter' },
    128: { id: 'what-next', asset: A(128), visual: 'Remind me what to do next', label: 'Remind me what to do next', action: 'reminds you what to do next' },
    129: { id: 'sit-with', asset: A(129), visual: 'Sit with me', label: 'Sit with me', action: 'sits with you' },
    130: { id: 'have-break', asset: A(130), visual: 'Let me have a break', label: 'Let me have a break', action: 'lets you have a break' },
    131: { id: 'move-others', asset: A(131), visual: 'Help other people move away', label: 'Help other people move away', action: 'helps other people move away' },
    132: { id: 'no-talk-yet', asset: A(132), visual: 'Do not make me talk straight away', label: 'Do not make me talk straight away', action: 'does not make you talk straight away' },
    133: { id: 'tell-safe', asset: A(133), visual: 'Tell me I am safe', label: 'Tell me I am safe', action: 'tells you that you are safe' },
    134: { id: 'calm-first', asset: A(134), visual: 'Help me calm first', label: 'Help me settle first', action: 'helps you settle first' },
    135: { id: 'talk-later', asset: A(135), visual: 'Come back later to talk', label: 'Come back later to talk', action: 'comes back later to talk' },
    136: { id: 'return-ready', asset: A(136), visual: 'Help me return when I am ready', label: 'Help me return when I am ready', action: 'helps you return when you are ready' },
    137: { id: 'talk-quietly', asset: A(137), visual: 'Talk quietly', label: 'Talk quietly', action: 'talks quietly' }
  };

  const broadPressure = [
    { id: 'sensory', asset: A(148), studentTitle: 'Things around you', adultTitle: 'Sensory pressures' },
    { id: 'reminder', asset: A(162), studentTitle: 'Things that remind you of something', adultTitle: 'Reminder-related pressures' },
    { id: 'situational', asset: A(173), studentTitle: 'What is happening', adultTitle: 'Situational pressures' },
    { id: 'relational', asset: A(186), studentTitle: 'Things other people say or do', adultTitle: 'Relational pressures' }
  ];

  const pressureQuestion = (domain, signal, feelingLabel) => {
    const f = feelingLabel.toLowerCase();
    const examples = {
      sensory: 'noise, lights, smells, touch or lots of people',
      reminder: 'being reminded of something upsetting',
      situational: 'being rushed, waiting or plans changing',
      relational: 'something another person says or does'
    };
    const start = `When you feel ${f}, can ${examples[domain]}`;
    if (signal === 'steady') return `${start} make it harder to stay feeling ${f}?`;
    if (signal === 'rising') return `${start} make the feeling build?`;
    if (signal === 'overload') return `${start} make it even harder?`;
    return `${start} make the feeling stronger?`;
  };

  const pressureDomains = [
    {
      id: 'sensory', studentTitle: 'THINGS AROUND ME', adultTitle: 'Sensory pressures', overview: A(148),
      intro: 'Now we’ll look at sounds, sights, smells, touch, movement and body feelings.',
      adultMeaning: 'Summarises the student’s reported impact of environmental and body-based input such as sound, light, smell, touch, crowding, movement, temperature and internal body states.',
      items: [
        { id: 'loud-noise', label: 'Loud noise', asset: A(149), adultDescriptor: 'Auditory input' },
        { id: 'bright-lights', label: 'Bright lights', asset: A(150), adultDescriptor: 'Visual and light input' },
        { id: 'strong-smells', label: 'Strong smells', asset: A(151), adultDescriptor: 'Smell input' },
        { id: 'food-tastes-textures', label: 'Food tastes or textures', asset: A(152), adultDescriptor: 'Taste and texture input' },
        { id: 'touch', label: 'Touch', asset: A(153), adultDescriptor: 'Touch input' },
        { id: 'crowding', label: 'Crowding', asset: A(154), adultDescriptor: 'Crowding and personal space' },
        { id: 'hot-cold', label: 'Hot or cold', asset: A(155), adultDescriptor: 'Temperature' },
        { id: 'hungry', label: 'Feeling hungry', asset: A(156), adultDescriptor: 'Internal body state: hunger' },
        { id: 'tired', label: 'Feeling tired', asset: A(157), adultDescriptor: 'Fatigue' },
        { id: 'sore', label: 'Feeling sore', asset: A(158), adultDescriptor: 'Pain or discomfort' },
        { id: 'toilet', label: 'Needing the toilet', asset: A(159), adultDescriptor: 'Internal body state: toileting' },
        { id: 'movement', label: 'Movement', asset: A(160), adultDescriptor: 'Movement input' },
        { id: 'squished', label: 'Feeling squished', asset: A(161), adultDescriptor: 'Body pressure or feeling confined' }
      ]
    },
    {
      id: 'reminder', studentTitle: 'THINGS THAT REMIND ME', adultTitle: 'Reminder-related pressures', overview: A(162),
      intro: 'Now we’ll look at things that can remind you of something from before.',
      adultMeaning: 'Summarises the reported impact of cues that remind the student of something from before. It does not explain why the reminder matters and does not imply trauma.',
      items: [
        { id: 'place', label: 'A place', asset: A(163), adultDescriptor: 'Place-based reminder' },
        { id: 'person', label: 'A person', asset: A(164), adultDescriptor: 'Person-related reminder' },
        { id: 'sound-song', label: 'A sound or song', asset: A(165), adultDescriptor: 'Sound-related reminder' },
        { id: 'smell-reminder', label: 'A smell', asset: A(166), adultDescriptor: 'Smell-related reminder' },
        { id: 'special-date', label: 'A special date', asset: A(167), adultDescriptor: 'Date or anniversary reminder' },
        { id: 'happened-before', label: 'Something that happened before', asset: A(168), adultDescriptor: 'Past-experience reminder' },
        { id: 'object', label: 'An object', asset: A(169), adultDescriptor: 'Object-related reminder' },
        { id: 'yelling-reminder', label: 'Yelling or arguing reminding me of something from before', asset: A(170), adultDescriptor: 'Conflict-related reminder' },
        { id: 'someone-leaving-reminder', label: 'Someone leaving', asset: A(171), adultDescriptor: 'Separation-related reminder' },
        { id: 'happen-again', label: 'Thinking something could happen again', asset: A(172), adultDescriptor: 'Anticipation linked with a past experience' }
      ]
    },
    {
      id: 'situational', studentTitle: 'SITUATIONS I FIND HARD', adultTitle: 'Situational pressures', overview: A(173),
      intro: 'Now we’ll look at situations that can make things harder.',
      adultMeaning: 'Summarises the student’s reported impact of demands, uncertainty, change, waiting, transitions, unfamiliarity and performance situations.',
      items: [
        { id: 'plans-changing', label: 'Plans changing', asset: A(174), adultDescriptor: 'Change and unpredictability' },
        { id: 'being-rushed', label: 'Being rushed', asset: A(175), adultDescriptor: 'Time pressure' },
        { id: 'waiting', label: 'Waiting', asset: A(176), adultDescriptor: 'Waiting and delay' },
        { id: 'hard-work', label: 'Hard work', asset: A(177), adultDescriptor: 'Task and cognitive demand' },
        { id: 'not-knowing-next', label: 'Not knowing what happens next', asset: A(178), adultDescriptor: 'Uncertainty and unpredictability' },
        { id: 'too-many-instructions', label: 'Too many instructions', asset: A(179), adultDescriptor: 'Instructional load' },
        { id: 'new-place-person', label: 'A new place or person', asset: A(180), adultDescriptor: 'Novelty and unfamiliarity' },
        { id: 'making-mistake', label: 'Making a mistake', asset: A(181), adultDescriptor: 'Error and performance pressure' },
        { id: 'losing', label: 'Losing', asset: A(182), adultDescriptor: 'Loss or competition outcome' },
        { id: 'being-watched', label: 'Being watched', asset: A(183), adultDescriptor: 'Observation and performance pressure' },
        { id: 'too-many-people', label: 'Too many people', asset: A(184), adultDescriptor: 'Busy social environment' },
        { id: 'moving-task', label: 'Moving from one task to another', asset: A(185), adultDescriptor: 'Transition between tasks' }
      ]
    },
    {
      id: 'relational', studentTitle: 'THINGS OTHER PEOPLE DO', adultTitle: 'Relational pressures', overview: A(186),
      intro: 'Now we’ll look at things other people can do that might make things harder.',
      adultMeaning: 'Summarises the student’s reported impact of interpersonal experiences such as exclusion, criticism, conflict, personal space, limits and feeling unheard.',
      items: [
        { id: 'left-out', label: 'Being left out', asset: A(187), adultDescriptor: 'Peer exclusion and social disconnection' },
        { id: 'teased', label: 'Being teased', asset: A(188), adultDescriptor: 'Teasing or ridicule' },
        { id: 'criticised', label: 'Being criticised', asset: A(189), adultDescriptor: 'Criticism and negative evaluation' },
        { id: 'ignored', label: 'Being ignored', asset: A(190), adultDescriptor: 'Being ignored or dismissed' },
        { id: 'not-listened', label: 'Not being listened to', asset: A(191), adultDescriptor: 'Feeling unheard' },
        { id: 'too-close', label: 'Someone too close', asset: A(192), adultDescriptor: 'Personal-space pressure' },
        { id: 'arguing', label: 'Arguing', asset: A(193), adultDescriptor: 'Interpersonal conflict' },
        { id: 'taking-things', label: 'Someone taking my things', asset: A(194), adultDescriptor: 'Boundary or belongings conflict' },
        { id: 'told-no', label: 'Being told “no”', asset: A(195), adultDescriptor: 'Limit-setting interaction' },
        { id: 'unfair', label: 'Feeling things are unfair', asset: A(196), adultDescriptor: 'Perceived unfairness' },
        { id: 'angry-with-me', label: 'Someone angry with me', asset: A(197), adultDescriptor: 'Another person’s anger' },
        { id: 'someone-leaving', label: 'Someone leaving', asset: A(198), adultDescriptor: 'Separation or disconnection' }
      ]
    }
  ];

  const ratingChoices = [
    { id: 'not-at-all', studentLabel: 'NOT AT ALL', value: 0, asset: A(200), adultLabel: 'No reported impact' },
    { id: 'a-little', studentLabel: 'A LITTLE', value: 1, asset: A(201), adultLabel: 'Low impact' },
    { id: 'kind-of', studentLabel: 'KIND OF / SOMETIMES', value: 2, asset: A(202), adultLabel: 'Somewhat / Moderate impact' },
    { id: 'a-lot', studentLabel: 'A LOT', value: 3, asset: A(203), adultLabel: 'High impact' },
    { id: 'whole-lot', studentLabel: 'A WHOLE LOT', value: 4, asset: A(204), adultLabel: 'Very high impact' },
    { id: 'unknown', studentLabel: 'I DON’T KNOW', value: null, asset: A(205), adultLabel: 'Uncertain / Not enough information yet' }
  ];

  const recoveryPatterns = [
    { id: 'tired-after', asset: A(29), visual: 'Tired after', question: 'After a really big feeling, do you feel tired?' },
    { id: 'quiet-after', asset: A(30), visual: 'Quiet after', question: 'After a really big feeling, do you get quiet?' },
    { id: 'still-upset', asset: A(31), visual: 'Still upset', question: 'After a really big feeling, are you sometimes still upset for a while?' },
    { id: 'settling-down', asset: A(32), visual: 'Settling down', question: 'After a really big feeling, does your body slowly settle down?' },
    { id: 'ready-return', asset: A(33), visual: 'Ready to return', question: 'After a really big feeling, do you know when you are ready to go back?' }
  ];

  const recoveryHelp = [
    { id: 'rest-quietly', asset: A(138), visual: 'Resting quietly', label: 'Rest quietly', question: 'After a really big feeling, does resting quietly help you?' },
    { id: 'water-after', asset: A(139), visual: 'Drinking water after', label: 'Drink water', question: 'After a really big feeling, does drinking water help you?' },
    { id: 'snack-after', asset: A(140), visual: 'Eating a snack after', label: 'Have a snack', question: 'After a really big feeling, does having a snack help you?' },
    { id: 'alone-calmly', asset: A(141), visual: 'Sitting alone calmly', label: 'Sit alone calmly', question: 'After a really big feeling, does sitting alone calmly help you?' },
    { id: 'quiet-activity', asset: A(142), visual: 'Doing a quiet activity', label: 'Do a quiet activity', question: 'After a really big feeling, does doing a quiet activity help you?' },
    { id: 'talk-later-recovery', asset: A(143), visual: 'Talking later', label: 'Talk later', question: 'After a really big feeling, does talking later help you?' },
    { id: 'check-later-recovery', asset: A(144), visual: 'Checking in later', label: 'Check in later', question: 'After a really big feeling, does it help when someone checks in later?' },
    { id: 'return-slowly', asset: A(146), visual: 'Returning slowly', label: 'Return slowly', question: 'After a really big feeling, does returning slowly help you?' }
  ];

  const references = [
    {
      id: 'acara-psc',
      short: 'Australian Curriculum: Personal and Social Capability',
      url: 'https://v9.australiancurriculum.edu.au/curriculum-information/understand-this-general-capability/personal-and-social-capability',
      apa: 'Australian Curriculum, Assessment and Reporting Authority. (n.d.). Personal and Social capability. Australian Curriculum Version 9.0.'
    },
    {
      id: 'acara-mh',
      short: 'Australian Curriculum: Mental health and wellbeing',
      url: 'https://v9.australiancurriculum.edu.au/curriculum-information/understand-this-curriculum-connection/mental-health-and-wellbeing',
      apa: 'Australian Curriculum, Assessment and Reporting Authority. (n.d.). Mental health and wellbeing. Australian Curriculum Version 9.0.'
    },
    {
      id: 'aero',
      short: 'AERO: Escalated behaviour — Creating calm, focused classrooms',
      url: 'https://www.edresearch.edu.au/guides-resources/practice-guides/escalated-behaviour-creating-calm-focused-classrooms',
      apa: 'Australian Education Research Organisation. (2026, February 18). Escalated behaviour: Creating calm, focused classrooms.'
    },
    {
      id: 'abs-rating',
      short: 'ABS Forms Design Standards: Rating scales',
      url: 'https://www.abs.gov.au/statistics/standards/abs-forms-design-standards/2023/general-forms-design-principles-question-type',
      apa: 'Australian Bureau of Statistics. (2023). ABS forms design standards: General forms design principles—Question type.'
    },
    {
      id: 'w3c-controls',
      short: 'W3C Cognitive Accessibility: Clearly identify controls',
      url: 'https://www.w3.org/WAI/WCAG2/supplemental/patterns/o1p05-clear-controls/',
      apa: 'World Wide Web Consortium. (2022). Clearly identify controls and their use. Web Accessibility Initiative.'
    },
    {
      id: 'wcag22',
      short: 'WCAG 2.2',
      url: 'https://www.w3.org/TR/WCAG22/',
      apa: 'World Wide Web Consortium. (2023). Web Content Accessibility Guidelines (WCAG) 2.2.'
    },
    {
      id: 'mazefsky',
      short: 'Mazefsky et al. (2021): Youth emotion-regulation questionnaires',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34436940/',
      apa: 'Mazefsky, C. A., Conner, C. M., Breitenfeldt, K., Leezenbaum, N., Chen, Q., Bylsma, L. M., & Pilkonis, P. (2021). Evidence base update for questionnaires of emotion regulation and reactivity for children and adolescents. Journal of Clinical Child & Adolescent Psychology, 50(6), 683–707. https://doi.org/10.1080/15374416.2021.1955372'
    },
    {
      id: 'nctsn',
      short: 'National Child Traumatic Stress Network: Trauma and loss reminders',
      url: 'https://www.nctsn.org/resources/trauma-reminders-infographic',
      apa: 'National Child Traumatic Stress Network. (2025). Trauma and loss reminders [Infographic].'
    },
    {
      id: 'gomez',
      short: 'Gomez et al. (2017): Sensory stimuli and regulation',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5733202/',
      apa: 'Gomez, I. N., Lai, C. Y. Y., Morato-Espino, P. G., Chan, C. C. H., & Tsang, H. W. H. (2017). Behavioural and autonomic regulation of response to sensory stimuli among children: A systematic review of relationship and methodology. BioMed Research International, 2017, Article 2629310. https://doi.org/10.1155/2017/2629310'
    },
    {
      id: 'de-los-reyes',
      short: 'De Los Reyes et al. (2015): Multi-informant perspectives',
      url: 'https://pubmed.ncbi.nlm.nih.gov/25915035/',
      apa: 'De Los Reyes, A., Augenstein, T. M., Wang, M., Thomas, S. A., Drabick, D. A. G., Burgers, D. E., & Rabinowitz, J. (2015). The validity of the multi-informant approach to assessing child and adolescent mental health. Psychological Bulletin, 141(4), 858–900. https://doi.org/10.1037/a0038498'
    }
  ];

  return {
    A, feelings, signals, happensItems, actionItems, selfHelpItems, selfHelpCatalog,
    otherHelpItems, otherHelpCatalog, broadPressure, pressureQuestion,
    pressureDomains, ratingChoices, recoveryPatterns, recoveryHelp, references,
    combinedSignalAsset: A(7), glorbAsset: A(2), allFacesAsset: A(1), ratingStripAsset: A(199)
  };
})();
