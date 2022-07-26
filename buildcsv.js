import converter from 'json-2-csv';
import * as fs from 'fs';

export default async (gamelogs) => { //Takes in an object containing gamelogs for "hitters" and "pitchers"
    for (const gamelogsByType of Object.keys(gamelogs)) { //For both of those...
        converter.json2csv(gamelogs[gamelogsByType], (err, csv) => { //Convert their objects to csv
            if (err) {
                throw err;
            }

            const writeStream = fs.createWriteStream(`gamelog-${gamelogsByType}.csv`);
            writeStream.write(csv); //Write it to a file with this name ^

            writeStream.on('finish', () => {
                console.log(`done writing to csv for ${gamelogsByType}s`);
            });

            writeStream.on('error', (err) => {
                console.error(err);
            });

            writeStream.end();
        })
    }
};