const getPageHtml = require('./common')
const {JSDOM} = require('jsdom')


module.exports = async function getAnimeSongs(URL) {
    const pageHtml = await getPageHtml(URL)
    const DOM = new JSDOM(pageHtml)
    const songs = DOM.window.document.getElementsByClassName('theme-song')
    
    let animeSongs = []
    for (let i = 0; i < songs.length; ++i) {
        animeSongs.push(songs.item(i).textContent)
    }

    return animeSongs
}