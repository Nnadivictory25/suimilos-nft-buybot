import { MIST_PER_SUI } from "@mysten/sui/utils";
import { suiClient } from "..";
import { NFT_IMAGE_BASE_URL, TRADE_PORT_BUY_EVENT_TYPE, NEW_TRADE_PORT_BUY_EVENT_TYPE } from "../constants";
import { getNftNumber, getRarityScore } from "../utils";
import { sendSaleMessage } from "../tg-bot/utils";

const NFT_INDEXED_DATA_PATH = 'indexed-data/nfts.json';

let lastProcessedTimestamp = Date.now();
const processedEventIds = new Set<string>();

export async function pollForBuyEvents() {
    console.log('✅ Polling for buy events..');

    const nfts = await Bun.file(NFT_INDEXED_DATA_PATH).json() as NFT[];

    async function poll() {
        try {
            // Query both event types concurrently
            const [oldBuyEventsResult, newBuyEventsResult] = await Promise.all([
                suiClient.queryEvents({
                    query: {
                        MoveEventType: TRADE_PORT_BUY_EVENT_TYPE,
                    },
                    order: 'descending',
                    limit: 50
                }),
                suiClient.queryEvents({
                    query: {
                        MoveEventType: NEW_TRADE_PORT_BUY_EVENT_TYPE,
                    },
                    order: 'descending',
                    limit: 50
                })
            ]);

            // Combine events from both queries
            const allBuyEvents = [...oldBuyEventsResult.data, ...newBuyEventsResult.data];

            // Filter for new events (by timestamp) and our NFT collection, exclude already processed
            const newBuyEvents = allBuyEvents
                .filter((event) => Number(event.timestampMs) > lastProcessedTimestamp)
                .filter((event) => !processedEventIds.has(`${event.id.txDigest}-${event.id.eventSeq}`))
                .filter((event) => nfts.some((nft) => nft.id === (event.parsedJson as TradePortBuyEvent).nft_id));

            if (newBuyEvents.length > 0) {
                console.log(`✅ Found ${newBuyEvents.length} new buy events`);

                for (const event of newBuyEvents) {
                    const nft = nfts.find((nft) => nft.id === (event.parsedJson as TradePortBuyEvent).nft_id);

                    if (nft) {
                        console.log(`✅ Sale event found and processing for ${nft.name}...`);

                        const salesEventInfo = (event.parsedJson as TradePortBuyEvent)
                        const suiAmount = (Number(salesEventInfo.price) + (salesEventInfo.commission ? Number(salesEventInfo.commission) : 0)) / Number(MIST_PER_SUI)
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

                            // Mark as processed
                            processedEventIds.add(`${event.id.txDigest}-${event.id.eventSeq}`);
                        } catch (error) {
                            console.error(`❌ Error sending sale message for ${nft.name}:`, error);
                        }
                    }
                }

                // Update timestamp to most recent successfully processed event
                const mostRecentTimestamp = Math.max(...newBuyEvents.map(event => Number(event.timestampMs)));
                lastProcessedTimestamp = mostRecentTimestamp;
            }

        } catch (error) {
            console.error('❌ Error polling for buy events:', error);
        }

        // Schedule next poll after this one completes
        setTimeout(poll, 3000);
    }

    // Start polling
    poll();
}
