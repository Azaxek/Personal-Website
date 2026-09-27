// Favorite quotes. The vending machine deals one at random (a shuffled deck, so nothing repeats until every quote has
// come out once). `note` is shown small under the quote: used for attributions that are disputed or that come with a story.
export const quotes = [
    {
        text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
        by: 'Will Durant',
        note: 'Popularly attributed to Aristotle.',
    },
    { text: 'Action is the foundational key to all success.', by: 'Pablo Picasso', note: 'Widely attributed to Picasso; no primary source found.' },
    { text: 'Do what you can, with what you have, where you are.', by: 'Theodore Roosevelt' },
    {
        text: 'It is not the critic who counts; not the man who points out how the strong man stumbles... The credit belongs to the man who is actually in the arena.',
        by: 'Theodore Roosevelt',
    },
    { text: 'Fall seven times, stand up eight.', by: 'Japanese proverb' },
    { text: 'It is not that I’m so smart, but I stay with the questions much longer.', by: 'Albert Einstein' },
    { text: 'Perfection is not attainable, but if we chase perfection we can catch excellence.', by: 'Vince Lombardi' },
    {
        text: 'To think is easy. To act is hard. But the hardest thing in the world is to act in accordance with your thinking.',
        by: 'Johann Wolfgang von Goethe',
    },
    { text: 'If you are going through hell, keep going.', by: 'Winston Churchill', note: 'Attributed to Churchill, but not found in his published words.' },
    { text: 'I have not failed. I’ve just found 10,000 ways that won’t work.', by: 'Thomas A. Edison' },
    {
        text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.',
        by: 'Ralph Waldo Emerson',
        note: 'Often credited to Emerson, but it comes from Muriel Strode’s 1903 poem “Wind-Wafted Wild Flowers”.',
    },
    { text: 'Fortune favors the bold.', by: 'Virgil' },
    {
        text: 'The prince always beats the king.',
        by: 'Machiavelli',
        note: 'No source found in Machiavelli’s writings. Arjan’s story: “I was nicknamed the Prince in high school, but was always overshadowed by the king. Until I wasn’t.”',
    },
    { text: 'The secret of getting ahead is getting started.', by: 'Mark Twain' },
    { text: 'Laugh uncontrollably and never regret anything that makes you smile.', by: 'Mark Twain' },
]

// Shuffled deck: draw() never repeats a quote until all have been dealt, and never deals the same one twice in a row.
let deck = [], lastText = ''
export function drawQuote()
{
    if(!deck.length)
    {
        deck = quotes.slice()
        for(let i = deck.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]] }
        if(deck[deck.length - 1].text === lastText) deck.unshift(deck.pop()) // don't open a new deck with the quote just dealt
    }
    const q = deck.pop(); lastText = q.text
    return q
}
