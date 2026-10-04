// All content for the site. Edit this file to change what's on the page — src/main.js just renders it.
// Anywhere text is shown you can write a link as [label](https://url), same as on the resume.
export const owner = {
    name: 'Arjan Khadka',
    short: 'Arjan',
    github: 'https://github.com/Azaxek',
    linkedin: 'https://www.linkedin.com/in/arjan-khadka-598386305/',
    email: 'arjank898@gmail.com',
}

export const hero = {
    photo: null, // set to '/photo.jpg' (drop the file in public/) to show a real photo next to the bio
    kicker: 'Paris, Texas · Class of 2027',
    bio: [
        'Hi, I’m ', { b: 'Arjan' },
        ' — a student researcher, civic-tech builder, and community organizer.',
    ],
    tagline: 'My goal is to minimize structural violence, using technology and speech to get there.',
    epigraph: { text: 'Do what you can, with what you have, where you are.', by: 'Theodore Roosevelt' },
    stats: [
        { n: 4000, suf: '+', label: 'teams worldwide — 1st place at Purple Comet, Mixed Division' },
        { n: 1200, suf: '+', label: 'members in Olympiads Democratized' },
        { n: 1000, suf: '+', label: 'hygiene products given out in Paris, TX' },
        { n: 120000, suf: '+', label: 'users reached organically at SYNK' },
    ],
}

export const education = [
    {
        title: 'Paris High School', meta: 'Paris, TX · Aug 2023 – May 2027',
        bullets: [
            'Unweighted GPA 4.0/4.0',
            '[AP Language & Composition](photo:ap-lang): 5',
            '[AP Literature & Composition](photo:ap-lit): 5',
            'Taking AP Calculus and AP Chemistry',
        ],
    },
    {
        title: 'Community service', meta: 'Volunteer hours',
        bullets: [
            '[Project New Hope](https://texas-biz.com/co/project-new-hope-inc) (Co-President / Co-Founder): 60+ hrs · grades 10–12',
            'Tutoring & college advising: 172 hrs · grades 11–12',
            'Paris Regional Health: 80 hrs across 2021 – 2024 (40 of them in summer 2023)',
            'National Honor Society: 30 hrs · grades 11–12',
            'Upward Bound summer volunteering: 40 hrs · grades 10–11',
        ],
    },
]

// status: 'live' | 'testing' | 'research' | 'built'
export const projects = [
    {
        name: 'Game Theory Analysis of Beefing vs. Collaboration', status: 'research',
        tagline: 'A published preprint on content-creator feuds',
        body: 'Published a preprint that has 3+ citations. Learned multivariable calculus along the way — and that collaboration is better than beefing for content creators.',
        facts: ['May 2025 – July 2026'],
        links: [{ label: 'Read the preprint', url: 'https://arxiv.org/pdf/2506.05373' }],
    },
    {
        name: 'OpenTip', status: 'testing',
        tagline: 'An open-source, free alternative to the P3 Tipping app',
        body: 'A completely free-to-set-up-and-use application with all the same features as the P3 Tipping app, which costs over $10,000. Releasing in February 2027.',
        facts: ['February 2026 – Present', 'Built as part of being a Texas Crime Stoppers Ambassador'],
        tags: ['Open source', 'Public safety'],
        links: [{ label: 'Code on GitHub', url: 'https://github.com/Azaxek/OpenTip-Tipping-Application' }],
    },
    {
        name: 'Flux', status: 'built',
        tagline: 'An AI-powered traffic light system — my Diamond Challenge submission',
        body: 'An AI-powered traffic light system trained to fit inside any camera a locality already has.',
        facts: ['November 2025 – March 2026', 'Diamond Challenge semifinalist'],
        tags: ['AI', 'Civic tech'],
        links: [{ label: 'Code on GitHub', url: 'https://github.com/Azaxek/FlowState' }],
    },
    {
        name: 'Vulnerability testing on GitHub', status: 'built',
        tagline: 'Reported 120+ vulnerabilities across 50 GitHub repositories',
        body: 'Used SAST (Static Application Security Testing) to find vulnerabilities across popular, weekly-trending GitHub repositories and reported them to the maintainers.',
        facts: ['October 2025 – August 2026'],
        tags: ['Security', 'SAST'],
    },
    {
        name: 'FocusGuard', status: 'built',
        tagline: 'A deterministic application to keep you from getting distracted',
        body: '20+ users, distributed as a .exe file through personal Gmail accounts.',
        facts: ['June 2026 – July 2026'],
    },
    {
        name: 'AP Chemistry Question Database', status: 'live',
        tagline: 'Practice questions for AP Chemistry — I maintain it',
        body: 'Documented every AP packet the AP Chem instructor handed out and put them into a database for practice. Used a script to scrape the internet for more AP-style questions, and added 800+ questions across all of AP Chemistry.',
        facts: ['August 2026 – Present'],
        tags: ['Education', 'Scraping'],
    },
    {
        name: 'NextStep', status: 'live',
        tagline: 'An AI career coach for students',
        body: 'A web platform, built for the Congressional App Challenge, that lets students explore possible career paths with AI guidance.',
        facts: ['TypeScript + AI integration', 'Congressional App Challenge 2025'],
        tags: ['TypeScript', 'AI', 'Education'],
        links: [{ label: 'Open NextStep', url: 'https://thenextstep.vercel.app/' }],
    },
    {
        name: 'OpenCouncil', status: 'built',
        tagline: 'Paris, Texas city council meetings, in plain English',
        body: 'Fetches Paris, Texas city council agendas and minutes, summarizes them with an LLM, and shows them in a web app so residents can follow what their city is doing and when to speak up.',
        facts: ['LLM summaries (DeepSeek), Supabase database, deployed on Vercel', 'Public repository on GitHub'],
        tags: ['Civic tech', 'LLM summarization'],
        links: [{ label: 'Code on GitHub', url: 'https://github.com/Azaxek/OpenCouncil' }],
    },
]

export const experience = [
    {
        title: 'Crime Stoppers Ambassador', meta: '[Texas Association for Crime Stoppers](https://myparistexas.com/paris-isd-students-earn-top-honors-at-texas-crime-stoppers-conference/) · Feb 2026 – Present · grades 11–12',
        bullets: [
            'Ambassador for the state of Texas — 1 of 12.',
            'Developed a free, open-source alternative to the P3 Tipping app to make that kind of technology more accessible (see OpenTip).',
            'Reached 1,000+ kids across Paris, Texas with the Crime Stoppers “Stop Crime” video series.',
        ],
        tags: ['Public safety', 'Community outreach'],
    },
    {
        title: 'Marketing Intern (unpaid)', meta: 'Synk.today · Mar – Jul 2026 · remote',
        bullets: ['Reached 120,000+ users organically on platforms such as Reddit.'],
    },
    {
        title: 'Website Operations', meta: 'RISE Tennis · Feb – May 2026',
        bullets: [
            'Built and ran the organization’s website.',
            'Developed a plan to accept donations digitally and to request old tennis equipment be donated.',
        ],
    },
    {
        title: 'Tutor & college advisor', meta: 'Grades 11–12 · 172 hours',
        body: 'One-on-one and small-group math tutoring, and guiding peers through applications, scholarships and test prep.',
    },
]

export const leadership = [
    {
        title: 'Olympiads Democratized', meta: 'President / Founder · grades 10–12',
        bullets: [
            'Founded an Olympiad equity org after failing the USAPhO qualifier, and set up a [completely anonymous Discord server](photo:olympiads).',
            'Recruited 10+ mentors (USAMO / USAPhO / USACO) and grew the server to 1,200+ members.',
            'Active members self-reported 20 USAMO and 12 USAPhO qualifiers in the last olympiad season.',
        ],
        tags: ['Education', 'Community'],
    },
    {
        title: 'Project New Hope', meta: 'Co-President / Co-Founder · grades 10–12 · Paris, TX',
        body: 'Works with local entities to serve people in Paris, Texas who need hygiene products. [More on Project New Hope](https://texas-biz.com/co/project-new-hope-inc).',
        bullets: ['Ran a hygiene drive that gave 1,000+ essential products to homeless and low-income neighbors.', '60+ volunteer hours.'],
    },
    {
        title: 'VEX Robotics', meta: 'Team Lead (9–12) · Vice President (11–12) · Member (9–10)',
        bullets: [
            'Led the team to state 2x.',
            'Organized meetings and helped our sister team qualify for regionals.',
            'Mentored 10+ underclassmen in proper building, notebooking, and programming fundamentals.',
            '[Won the Judges’ Award.](photo:robotics)',
        ],
    },
    {
        title: 'UIL Speech & Debate', meta: 'Member (9–10) · President (11–12)',
        bullets: [
            'One-on-one coached 10+ debaters by debating them and giving individualized feedback.',
            'Ran weekly meetings.',
            '[Helped 4+ members advance to regionals.](photo:debate)',
        ],
    },
    {
        title: 'Future Problem Solving', meta: 'Team Captain · grades 9–12',
        bullets: [
            'Led the team to 4 state qualifications and [1 international qualification](https://www.txfpsp.org/competitionresults/2024resultsstate/).',
            'Mentored new members on the challenge and solution-writing formats that score the most points.',
            '[Also competed in Scenario Writing and earned 1 international qualification.](photo:fps)',
        ],
    },
    {
        title: 'Band', meta: 'Member (9–10) · Section Leader (10–11) · bass clarinet',
        bullets: [
            'Mentored 5+ underclassmen.',
            'Helped the band qualify for marching regionals 3x and for marching state 1x.',
            'Led 2+ low reed and brass sectionals.',
        ],
    },
    {
        title: 'NAEIF', meta: 'Steering Committee Member · grades 11–12',
        bullets: [
            '[North American Educational Initiatives Foundation](https://naeif.org/student-steering-committee/) student steering committee.',
            'Presented a lecture on democracy and its pros and cons.',
            'Led committee voting 2x and helped organize meetings and virtual conferences 3x.',
        ],
    },
    {
        title: 'Spanish Honor Society', meta: 'Vice President · grades 10–11',
        bullets: [
            'Helped organize 4+ meetings and organized voting for the next officers.',
            '[Inducted 30+ students into Spanish Honor Society.](photo:spanish-honor-society)',
        ],
    },
    {
        title: 'CatGut', meta: 'Vice Captain · grade 12',
        bullets: [
            'Helped organize 5+ meetings.',
            'Passed information along to 3 members who didn’t have access to Snapchat.',
            '[Taught 4 new members the duties of being in the org.](photo:catgut)',
        ],
    },
    {
        title: 'At school', meta: 'Paris High School',
        bullets: [
            'Crime Stoppers chapter Treasurer (2024 – Present).',
            'Key Club (2023 – Present).',
        ],
    },
    { title: 'Bayar Fellowship', meta: 'Completed · 2026', body: 'Professional-growth fellowship organized by Esat Bayar.' },
]

export const honors = {
    ticker: [
        'Purple Comet: 1st place, Mixed Division', 'USA Physics Olympiad qualifier', 'US National Chemistry Olympiad qualifier',
        'Genes In Space: Honorable Mention', 'Future Problem Solving: 3rd place state', 'Diamond Challenge semifinalist',
        'UIL Debate: district winner 2x', 'VEX Robotics: state qualifier 2x', 'National Merit Commended', 'Carson Scholar',
    ],
    groups: [
        {
            title: 'Competitions',
            bullets: [
                '[Purple Comet Competition](https://purplecomet.org/results/2026): 1st place, Mixed Division — out of 4,000+ teams worldwide (team Radix Sort, Paris High). Grade 11.',
                '[USA Physics Olympiad qualifier](https://aapt.org/physicsteam/2026/upload/2026-USAPhO-Qualifiers-v3.pdf): ranked among the top 440 of 7,000 exam takers nationally. Grade 11.',
                '[US National Chemistry Olympiad](photo:usnco): national exam qualifier — top 1,000 of 10,000+ nationwide. Grade 11.',
                '[Genes In Space](https://www.genesinspace.org/news/blog/2026-Honorable-Mentions/): Honorable Mention — top 15 of 900+ teams nationwide. Grade 11.',
                'Future Problem Solving: 3rd place at state in [Team Problem Solving](https://www.txfpsp.org/competitionresults/2024resultsstate/) and [Scenario Writing](https://myparistexas.com/paris-isd-students-earn-46-awards-at-state-future-problem-solving-competition/); international qualifier. Grades 9 and 11.',
                '[Diamond Challenge](photo:diamond) semifinalist. Grade 11.',
                'UIL Debate district winner 2x: [2025](https://theparisnews.com/news/paris-high-school-students-excel-at-district-academic-meet/article_5870aeb3-4523-4bc4-b4b9-1a470caa4c7b.html) and 2026. Grades 10 and 11.',
                'VEX Robotics state qualifier 2x: 2024 and 2025. Grades 9 and 10.',
            ],
        },
        {
            title: 'Recognition',
            bullets: [
                '[National Merit Commended](https://theparisnews.com/free/phs-senior-arjan-khadka-2026-named-national-merit-commended-student/article_64d85fdc-93f0-42e2-a22d-0815166320ac.html) student. Grade 11.',
                '[Carson Scholar](https://myparistexas.com/paris-high-school-senior-arjan-khadka-named-carson-scholar/). Grade 11.',
            ],
        },
        {
            title: 'Merit awards — each given to one student in the class',
            bullets: [
                '[Honors Geometry](photo:merit-geometry) (grade 9)',
                '[Honors Biology](photo:merit-biology) (grade 9)',
                '[Honors Chemistry](photo:merit-chemistry) (grade 10) — plus the [Mole Day project](photo:mole-day)',
                '[Honors World History](photo:merit-world-history) (grade 10)',
                'Dual Credit Spanish III (grade 10)',
                '[AP Language & Composition](photo:merit-ap-lang) (grade 11)',
            ],
        },
    ],
}

export const summer = [
    {
        title: 'Boys State', meta: 'Jun – Jul 2026',
        bullets: [
            '[Chosen as one of three delegates from Lamar County.](photo:boys-state)',
            'Voted up all the way to state delegate for the Nationalist Party (1% of the Boys State population).',
        ],
    },
    {
        title: 'Upward Bound: Summer 2', meta: 'Jun – Jul 2026',
        bullets: [
            'Took Calculus 1 and Art History, and volunteered 20 hrs.',
            'Made clay sculptures again.',
            'Accepted to go on the summer trip for the second year in a row — 1 of 20 selected.',
        ],
    },
    {
        title: 'Upward Bound: Summer 1', meta: 'Jun – Jul 2025',
        bullets: [
            'Took College Frameworks and volunteered 20 hrs.',
            '[Made clay sculptures.](photo:sculpting)',
            '[Accepted to go on the summer trip — 1 of 20 selected.](photo:upward-bound)',
        ],
    },
    {
        title: 'Paris Regional Health', meta: 'Volunteer · May – Aug 2023 · 40 hrs that summer, 80 hrs total (2021 – 2024)',
        bullets: ['Wiped 100+ chairs.', 'Checked in 120+ patients.'],
    },
]

export const skills = [
    {
        title: 'Additional skills',
        tags: ['Playing guitar · 2018 – present', 'Speaking Spanish · 2021 – present', 'Speaking Nepali · 2009 – present', 'Playing bass clarinet · 2023 – present', 'Swimming · 2016 – present'],
    },
]

export const press = [
    { label: 'The Paris News — National Merit', url: 'https://theparisnews.com/free/phs-senior-arjan-khadka-2026-named-national-merit-commended-student/article_64d85fdc-93f0-42e2-a22d-0815166320ac.html' },
    { label: 'East Texas Radio — National Merit', url: 'https://easttexasradio.com/paris-high-school-senior-arjan-khadka-named-national-merit-commended-student/' },
    { label: 'East Texas Radio — Carson Scholar', url: 'https://easttexasradio.com/paris-high-school-senior-arjan-khadka-named-carson-scholar/' },
    { label: 'MyParisTexas — Carson Scholar', url: 'https://myparistexas.com/paris-high-school-senior-arjan-khadka-named-carson-scholar/' },
]

// Every photo on the site. Files live in public/photos/. Any text can link to one with [label](photo:id) —
// hovering the word pops up the picture, clicking it opens it larger, and it never leaves the page.
// To swap a picture, overwrite its file in public/photos/ (same name) and edit the caption here.
export const photos = {
    'robotics': { src: '/photos/robotics.jpg', w: 1400, h: 689, title: 'VEX Robotics', caption: 'Judges Award, VEX V5 Competition — Team 1394B.' },
    'debate': { src: '/photos/debate.jpg', w: 647, h: 1400, title: 'Debate', caption: 'With the team after a tournament round.' },
    'boys-state': { src: '/photos/boys-state.jpg', w: 960, h: 1280, title: 'Texas Boys State', caption: 'With fellow delegates at Texas Boys State.' },
    'upward-bound': { src: '/photos/upward-bound.jpg', w: 1400, h: 1050, title: 'Upward Bound', caption: 'On the Upward Bound trip.' },
    'sculpting': { src: '/photos/sculpting.jpg', w: 1400, h: 1050, title: 'Upward Bound sculpting', caption: 'Ceramic pieces made during Upward Bound.' },
    'spanish-honor-society': { src: '/photos/spanish-honor-society.jpg', w: 1400, h: 1050, title: 'Spanish Honor Society', caption: 'Membership certificate, Sociedad Honoraria Hispánica de Paris High School.' },
    'fps': { src: '/photos/fps.jpg', w: 1050, h: 1400, title: 'Future Problem Solving', caption: '3rd Place, Creative Writing, Texas Future Problem Solving State Bowl.' },
    'catgut': { src: '/photos/catgut.jpg', w: 780, h: 1400, title: 'CatGut', caption: 'Running the flag onto the field at a football game.' },
    'mole-day': { src: '/photos/mole-day.jpg', w: 1050, h: 1400, title: 'Honors Chemistry', caption: 'Mole Day project — a brownie cake decorated with Avogadro’s number.' },
    'usnco': { src: '/photos/usnco.png', w: 1400, h: 587, title: 'US National Chemistry Olympiad', caption: 'Qualification email from the Dallas/Fort Worth ACS Section Coordinator: a 57/60 on the Local Section Exam, advancing to the National Exam.' },
    'diamond': { src: '/photos/diamond.png', w: 1400, h: 561, title: 'Diamond Challenge', caption: 'Notification email confirming advancement to the 2026 Pitching Round.' },
    'ap-lang': { src: '/photos/ap-lang.png', w: 790, h: 340, title: 'AP English Language & Composition', caption: 'Official score report: 5.' },
    'ap-lit': { src: '/photos/ap-lit.png', w: 789, h: 332, title: 'AP English Literature & Composition', caption: 'Official score report: 5.' },
    'olympiads': { src: '/photos/olympiads.png', w: 301, h: 241, title: 'Olympiads Democratized', caption: 'Discord community server, established March 2026 — 1,135 members at the time of this screenshot.' },
    'merit-geometry': { src: '/photos/merit-geometry.jpg', w: 1400, h: 1088, title: 'Honors Geometry', caption: 'Merit Award, Paris High School, 2023–2024.' },
    'merit-biology': { src: '/photos/merit-biology.jpg', w: 1400, h: 1079, title: 'Honors Biology', caption: 'Merit Award, Paris High School, 2023–2024.' },
    'merit-chemistry': { src: '/photos/merit-chemistry.jpg', w: 1400, h: 1076, title: 'Chemistry', caption: 'Certificate of Merit, Pre-AP Chemistry, Paris High School, 2024–2025.' },
    'merit-world-history': { src: '/photos/merit-world-history.jpg', w: 1400, h: 1076, title: 'Honors World History', caption: 'Certificate of Merit, Paris High School, 2024–2025.' },
    'merit-ap-lang': { src: '/photos/merit-ap-lang.jpg', w: 1400, h: 1090, title: 'AP English Language', caption: 'Certificate of Merit, Paris High School, 2025–2026.' },
}

// How the hidden /photos/ page groups the pictures (it lists every one, with its own link).
export const photoGroups = [
    { title: 'Moments', kind: 'moments', ids: ['robotics', 'debate', 'boys-state', 'upward-bound', 'sculpting', 'spanish-honor-society', 'fps', 'catgut', 'mole-day'] },
    { title: 'Certificates & records', kind: 'records', ids: ['usnco', 'diamond', 'ap-lang', 'ap-lit', 'merit-ap-lang', 'merit-world-history', 'merit-chemistry', 'merit-geometry', 'merit-biology', 'olympiads'] },
]
