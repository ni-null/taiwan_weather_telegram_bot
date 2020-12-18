const axios = require('axios');

//api 
const api_key = require('../api_key.json')


module.exports = {

    user_bind: async function (telegram_id, bind_code) {

        const data = {
            telegram_id: telegram_id,
            bind_code: bind_code
        }

        const response = await axios.post(`${api_key.api_url}telegtam/bind`, data)

        return response["data"]


    }
    ,

    user_un_bind: async function (telegram_id) {
        const data = {
            telegram_id: telegram_id,
        }


        const response = await axios.delete(`${api_key.api_url}telegtam/bind`, { data })


        return response["data"]


    }

}