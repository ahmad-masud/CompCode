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
      try {
        console.log(`Processing: ${filePath}`);
        if (ext === ".js") {
          const content = fs.readFileSync(filePath, "utf8");
          const obfuscatedCode = javascriptObfuscator
            .obfuscate(content, {
              compact: true,
              controlFlowFlattening: false,
              deadCodeInjection: false,
              stringArray: false,
              stringArrayThreshold: 0.75,
              disableConsoleOutput: true,
              reservedNames: [
                "^use[A-Z]",
                "id",
                "source",
                "target",
                "customNode",
                "ReactFlow",
              ],
            })
            .getObfuscatedCode();
          fs.writeFileSync(filePath, obfuscatedCode, "utf8");
        } else if (ext === ".html") {
          const content = fs.readFileSync(filePath, "utf8");
          const minified = await minify(content, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: false,
          });
          fs.writeFileSync(filePath, minified, "utf8");
        } else if (ext === ".css") {
          const content = fs.readFileSync(filePath, "utf8");
          const minifiedCSS = new CleanCSS({ level: 2 }).minify(content).styles;
          fs.writeFileSync(filePath, minifiedCSS, "utf8");
        } else if (ext === ".json") {
          const content = fs.readFileSync(filePath, "utf8");
          const jsonContent = JSON.stringify(JSON.parse(content));
          fs.writeFileSync(filePath, jsonContent, "utf8");
        }
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
      }
    }
  }
}

const buildDir = path.join(__dirname, "../build");

(async () => {
  await processFiles(buildDir);
  console.log("Build folder obfuscated and minified successfully!");
})();
