const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = ({ config }) => {
  const appJsonPath = path.join(__dirname, "app.json");
  let staticExpo = config;

  try {
    const raw = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
    if (raw?.expo) staticExpo = { ...config, ...raw.expo };
  } catch {
    // Ignore
  }

  if (!staticExpo?.extra?.eas?.projectId) {
    try {
      execFileSync(process.execPath, [path.join(__dirname, "scripts", "ensure-eas-project.js")], {
        stdio: "ignore",
        timeout: 15000,
      });
      const updated = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
      if (updated?.expo) {
        staticExpo = { ...config, ...updated.expo };
      }
    } catch {
      // Ignore fallback error
    }
  }

  return staticExpo;
};
