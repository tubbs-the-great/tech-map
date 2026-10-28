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
      server: { from: 1, x: 300, y: p => 295 - (p >= 5 ? 64 : p >= 3 ? 52 : 43), w: 180, h: p => p >= 5 ? 128 : p >= 3 ? 104 : 86, kind: 'hub',
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
      c_s:     { from: 1,  ends: ['client','server'], d: 'M 190 295 L 300 295', label: p => p >= 6 ? 'HTTP' : '', lx: 245, ly: 284 },
      s_db:    { from: 4,  ends: ['server','db'], d: 'M 390 352 L 390 430' },
      s_api:   { from: 7,  ends: ['server','api'], d: 'M 480 262 C 565 262, 565 86, 650 86' },
      ph_s:    { from: 8,  ends: ['phone','server'], d: 'M 190 424 C 245 424, 245 336, 300 336' },
      c_dns:   { from: 10, ends: ['client','dns'], d: 'M 115 250 C 115 168, 130 137, 160 137' },
      s_ai:    { from: 11, ends: ['server','ai'], d: 'M 480 290 C 565 290, 565 216, 650 216' },
      s_tools: { from: 11, ends: ['server','tools'], d: 'M 480 340 C 565 340, 565 452, 650 452', dashed: true },
      ag_lap:  { from: 12, ends: ['agent','laptop'], d: 'M 170 588 L 200 588' },
      lap_gh:  { from: 9,  ends: ['laptop','github'], d: 'M 340 588 L 370 588' },
      gh_cloud:{ from: 10, ends: ['github','db'], d: 'M 435 562 L 435 524' }
    },
    regions: {
      cloud: { from: 10, x: 280, y: 196, w: 220, h: 328, label: 'THE CLOUD' },
      build: { from: 9,  x: 24,  y: 548, w: 640, h: 80,  label: 'HOW IT GETS BUILT', labelAt: 'right' }
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
    },
    {
      n: 3,
      title: 'Front end and back end',
      headline: 'Your screen speaks three languages. The server speaks others.',
      body: [
        'A browser only understands three languages. <strong>HTML</strong> says where things go. <strong>CSS</strong> says what they look like. <strong>JavaScript</strong> says what they do when you click.',
        'Every other language you\'ve heard of, like Python, runs on the server instead.',
        'So there are two halves. The part that runs on your device is the <strong>front end</strong>. The part that runs on the server is the <strong>back end</strong>.'
      ],
      words: [
        ['Front end', 'the code that runs on your device and draws what you see.'],
        ['Back end', 'the code that runs on the server and does the work.']
      ],
      peek: { label: 'See one button in all three browser languages', code: '<!-- HTML: where it goes -->\n<button>Click me</button>\n\n/* CSS: what it looks like */\nbutton { background: navy; color: white; }\n\n// JavaScript: what it does\nbutton.onclick = () => alert("You clicked!");' },
      story: [
        ['Your device sends the request to a server.', false],
        ['The server runs back-end code to do the work.', true],
        ['It sends back HTML, CSS and JavaScript.', true],
        ['Your device runs that front-end code and shows the page.', true]
      ],
      steps: [
        { link: 'c_s', dir: 1, label: '1 · you ask', caption: 'Your device asks the server for a page.' },
        { node: 'server', label: '2 · back end runs', caption: 'Back-end code on the server builds the page.' },
        { link: 'c_s', dir: -1, label: '3 · front end arrives', caption: 'HTML, CSS and JavaScript come back and run on your device.' }
      ],
      check: { q: 'Tap the box where Python code runs.', node: 'server', why: 'Browsers only run HTML, CSS and JavaScript. Python is back-end code, so it runs on the server.' }
    },
    {
      n: 4,
      title: 'Databases',
      headline: 'The server keeps a giant spreadsheet.',
      body: [
        'Most of the server\'s work involves a <strong>database</strong>. Think of it as a huge collection of spreadsheets. It holds users, posts, messages, orders, anything the app needs to remember.',
        'When you open someone\'s profile, the server doesn\'t have that page ready. It reads the web address, finds the right row in the database, and builds the page from it.',
        '<strong>One surprise:</strong> every page you see was assembled from rows like these, moments before it arrived.'
      ],
      words: [
        ['Database', 'where an app stores everything it needs to remember.'],
        ['JSON', 'a simple text format for passing information between computers. You\'ll see it again.']
      ],
      peek: { label: 'See one user as a row, then as JSON', code: 'username | first_name | last_name | email\nspike    | William    | Pratt     | wpratt@sunnyd.com\n\n{\n  "username": "spike",\n  "first_name": "William",\n  "last_name": "Pratt",\n  "email": "wpratt@sunnyd.com"\n}' },
      story: [
        ['Your device asks for a page, such as someone\'s profile.', false],
        ['The server looks in its database.', true],
        ['It finds the right row and builds the page from it.', true],
        ['It sends the page back to your device.', false]
      ],
      steps: [
        { link: 'c_s', dir: 1, label: '1 · you ask', caption: 'You ask for William\'s profile page.' },
        { link: 's_db', dir: 1, label: '2 · look it up', caption: 'The server looks for the row where username is "spike".' },
        { link: 's_db', dir: -1, label: '3 · row found', caption: 'The database sends William\'s row back.' },
        { link: 'c_s', dir: -1, label: '4 · page built', caption: 'The server builds the page from that row and sends it to you.' }
      ],
      check: { q: 'Tap the box where the list of users is kept.', node: 'db', why: 'User records live in the database. The server reads from it to build each page.' }
    },
    {
      n: 5,
      title: 'Frameworks and libraries',
      headline: 'Nobody builds from scratch.',
      body: [
        'A <strong>library</strong> is a piece of code someone else wrote to solve one problem, like sending email or formatting dates. You pick one up when you need it.',
        'A <strong>framework</strong> is much bigger. It\'s a whole structure you build inside of, chosen before the first line of code. React, Next.js, Django and Rails are frameworks.',
        'Much of this code is <strong>open source</strong>: free, public, and maintained by people around the world. When someone asks "what\'s your stack?", they mostly mean "which framework?"'
      ],
      words: [
        ['Library', 'borrowed code that solves one problem.'],
        ['Framework', 'a big structure you build your whole app inside.'],
        ['Open source', 'code anyone can read, use and improve for free.']
      ],
      story: [
        ['Your device asks for a page and the server receives it.', false],
        ['The framework decides which code should run.', true],
        ['That code uses libraries to do its work.', true],
        ['It talks to the database, then sends the page back.', false]
      ],
      steps: [
        { link: 'c_s', dir: 1, label: '1 · you ask', caption: 'Your device asks for a page.' },
        { node: 'server', label: '2 · framework routes', caption: 'The framework sends the request to the right code, which uses libraries.' },
        { link: 's_db', dir: 1, label: '3 · look it up', caption: 'That code asks the database for what it needs.' },
        { link: 's_db', dir: -1, label: '4 · data back', caption: 'The rows come back.' },
        { link: 'c_s', dir: -1, label: '5 · page back', caption: 'The finished page goes to your device.' }
      ],
      check: { q: 'Which one do teams usually pick before writing any code?', options: ['A library', 'A framework', 'An open-source license'], answer: 1, why: 'A framework shapes the whole app, so it comes first. Libraries get picked up along the way.' }
    },
    {
      n: 6,
      title: 'HTTP: how the web talks',
      headline: 'Every request follows the same rules.',
      body: [
        'When two computers talk, they agree on a set of rules first. That set of rules is called a <strong>protocol</strong>. The web\'s protocol is <strong>HTTP</strong>. It\'s the "http" at the start of every web address.',
        'Two kinds of request matter most. <strong>GET</strong> asks for something, like a page. <strong>POST</strong> sends something to be saved, like a sign-up form.',
        'The <strong>S</strong> in <strong>HTTPS</strong> means the conversation is scrambled so nobody in between can read it.'
      ],
      words: [
        ['Protocol', 'the rules two computers agree to follow when they talk.'],
        ['GET', 'a request that asks for something.'],
        ['POST', 'a request that sends something to be saved.']
      ],
      peek: { label: 'See a GET and a POST request', code: 'GET /users/spike\nHost: www.socialsite.com\n\nPOST /signup\nHost: www.socialsite.com\n\n{ "email": "new.person@example.com", "name": "Sam" }' },
      story: [
        ['Your device sends an HTTP request: GET to ask, POST to send.', true],
        ['The server runs its code and talks to the database.', false],
        ['The server sends back an HTTP response.', true],
        ['Your device runs the front-end code and shows the result.', false]
      ],
      steps: [
        { link: 'c_s', dir: 1, label: '1 · HTTP GET', caption: 'Your device sends a GET request for /users/spike.' },
        { link: 's_db', dir: 1, label: '2 · look it up', caption: 'The server looks up the user.' },
        { link: 's_db', dir: -1, label: '3 · row found', caption: 'The row comes back.' },
        { link: 'c_s', dir: -1, label: '4 · HTTP response', caption: 'The page comes back over a scrambled HTTPS connection.' }
      ],
      check: { q: 'You fill in a sign-up form and press Submit. What kind of request is that?', options: ['GET', 'POST'], answer: 1, why: 'You\'re sending information to be saved, so it\'s a POST.' }
    },
    {
      n: 7,
      title: 'APIs: servers talking to servers',
      headline: 'Your app asks other companies for help.',
      body: [
        'Servers rarely work alone. To show a map, send an email or take a payment, your server asks another company\'s server for help. It does that through an <strong>API</strong>.',
        'An API is like a website built for computers instead of people. It uses the same HTTP requests you just learned. But computers don\'t need a pretty page, so the answer comes back as plain data, in <strong>JSON</strong>.',
        'You never see these conversations. They happen behind the scenes, thousands of times a second.'
      ],
      words: [
        ['API', 'a way for one computer to ask another for something. A website for machines.'],
        ['JSON', 'the plain-text format computers use to hand each other data.']
      ],
      peek: { label: 'See a server ask a weather service for data', code: 'GET https://api.weather.com/current?city=Austin\n\n{\n  "city": "Austin",\n  "temperature": 87,\n  "condition": "Sunny"\n}' },
      story: [
        ['Your device sends an HTTP request to the server.', false],
        ['The server runs its code and talks to the database.', false],
        ['It may also ask other companies\' services through their APIs.', true],
        ['Those services answer with JSON data.', true],
        ['The server builds the page and sends it back to you.', false]
      ],
      steps: [
        { link: 'c_s', dir: 1, label: '1 · you ask', caption: 'You ask a travel site for directions.' },
        { link: 's_db', dir: 1, label: '2 · look it up', caption: 'The server loads your saved places.' },
        { link: 's_db', dir: -1, label: '3 · data back', caption: 'Your places come back.' },
        { link: 's_api', dir: 1, label: '4 · ask a service', caption: 'The server asks a maps company\'s API for a route.' },
        { link: 's_api', dir: -1, label: '5 · JSON back', caption: 'The route comes back as JSON.' },
        { link: 'c_s', dir: -1, label: '6 · page back', caption: 'The server builds the page and sends it to you.' }
      ],
      check: { q: 'Tap the box your server uses to send an email or get directions.', node: 'api', why: 'Email and maps come from other companies\' servers, reached through their APIs.' }
    },
    {
      n: 8,
      title: 'Phone apps',
      headline: 'Phone apps ask for data, not pages.',
      body: [
        'Phone apps follow the same loop, with one twist. When you install an app, you download its whole front end once. All the screens are already on your phone.',
        'So when you tap a button, the app doesn\'t ask the server for a new page. It asks for <strong>data</strong>, usually as JSON, and draws the screen itself.',
        '<strong>One surprise:</strong> downloading an app from the app store is really just downloading its front end.'
      ],
      words: [
        ['Phone app', 'a client whose front end is installed on your phone.']
      ],
      peek: { label: 'See what a messaging app gets back', code: '{\n  "conversation_id": 123,\n  "messages": [\n    { "sender": "Sara", "text": "Are we meeting at 6?" },\n    { "sender": "David", "text": "Yes, see you then." }\n  ]\n}' },
      story: [
        ['The app\'s front end already lives on your phone.', true],
        ['It sends HTTP requests to the server.', true],
        ['The server talks to the database and answers with JSON data.', true],
        ['The app draws the screen from that data. Same loop, different device.', true]
      ],
      steps: [
        { link: 'ph_s', dir: 1, label: '1 · app asks', caption: 'You tap a conversation. The app asks for its messages.' },
        { link: 's_db', dir: 1, label: '2 · look it up', caption: 'The server looks up conversation 123.' },
        { link: 's_db', dir: -1, label: '3 · messages found', caption: 'The messages come back.' },
        { link: 'ph_s', dir: -1, label: '4 · JSON back', caption: 'Only data returns. The app draws the chat bubbles itself.' }
      ],
      check: { q: 'You tap a conversation in a messaging app. What does the server send back?', options: ['A whole new page', 'Just the data, as JSON', 'A fresh copy of the app'], answer: 1, why: 'The app already has its screens. It only needs the data.' }
    },
    {
      n: 9,
      title: 'Git and GitHub',
      headline: 'Before anyone uses an app, someone builds it.',
      body: [
        'Everything so far is how software <em>runs</em>. This pass is about how it gets <em>built</em>.',
        '<strong>Git</strong> is a tool on a developer\'s own computer. It saves checkpoints of a project, called <strong>commits</strong>, so you can see what changed and go back if something breaks. Think "undo" for a whole project.',
        '<strong>GitHub</strong> is a website that stores those projects online so a team can share them. Sending your commits there is called "pushing".'
      ],
      words: [
        ['Git', 'a tool that saves checkpoints of a project on your own computer.'],
        ['Commit', 'one saved checkpoint, with a note about what changed.'],
        ['GitHub', 'a website that stores projects online for teams.']
      ],
      story: [
        ['A developer writes code on their laptop.', true],
        ['Git saves each checkpoint as a commit.', true],
        ['The code is pushed to GitHub, where the team can see it.', true],
        ['When a user visits the app, Git and GitHub aren\'t involved. They mattered earlier.', true]
      ],
      steps: [
        { node: 'laptop', label: '1 · commit', caption: 'A developer saves a checkpoint with Git.' },
        { link: 'lap_gh', dir: 1, label: '2 · push', caption: 'The commits go up to GitHub.' },
        { node: 'github', label: '3 · shared', caption: 'The team can now see and review the change.' }
      ],
      check: { q: 'Tap where Git keeps a project\'s history while someone is working on it.', node: 'laptop', why: 'Git runs on the developer\'s own computer. GitHub is the online copy.' }
    },
    {
      n: 10,
      title: 'The cloud',
      headline: 'The cloud is just someone else\'s computer.',
      body: [
        'Servers live in huge buildings full of computers called data centers. Almost nobody owns their own anymore. Instead they rent from companies like Amazon, Microsoft and Google. That\'s all <strong>the cloud</strong> means.',
        'Two more pieces. Before your device can reach a server, <strong>DNS</strong>, the internet\'s phone book, turns a name like example.com into the server\'s numeric address. And to put an app in front of users, its code is copied from GitHub onto a rented server. That\'s called <strong>deploying</strong>.',
        '<strong>One surprise:</strong> passwords and secret keys never go in the code. They stay on the server, in settings only it can read.'
      ],
      words: [
        ['The cloud', 'servers you rent from a big provider instead of owning.'],
        ['DNS', 'the phone book that turns a website\'s name into an address.'],
        ['Deploy', 'copy the code onto a server so real people can use it.']
      ],
      story: [
        ['You type a web address. DNS turns it into a server\'s address.', true],
        ['That server is rented from a cloud provider.', true],
        ['The code got there by being pushed to GitHub and deployed.', true],
        ['The server runs its code, uses its database and APIs, and sends the page back.', false]
      ],
      steps: [
        { link: 'lap_gh', dir: 1, label: '1 · push', caption: 'New code goes to GitHub.' },
        { link: 'gh_cloud', dir: 1, label: '2 · deploy', caption: 'The code is copied onto a server in the cloud.' },
        { link: 'c_dns', dir: 1, label: '3 · ask DNS', caption: 'Your device asks DNS where example.com lives.' },
        { link: 'c_dns', dir: -1, label: '4 · address back', caption: 'DNS answers with the server\'s address.' },
        { link: 'c_s', dir: 1, label: '5 · you ask', caption: 'Your device sends the request to that server.' },
        { link: 'c_s', dir: -1, label: '6 · page back', caption: 'The page comes back to you.' }
      ],
      check: { q: 'Tap the box that turns a website\'s name into an address.', node: 'dns', why: 'DNS is the internet\'s phone book. Names in, addresses out.' }
    },
    {
      n: 11,
      title: 'AI is just another API',
      headline: 'Talking to AI is just sending a message to another computer.',
      body: [
        'The AI lives on a server far away. The app sends it your message, the same way it asks a maps service for directions. The AI sends back a reply.',
        'The AI itself is a <strong>model</strong>: a program trained on a huge amount of text, so it can predict what words should come next. It doesn\'t look facts up, so it can be confidently wrong.',
        '<strong>One surprise:</strong> the AI doesn\'t remember you. The app saves your chat in its database and re-sends the whole thing every single time. That\'s why very long chats eventually hit a limit.',
        'When the AI needs to <em>do</em> something, like check a calendar, it asks the app to run a <strong>tool</strong>. An AI that keeps using tools until a job is done is called an <strong>agent</strong>.'
      ],
      words: [
        ['AI model', 'the program that writes the replies.'],
        ['Tool', 'something the AI can ask the app to do, like a search.'],
        ['Agent', 'an AI that keeps going, step by step, until a task is done.']
      ],
      peek: { label: 'See what the app actually sends to the AI', code: '{\n  "system": "You are a helpful assistant for a bookstore.",\n  "messages": [\n    { "role": "user", "content": "Any books on gardening?" },\n    { "role": "assistant", "content": "Yes! Here are three..." },\n    { "role": "user", "content": "Which is best for beginners?" }\n  ],\n  "tools": ["search_inventory"]\n}' },
      story: [
        ['You type a message. Your device sends it to the app\'s server.', false],
        ['The server loads your earlier messages from its database.', true],
        ['It sends them all to the AI model, as JSON.', true],
        ['If the AI asks for a tool, the server runs it and reports back.', true],
        ['The reply comes back and appears on your screen.', false]
      ],
      steps: [
        { link: 'c_s', dir: 1, label: '1 · you ask', caption: 'You ask the bookstore\'s assistant a question.' },
        { link: 's_db', dir: 1, label: '2 · old chats', caption: 'The server loads your conversation so far.' },
        { link: 's_db', dir: -1, label: '3 · history back', caption: 'Your earlier messages come back.' },
        { link: 's_ai', dir: 1, label: '4 · sent to AI', caption: 'The server sends the whole chat to the AI model.' },
        { link: 's_ai', dir: -1, label: '5 · AI asks for a tool', caption: 'The AI asks to search the bookstore\'s inventory.' },
        { link: 's_tools', dir: 1, label: '6 · tool runs', caption: 'The server runs the search.' },
        { link: 's_tools', dir: -1, label: '7 · result', caption: 'Matching books come back.' },
        { link: 's_ai', dir: 1, label: '8 · result to AI', caption: 'The server hands the results to the AI.' },
        { link: 's_ai', dir: -1, label: '9 · reply', caption: 'The AI writes its reply.' },
        { link: 'c_s', dir: -1, label: '10 · you see it', caption: 'The reply appears on your screen.' }
      ],
      check: { q: 'An AI assistant needs to check your calendar. Tap the box that actually does the checking.', node: 'server', why: 'The AI can only ask. The app\'s server does the real work and passes the result back.' }
    },
    {
      n: 12,
      title: 'When the code writes itself',
      headline: 'AI builds the same map you just learned.',
      body: [
        'AI coding tools don\'t make anything magical. They build exactly what\'s on this map: a front end, a back end, a database, some libraries and APIs, and a deployment to the cloud.',
        'A coding <strong>agent</strong> is the last pass pointed at a project. It reads the files, writes code, runs it, sees errors, and fixes them, in a loop.',
        'That makes this map your checklist. Ask for what you want using its words. When something breaks, say <em>where</em>: front end, back end, database, API or deployment. Save a checkpoint before big changes, so Git can undo them.',
        '<strong>Where AI most often slips:</strong> secret keys put in the front end where anyone can read them, apps that check who you are but not what you\'re allowed to do, and rules enforced only on your device, where a user can change them.'
      ],
      words: [
        ['Vibe coding', 'describing what you want in plain words and letting AI write the code.'],
        ['Coding agent', 'an AI that reads, writes and tests code in your project until it works.']
      ],
      peek: { label: 'See a vague request next to a clear one', code: 'Vague:\n  "Make me a website for my bakery where people can order cakes."\n\nClear:\n  "Build a Next.js front end with a simple Node back end.\n   Store orders in a managed database.\n   Send confirmations through an email API.\n   Keep all secret keys in server settings, never in the code."' },
      story: [
        ['You describe what you want to an AI coding agent.', true],
        ['It writes the front end, back end and database code.', true],
        ['You review it, save a checkpoint with Git, and push to GitHub.', false],
        ['It\'s deployed to the cloud, and users\' requests start the loop again.', false]
      ],
      steps: [
        { node: 'agent', label: '1 · describe', caption: 'You tell the agent what to build.' },
        { link: 'ag_lap', dir: 1, label: '2 · write', caption: 'The agent writes code in your project.' },
        { node: 'laptop', label: '3 · commit', caption: 'You review the change and save a checkpoint.' },
        { link: 'lap_gh', dir: 1, label: '4 · push', caption: 'The code goes to GitHub.' },
        { link: 'gh_cloud', dir: 1, label: '5 · deploy', caption: 'It goes live in the cloud.' },
        { link: 'c_s', dir: 1, label: '6 · a user asks', caption: 'A user visits the new feature.' },
        { link: 'c_s', dir: -1, label: '7 · the loop again', caption: 'The loop you know begins again.' }
      ],
      check: { q: 'An AI-built shop checks discount codes only in the browser. Why is that risky?', options: ['Browsers are too slow to check codes', 'Anything on the user\'s own device can be changed by the user', 'Discount codes have to be stored on GitHub'], answer: 1, why: 'Anything on the client can be read or changed by the person using it. Important rules belong on the server.' }
    }
  ],

  closing: {
    headline: 'The tools will keep changing. The machine underneath won\'t.',
    intro: 'New AI models, tools and buzzwords arrive every week. Nobody can follow all of it, and you don\'t need to. When you hear about a new one, ask five questions and place it on the map.',
    questions: [
      ['Where does it sit on the map?', 'A new device, a new AI model, a new tool, a new cloud service, a new framework? Almost everything fits somewhere.'],
      ['What does it send, and to whom?', 'Where does your data go, and whose servers handle it?'],
      ['What can it actually do?', 'Only write text, or also send email, edit files or spend money? The more it can do, the more its permissions matter.'],
      ['What does it remember?', 'Just this conversation, or information about you kept in a database over time?'],
      ['What changed, really?', 'A genuinely new ability, or a faster, cheaper, better-packaged version of something that existed?']
    ],
    wholeStory: [
      'You type a web address or tap an app. DNS finds the server, which is rented in the cloud.',
      'Your device sends an HTTP request: GET to ask, POST to send.',
      'The server runs back-end code, built on a framework and libraries.',
      'It reads and writes its database, and asks other services, including AI models, through APIs. They answer in JSON.',
      'It sends back a page for a browser, or data for an app, and your device shows it.',
      'Behind the scenes, people and AI wrote the code, Git saved it, GitHub stored it, and it was deployed.'
    ]
  },

  glossary: [
    ['Agent', 'An AI that keeps working step by step, using tools, until a task is done.'],
    ['AI model', 'The program that writes AI replies. Trained on huge amounts of text to predict what comes next.'],
    ['API', 'A way for one computer to ask another for something. A website built for machines.'],
    ['Back end', 'The code that runs on the server and does the work.'],
    ['Client', 'The device that asks: your phone, laptop or browser.'],
    ['Cloud', 'Servers and databases you rent from a big provider such as Amazon, Microsoft or Google.'],
    ['Commit', 'One saved checkpoint of a project, with a note about what changed.'],
    ['CSS', 'The browser language that says what things look like.'],
    ['Database', 'Where an app stores everything it needs to remember.'],
    ['Deploy', 'Copy code onto a server so real people can use it.'],
    ['DNS', 'The internet\'s phone book. Turns a name like example.com into a server\'s address.'],
    ['Framework', 'A large structure you build a whole app inside, such as React or Django.'],
    ['Front end', 'The code that runs on your device and draws what you see.'],
    ['GET', 'An HTTP request that asks for something.'],
    ['Git', 'A tool that saves checkpoints of a project on a developer\'s own computer.'],
    ['GitHub', 'A website that stores Git projects online so teams can share them.'],
    ['HTML', 'The browser language that says where things go on a page.'],
    ['HTTP / HTTPS', 'The rules browsers and servers use to talk. The S means the conversation is scrambled.'],
    ['JavaScript', 'The browser language that says what things do. Also runs on servers.'],
    ['JSON', 'A simple text format computers use to hand each other data.'],
    ['Library', 'Borrowed code that solves one problem, like sending email.'],
    ['Open source', 'Code anyone can read, use and improve for free.'],
    ['POST', 'An HTTP request that sends something to be saved.'],
    ['Protocol', 'The rules two computers agree to follow when they talk.'],
    ['Secret key', 'A password an app uses to call a service. It stays on the server, never in front-end code.'],
    ['Server', 'A computer whose job is to answer requests.'],
    ['Tool', 'Something an AI can ask the app to do, like a search or sending an email.'],
    ['Vibe coding', 'Describing what you want in plain words and letting AI write the code.']
  ]
};
