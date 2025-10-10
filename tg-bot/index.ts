import { Bot } from "grammy";
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not set');
}

export const bot = new Bot(BOT_TOKEN);

bot.api.setMyCommands([
    {
        command: 'id',
        description: 'Get chat ID',
    },
]);

bot.command('id', async (ctx) => {
    const isGroup = ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup';
    if (isGroup) {
        await ctx.reply(`ID: <code>${ctx.chat?.id}</code>`, {
            parse_mode: 'HTML',
        });
    } else {
        await ctx.reply(`ID: <code>${ctx.from?.id}</code>`, {
            parse_mode: 'HTML',
        });
    }
});