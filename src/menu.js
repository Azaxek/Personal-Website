// The ramen shop = Projects. Each item becomes a dish on the counter and a row on the menu card.
// (The rest of the portfolio is reached from the signpost: see content.js.)
//
// Item fields:
//   kind      section on the menu card ("Research", "Software", "Initiatives")
//   dish      look of the bowl: broth color, bowl color, up to 4 toppings from
//             egg | naruto | nori | scallion | chashu | corn | pepper | star
//   facts     short bullet list shown on the detail card
//   links     [{ label, url }]
export const owner = {
    name: 'Arjan Khadka',
    short: 'Arjan',
    chef: 'Chef Kenji',
    tagline: 'Student, builder and organizer in Paris, Texas',
    github: 'https://github.com/Azaxek',
}

export const greeting = [
    `Irasshaimase! Welcome to ${owner.short}'s Ramen.`,
    `I'm ${owner.chef}. This is ${owner.name}'s portfolio. Read the signpost: pick an arrow and I'll take you there.`,
    `Here's the menu. Take your time. Every dish is a project, and I'll make it fresh right here in front of you.`,
]

export const items = [
    {
        id: 'gbm',
        name: 'GBM Turing Bowl',
        kind: 'Research',
        tagline: 'A reaction–diffusion model of multifocal glioblastoma',
        summary: 'Predicting where satellite tumor lesions appear.',
        description: [
            'A Turing-type reaction–diffusion simulation of VEGF-A and sFLT-1 activator–inhibitor dynamics, built to predict the spatial distribution of multifocal glioblastoma lesions.',
            'In simulation the model places satellite lesions about 2.8 cm apart, which the project notes as consistent with clinical observations.',
        ],
        facts: ['Python: NumPy, SciPy, Matplotlib', 'Generates the manuscript figures, extended-data figures and a graphical abstract'],
        tags: ['Computational biology', 'PDEs', 'Python'],
        links: [],
        dish: { broth: '#7a3b1a', bowl: '#c8362f', band: '#f5c542', toppings: ['egg', 'naruto', 'nori'] },
    },
    {
        id: 'lighteeg',
        name: 'LightEEG-Net Tonkotsu',
        kind: 'Research',
        tagline: 'Lightweight, explainable Alzheimer’s detection from 6-channel EEG',
        summary: 'A deep-learning model under 2.5k parameters.',
        description: [
            'A compact deep-learning framework for detecting Alzheimer’s disease from reduced-channel, resting-state EEG. It is designed for 6-channel setups and stays under roughly 2.5 thousand parameters.',
            'Temporal convolutions approximate frequency banks, depthwise spatial convolutions mix channels, and squeeze-and-excitation attention helps the model ignore transient sensor noise.',
        ],
        facts: ['PyTorch implementation released for reproducibility', 'Written up as a manuscript'],
        tags: ['Deep learning', 'EEG', 'Explainable AI', 'PyTorch'],
        links: [{ label: 'Code on GitHub', url: 'https://github.com/Azaxek/LightEEG-Net' }],
        dish: { broth: '#eadab0', bowl: '#2f6fc9', band: '#ffffff', toppings: ['chashu', 'scallion', 'egg'] },
    },
    {
        id: 'benford',
        name: 'Benford Miso',
        kind: 'Research',
        tagline: 'Do campaign donations follow Benford’s law?',
        summary: 'Forensic-accounting statistics on FEC donation data.',
        description: [
            'An independent study that applies Benford’s-law style digit analysis, a technique from forensic accounting, to U.S. Federal Election Commission donation records.',
            'The analysis is organised around three tests: the leading-digit distribution, duplicate donation amounts, and clustering of amounts just under itemization thresholds.',
        ],
        facts: ['Self-directed: no lab, advisor or grant', 'Built to be understood and defended, not just run'],
        tags: ['Statistics', 'Political finance', 'Data analysis'],
        links: [],
        dish: { broth: '#d8842f', bowl: '#8a3fc0', band: '#f5c542', toppings: ['corn', 'scallion', 'pepper'] },
    },
    {
        id: 'opentip',
        name: 'OpenTip Spicy',
        kind: 'Software',
        tagline: 'An open-source anonymous tip platform for cities that can’t afford P3',
        summary: 'In testing. An announcement is planned at the conference in Waco.',
        description: [
            'As a Texas Crime Stopper Ambassador, Arjan is building an open-source alternative to the P3 tip app, for cities that can’t afford its $10,000+ price tag.',
            'It is a browser-based platform for anonymous crime reporting, aimed at law-enforcement agencies and Crime Stoppers programs. The prototype is being tested now, and the plan is to announce it at the conference in Waco this year.',
        ],
        facts: ['Status: prototyping and testing', 'Next.js 14 + Supabase + Tailwind CSS', 'Part of the Texas Association for Crime Stoppers ambassador role'],
        tags: ['Next.js', 'Supabase', 'Public safety'],
        links: [],
        dish: { broth: '#b8321f', bowl: '#1c1c28', band: '#ff3dcb', toppings: ['pepper', 'nori', 'egg'] },
    },
    {
        id: 'nextstep',
        name: 'NextStep Shoyu',
        kind: 'Software',
        tagline: 'An AI career coach for students',
        summary: 'Congressional App Challenge entry.',
        description: [
            'A web platform, built for the Congressional App Challenge, that lets students explore possible career paths with AI guidance.',
            'Written in TypeScript with AI API integration, and deployed on Vercel.',
        ],
        facts: ['TypeScript + AI integration', 'Congressional App Challenge 2025'],
        tags: ['TypeScript', 'AI', 'Education'],
        links: [{ label: 'Open NextStep', url: 'https://thenextstep.vercel.app/' }],
        dish: { broth: '#9a5a2a', bowl: '#e8e2d0', band: '#c8362f', toppings: ['naruto', 'scallion', 'egg'] },
    },
    {
        id: 'opencouncil',
        name: 'OpenCouncil Shio',
        kind: 'Software',
        tagline: 'Paris, Texas city council meetings, in plain English',
        summary: 'City council meetings, summarized and made searchable.',
        description: [
            'OpenCouncil fetches Paris, Texas city council agendas and minutes, summarizes them with an LLM, and shows them in a web app so residents can follow what their city is doing and when to speak up.',
        ],
        facts: ['LLM summaries (DeepSeek), Supabase database, deployed on Vercel', 'Public repository on GitHub'],
        tags: ['Civic tech', 'LLM summarization', 'Supabase', 'Vercel'],
        links: [{ label: 'Code on GitHub', url: 'https://github.com/Azaxek/OpenCouncil' }],
        dish: { broth: '#a86a38', bowl: '#2b3a63', band: '#e6c15a', toppings: ['chashu', 'menma', 'scallion'] },
    },
    {
        id: 'olydemo',
        name: 'Olympiads Tsukemen',
        kind: 'Initiatives',
        tagline: 'Free Olympiad prep for students everywhere',
        summary: 'Founded a 1,000+ member community.',
        description: [
            'Olympiads Democratized is an international educational initiative that provides free Olympiad preparation resources and tutoring to students worldwide, sourced from olympiad campers and other high achievers.',
            'It is aimed at underserved students who can’t afford prep courses, and has grown to more than 1,000 members.',
        ],
        facts: ['Founder, August 2025 – present', '1,000+ members'],
        tags: ['Education', 'Community', 'Olympiads'],
        links: [],
        dish: { broth: '#c0592b', bowl: '#2e8f6a', band: '#f5c542', toppings: ['chashu', 'corn', 'scallion'] },
    },
]
