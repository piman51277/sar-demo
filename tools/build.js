const nunjucks = require("nunjucks");
const { writeFileSync } = require('fs');

nunjucks.configure("njk");
const output = nunjucks.render("index.njk");
writeFileSync("dist/index.html", output);