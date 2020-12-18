const axios = require('axios');



module.exports = {

    user_bind: async function (telegram_id, bind_code) {

        const data = {
            telegram_id: telegram_id,
            bind_code: bind_code
        }

        const response = await axios.post("http://127.0.0.1:5000/telegtam/bind", data)

        return response["data"]


    }
    ,

    user_un_bind: async function (telegram_id) {
        const data = {
            telegram_id: telegram_id,
        }


        const response = await axios.delete("http://127.0.0.1:5000/telegtam/bind", { data })


        return response["data"]


    }

}