type NFT = {
    id: string;
    name: string;
    attributes: Record<string, string>;
}

type NFTMintedEvent = {
    minter: string
    nft_id: string
    phase: number
    token_id: string
}

type RarityScore = {
    id: string
    rarityScore: number
}

type CoinGeckoAPIResp = {
    sui: {
        usd: number
    }
}

type TradePortBuyEvent = {
    beneficiary: string
    buyer: string
    buyer_kiosk_id: string
    commission: string
    listing_id: string
    nft_id: string
    price: string
    seller: string
    seller_kiosk_id: string
}

type SalesMessageParams = {
    name: string
    amount: number
    rarity: number
    buyer: string
    imageUrl: string
}