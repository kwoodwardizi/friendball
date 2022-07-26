import * as cheerio from 'cheerio';
import got from 'got';

const players = [];

/* The lowercase alphabet sliced out of the char map and converted to an array, for no real good reason */
//const alphabet = [...String.fromCharCode(...Array(123).keys()).slice(97)];
const alphabet = 'z';

const getPlayerListUrl = (letter) => `https://www.baseball-reference.com/players/${letter}/`;

export default async () => {
    for (const letter of alphabet) {
        const response = await got.get(getPlayerListUrl(letter));
        const $ = cheerio.load(response.body);

        $('#div_players_ p b a').each((i, el) => {
            const name = $(el).html();
            console.log(name);
            const [blank, _players, letter, _name] = el.attribs.href.split('/');
            const [slug, html] = _name.split('.');
            players.push({ letter, name, slug });
        });

        return players;
    }
};


