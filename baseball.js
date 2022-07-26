import scrapePlayers from './scrapePlayers.js';
import scrapeGamelog from './scrapeGamelog.js';
import buildcsv from './buildcsv.js';


(async () => {
  const players = await scrapePlayers();
  const gamelogs = await scrapeGamelog(players);
  await buildcsv(gamelogs);
})();