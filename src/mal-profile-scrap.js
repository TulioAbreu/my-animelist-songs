const getPageHtml = require('./common')

module.exports = async function getMalProfileAnimes(username) {
    let animes = []
    const htmlPage = await getPageHtml(`http://myanimelist.net/animelist/${username}`)

    if (htmlPage.indexOf('Could not find user') >= 0) {
        return null
    }

    const raw = htmlPage.match(/anime_id&quot;:(.*?),/g)
    for (let i = 0; i < raw.length; ++i) {
        let rawLink = raw[i].split('&quot;:')[1].slice(0, -1);
        animes.push(rawLink)
    }
    return animes
}
