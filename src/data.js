// All content for the site. Edit this file to change what's on the page — src/main.js just renders it.
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
        { n: 1000, suf: '+', label: 'members in Olympiads Democratized' },
        { n: 1000, suf: '+', label: 'hygiene products given out in Paris, TX' },
        { n: 500000, suf: '+', label: 'potential users reached organically at SYNK' },
    ],
}

// status: 'live' | 'testing' | 'research' | 'built'
export const projects = [
    {
        name: 'Olympiads Democratized', status: 'live',
        tagline: 'Free Olympiad prep for students everywhere',
        body: 'An international initiative providing free Olympiad preparation and tutoring, sourced from olympiad campers and other high achievers, for students who can’t afford prep courses.',
        facts: ['Founder, August 2025 – present', '1,000+ members'],
        tags: ['Education', 'Community'],
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
        name: 'GBM Turing-Pattern Model', status: 'research',
        tagline: 'A reaction–diffusion model of multifocal glioblastoma',
        body: 'A Turing-type reaction–diffusion simulation of VEGF-A / sFLT-1 activator–inhibitor dynamics, built to predict the spatial distribution of multifocal glioblastoma lesions.',
        note: 'In simulation, satellite lesions land about 2.8cm apart — which the project notes as consistent with clinical observations.',
        facts: ['Python: NumPy, SciPy, Matplotlib', 'Generates the manuscript and graphical-abstract figures'],
        tags: ['Computational biology', 'PDEs', 'Python'],
    },
    {
        name: 'LightEEG-Net', status: 'research',
        tagline: 'Lightweight, explainable Alzheimer’s detection from 6-channel EEG',
        body: 'A compact deep-learning framework for detecting Alzheimer’s disease from reduced-channel, resting-state EEG — under roughly 2.5 thousand parameters. Temporal convolutions approximate frequency banks, depthwise spatial convolutions mix channels, and squeeze-and-excitation attention filters out sensor noise.',
        facts: ['PyTorch implementation released for reproducibility', 'Written up as a manuscript'],
        tags: ['Deep learning', 'EEG', 'Explainable AI'],
        links: [{ label: 'Code on GitHub', url: 'https://github.com/Azaxek/LightEEG-Net' }],
    },
    {
        name: 'Benford Analysis of Campaign Finance', status: 'research',
        tagline: 'Do campaign donations follow Benford’s law?',
        body: 'An independent study applying Benford’s-law digit analysis — a forensic-accounting technique — to U.S. FEC donation records, across three tests: leading-digit distribution, duplicate amounts, and clustering just under itemization thresholds.',
        note: 'No lab, advisor, or grant — built to be understood and defended, not just run.',
        facts: ['Self-directed statistical analysis'],
        tags: ['Statistics', 'Political finance'],
    },
    {
        name: 'OpenCouncil', status: 'built',
        tagline: 'Paris, Texas city council meetings, in plain English',
        body: 'Fetches Paris, Texas city council agendas and minutes, summarizes them with an LLM, and shows them in a web app so residents can follow what their city is doing and when to speak up.',
        facts: ['LLM summaries (DeepSeek), Supabase database, deployed on Vercel', 'Public repository on GitHub'],
        tags: ['Civic tech', 'LLM summarization'],
        links: [{ label: 'Code on GitHub', url: 'https://github.com/Azaxek/OpenCouncil' }],
    },
    {
        name: 'OpenTip', status: 'testing',
        tagline: 'An open-source anonymous tip platform for cities that can’t afford P3',
        body: 'As a Texas Crime Stopper Ambassador, building an open-source alternative to the P3 tip app for cities priced out of its $10,000+ commercial license. A browser-based platform for anonymous crime reporting, aimed at law-enforcement agencies and Crime Stoppers programs.',
        note: 'In testing now — announcement planned at the conference in Waco this year.',
        facts: ['Next.js 14 + Supabase + Tailwind CSS', 'Part of the Texas Association for Crime Stoppers ambassador role'],
        tags: ['Next.js', 'Supabase', 'Public safety'],
    },
]

export const experience = [
    {
        title: 'Vertical Application Developer', meta: 'Mantis AI · MIT CSAIL · Apr 2026 – Present',
        body: 'Building vertical AI applications at Mantis AI, a startup operating within MIT’s Computer Science and Artificial Intelligence Laboratory. Developing production-ready AI-powered tools and pipelines.',
        tags: ['AI applications', 'Pipelines'],
    },
    {
        title: 'Crime Stopper Ambassador', meta: 'Texas Association for Crime Stoppers · Feb 2026 – Present · one of 12 in the state',
        bullets: [
            'Prototyping and testing an open-source version of the P3 app for cities that can’t afford the $10,000+ price tag (see OpenTip).',
            'Working to expand Crime Stoppers to more campuses and producing a series of safety videos to promote stopping crime.',
            'Worked with law enforcement across the state to protect people.',
            'Raised awareness through initiatives like the “See something, say something” poster competition.',
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
]

export const leadership = [
    {
        title: 'Project Hope.Serve', meta: 'Co-Founder & President · Jan 2025 – Present · Paris, TX',
        body: 'Works with local entities to serve people in Paris, Texas who need hygiene products.',
        bullets: ['Ran a hygiene drive that gave 1,000+ essential products to homeless and low-income neighbors.'],
    },
    {
        title: 'Olympiads Democratized', meta: 'Founder · Aug 2025 – Present',
        body: 'A free Olympiad prep community with resources and tutoring sourced from olympiad campers and high achievers, for students worldwide.',
        bullets: ['1,000+ members.'],
    },
    { title: 'NAEIF', meta: 'Steering member', body: 'North American Educational Initiatives Foundation.' },
    { title: 'Bayar Fellowship', meta: 'Completed · 2026', body: 'Professional-growth fellowship organized by Esat Bayar.' },
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
]

export const honors = {
    ticker: [
        'National Merit Commended Student', 'Carson Scholar', 'USA Physics Olympiad Qualifier', 'USA National Chemistry Olympiad Qualifier',
        'Future Problem Solving: 3rd Place Texas State', 'UIL Lincoln–Douglas Debate: 1st Place District', 'VEX Robotics: UIL State Qualifier',
    ],
    groups: [
        {
            title: 'Science and competition',
            bullets: [
                'USA Physics Olympiad (USAPhO) national exam qualifier, 2026: among the top ~400 students nationally.',
                'USA National Chemistry Olympiad (USNCO) national exam qualifier, 2026.',
                'Future Problem Solving: 3rd place at Texas State (senior division); led the team to international qualification.',
                'UIL Lincoln–Douglas Debate: 1st place at district in 2024–25 and 2025–26, with top speaker points both years.',
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
}

export const skills = [
    { title: 'Languages and tools', tags: ['TypeScript', 'Python', 'Node.js', 'APIs', 'JSON', 'GitHub', 'Cursor', 'Copilot'] },
    { title: 'Frameworks and libraries', tags: ['React', 'REST APIs', 'LangChain', 'Django', 'Flask', 'pandas', 'NumPy', 'scikit-learn', 'HuggingFace'] },
    { title: 'Concepts', tags: ['AI / ML', 'Full-stack development', 'Embeddings', 'Data scraping', 'Algorithms', 'Linear algebra', 'Async programming'] },
    { title: 'Infrastructure and data', tags: ['AWS', 'Airflow', 'FAISS', 'Neo4j', 'NetworkX', 'Selenium'] },
]

export const writing = {
    posts: [
        {
            quote: 'the smartest kids are already tunneling underneath them.', about: 'On why students reach for AI in class',
            url: 'https://www.linkedin.com/feed/update/urn:li:activity:7442555951976620032/',
        },
        {
            quote: 'the ultimate flex isn’t launching a product in an hour; it’s building a system that doesn’t collapse in a week.', about: 'The death of the software engineer?',
            url: 'https://www.linkedin.com/feed/update/urn:li:activity:7441831302770819072/',
        },
        {
            quote: 'the ultimate flex isn’t destroying an opponent; it’s converting them.', about: 'On unlearning a combat style of debate',
            url: 'https://www.linkedin.com/feed/update/urn:li:activity:7440377817097465856/',
        },
    ],
    press: [
        { label: 'The Paris News — National Merit', url: 'https://theparisnews.com/free/phs-senior-arjan-khadka-2026-named-national-merit-commended-student/article_64d85fdc-93f0-42e2-a22d-0815166320ac.html' },
        { label: 'East Texas Radio — National Merit', url: 'https://easttexasradio.com/paris-high-school-senior-arjan-khadka-named-national-merit-commended-student/' },
        { label: 'East Texas Radio — Carson Scholar', url: 'https://easttexasradio.com/paris-high-school-senior-arjan-khadka-named-carson-scholar/' },
        { label: 'MyParisTexas — Carson Scholar', url: 'https://myparistexas.com/paris-high-school-senior-arjan-khadka-named-carson-scholar/' },
    ],
}

export const beyond = {
    body: 'Section leader for bass clarinet in the Paris High Blue Blazes marching band, mentoring five-plus members — the 2023–24 show went to the UIL 4A State Marching Contest. Also VEX Robotics (qualified for UIL State, coach newer members) and Lincoln–Douglas debate (1st at district two years running, now aiming to convert people rather than beat them).',
    links: [
        { label: '2023–24 show — UIL State prelims', url: 'https://www.youtube.com/watch?v=AVtVxIepRqY' },
        { label: 'Paris High School Band', url: 'https://phs.parisisd.net/band' },
    ],
}
