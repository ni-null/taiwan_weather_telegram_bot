const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
const axios = require('axios');
const port = process.env.PORT || 4000;
const fs = require("fs");

//設置json格式
app.use(express.json());

//資料
const city_json = require('./json/citys_list.json')
const dist_json = require('./json/dist_list.json')


//引入
const get_weather = require('./part/get_weather')
const sub = require('./part/sub')
const bind = require('./part/bind')
const other = require('./part/other')


other.creat_api_key()


/* 讀取api_key */


const api_key = require('./api_key.json')
const TOKEN = api_key.TOKEN
const url = api_key.url

/* 讀取api_key */



// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN, {
    polling: true,
    onlyFirstMatch: true,
});

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`);



// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {

    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Start Express Server
app.listen(port, () => {
    console.log(`Express server is listening on ${port}`);
});




//判斷鄉鎮

bot.onText(/(區)|(鎮)|(市)|(縣)|(鄉)/, async msg => {




    msg.text = msg.text.replace('台', '臺')


    //檢查是否為縣市
    const check_city = Object.keys(city_json[1][0]).some(e => e == msg.text);


    const town_data = msg.text.split('/')



    // 鄉鎮
    if (!check_city) {

        const result = await get_weather.town_weatger(town_data[0], town_data[1])

        bot.sendMessage(msg.chat.id, result.weather_info, result.button);


    }

    //城市

    if (check_city) {

        const result = await get_weather.city_weatger(msg.text)

        bot.sendMessage(msg.chat.id, result.weather_info, result.button);


    }


}

)


/* 回調判斷 */
bot.on('callback_query', async function onCallbackQuery(callbackQuery) {


    const callback_text = callbackQuery.data.split('-')


    //鄉鎮回調
    if (callback_text[0] == 'town') {

        const action = callback_text[2] + '天氣 '
        const msg = callbackQuery.message;

        bot.deleteMessage(msg.chat.id, msg.message_id);

        const result = await get_weather.town_weatger(callback_text[1], callback_text[2])

        bot.sendMessage(msg.chat.id, result.weather_info, result.button);


    }


    //縣市回調(查看鄉鎮)
    if (callback_text[0] == 'city') {

        const msg = callbackQuery.message;

        const button = other.get_towns(callback_text[1])

        bot.sendMessage(msg.chat.id, "『" + callback_text[1] + '』的鄉鎮天氣', button)


    }

    //訂閱回調
    if (callback_text[0] == 'sub') {

        //處理鄉鎮資訊
        const msg = callbackQuery.message;

        const result = await sub.add_sub(msg.chat.id, callback_text[1] + "-" + callback_text[2])

        bot.sendMessage(msg.chat.id, result);

    }


    //訂閱回調刪除
    if (callback_text[0] == 'sub_delete') {

        const msg = callbackQuery.message;

        const result = await sub.delete_sub(msg.chat.id, callback_text[1])

        const button = await sub.get_sub(msg.chat.id)

        bot.deleteMessage(msg.chat.id, msg.message_id);

        bot.sendMessage(msg.chat.id, '當前訂閱狀態', button);



    }


    //獲取天氣回調
    if (callback_text[0] == 'get_weather') {

        const msg = callbackQuery.message;

        const get_data = callback_text[1].split('/')



        let result

        if (get_data[1] == null) {
            result = await get_weather.city_weatger(get_data[0])
        }
        else {
            result = await get_weather.city_weatger(get_data[0], get_data[1])
        }

        bot.sendMessage(msg.chat.id, result.weather_info, result.button);


    }


    //解除綁定

    if (callback_text[0] == 'un_bind') {
        const msg = callbackQuery.message;

        const result = await bind.user_un_bind(msg.chat.id)

        bot.sendMessage(msg.chat.id, result);
    }



});




//綁定
bot.onText(/(TG@)/, async msg => {

    const result = await bind.user_bind(msg.chat.id, msg.text)

    bot.sendMessage(msg.chat.id, result)

})

/* 


bot.onText(/(TG#un_bind)/, async msg => {

    const result = await bind.user_un_bind(msg.chat.id)

    bot.sendMessage(msg.chat.id, result);

})
 */

//獲取訂閱
bot.onText(/訂閱狀態/, async msg => {

    const button = await sub.get_sub(msg.chat.id)

    if (button.reply_markup.inline_keyboard[0] != undefined) bot.sendMessage(msg.chat.id, '以下是你當前訂閱資料', button)

    else if (button.reply_markup.inline_keyboard[0] == undefined) bot.sendMessage(msg.chat.id, '查詢不到你的訂閱資料')

    else bot.sendMessage(msg.chat.id, '查詢失敗，請在試一次')


})


//綁定狀態
bot.onText(/綁定狀態/, async msg => {


    const button = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '解除綁定', callback_data: 'un_bind-' }]
            ]
        }
    }

    const result = await bind.user_bind_status(msg.chat.id)

    if (result == '') bot.sendMessage(msg.chat.id, '未綁定')

    else bot.sendMessage(msg.chat.id, `你的TG已和『${result}』`, button)


})




//綁定狀態
bot.onText(/北|中|南|東\/外島/, msg => {


    const button = other.get_city_button(msg.text)

    bot.sendMessage(msg.chat.id, '北部地區', button)


})



//無匹配
bot.onText(/.+/, msg => {

    const button = {
        reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: false,
            keyboard: [
                [
                    { text: '綁定狀態' },
                    { text: '訂閱狀態' }
                ],
                [
                    { text: '北' },
                    { text: '中' },
                    { text: '南' },
                    { text: '東/外島' }
                ]
            ]
        }
    }
    bot.sendMessage(msg.chat.id, '不知道你輸入啥欸', button)

})
