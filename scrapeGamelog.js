import * as cheerio from 'cheerio';
import got from 'got';
import fs from 'fs';

const fileName = 'gamelog.json';

const getGamelogUrl = (player) => {
    const {letter, slug} = player;
    return `https://www.basketball-reference.com/players/${letter.toUpperCase()}/${slug}/gamelog/2022`
};

const getColumnName = (index) => {
    const cols = [
    // 'rk',
    'g',
    'date',
    'age',
    'tm',
    '@',
    'op',
    'blank',
    'gs',
    'mp',
    'fg',
    'fga',
    'fg%',
    '3p',
    '3pa',
    '3p%',
    'ft',
    'fta',
    'ft%',
    'orb',
    'drb',
    'trb',
    'ast',
    'stl',
    'blk',
    'tov',
    'pf',
    'pts',
    'gmsc',
    '+/-',
    ];

    return cols[index];
};

const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

const gamelog = [];

const main = async () => {

    const rawJson = fs.readFileSync('players.json');
    const players = JSON.parse(rawJson);

    for (const player of players) {
        const url = getGamelogUrl(player);
        const response = await got.get(url);

        const $ = cheerio.load(response.body);

        let row = {};
        const rows = $('#pgl_basic tbody tr');
        rows.each((i, rowEl) => {
            $(rowEl).children('td').each((i, el) => {
                const key = getColumnName(i);
                let val = '';
                if ($(el).children('a').length){
                    val = $($(el).children('a')[0]).html();
                } else
                if ($(el).children('strong').length){
                    val = $($(el).children('strong')[0]).html();
                } 
                else {
                    val = $(el).html();
                }
                row[key] = val;
            })
            if (!isEmpty(row)) {
                row.rk = $($(rowEl).children('th')[0]).html();
                row.year = '2022';
                row.player = player.name;
                gamelog.push(JSON.parse(JSON.stringify(row)));
                row = {};
            }
        })
    }

    const writeStream = fs.createWriteStream(fileName);
 
    writeStream.write(JSON.stringify(gamelog));

    writeStream.on('finish', () => {
        console.log('done');
    });

    writeStream.on('error', (err) => {
        console.error(err);
    });

    writeStream.end();
};

main();

