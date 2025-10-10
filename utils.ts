import { COIN_GECKO_API_URL } from "./constants";
const RARITY_SCORE_DATA_PATH = 'indexed-data/rarity-score.json';
const PRICE_CACHE = new Map<string, number>();

export async function getSuiPrice() {
    if (PRICE_CACHE.has('sui')) {
        return PRICE_CACHE.get('sui') as number;
    }
    const response = await fetch(COIN_GECKO_API_URL);
    const data = await response.json() as CoinGeckoAPIResp;
    PRICE_CACHE.set('sui', data.sui.usd);
    return data.sui.usd;
}

export async function getRarityScore(id: string) {
    const rarityScores = await Bun.file(RARITY_SCORE_DATA_PATH).json() as RarityScore[];
    return rarityScores.find((score) => score.id === id)?.rarityScore || 0
}

export function getNftNumber(name: string) {
    const nftNumber = name.match(/#(\d+)/)?.[1] || '';
    return nftNumber;
}