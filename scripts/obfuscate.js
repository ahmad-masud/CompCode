const fs = require("fs");
const path = require("path");
const { minify } = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const javascriptObfuscator = require("javascript-obfuscator");

async function processFiles(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      await processFiles(filePath);
    } else {
      const ext = path.extname(file);

      if (ext === ".js") {
        const content = fs.readFileSync(filePath, "utf8");
        const obfuscatedCode = javascriptObfuscator
          .obfuscate(content, {
            compact: true,
            controlFlowFlattening: true,
            deadCodeInjection: true,
            stringArray: true,
            stringArrayThreshold: 0.75,
            disableConsoleOutput: true,
          })
          .getObfuscatedCode();
        fs.writeFileSync(filePath, obfuscatedCode, "utf8");
      } else if (ext === ".html") {
        const content = fs.readFileSync(filePath, "utf8");
        try {
          const minified = await minify(content, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true,
          });
          fs.writeFileSync(filePath, minified, "utf8");
        } catch (err) {
          console.error(`Error minifying ${filePath}:`, err);
        }
      } else if (ext === ".css") {
        const content = fs.readFileSync(filePath, "utf8");
        const minifiedCSS = new CleanCSS({ level: 2 }).minify(content).styles;
        fs.writeFileSync(filePath, minifiedCSS, "utf8");
      } else if (ext === ".json") {
        const content = fs.readFileSync(filePath, "utf8");
        try {
          const jsonContent = JSON.stringify(JSON.parse(content));
          fs.writeFileSync(filePath, jsonContent, "utf8");
        } catch (err) {
          console.error(`Error minifying JSON ${filePath}:`, err);
        }
      }
    }
  }
}

const buildDir = path.join(__dirname, "../build");

(async () => {
  await processFiles(buildDir);
  console.log("Build folder obfuscated and minified successfully!");
})();
