const YoutubeSearcher = require('./youtube-searcher')
const YoutubeDownloader = require('./youtube-downloader')
const scrapProfile = require('./mal-profile-scrap')
const getAnimeSongs = require('./mal-anime-scrap')
const sleep = require('system-sleep')
const cliProgress = require('cli-progress')
const ffmpeg = require('ffmpeg')
const bar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic)
const config = require('../config.js')

async function main() {
    function wait() {
        sleep(Math.random()*1000 + 500)
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
    
    console.log('Collecting profile animes... ' + config.profileName)
    const animeIdList = await scrapProfile(config.profileName)

    const animeUrlList = []
    for (let i = 0; i < animeIdList.length; ++i) {
        animeUrlList.push(`https://myanimelist.net/anime/${animeIdList[i]}`)
    }

    console.log('Collecting anime songs')
    let songList = []

    let getAllSongs = async function(x) {
        if (x < animeUrlList.length) {
            console.log(`Requesting anime page ${x}/${animeUrlList.length}`)
            const animeSongList = await getAnimeSongs(animeUrlList[x])
            animeSongList.forEach(song => {
                songList.push(song)
            })
            console.log(animeSongList)
            wait()
            await getAllSongs(x+1)
        }
    }
    await getAllSongs(0)


    console.log('Collecting songs URLs')
    let ytSearcher = new YoutubeSearcher()
    let ytSongList = []
    let getAllUrls = async function(x) {
        if (x < songList.length) {
            console.log(`Requesting song ${x}/${songList.length}`)
            let currentSong = songList[x]
            let sanitizedSong = sanitizeMusicName(currentSong)
        
            let newSong = {
                name: sanitizedSong,
                URL: await ytSearcher.search(sanitizedSong)
            }

            if (newSong.URL) {
                ytSongList.push(newSong)
                console.log(ytSongList[ytSongList.length-1])
            }
            await getAllUrls(x+1)
        }
    }
    await getAllUrls(0)

    console.log('Downloading songs')
    let ytDownloader = new YoutubeDownloader()
    let downloadAllSongs = async function(x) {
        if (x < ytSongList.length) {
            console.log(`Downloading song ${x}/${ytSongList.length}`)
            let { name, URL } = ytSongList[x]
            ytDownloader.downloadMp4Stream(URL, name).then(_ => {
                downloadAllSongs(x+1)
            })
        }
    }
    await downloadAllSongs(0)
}

main()