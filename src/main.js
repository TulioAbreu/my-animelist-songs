const AnimeListExtractor = require('./animeListExtractor')
const MusicNamesExtractor = require('./musicNamesExtractor')
const fs = require('fs')
const process = require('process')

async function main(argv) {
    async function scrapeAnimeList(userName) {
        let animeListExtractor = new AnimeListExtractor(userName);
        await animeListExtractor.start()
        return animeListExtractor.getTitles()
    }

    async function getAnimeSongs(animePageLinks) {
        let animeSongs = []
        for (let i = 0; i < animePageLinks.length; ++i) {
            let musicNamesExtractor = new MusicNamesExtractor(animePageLinks[i])
            await musicNamesExtractor.start()

            let songs = musicNamesExtractor.getSongs()
            let animeName = musicNamesExtractor.getAnimeName()
            for (let j = 0; j < songs.length; ++j) {
                if (songs[j].length > 3) {
                    let indexOfStart = songs[j].search(/:\w?/)
                    if (indexOfStart == -1) {
                        indexOfStart = 0;
                    } else {
                        indexOfStart += 1
                    }
                    let indexOfEps = songs[j].search(/ \(ep/)
                    songs[j] = songs[j].slice(indexOfStart, indexOfEps + 1)
                    songs[j] = songs[j].replace(' "', '')
                    songs[j] = songs[j].replace('"', '')
                    songs[j] = songs[j].replace('"', '')
                    songs[j] = songs[j].replace('(', '')
                    songs[j] = songs[j].replace('(', '')
                    songs[j] = songs[j].replace(')', '')
                    songs[j] = songs[j].replace('\n', '')
                    songs[j] = songs[j].replace(')', '')
                    songs[j] = songs[j].replace(/[^\x00-\x7F]/g, "");
                    if (songs[j] != "") {
                        animeSongs.push({
                            'animeName': animeName,
                            'songName': songs[j]
                        })
                    }
                }
            }
        }
        
        return animeSongs
    }

    if (argv.length < 3) {
        console.log("node src/main.js <yourMyAnimeListNick>")
        return;
    }
    let userName = argv[2];

    let animeIdList = await scrapeAnimeList(userName)
    console.log("[LOG] Searching profile...")
    let animePageLinks = []
    for (let i = 0; i < animeIdList.length; ++i) {
        animePageLinks.push('https://myanimelist.net/anime/' + animeIdList[i])
    }

    console.log("[LOG] Getting anime songs...")
    let songs = await getAnimeSongs(animePageLinks)

    let songsJson = JSON.stringify(songs, null, 4)
    fs.writeFile('./animeSongs.json', songsJson, () => {
        console.log("Success!")
    })
}

main(process.argv)