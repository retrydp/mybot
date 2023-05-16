const https = require('https');
const { Agent } = require('https');
const LW = require('./logWriter.js');
const TerminalFormatter = require('./terminalFormatter');

class BattlegroundStatsParser {
  PAGES = 10000 / 25; // 25 pages per chunk
  BLIZZ_API_URL = `https://hearthstone.blizzard.com/en-us/api/community/leaderboardsData?region=EU&leaderboardId=battlegrounds&page=`;
  tf = new TerminalFormatter();

  constructor() {
    const { logToConsole, colorize } = this.tf;
    logToConsole(colorize(`blue`, `Fetcher executed`));
  }

  async init() {
    const lw = new LW();
    const { colorize, logToConsole } = this.tf;
    const fetchData = this.fetchLeaderboardData.bind(this);
    const log = this.measureExecutionTime.bind(this);
    logToConsole(colorize(`blue`, `Initializing...`));
    const data = await log(colorize(`blue`, `Parsed in`), fetchData());
    await log(colorize(`blue`, `Saved to file in`), lw.logToFile(data));
  }

  createBlizzardAPIUrl(page) {
    return `${this.BLIZZ_API_URL}${page}`;
  }

  getCurrentTime() {
    return new Date().getTime();
  }

  async fetchLeaderboardData() {
    const cached = [];
    const agent = new Agent({ maxSockets: this.PAGES }); // Set maximum number of concurrent connections

    const requests = Array.from({ length: this.PAGES }, (_, i) => {
      const url = this.createBlizzardAPIUrl(i + 1); // Use 1-based index
      const options = new URL(url);

      options.agent = agent; // Reuse existing connections

      return new Promise((resolve, reject) => {
        const req = https.get(options, (res) => {
          const chunks = [];

          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks))));
        });

        req.on('error', (err) => reject(err));
      });
    });

    const results = await Promise.allSettled(requests);

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const rows = result.value?.leaderboard?.rows || [];
        cached.push(...rows);
      } else {
        const { logToConsole, colorize } = this.tf;
        logToConsole(colorize(`red`, result.reason)); // Log any errors
      }
    });

    return cached;
  }

  measureExecutionTime(text, cb) {
    const startTime = this.getCurrentTime();
    const { logToConsole } = this.tf;

    return cb.then((data) => {
      logToConsole(`${text} ${this.getCurrentTime() - startTime}ms`);
      return data;
    });
  }
}

module.exports = BattlegroundStatsParser;
