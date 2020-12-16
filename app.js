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
const city_list_json = city_json[1]


//引入
const get_weather = require('./part/get_weather')
const sub = require('./part/sub')


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




    const inline_keyboard = {

        keyborad: [[
            { text: '台南市' },
            { text: '台北市' }
        ],
        [{ text: '北部' },
        { text: '中部' },
        { text: '南部' },
        { text: '東部/外島' }
        ]]

    }



    bot.on('message', (msg) => {

        const city_button = {
            reply_markup: {
                resize_keyboard: true,
                one_time_keyboard: false,
                keyboard: [
                    [
                        { text: '台南市' },
                        { text: '第一排之二' }
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

    bot.onText(/(區)|(鎮)|(市)|(縣)|(鄉)/, msg => {


        msg.text = msg.text.replace('台', '臺')


        //檢查是否為縣市
        const check_city = Object.keys(city_json[1][0]).some(e => e == msg.text);


        const town_data = msg.text.split('.')



        // 鄉鎮
        if (!check_city) {
            get_weather.town_weatger(msg.chat.id, town_data[0], town_data[1])

        }

        //城市

        if (check_city) {

            get_weather.city_weatger(msg.chat.id, msg.text)
        }


    }

    )


    //回調判斷
    bot.on('callback_query', function onCallbackQuery(callbackQuery) {


        const callback_text = callbackQuery.data.split('-')

        //鄉鎮回調
        if (callback_text[0] == 'town') {

            const action = callback_text[2] + '天氣 '
            const msg = callbackQuery.message;
            const opts = {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            };
            bot.editMessageText(null, opts);
            get_weather.town_weatger(msg.chat.id, callback_text[1], callback_text[2])

        }


        //縣市回調
        else if (callback_text[0] == 'city') {


            //處理鄉鎮資訊
            let dist_data
            dist_json.forEach(e => {
                if (e.name == callback_text[1])
                    dist_data = e.dist
            })


            let dist_button = []

            dist_data.forEach(e => {

                dist_button.push({
                    text: e,
                    callback_data: 'town-' + callback_text[1] + '-' + e
                })

            });

            const dist_button_length = dist_button.length

            let dist_line_button = []

            for (let i = 0; i < dist_button_length / 3; i++) {
                dist_line_button.push(dist_button.splice(0, 3))
            }

            //處理鄉鎮資訊

            const msg = callbackQuery.message;


            const button = {
                reply_markup: {
                    remove_keyboard: true,
                    inline_keyboard: dist_line_button

                }
            }


            bot.sendMessage(msg.chat.id, "『" + callback_text[1] + '』的鄉鎮天氣', button)


        }

        //訂閱回調
        else if (callback_text[0] == 'sub') {

            //處理鄉鎮資訊
            const msg = callbackQuery.message;

            sub.add_sub(msg.chat.id, callback_text[1] + "-" + callback_text[2])


        }

    });




    bot.onText(/(新增帳號)/, msg => {


        msg.text = msg.text.replace('台', '臺')


        sub.add_sub(msg.chat.id, '/taiwan')

    }

    )


}