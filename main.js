const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const Crawler = require("crawler")
var fs = require('fs'),
    request = require('request'),
    path = require("path"),
    urlM = require("url"),
    https = require("https"),
    rimraf = require("rimraf");

const fetch = require('node-fetch');

function download(url, localPath) {
    return new Promise(async resolve => {
        let parsed = urlM.parse(url);
        const response = await fetch(url);
        const buffer = await response.buffer();
        let fileName = localPath + ' - ' + path.basename(parsed.pathname)
        fs.writeFileSync(fileName, buffer);
        console.log('Saved to: ' + fileName)
        resolve()
    })
}

function pad(num, len) {
    return Array(len + 1 - num.toString().length).join('0') + num;
  }

const c = new Crawler({
    callback: async function(error, res, done) {
        if (error) {
            console.log({error})
        } else {
            const images = res.$('img')
            const title = res.$('title')
            console.log(title.text())
            let pathTar = 'images/' + title.text()
            if (!fs.existsSync(pathTar))
                fs.mkdirSync(pathTar);
            else {
                rimraf.sync(pathTar);
                fs.mkdirSync(pathTar);
            }
            for (let index = 0; index < images.length; index++) {
                await download(images[index].attribs.src, `${pathTar}/${pad(index, 4)}`)
            }
            console.log(`Finished at ${pathTar}!\n`)
            prompt()
        }
    }
})


if (!fs.existsSync('images'))
    fs.mkdirSync('images');

function prompt() {
    rl.question("Website url: ", function(link) {
        c.queue(link)
        rl.close()
    });
}
prompt()