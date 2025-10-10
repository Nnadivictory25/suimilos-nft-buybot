async function getStats() {
    const nfts = await Bun.file('indexed-data/nfts.json').json() as NFT[];
    const stats = {
        nfts: nfts.length,
    }
    console.log(stats);
}

getStats().catch(console.error);