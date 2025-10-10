const NFTS_DATA_PATH = 'indexed-data/nfts.json';
const RARITY_SCORE_DATA_PATH = 'indexed-data/rarity-score.json';

async function calculateRarity() {
    console.log('📊 Starting rarity score calculation...');
    const nfts = await Bun.file(NFTS_DATA_PATH).json() as NFT[];
    const totalNfts = nfts.length;

    if (totalNfts === 0) {
        console.log('No NFTs found to calculate rarity.');
        return;
    }

    const traitCounts = new Map<string, Map<string, number>>();

    // 1. Count trait occurrences
    for (const nft of nfts) {
        for (const [traitType, traitValue] of Object.entries(nft.attributes)) {
            if (!traitCounts.has(traitType)) {
                traitCounts.set(traitType, new Map<string, number>());
            }
            const values = traitCounts.get(traitType)!;
            values.set(traitValue, (values.get(traitValue) || 0) + 1);
        }
    }

    // 2. Calculate rarity scores for each NFT
    const rarityScoresWithFloat = nfts.map(nft => {
        let totalRarityScore = 0;
        for (const [traitType, traitValue] of Object.entries(nft.attributes)) {
            const count = traitCounts.get(traitType)!.get(traitValue)!;
            const traitRarityScore = 1 / (count / totalNfts);
            totalRarityScore += traitRarityScore;
        }
        return {
            id: nft.id,
            rarityScore: totalRarityScore
        };
    });

    // 3. Sort by the calculated float score to determine the rank
    rarityScoresWithFloat.sort((a, b) => b.rarityScore - a.rarityScore);

    // 4. Create the final rarity scores using the rank
    const rarityScores: RarityScore[] = rarityScoresWithFloat.map((score, index) => ({
        id: score.id,
        rarityScore: index + 1,
    }));


    // 5. Store the rarity scores
    await Bun.write(RARITY_SCORE_DATA_PATH, JSON.stringify(rarityScores, null, 2));
    console.log(`✅ Rarity scores calculated and saved to ${RARITY_SCORE_DATA_PATH}`);

    // 6. Rank and display the results
    console.log("\n🏆 NFT Rarity Ranking (Top 10):");
    rarityScores.slice(0, 10).forEach((score) => {
        console.log(
            `Rank ${score.rarityScore}: ${score.id}`
        );
    });
}

calculateRarity().catch(console.error);
