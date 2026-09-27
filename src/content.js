// Everything outside the ramen shop. The signpost in front of the shop is the hub (see `hub`); each arrow leads to a
// place, and each place shows one or more channels (a channel = one screen in the world + one panel).
// Sources: LinkedIn profile, resume/CV, local news coverage, YouTube. Edit freely.
//
// Entry fields: title, meta (org · dates), body [paragraphs], bullets, tags, links [{ label, url }],
//               videos [{ season, items: [{ id (YouTube id), title, sub }] }]
// Channel fields: id, place, label, screen (mesh name), accent, kicker (short mono tag, no numbering), tagline, entries,
//                 poster (short lines drawn on the 3D screen), stats (About only), ticker (Honors only),
//                 style ('chalk' | 'arcade' | 'vending' | 'onair'), hero (About: avatar header in the panel)
import { owner } from './menu.js'

const LI = 'https://www.linkedin.com/in/arjan-khadka-598386305/'

// The four arrows on the signpost. `arrow` = the sign's mesh names (arrow shape, then its lettering).
export const hub = [
    { id: 'shop', label: 'Projects', arrow: ['projectsRed', 'projectsWhite'], blurb: 'The ramen shop: one bowl per project' },
    { id: 'tower', label: 'About me', arrow: ['aboutMeBlue', 'aboutMeBlack'], blurb: 'The billboard tower: about, experience, leadership, honors, skills, contact' },
    { id: 'news', label: 'Articles', arrow: ['articlesRed', 'articlesWhite'], blurb: 'Things I have written, and things written about me' },
    { id: 'arcade', label: 'Arcade', arrow: ['creditsOrange', 'creditsBlack'], relabel: 'arcade', blurb: 'Just for fun: a game, the band, robotics, debate' },
    { id: 'drinks', label: 'Drinks', arrow: ['greenSignSquare'], overlay: 'drinks', blurb: 'The vending machine: a bottle with one of my favorite quotes inside' },
]


export const channels = [
    {
        id: 'about', place: 'tower', label: 'About', screen: 'bigScreen', accent: '#00e5ff', kicker: 'IDENTITY', hero: true,
        tagline: 'Minimizing structural violence with technology and speech.',
        stats: [
            { n: 1000, pre: '~', suf: '', t: 'monthly users at its peak: OpenCouncil, Paris TX council summaries' },
            { n: 1000, t: 'members in Olympiads Democratized' },
            { n: 1000, t: 'hygiene products given out in Paris, TX' },
            { n: 500000, t: 'potential users reached organically at SYNK' },
        ],
        entries: [
            {
                title: 'In my own words',
                body: [
                    '“I’m just another student in the Paris Class of 2027. But honestly, while many people have different end goals from dream careers to becoming celebrities, my end goal is to minimize structural violence. I utilize technology and speaking skills in order to raise awareness and promote initiatives to combat such violence as it is among the worst.”',
                ],
            },
            {
                title: 'Right now',
                bullets: [
                    'Building vertical AI applications at Mantis AI, a startup inside MIT CSAIL.',
                    'Texas Crime Stopper Ambassador: prototyping and testing an open-source version of the P3 app, with an announcement planned at the conference in Waco this year.',
                    'Working to bring Crime Stoppers to more campuses, and making a series of safety videos to promote stopping crime.',
                    'Running Project Hope.Serve and Olympiads Democratized.',
                    'Open to work: LinkedIn shows Recruiters only.',
                ],
            },
        ],
    },
    {
        id: 'experience', place: 'tower', label: 'Experience', screen: 'tallScreen', accent: '#ff3dcb', kicker: 'WORK LOG',
        tagline: 'Where I build and ship.',
        poster: ['EXPERIENCE', 'MANTIS AI', 'CRIME STOPPERS', 'SYNK', 'R.I.S.E.'],
        entries: [
            {
                title: 'Vertical Application Developer', meta: 'Mantis AI · MIT CSAIL · Apr 2026 – Present',
                body: ['Building vertical AI applications at Mantis AI, a startup operating within MIT’s Computer Science and Artificial Intelligence Laboratory. Developing production-ready AI-powered tools and pipelines.'],
                tags: ['AI applications', 'Pipelines'],
            },
            {
                title: 'Crime Stopper Ambassador', meta: 'Texas Association for Crime Stoppers · Feb 2026 – Present · one of 12 in the state',
                bullets: [
                    'Prototyping and testing an open-source version of the P3 app for cities that can’t afford the $10,000+ price tag (see OpenTip in the ramen shop). The plan is to announce it at the conference in Waco this year.',
                    'Working to expand Crime Stoppers to more campuses and producing a series of safety videos to promote stopping crime.',
                    'Worked with law enforcement across the state to protect people.',
                    'Raised awareness of the Crimestoppers program through initiatives like the “See something, say something” poster competition.',
                    'Led the organization’s TikTok awareness push.',
                ],
                tags: ['Communication', 'Community outreach'],
            },
            {
                title: 'Marketing Lead Intern', meta: 'SYNK · Mar – Jul 2026 · remote',
                bullets: ['Reached 500,000+ potential users organically on platforms such as Reddit.'],
            },
            {
                title: 'Website Director', meta: 'R.I.S.E. Tennis · Feb 2026 – Present',
                bullets: ['Built and maintains the organization’s website.', 'Helped raise $15,000+ in donated tennis equipment.'],
            },
            {
                title: 'Tutor and college advisor', meta: '2023 – Present',
                bullets: ['100+ hours of one-on-one and small-group math tutoring.', '50+ hours guiding peers through applications, scholarships and test prep.'],
            },
        ],
    },
    {
        id: 'leadership', place: 'tower', label: 'Leadership', screen: 'smallScreen1', accent: '#ffd84a', kicker: 'CREW',
        tagline: 'Things I started and people I serve.',
        poster: ['LEADERSHIP', 'HOPE.SERVE', 'OLYMPIADS', 'STUDENT COUNCIL'],
        entries: [
            {
                title: 'Project Hope.Serve', meta: 'Co-Founder & President · Jan 2025 – Present · Paris, TX',
                body: ['Works with local entities to serve people in Paris, Texas who need hygiene products.'],
                bullets: ['Ran a hygiene drive that gave 1,000+ essential products to homeless and low-income neighbors.'],
            },
            {
                title: 'Olympiads Democratized', meta: 'Founder · Aug 2025 – Present',
                body: ['A free Olympiad prep community with resources and tutoring sourced from olympiad campers and high achievers, for students worldwide. See it in the ramen shop.'],
                bullets: ['1,000+ members.'],
            },
            {
                title: 'NAEIF', meta: 'Steering member',
                body: ['North American Educational Initiatives Foundation.'],
            },
            {
                title: 'Bayar Fellowship', meta: 'Completed · 2026',
                body: ['Professional-growth fellowship organized by Esat Bayar.'],
            },
            {
                title: 'At school', meta: 'Paris High School',
                bullets: [
                    'Student Council Vice President (2023 – Present).',
                    'Crime Stoppers chapter Treasurer (2024 – Present).',
                    'Spanish Honor Society Vice President (2024 – Present).',
                    'Band section leader, bass clarinet (2024 – Present); Key Club (2023 – Present).',
                    'PRMC Hospital volunteer, 80 hours (2021 – 2024).',
                ],
            },
        ],
    },
    {
        id: 'honors', place: 'tower', label: 'Honors', screen: 'sideScreen', accent: '#56ff54', kicker: 'TROPHY CASE',
        tagline: 'Competitions and recognition.',
        ticker: [
            'NATIONAL MERIT COMMENDED STUDENT', 'CARSON SCHOLAR', 'USA PHYSICS OLYMPIAD QUALIFIER', 'USA NATIONAL CHEMISTRY OLYMPIAD QUALIFIER',
            'FUTURE PROBLEM SOLVING: 3RD PLACE TEXAS STATE', 'UIL LINCOLN-DOUGLAS DEBATE: 1ST PLACE DISTRICT', 'VEX ROBOTICS: UIL STATE QUALIFIER',
        ],
        entries: [
            {
                title: 'Science and competition',
                bullets: [
                    'USA Physics Olympiad (USAPhO) national exam qualifier, 2026: among the top ~400 students nationally.',
                    'USA National Chemistry Olympiad (USNCO) national exam qualifier, 2026.',
                    'Future Problem Solving: 3rd place at Texas State (senior division); led the team to international qualification.',
                    'UIL Lincoln-Douglas Debate: 1st place at district in 2024–25 and 2025–26, with top speaker points both years.',
                    'VEX Robotics: qualified for UIL State; coached new team members.',
                ],
            },
            {
                title: 'Academic recognition',
                bullets: [
                    'National Merit Commended Student (2027 National Merit Scholarship Program).',
                    'Carson Scholar (2026): $1,000 for academic achievement and community service.',
                    'College Board National Recognition Program honoree, recognized by the Paris ISD Board of Trustees.',
                ],
            },
        ],
    },
    {
        id: 'skills', place: 'tower', label: 'Skills', screen: 'smallScreen3', accent: '#7c6cff', kicker: 'LOADOUT',
        tagline: 'The toolbox.',
        poster: ['SKILLS', 'TS · PY', 'REACT', 'LANGCHAIN'],
        entries: [
            { title: 'Languages and tools', tags: ['TypeScript', 'Python', 'Node.js', 'APIs', 'JSON', 'GitHub', 'Cursor', 'Copilot'] },
            { title: 'Frameworks and libraries', tags: ['React', 'REST APIs', 'LangChain', 'Django', 'Flask', 'pandas', 'NumPy', 'scikit-learn', 'HuggingFace'] },
            { title: 'Concepts', tags: ['AI / ML', 'Full-stack development', 'Embeddings', 'Data scraping', 'Algorithms', 'Linear algebra', 'Async programming'] },
            { title: 'Infrastructure and data', tags: ['AWS', 'Airflow', 'FAISS', 'Neo4j', 'NetworkX', 'Selenium'] },
        ],
    },
    {
        id: 'contact', place: 'tower', label: 'Contact', screen: 'smallScreen5', accent: '#ff2f4d', kicker: 'COMMS', style: 'onair',
        tagline: 'On air. Say hello.',
        poster: ['CONTACT'],
        entries: [
            {
                title: 'Say hello',
                body: ['I’m open to work and always up for talking about education, safety and building things for the community.'],
                links: [
                    { label: 'Email', url: 'mailto:arjank898@gmail.com' },
                    { label: 'LinkedIn', url: LI },
                    { label: 'GitHub', url: owner.github },
                ],
            },
        ],
    },
    {
        id: 'articles', place: 'news', label: 'Articles', screen: 'easelFrontGraphic', accent: '#f4f0d8', kicker: 'FRESH PRINT', style: 'chalk',
        tagline: 'Written by me, and written about me.',
        poster: ['ARTICLES', 'written by me', 'written about me'],
        entries: [
            {
                title: 'Written by me',
                meta: 'LinkedIn posts on AI, school, and how to argue',
                body: ['“the smartest kids are already tunneling underneath them.” On why students reach for AI in class.'],
                links: [{ label: 'The AP Lang post', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7442555951976620032/' }],
            },
            {
                title: 'The death of the software engineer?',
                body: ['“the ultimate flex isn’t launching a product in an hour; it’s building a system that doesn’t collapse in a week.”'],
                links: [{ label: 'Read the post', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7441831302770819072/' }],
            },
            {
                title: 'Winning the room, losing the argument',
                body: ['“the ultimate flex isn’t destroying an opponent; it’s converting them.” On unlearning a combat style of debate.'],
                links: [{ label: 'Read the post', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7440377817097465856/' }],
            },
            {
                title: 'Written about me',
                meta: 'Local news coverage of two 2026 honors',
                links: [
                    { label: 'The Paris News: National Merit', url: 'https://theparisnews.com/free/phs-senior-arjan-khadka-2026-named-national-merit-commended-student/article_64d85fdc-93f0-42e2-a22d-0815166320ac.html' },
                    { label: 'East Texas Radio: National Merit', url: 'https://easttexasradio.com/paris-high-school-senior-arjan-khadka-named-national-merit-commended-student/' },
                    { label: 'East Texas Radio: Carson Scholar', url: 'https://easttexasradio.com/paris-high-school-senior-arjan-khadka-named-carson-scholar/' },
                    { label: 'MyParisTexas: Carson Scholar', url: 'https://myparistexas.com/paris-high-school-senior-arjan-khadka-named-carson-scholar/' },
                ],
            },
        ],
    },
    {
        id: 'arcade', place: 'arcade', label: 'Arcade', screen: 'arcadeScreen', accent: '#ff3dcb', kicker: 'PLAYER 1', style: 'arcade',
        tagline: 'Just for fun. Pick a cartridge.',
        poster: ['ARCADE'],
        entries: [
            {
                title: 'Cartridge 0: Shell Shockers',
                meta: 'Free online multiplayer shooter by Blue Wizard Digital',
                body: ['In case you feel the itch. It’s a third-party game: it runs on its own site inside a window here, has ads, and puts you in public lobbies with strangers.'],
                game: { title: 'Shell Shockers', url: 'https://shellshock.io/', by: 'Blue Wizard Digital' },
            },
            {
                title: 'Cartridge 1: Blue Blazes Band',
                meta: 'Paris High School · section leader, bass clarinets · 2024 – present',
                body: ['Section leader for the bass clarinets, mentoring five-plus members. Here are the Paris High Blue Blazes marching shows, season by season (recordings by other people, linked on YouTube).'],
                videos: [
                    {
                        season: '2023 – 2024', note: 'This show went on to the UIL 4A State Marching Contest.',
                        items: [
                            { id: 'Bo5FTCBe8nI', title: 'Region 4 Marching Contest', sub: 'Mt. Pleasant · Oct 2023' },
                            { id: 'bNnbg1hHmGQ', title: 'UIL Area C prelims', sub: 'Lindale · Oct 2023' },
                            { id: 'AVtVxIepRqY', title: 'UIL 4A State prelims', sub: 'Nov 2023' },
                        ],
                    },
                    {
                        season: '2024 – 2025',
                        items: [
                            { id: 'FwbVApRAtaY', title: 'Region 4 Marching Contest', sub: 'Mt. Pleasant · Oct 2024' },
                            { id: '3I6LWm_hJVo', title: 'UIL Area finals', sub: 'Nov 2024' },
                        ],
                    },
                    {
                        season: '2025 – 2026', note: 'Show title: “Skyfire”.',
                        items: [{ id: 'waKqjtCDqSQ', title: 'Region 4 Marching Contest', sub: 'Mt. Pleasant · Oct 2025' }],
                    },
                ],
                links: [{ label: 'Paris High School Band', url: 'https://phs.parisisd.net/band' }],
            },
            {
                title: 'Cartridge 2: VEX Robotics',
                meta: 'Paris High School · 2023 – present',
                bullets: ['Qualified for UIL State.', 'Coached newer team members.'],
            },
            {
                title: 'Cartridge 3: Lincoln–Douglas debate',
                meta: 'UIL · 2023 – present',
                bullets: ['1st place at district in 2024–25 and 2025–26, with top speaker points both years.', 'Now debates to convert people, not beat them (see Articles).'],
            },
            {
                title: 'More cartridges coming',
                body: ['Add your own games (music, sports, side quests) in src/content.js under the arcade channel.'],
            },
        ],
    },
    {
        id: 'drinks', place: 'drinks', label: 'Drinks', screen: 'vendingMachineScreen', accent: '#4dffa1', kicker: 'DISPENSER', style: 'vending',
        tagline: 'Pick a bottle. Inside is one of my favorite quotes.',
        poster: ['DRINKS'],
        entries: [],
    },
]

// Small screens on the tower that are shortcuts to other places.
export const links = [
    { id: 'shop', screen: 'smallScreen4', accent: '#ff3dcb', poster: ['PROJECTS', '▸ RAMEN', 'SHOP'] },
    { id: 'arcade', screen: 'smallScreen2', accent: '#ff8a3d', poster: ['ARCADE', '▸ BAND', 'ROBOTICS', 'DEBATE'] },
]
