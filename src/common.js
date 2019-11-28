const fetch = require('node-fetch')

module.exports = async function getPageHtml(URL) {
    const htmlPage = await (await fetch(URL)).text()
    return htmlPage
}
