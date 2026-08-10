const crypto = require("crypto");
const salt = "5d09dcfa4606212539254d54aa9a370f";
const password = "portfoliopasswordnew";
const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
console.log(hash);
