const ytdl = require('ytdl-core')

module.exports = class YoutubeDownloader {
    constructor() {

    }

    async downloadMp4Stream(URL) {
        return await ytdl(URL, { filter: 'audioonly', format: 'mp4'})
    }
}