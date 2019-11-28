const fetch = require('node-fetch')
const {JSDOM} = require('jsdom')

module.exports = class MusicNamesExtractor {
    constructor(link) {
        this.link = link
        this.animeName = ""
        this.songs = []
    }


    async start() {
        const htmlPage = await this.startHtml()
        this.startSongs(htmlPage)
    }
    
    async startHtml() {
        const htmlPage = await (await fetch(this.link)).text()
        return htmlPage
    }

    startSongs(htmlPage) {
        let dom = new JSDOM(htmlPage)
        let musics = dom.window.document.getElementsByClassName("theme-song")
        for (let i = 0; i < musics.length; ++i) {
            this.songs.push(musics.item(i).textContent)
        }
        let h1Element = dom.window.document.getElementsByClassName("h1")
        if (h1Element) {
            if (h1Element.item(0)) {
                this.animeName = h1Element.item(0).textContent
            }
        }
    }

    getAnimeName() {
        return this.animeName
    }

    getSongs() {
        return this.songs
    }
}