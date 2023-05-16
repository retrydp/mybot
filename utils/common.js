function currentTime() {
  return new Date().toLocaleTimeString('ua-UA', { hour12: false });
}

module.exports = { currentTime };
