const fetch = require('node-fetch')

module.exports = class AnimeListExtractor {
    constructor(username) {
        this.userLink = 'https://myanimelist.net/animelist/' + username
        this.rawTitles = []
    }
    
    async start() {
        const htmlPage = await this.startHtml()
        this.startTitles(htmlPage)
    }

    async startHtml() {
        const htmlPage = (await fetch(this.userLink)).text()
        return htmlPage
    }
    
    startTitles(htmlPage) {
        let raw = htmlPage.match(/anime_id&quot;:(.*?),/g)
        for (let i = 0; i < raw.length; ++i) {
            let rawLink = raw[i].split('&quot;:')[1].slice(0, -1);
            this.rawTitles.push(rawLink)
        }
    }

    getTitles() {
        return this.rawTitles
    }
}