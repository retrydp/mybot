const fs = require('fs/promises');

class LogWriter {
  async logToFile(data) {
    try {
      await fs.writeFile(
        './modules/hsbg/data/db.json',
        JSON.stringify(data, null, 3)
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LogWriter;
