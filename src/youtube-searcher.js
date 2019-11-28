const ytsr = require('ytsr')

module.exports = class YoutubeSearcher {
    constructor() {
    }

    async search(searchString) {
        let queryResult = await ytsr(searchString, { limit: 5 })
        if (queryResult.items.length > 1) {
            return queryResult.items[0].link
        }
        return null
    }
}
