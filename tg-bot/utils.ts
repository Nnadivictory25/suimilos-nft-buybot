import { InlineKeyboard } from "grammy"
import { TRADE_PORT_URL, MY_USERNAME, SUI_SCAN_URL, SUIMILOS_GROUP_ID, MY_GROUP_ID } from "../constants"
import { getSuiPrice } from "../utils"
import { bot } from "."

const isDev = process.env.NODE_ENV === 'development';
const GROUP_ID = isDev ? MY_GROUP_ID : SUIMILOS_GROUP_ID;
console.log(`🔍 Using group ID: ${GROUP_ID} on ${isDev ? 'development' : 'production'}`);

function formatUrl({ url, text }: { url: string, text: string }) {
    return `<b><a href="${url}">${text}</a></b>`
}

const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

const keyboard = new InlineKeyboard()
    .url('🛒 TradePort', TRADE_PORT_URL)
    .url('👨‍💻 Bot Dev', `https://t.me/${MY_USERNAME}`)

export async function sendSaleMessage({ name, amount, rarity, buyer, imageUrl }: SalesMessageParams) {
    const suiPrice = await getSuiPrice();
    const usdAmount = suiPrice * amount;

    const msg = `
🤪 <b>${name}</b> just found a new home 🥹

🏅 Rank: <b>${rarity}</b>

Sold for <b>${formatAmount(amount)} SUI</b> (${formatAmount(usdAmount)} USD)

${formatUrl({ url: `${SUI_SCAN_URL(buyer)}`, text: 'Buyer' })}`

    await bot.api.sendPhoto(GROUP_ID, imageUrl, {
        caption: msg,
        reply_markup: keyboard,
        parse_mode: 'HTML',
    });

}