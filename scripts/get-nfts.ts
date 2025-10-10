import { suiClient } from "../index";
import { NFT_MINT_EVENT_TYPE } from "../constants";
import type { EventId } from "@mysten/sui/client";
import { sleep } from "bun";
const NFT_INDEXED_DATA_PATH = 'indexed-data/nfts.json';
const CURSOR_DATA_PATH = 'scripts/last-cursor.json';

type SuiEventsCursor = EventId | null | undefined;

async function getNfts() {
    let startTime = Date.now();
    let lastCursor = await Bun.file(CURSOR_DATA_PATH).json() as SuiEventsCursor;
    let hasNextPage = true;
    let batchCount = 0;

    while (hasNextPage) {
        let batchStartTime = Date.now();
        const { data, hasNextPage: nextHasNextPage, nextCursor } = await suiClient.queryEvents({
            query: {
                MoveEventType: NFT_MINT_EVENT_TYPE,
            },
            order: 'ascending',
            cursor: lastCursor,
        });
        hasNextPage = nextHasNextPage;
        lastCursor = nextCursor;
        await storeCursor(lastCursor);
        const nftIds = data.map((event) => (event.parsedJson as NFTMintedEvent).nft_id);
        const nftData = await getBatchNFTsData(nftIds);
        await storeNFTs(nftData);
        await sleep(200)

        let batchEndTime = Date.now();
        batchCount++;
        console.log(`Batch ${batchCount} time taken: ${(batchEndTime - batchStartTime) / 1000}s`);
    }
    let endTime = Date.now();
    console.log(`Total time taken for all batches: ${(endTime - startTime) / 1000 / 60} minutes`);
}

async function getBatchNFTsData(nftIds: string[]): Promise<NFT[]> {
    const nftObjects = await suiClient.multiGetObjects({
        ids: nftIds,
        options: {
            showContent: true,
        }
    });

    return nftObjects.map((nft) => {
        const fields = (nft.data!.content as any)?.fields;
        const attributesArray = fields?.attributes.fields.contents || [];
        const attributes: Record<string, string> = {};

        for (const entry of attributesArray) {
            if (entry.fields && entry.fields.key && entry.fields.value) {
                attributes[entry.fields.key] = entry.fields.value;
            }
        }

        return {
            id: nft.data!.objectId,
            name: fields?.name || '',
            attributes,
        }
    })
}

async function storeNFTs(nfts: NFT[]) {
    let currentData = await Bun.file(NFT_INDEXED_DATA_PATH).json() as NFT[];
    currentData.push(...nfts);
    await Bun.write(NFT_INDEXED_DATA_PATH, JSON.stringify(currentData));
}

async function storeCursor(cursor: SuiEventsCursor) {
    await Bun.write(CURSOR_DATA_PATH, JSON.stringify(cursor));
}

getNfts().catch(console.error);