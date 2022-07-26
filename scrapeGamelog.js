import * as cheerio from 'cheerio';
import got from 'got';

const hitterStats = ["career_game_num","team_game_num", "date", "team_ID", "@", "opp_ID", "game_result", "player_game_span",
                     "PA", "AB", "R", "H", "2B", "3B", "HR", "RBI", "BB", "IBB", "SO", "HBP", "SH", "SF", "ROE", "GIDP",
                     "SB", "CS", "batting_avg", "onbase_perc", "slugging_perc", "onbase_plus_slugging", "batting_order_position", "leverage_index_avg",
                     "wpa_bat", "cli_avg", "cwpa_bat", "re24_bat", "draftkings_points", "fanduel_points","pos_game"];
const pitcherStats = ["career_game_num","team_game_num", "date", "team_ID", "@", "opp_ID", "game_result", "player_game_span",
                      "player_game_result", "days_rest", "IP", "H", "R", "ER", "BB", "SO", "HR", "HBP", "earned_run_avg", "fip", "batters_faced", "pitches",
                      "strikes_total", "strikes_looking", "strikes_swinging", "inplay_gb_total", "inplay_fb_total", "inplay_ld",
                      "inplay_pu", "inplay_unk", "game_score", "inherited_runners", "inherited_score", "SB", "CS", "pickoffs",
                      "AB", "2B", "3B", "IBB", "GIDP","SF","ROE","leverage_index_avg","wpa_def",
                      "cli_avg","cwpa_def","re24_def","draftkings_points","fanduel_points","pitcher_situation_in","pitcher_situation_out"];

const getGamelogUrl = ({slug}, isPitcher = false) => `https://www.baseball-reference.com/players/gl.fcgi?id=${slug}&year=2022&t=${isPitcher ? 'p' : 'b'}`;

const checkPitcherness = $ => /pitcher/i.test($('#meta').toString());

const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

const gamelogs = {
    hitter: [],
    pitcher: []
};

const scrapeUrl = async (player, isPitcher) => {
    const url = getGamelogUrl(player, isPitcher);
    const response = await got.get(url);
    return cheerio.load(response.body);
};

export default async (players) => {
    for (const player of players) {
        let $ = await scrapeUrl(player);
        let stats = hitterStats;
        let logs = '#batting_gamelogs';
        let isPitcher = false;
        if (checkPitcherness($)) {
            stats = pitcherStats;
            logs = '#pitching_gamelogs';
            isPitcher = true;
            $ = await scrapeUrl(player, isPitcher);
        }

        let row = {};
        const rows = $(`${logs} tbody tr`);
        rows.each((i, rowEl) => {
            $(rowEl).children('td').each((i, el) => {
                const key = stats[i];
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
            });
            if (!isEmpty(row)) {
                row.rk = $($(rowEl).children('th')[0]).html();
                row.year = '2022';
                row.player = player.name;
                gamelogs[isPitcher ? "pitcher" : "hitter"].push(JSON.parse(JSON.stringify(row)));
                row = {};
            }
        });
        console.log(`Wrote gamelogs for ${player.name}`);
    }
    return gamelogs;

};
