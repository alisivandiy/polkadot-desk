const axios = require('axios');

let URL = {
    testNet: 'https://westend.api.subscan.io',
    mainNet: 'https://s1.ripple.com:51234',
}

async function main() {
    let polkaInstance = axios.create({
        baseURL : URL.testNet,
        timeout: 100000,
        headers: {
          'Content-Type': 'application/json',
        }
    })

    let response = await polkaInstance.post('/api/scan/transfers',{
        address : '5FWpTWZtUzhvywfkrtkizh3KsKYqXhFvWy2hWXVwuwhjFXMp',
        page : 0,
        row : 10
    })

    console.log(response.data.data.transfers);
}

main().catch(console.error).finally(() => process.exit());