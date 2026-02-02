const { BackgroundService } = require("../BackgroundWorkers");
const { EncryptionManager } = require("../EncryptionManager");
const { CommunicationKey } = require("../comKey");

function bootHTTP(app, port = 3001) {
  if (!app) throw new Error('No "app" defined - crashing!');

  app
    .listen(port, async () => {
      new CommunicationKey(true);
      new EncryptionManager();
      new BackgroundService().boot();
      console.log(`Primary server in HTTP mode listening on port ${port}`);
    })
    .on("error", catchSigTerms);

  return { app, server: null };
}

function catchSigTerms() {
  process.once("SIGUSR2", function () {
    process.kill(process.pid, "SIGUSR2");
  });
  process.on("SIGINT", function () {
    process.kill(process.pid, "SIGINT");
  });
}

module.exports = {
  bootHTTP,
};
