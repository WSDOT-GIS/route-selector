/**
 * @fileoverview Script that builds TypeScript to js module,
 * renames extension from js to mjs,
 * then builds commonjs module from TypeScript
 */
const { exec } = require("child_process");
const fs = require("fs");

/**
 * Wrap exec function and return a promise.
 * @param {string} command
 * @returns {Promise}
 */
async function asyncExec(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ error, stdout, stderr });
      }
    });
  });
}

(async () => {
  await asyncExec("tsc --declaration");
  await fs.promises.rename("index.js", "index.mjs");
  await asyncExec("tsc --target es5 --module commonjs");
})();


