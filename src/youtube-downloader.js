const ytdl = require('ytdl-core')
const fs = require('fs')

module.exports = class YoutubeDownloader {
    constructor() {

    }

    async downloadMp4Stream(URL, name) {
        if (URL) {
            return await ytdl(URL, { 
                filter: 'audioonly', 
                format: 'mp4'
            }).pipe(fs.createWriteStream('./songlist/'+name+'.mp4'))
        }
    }
}