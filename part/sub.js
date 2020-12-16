
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');


//資料
const city_json = require('../json/citys_list.json')
const dist_json = require('../json/dist_list.json')


const city_list_json = city_json[1]



//用戶資訊
const TOKEN = '1460212562:AAEHeaeu4vPV3s75Ms0WrxExfpN-lL630Bk';
const url = 'https://weather-bot.ninull.com';
//用戶資訊


// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);



module.exports = {



    add_sub: function (telegram_id, sub_data) {


        sub_data = sub_data.split('-')

        //城市中英
        sub_data_eng = city_json[1][0][sub_data[0]]
        console.log(telegram_id, sub_data)

        let data

        //沒有鄉鎮
        if (sub_data[1] == 'undefined') {
            data = {
                telegram_id: telegram_id,
                sub_data: sub_data_eng
            }
            sub_data = sub_data[0]
        }

        //有鄉鎮鄉鎮
        else {
            data = {
                telegram_id: telegram_id,
                sub_data: sub_data_eng + '/' + sub_data[1]
            }
        }

        console.log(data)


        axios.put("http://127.0.0.1:5000/telegtam/sub", data).then((response) => {

            if (response["data"])
                bot.sendMessage(telegram_id, sub_data + "訂閱成功");

            else
                bot.sendMessage(telegram_id, sub_data + "訂閱失敗，請在試一次");


        })

    }

}