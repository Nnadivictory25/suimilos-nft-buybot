import { MIST_PER_SUI } from "@mysten/sui/utils";
import { suiClient } from "..";
import { NFT_IMAGE_BASE_URL, TRADE_PORT_BUY_EVENT_TYPE } from "../constants";
import { getNftNumber, getRarityScore } from "../utils";
import { sendSaleMessage } from "../tg-bot/utils";

const NFT_INDEXED_DATA_PATH = 'indexed-data/nfts.json';

let lastProcessedTimestamp = Date.now();

export async function pollForBuyEvents() {
    console.log('✅ Polling for buy events..');

    const nfts = await Bun.file(NFT_INDEXED_DATA_PATH).json() as NFT[];
    const { data: buyEvents } = await suiClient.queryEvents({
        query: {
            MoveEventType: TRADE_PORT_BUY_EVENT_TYPE,
        },
        order: 'descending',
        limit: 20
    });

    const newBuyEvents = buyEvents.filter((event) => (Number(event.timestampMs) > lastProcessedTimestamp)).filter((event) => nfts.some((nft) => nft.id === (event.parsedJson as TradePortBuyEvent).nft_id));

    if (newBuyEvents.length > 0) {
        console.log(`✅ Found ${newBuyEvents.length} new buy events`);
        for (const event of newBuyEvents) {
            const nft = nfts.find((nft) => nft.id === (event.parsedJson as TradePortBuyEvent).nft_id);

            if (nft) {
                console.log(`✅ Sale event found and processing for ${nft.name}...`);

                const salesEventInfo = (event.parsedJson as TradePortBuyEvent)
                const suiAmount = (Number(salesEventInfo.price) + Number(salesEventInfo.commission)) / Number(MIST_PER_SUI)
                const rarity = await getRarityScore(nft.id)


                try {
                    const salesMessageParams: SalesMessageParams = {
                        name: nft.name,
                        amount: suiAmount,
                        rarity: rarity,
                        buyer: salesEventInfo.buyer,
                        imageUrl: `${NFT_IMAGE_BASE_URL}/${getNftNumber(nft.name)}.png`
                    }

                    await sendSaleMessage(salesMessageParams);
                    console.log(`✅ Sent sale message for ${nft.name}`);
                } catch (error) {
                    console.error(`Error sending sale message for ${nft.name}:`, error);
                }
            }
        }
    }

    lastProcessedTimestamp = Date.now();
}