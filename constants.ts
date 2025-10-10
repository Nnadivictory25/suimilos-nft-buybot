export const NFT_OBJECT_ID = '0xf75f70c333292e9258ba1c6fc44e6bccfa2bd03bbed6d8e6e343f06f3b22a7f4'
export const NFT_TYPE = '0xf75f70c333292e9258ba1c6fc44e6bccfa2bd03bbed6d8e6e343f06f3b22a7f4::suimilios::SUIMILIOS_NFT'

export const NFT_MINT_EVENT_TYPE = '0xf75f70c333292e9258ba1c6fc44e6bccfa2bd03bbed6d8e6e343f06f3b22a7f4::suimilios::NFTMinted'
export const TRADE_PORT_BUY_EVENT_TYPE = '0xec175e537be9e48f75fa6929291de6454d2502f1091feb22c0d26a22821bbf28::kiosk_listings::BuyEvent'

export const COIN_GECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd'
export const SUI_SCAN_URL = (account: string) => `https://suiscan.xyz/mainnet/account/${account}`
export const TRADE_PORT_URL = `https://www.tradeport.xyz/sui/collection/${encodeURIComponent(NFT_TYPE)}?bottomTab=trades&tab=items`
export const NFT_IMAGE_BASE_URL = 'https://walrus.doonies.net/suimilios'

export const GROUP_ID = '-4564790096';
export const MY_USERNAME = 'victory_web3'