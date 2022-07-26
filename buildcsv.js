import converter from 'json-2-csv';
import * as fs from 'fs';

export default async (gamelogs) => {
    Object.keys(gamelogs).forEach(gamelogsByType => converter.json2csv(gamelogs[gamelogsByType], (err, csv) => {
        if (err) {
            throw err;
        }

        const writeStream = fs.createWriteStream(`gamelog-${gamelogsByType}.csv`);

        writeStream.write(csv);

        writeStream.on('finish', () => {
            console.log(`done writing to csv for ${gamelogsByType}s`);
        });

        writeStream.on('error', (err) => {
            console.error(err);
        });

        writeStream.end();
    }))
};