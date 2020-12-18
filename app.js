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



//api_key



//讀取api_key
fs.open("./api_key.json", function (err, fd) {
    if (err != null) {
        console.log("沒有偵測到api_key檔案");

        fs.appendFile("./api_key.json", "", function (err) {
            if (err) console.log("已經創建『api_key.json』請於裡面添加apikey");
        });
    } else {
        fs.readFile("./api_key.json", function (err, data) {
            const key = data.toString();

            if (key.length != 0) {


                const api_key = require('./api_key.json')

                start(api_key)

            } else console.log("『api_key.json");
        });
    }
});

function start(api_key) {


    //用戶資訊
    const TOKEN = api_key.TOKEN
    const url = api_key.url
    //用戶資訊


    // No need to pass any parameters as we will handle the updates with Express
    const bot = new TelegramBot(TOKEN);

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



    bot.on('message', (msg) => {

        const city_button = {
            reply_markup: {
                resize_keyboard: true,
                one_time_keyboard: false,
                keyboard: [
                    [
                        { text: '台南市' },
                        { text: 'get' }
                    ],
                    [
                        { text: '北' },
                        { text: '中' },
                        { text: '南' },
                        { text: '東' },
                        { text: '外島' }
                    ]
                ]
            }
        }

        bot.sendMessage(msg.chat.id, '不明內容', city_button);

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

            bot.sendMessage(msg.chat.id, result);


        }


        //獲取天氣回調
        if (callback_text[0] == 'get') {

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

    });




    //綁定
    bot.onText(/(TG@)/, async msg => {

        const result = await bind.user_bind(msg.chat.id, msg.text)

        bot.sendMessage(msg.chat.id, result)

    })



    //解除綁定
    bot.onText(/(TG#un_bind)/, async msg => {

        const result = await bind.user_un_bind(msg.chat.id)

        bot.sendMessage(msg.chat.id, result);

    })


    //獲取訂閱
    bot.onText(/(get)/, async msg => {

        const button = await sub.get_sub(msg.chat.id)

        if (button) {
            bot.sendMessage(msg.chat.id, '當前訂閱資料', button)
        }
        else {
            bot.sendMessage(msg.chat.id, '獲取訂閱失敗')

        }



    })


}


