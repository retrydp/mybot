const fs = require('fs/promises');

class LogWriter {
  async logToFile(data) {
    try {
      await fs.writeFile('../logs/db.txt', JSON.stringify(data, null, 3));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LogWriter;
