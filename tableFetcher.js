const fs = require('fs/promises');

class TableFetcher {
  PAGES = 10000 / 25; // 25 pages per chunk
  BLIZZ_API_URL = `https://hearthstone.blizzard.com/en-us/api/community/leaderboardsData?region=EU&leaderboardId=battlegrounds&page=`;

  constructor() {
    this.printLog(`Fetcher executed`);
  }

  async init() {
    const log = this.timestampHandler.bind(this);
    this.printLog(`Initializing...`);
    const data = await log('Parsed in', this.fetchHandler());
    await log(`Saved to file in`, this.fsLogger(data));
  }

  urlFormater(page) {
    return `${this.BLIZZ_API_URL}${page}`;
  }

  getCurrentTime() {
    return new Date().getTime();
  }

  async fetchHandler() {
    const requests = Array.from({ length: this.PAGES }, async (_, i) => {
      const getChunk = await fetch(this.urlFormater(++i)).then((response) => {
        if (!response.ok) {
          throw Error(response.status);
        }

        return response.json();
      });

      return await getChunk.leaderboard.rows;
    });

    const cached = [];

    for await (const chunk of requests) {
      cached.push(...chunk);
    }

    return cached;
  }

  printLog(text) {
    process.stdout.write(text + '\n');
  }

  async timestampHandler(text, cb) {
    const startTime = this.getCurrentTime();
    return await cb.then((data) => {
      this.printLog(`${text} ${this.getCurrentTime() - startTime}ms`);
      return data;
    });
  }

  async fsLogger(data) {
    try {
      await fs.writeFile('./logs/db.txt', JSON.stringify(data, null, 3));
    } catch (error) {
      throw error;
    }
  }
}
const tf = new TableFetcher();
tf.init();
