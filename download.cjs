const fs = require('fs');
const https = require('https');

const file = fs.createWriteStream("cloudflared.exe");
https.get("https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe", (response) => {
  if (response.statusCode === 302) {
    https.get(response.headers.location, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log("Download Completed");
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log("Download Completed");
    });
  }
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
