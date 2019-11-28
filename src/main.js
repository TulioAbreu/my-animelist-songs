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
        sleep(Math.random()*1000 + 2000)
    }

    function sanitizeMusicName(name) {
        name = name.replace(/(ep[s]*[ ]*[0-9]+\-[0-9]*)+/g, '')
            .replace(/([0-9]+\-[0-9]*)+/g, '')
            .replace(/#[0-9]+[:]*/g, '')
            .replace(/[^a-zA-Z\d\s:]/g, ' ')
            .replace('"', '')
            .replace(/[ ]+/g, ' ')
        return name
    }
    
    console.log('Collecting profile animes...')
    const animeIdList = await scrapProfile(config.profileName)

    const animeUrlList = []
    for (let i = 0; i < animeIdList.length/200; ++i) {
        animeUrlList.push(`https://myanimelist.net/anime/${animeIdList[i]}`)
    }

    console.log('Collecting anime songs')
    bar.start(animeUrlList.length, 0)
    let songList = []
    for (let i = 0; i < animeUrlList.length; ++i) {
        const animeSongList = await getAnimeSongs(animeUrlList[i])
        for (let j = 0; j < animeSongList.length; ++j) {
            songList.push(animeSongList[j])
        }
        bar.increment()
        wait()
    }
    bar.stop()

    console.log('Collecting songs URLs')
    let ytSearcher = new YoutubeSearcher()
    let ytSongList = []
    bar.start(songList.length, 0)
    for (let i = 0; i < songList.length; ++i) {
        let currentSong = songList[i]
        let sanitizedSong = sanitizeMusicName(currentSong)

        ytSongList.push({
            name: sanitizedSong,
            URL: await ytSearcher.search(sanitizedSong)
        })
        bar.increment()
        wait()
    }
    bar.stop()

    console.log(ytSongList)

    // console.log('Downloading songs')
    // let ytDownloader = new YoutubeDownloader()
    // for (let i = 0; i < ytSongList.length; ++i) {
    //     let { name, URL } = ytSongList[i]
    //     let streamMP4 = ytDownloader.downloadMp4Stream(URL)
    //     new ffmpeg({ source: streamMP4, nolog: true })
    //         .setFfmpegPath(config.ffmpegPath)
    //         .toFormat('mp3')
    //         .saveToFile(`./songs/${name}`)
    // }
}

main()