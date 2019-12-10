const YoutubeSearcher = require('./youtube-searcher')
const scrapProfile = require('./mal-profile-scrap')
const getAnimeSongs = require('./mal-anime-scrap')
const sleep = require('system-sleep')
const cliProgress = require('cli-progress')
const fs = require('fs')

const config = require('../config.js')
async function main() {
    function wait() {
        sleep(1000)
    }

    function sanitizeMusicName(name) {
        name = name.replace(/(ep[s]*[ ]*[0-9]+\-[0-9]*)+/g, '')
            .replace(/([0-9]+\-[0-9]*)+/g, '')
            .replace(/#[0-9]+[:]*/g, '')
            .replace(/[^a-zA-Z\d\s:]/g, ' ')
            .replace('"', '')
            .replace('|', '')
            .replace(':', '')
            .replace('*', '')
            .replace('<', '')
            .replace('>', '')
            .replace('/', '')
            .replace('\\', '')
            .replace('?', '')
            .replace(/[ ]+/g, ' ')
        return name
    }
    
    function getUrlFromId(id) {
        return `https://myanimelist.net/anime/${id}`
    }

    async function getAnimesSongs(animeUrlList) {
        if (animeUrlList.length === 0) { 
            return []
        }
        
        let currAnimeURL = animeUrlList[0]
        const currAnimeSongList = await getAnimeSongs(currAnimeURL)

        wait()  // Be nice to the website!
        
        return currAnimeSongList.concat(await getAnimesSongs(animeUrlList.slice(1)))
    }

    async function getAnimesUrls(searchStringsList, ytSearcher) {
        if (searchStringsList.length === 0) {
            return []
        }

        const searchString = searchStringsList[0]
        const sanitizedSearchString = sanitizeMusicName(searchString)

        const song = {
            name: sanitizedSearchString,
            URL: await ytSearcher.search(sanitizedSearchString)
        }

        wait()  // Be nice to the website!

        if (! song.URL) {
            return await getAnimesUrls(searchStringsList.slice(1), ytSearcher)
        }
        else {
            return [song].concat(await getAnimesUrls(searchStringsList.slice(1), ytSearcher))
        }
    }

    if (config.profileName == "") {
        console.log("[ERROR] No profile name specified on config.js file.")
        return
    }

    console.log(`Collecting profile data [profileName="${config.profileName}"]`)
    const animeIdList = await scrapProfile(config.profileName)

    if (! animeIdList) {
        console.log('[ERROR] Invalid MyAnimeList profile.')
        return
    }

    let animeUrlList = []
    animeIdList.forEach(id => {
        animeUrlList.push(getUrlFromId(id))
    })

    console.log('Collecting anime songs')
    const songList = await getAnimesSongs(animeUrlList)

    console.log('Collecting songs URLs')
    const ytSongList = await getAnimesUrls(songList, new YoutubeSearcher())

    fs.writeFile(
        `./${config.profileName}_list.json`, 
        JSON.stringify({songList: ytSongList}, 0, 4), 
        function(err) {if (err) console.error(err)}
    )
}

main()