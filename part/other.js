/* 內部調用相關*/



//資料
const city_json = require('../json/citys_list.json')
const dist_json = require('../json/dist_list.json')
const fs = require("fs");

const city_list_json = city_json[0]



module.exports = {

    get_towns: function (city_name) {

        //取得鄉鎮資訊
        let dist_data
        dist_json.forEach(e => {
            if (e.name == city_name)
                dist_data = e.dist
        })


        //添加按鈕回掉
        let dist_button = []
        dist_data.forEach(e => {
            dist_button.push({
                text: e,
                callback_data: 'town-' + city_name + '-' + e
            })

        });
        const dist_button_length = dist_button.length
        let dist_line_button = []
        for (let i = 0; i < dist_button_length / 3; i++) {
            dist_line_button.push(dist_button.splice(0, 3))
        }

        const button = {
            reply_markup: {
                remove_keyboard: true,
                inline_keyboard: dist_line_button

            }
        }


        return button

    }

    ,

    creat_api_key: function () {
        fs.open("./api_key.json", function (err, fd) {

            if (err) {
                fs.appendFile("./api_key.json", "", function (err) {
                    if (err) console.log(err);
                });
                const json = JSON.stringify(
                    {
                        "TOKEN": "",
                        "url": "",
                        "api_url": "",
                        "site_url": ""
                    }

                );
                fs.writeFile('./api_key.json', json, function (err) {
                    if (err)
                        console.log(err);
                    else
                        console.log("已經創建『api_key.json』請於裡面添加連接資訊");
                });

            }
        });
    }
    ,
    get_city_button: function (msg_text) {



        let child
        city_list_json.forEach(e => {
            if (e.name == msg_text)
                child = e.child
        });


        let data = []

        child.forEach(e => {
            data.push({
                text: e.che,
                callback_data: 'get_weather-' + e.che
            })
        }
        );

        const data_length = data.length
        let data_button = []
        for (let i = 0; i < data_length / 3; i++) {
            //每次刪除三個
            data_button.push(data.splice(0, 3))
        }

        const button = {
            reply_markup: {
                inline_keyboard: data_button
            }
        }



        return button

    }

}





