

//資料
const city_json = require('../json/citys_list.json')
const dist_json = require('../json/dist_list.json')


const city_list_json = city_json[1]



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

}





