/*
  All the words and map data for the guide.
  Writing rules (from the Tech Map design system):
  plain headlines, short sentences, ~60 words before a break,
  define every term the first time, one bold "surprise" per pass at most.
*/

window.TECH_MAP = {
  totalPasses: 12,

  /* ---------- the map: every box and line, and the pass where it first appears ---------- */
  map: {
    width: 900,
    height: 640,
    nodes: {
      client: { from: 1, x: 40, y: 250, w: 150, h: 90,
        title: p => p < 2 ? 'You' : 'Your device',
        sub: p => p < 2 ? 'your browser' : 'the client',
        chips: p => p >= 3 ? ['HTML · CSS · JS'] : [] },
      server: { from: 1, x: 300, y: 236, w: 180, h: 128, kind: 'hub',
        title: p => p < 2 ? 'The internet' : 'A server',
        sub: p => p < 2 ? 'where things come from' : 'another computer',
        chips: p => [].concat(p >= 3 ? ['Back-end code'] : [], p >= 5 ? ['Framework'] : []) },
      db:     { from: 4,  x: 320, y: 430, w: 140, h: 64, title: () => 'Database', sub: () => 'saved information' },
      api:    { from: 7,  x: 650, y: 52,  w: 180, h: 68, title: () => 'Other services', sub: () => 'maps · email · payments' },
      phone:  { from: 8,  x: 40,  y: 392, w: 150, h: 64, title: () => 'Phone app', sub: () => 'another client' },
      dns:    { from: 10, x: 160, y: 108, w: 120, h: 58, title: () => 'DNS', sub: () => 'name → address' },
      ai:     { from: 11, x: 650, y: 180, w: 180, h: 72, title: () => 'AI model', sub: () => 'writes the reply' },
      tools:  { from: 11, x: 650, y: 420, w: 180, h: 64, title: () => 'Tools', sub: () => 'search · calendar', dashed: true },
      agent:  { from: 12, x: 40,  y: 562, w: 130, h: 52, title: () => 'AI agent', sub: () => 'writes code', compact: true },
      laptop: { from: 9,  x: 200, y: 562, w: 140, h: 52, title: () => 'Your laptop', sub: () => 'saves with Git', compact: true },
      github: { from: 9,  x: 370, y: 562, w: 130, h: 52, title: () => 'GitHub', sub: () => 'stores the code', compact: true }
    },
    links: {
      c_s:     { from: 1,  d: 'M 190 295 L 300 295', label: p => p >= 6 ? 'HTTP' : '', lx: 245, ly: 284 },
      s_db:    { from: 4,  d: 'M 390 364 L 390 430' },
      s_api:   { from: 7,  d: 'M 480 262 C 565 262, 565 86, 650 86' },
      ph_s:    { from: 8,  d: 'M 190 424 C 245 424, 245 336, 300 336' },
      c_dns:   { from: 10, d: 'M 115 250 C 115 168, 130 137, 160 137' },
      s_ai:    { from: 11, d: 'M 480 290 C 565 290, 565 216, 650 216' },
      s_tools: { from: 11, d: 'M 480 340 C 565 340, 565 452, 650 452', dashed: true },
      ag_lap:  { from: 12, d: 'M 170 588 L 200 588' },
      lap_gh:  { from: 9,  d: 'M 340 588 L 370 588' },
      gh_cloud:{ from: 10, d: 'M 435 562 L 435 524' }
    },
    regions: {
      cloud: { from: 10, x: 280, y: 196, w: 220, h: 328, label: 'THE CLOUD' },
      build: { from: 9,  x: 24,  y: 548, w: 496, h: 80,  label: 'HOW IT GETS BUILT' }
    }
  },

  /* ---------- the passes ---------- */
  passes: [
    {
      n: 1,
      title: 'The one-sentence web',
      headline: 'You ask for something. The internet sends it back.',
      body: [
        'Every time you open a website, the same simple thing happens.',
        'You ask for something, like a page, a photo or a video. It comes back to your screen.',
        'That is the whole story for now. Each pass adds one more piece to it.'
      ],
      words: [
        ['Web address', 'what you type to say where to go, like example.com. Also called a URL.']
      ],
      story: [
        ['You type a web address.', true],
        ['You ask for something.', true],
        ['It comes back to your screen.', true]
      ],
      steps: [
        { link: 'c_s', dir: 1, label: '1 · you ask', caption: 'You ask for a page.' },
        { link: 'c_s', dir: -1, label: '2 · it comes back', caption: 'The page comes back to your screen.' }
      ],
      check: {
        q: 'What can you ask the internet for?',
        options: ['Only web pages', 'Pages, photos, videos and more', 'Only files to download'],
        answer: 1,
        why: 'Anything you can see online started as a request like this one.'
      }
    },
    {
      n: 2,
      title: 'Clients and servers',
      headline: 'The internet is just other computers.',
      body: [
        'What you asked for doesn\'t come from "the internet". It comes from another computer, called a <strong>server</strong>. Its job is to answer requests, all day, every day.',
        'Your phone or laptop is the <strong>client</strong>. It\'s the one doing the asking.',
        '<strong>One surprise:</strong> the server doesn\'t have your page sitting ready. It does a bit of work to put it together first.'
      ],
      words: [
        ['Client', 'the device that asks, like your phone or laptop.'],
        ['Server', 'a computer whose job is to answer requests.']
      ],
      story: [
        ['You type a web address.', false],
        ['Your device sends the request to a server.', true],
        ['The server does some work.', true],
        ['It sends the answer back to your screen.', false]
      ],
      steps: [
        { link: 'c_s', dir: 1, label: '1 · you ask', caption: 'Your device sends a request to a server.' },
        { node: 'server', label: '2 · server works', caption: 'The server puts the page together.' },
        { link: 'c_s', dir: -1, label: '3 · answer comes back', caption: 'The finished page comes back to you.' }
      ],
      check: {
        q: 'On the map, tap the computer that does the work before answering.',
        node: 'server',
        why: 'The server does the work. Your device only asks and shows the result.'
      }
    }
  ],

  nextUp: [
    'Front end and back end', 'Databases', 'Frameworks and libraries', 'HTTP', 'APIs',
    'Phone apps', 'Git and GitHub', 'The cloud', 'AI is just another API', 'When the code writes itself'
  ]
};
