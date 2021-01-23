const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const Crawler = require("crawler")
const fs = require('fs'),
    path = require("path"),
    URL = require("url"),
    rimraf = require("rimraf");

const fetch = require('node-fetch');

let crrDomain = ''

function download(url, localPath, fn) {
    return new Promise(async resolve => {
        try {
            let parsed = URL.parse(url);
            if(parsed.hostname === null)
                url = 'http://' + crrDomain.hostname + url
            const response = await fetch(url);
            const buffer = await response.buffer();
            let fileName = localPath + ' - ' + path.basename(parsed.pathname)
            fs.writeFileSync(fileName, buffer);
            console.log('Saved to: ' + fileName)   
        } catch (error) {
            console.log('Failed to save this url: ' + url)
        }
        if(fn) fn()
        resolve()
    })
}

function pad(num, len) {
    return Array(len + 1 - num.toString().length).join('0') + num;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const c = new Crawler({
    callback: async function(error, res, done) {
        if (error) {
            console.log({error})
        } else {
            if (!fs.existsSync('images'))
                fs.mkdirSync('images');
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
            let count = 0
            for (let index = 0; index < images.length; index++) {
                download(images[index].attribs.src, `${pathTar}/${pad(index, 4)}`, ()=> {
                    count++;
                })
            }
            while (count < images.length) {
                await sleep(10)
            }
            console.log(`Finished at ${pathTar}!\n`)
            prompt()
        }
    }
})

function prompt() {
    rl.question("Website url: ", function(link) {
        crrDomain = URL.parse(link)
        c.queue(link)
    });
}
prompt()