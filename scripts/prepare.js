const { exec } = require("child_process");
const fs = require("fs");

exec("tsc --declaration", (error, stdout, stderr) => {
  if (error) {
    console.error(error);
  }
  if (!error) {
    fs.rename("index.js", "index.mjs", err => {
      if (err) {
        console.error("rename error", err);
      } else {
        exec("tsc --target es5 --module commonjs", err => {
          if (err) {
            console.error("tsc 2 error", err);
          }
        })
      }
    });
  }
});

// fs.exists("index.js")
