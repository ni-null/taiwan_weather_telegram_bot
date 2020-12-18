
const axios = require('axios');


//資料
const city_json = require('../json/citys_list.json')
const dist_json = require('../json/dist_list.json');
const { resolve } = require('bluebird');

//api 
const api_key = require('../api_key.json')



module.exports = {



    add_sub: async function (telegram_id, sub_data) {


        sub_data = sub_data.split('-')

        //城市中英
        sub_data_eng = city_json[1][0][sub_data[0]]


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



        const response = await axios.put(`${api_key.api_url}telegtam/sub`, data)

        if (response["data"])
            return `『${sub_data}』訂閱成功`

        else
            return `『${sub_data}』訂閱失敗，請在試一次`
    },

    delete_sub: async function (telegram_id, sub_data) {


        sub_data = sub_data.split('/')


        let data

        //沒有鄉鎮
        if (sub_data[1] == null) {
            data = {
                telegram_id: telegram_id,
                sub_data: sub_data[0]
            }

        }

        //有鄉鎮鄉鎮
        else {
            data = {
                telegram_id: telegram_id,
                sub_data: sub_data[0] + '/' + sub_data[1]
            }
        }

        //城市中英
        sub_data[0] = city_json[2][0][sub_data[0]]

        const response = await axios.delete(`${api_key.api_url}telegtam/sub`, { data })

        if (response["data"])

            return `『${sub_data}』訂閱刪除`


        else
            return `『${sub_data}訂閱刪除刪除失敗，請在試一次`




    },

    get_sub: async function (telegram_id) {

        const response = await axios.get(`${api_key.api_url}telegtam/sub/${telegram_id}`)

        if (response['data'] != null) {

            //整理資料
            let user_sub = []

            response['data'].forEach(e => {

                let e_sub = e.sub.split('/')

                e_sub_che = city_json[2][0][e_sub[0]]

                if (e_sub[1] != null)
                    user_sub.push([
                        { text: e_sub_che + "/" + e_sub[1], callback_data: 'get-' + e_sub_che + "/" + e_sub[1] },
                        { text: '刪除訂閱', callback_data: 'sub_delete-' + e_sub[0] + "/" + e_sub[1] },
                    ])
                else {
                    user_sub.push(
                        [
                            { text: e_sub_che, callback_data: 'get-' + e_sub_che },
                            { text: '刪除訂閱', callback_data: 'sub_delete-' + e_sub[0] },
                        ]

                    )
                }

            });

            //按鈕
            const button = {
                reply_markup: {
                    inline_keyboard: user_sub
                }
            }


            return button

        }
        else
            return false

    }

}