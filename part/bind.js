/* 處理綁定相關 */


const axios = require('axios');

//api 
const api_key = require('../api_key.json')


module.exports = {


    //綁定使用者
    user_bind: async function (telegram_id, bind_code, telegram_username) {

        const data = {
            telegram_id: telegram_id,
            bind_code: bind_code,
            telegram_username: telegram_username
        }

        const response = await axios.post(`${api_key.api_url}telegram/bind`, data)

        return response["data"]


    }
    ,
    //綁定狀態
    user_bind_status: async function (telegram_id) {

        const response = await axios.get(`${api_key.api_url}telegram/bind/${telegram_id}`)




        return response["data"]


    },

    //解除綁定
    user_un_bind: async function (telegram_id) {
        const data = {
            telegram_id: telegram_id,
        }


        const response = await axios.delete(`${api_key.api_url}telegram/bind`, { data })


        return response["data"]


    },

    //重置綁定使用者的密碼
    user_bind_re_pas: async function (telegram_id) {


        const data = { telegram_id: telegram_id }

        const response = await axios.post(`${api_key.api_url}telegram/bind_user_re_pas`, data)

        return response['data']


    }

}