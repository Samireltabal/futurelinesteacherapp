import axios from 'axios'
export async function ping() {
    var data;
    await axios.get('https://api.futurelines.net/api/ping').then((response) => {
        data = response
    }).catch((error) => {
        data = error
    })
    return data;
}