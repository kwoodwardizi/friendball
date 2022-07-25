import * as cheerio from 'cheerio';
import got from 'got';
import fs from 'fs';

const fileName = 'players.json';

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const getPlayerListUrl = (letter) => {
    letter = letter.toLowerCase();
    return `https://www.basketball-reference.com/players/${letter}/`;
}

const players = [];

const main = async () => {
    for (const letter of alphabet) {
        const url = getPlayerListUrl(letter);
        const response = await got.get(url);

        const $ = cheerio.load(response.body);

        $('th.left a').each((i, el) => {
            const href = el.attribs.href;
            const name = $(el).html();
            console.log(name);
            const [blank, _players, letter, _name] = href.split('/');
            const [finalName, html] = _name.split('.');
            players.push({
                letter: letter,
                slug: finalName,
                name: name
            });
        })
    }

    const writeStream = fs.createWriteStream(fileName);
 
    writeStream.write(JSON.stringify(players));

    writeStream.on('finish', () => {
        console.log('done');
    });

    writeStream.on('error', (err) => {
        console.error(err);
    });

    writeStream.end();
}

main();


