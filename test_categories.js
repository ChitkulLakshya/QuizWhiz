const fetch = require('node-fetch');

const categories = {
    GENERAL_KNOWLEDGE: 9, BOOKS: 10, MOVIES: 11, MUSIC: 12, MUSICALS: 13,
    TV: 14, VIDEO_GAMES: 15, BOARD_GAMES: 16, SCIENCE_NATURE: 17, COMPUTERS: 18,
    MATHEMATICS: 19, MYTHOLOGY: 20, SPORTS: 21, GEOGRAPHY: 22, HISTORY: 23,
    POLITICS: 24, ART: 25, CELEBRITIES: 26, ANIMALS: 27, VEHICLES: 28,
    COMICS: 29, GADGETS: 30, ANIME: 31, CARTOONS: 32,
};

async function testAll() {
    for (const [name, id] of Object.entries(categories)) {
        const url = `https://opentdb.com/api.php?amount=10&category=${id}&type=multiple&difficulty=medium`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.response_code !== 0) {
                console.log(`Failed: ${name} (${id}) - Code: ${data.response_code}`);
            } else {
                console.log(`Success: ${name} (${id})`);
            }
        } catch (e) {
            console.log(`Error: ${name} (${id}) - ${e.message}`);
        }
        // Rate limit
        await new Promise(r => setTimeout(r, 6000));
    }
}
testAll();
