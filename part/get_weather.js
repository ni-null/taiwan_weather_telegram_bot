/* 處理天氣獲取相關 */


const axios = require('axios');


//資料
const city_json = require('../json/citys_list.json')
const dist_json = require('../json/dist_list.json')
const city_list_json = city_json[1]

//api 
const api_key = require('../api_key.json')


module.exports = {



    city_weatger: async function (city_name) {


        const response = await axios.get(`${api_key.api_url}city/taiwan`)


        let w_data = response["data"].filter(
            (x) => x.cityname === city_name
        )




        if (w_data[0] != null) {
            //按鈕
            const button = {
                reply_markup: {
                    remove_keyboard: true,
                    inline_keyboard: [
                        [{ text: '網站查看圖表', url: `${api_key.site_url}${w_data[0].cityname_eng} ` }],
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




            return { weather_info: weather_info, button: button }


        }



    }

    ,
    town_weatger: async function (city, town) {


        //中英轉換
        city_eng = city_list_json[0][city]


        const response = await axios.get(`${api_key.api_url}city/${city_eng}`)
        let w_data = response["data"].filter(
            (x) => x.cityname === town)

        //中文url編碼
        let town_url = `${api_key.site_url}${city_eng}/${town}`
        town_url = encodeURI(town_url)

        if (w_data[0] != null) {

            //取六筆
            w_data.splice(6, 8)

            //按鈕
            const button = {
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

            return { weather_info: weather_info, button: button }

        }



    }



}





