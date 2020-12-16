
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

    city_weatger: function (user_id, city_name) {




        axios.get("https://weather-api.ninull.com/city/taiwan").then((response) => {
            let w_data = response["data"].filter(
                (x) => x.cityname === city_name
            );

            if (w_data[0] == null) resolve("空")
            else {



                //按鈕
                const city_button = {
                    reply_markup: {
                        remove_keyboard: true,
                        inline_keyboard: [
                            [{ text: '網站查看圖表', url: 'https://weather.ninull.com/#/weather/' + w_data[0].cityname_eng }],
                            [{ text: '查看鄉鎮', callback_data: 'city-' + city_name }],
                            [{ text: '訂閱', callback_data: 'sub-' + city_name }]
                        ]
                    }
                }

                //資料
                const w_name = w_data[0].cityname_eng
                let weather_info = '*' + city_name + '*' + '\n'
                w_data.forEach(e => {
                    weather_info +=
                        e.time_1 + "(" + e.day_2 + ") " + e.time_2 + " " + e.WD + " \n " +
                        "氣溫:" + e.temp + "  降雨機率" + e.rain + "\n\n"
                });




                bot.sendMessage(user_id, weather_info, city_button);

            }



        })


    }

    ,
    town_weatger: function (user_id, city, town) {


        //中英轉換
        city_eng = city_list_json[0][city]



        //查詢
        return new Promise(function (resolve) {



            axios.get("http://weather-api.ninull.com/city/" + city_eng).then((response) => {
                let w_data = response["data"].filter(
                    (x) => x.cityname === town
                );



                //中文url編碼
                let town_url = 'https://weather.ninull.com/#/weather/' + city_eng + '/' + town


                town_url = encodeURI(town_url)


                if (w_data[0] == null) resolve("空")
                else {

                    //取六筆

                    w_data.splice(6, 8)

                    //按鈕
                    const city_button = {
                        reply_markup: {
                            remove_keyboard: true,

                            inline_keyboard: [

                                [{ text: '網站查看圖表', url: town_url }],
                                [{ text: '查看鄉鎮', callback_data: 'city-' + city }],
                                [{ text: '訂閱', callback_data: 'sub-' + city + '-' + town }]

                            ]
                        }
                    }



                    let weather_info = '*' + city + town + '*' + '\n' + '\n'
                    w_data.forEach(e => {
                        weather_info +=
                            e.time_1 + "(" + e.day_2 + ") " + e.time_2 + " " + e.WD + " \n " +
                            "氣溫:" + e.temp + "  降雨機率" + e.rain + "\n\n"
                    });

                    resolve(weather_info)

                    bot.sendMessage(user_id, weather_info, city_button);
                }


            })



        })




    }

}