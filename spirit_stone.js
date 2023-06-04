const {Provider, RpcProvider, Account, Contract, json, uint256, ec, stark, hash} = require("starknet")
//require("dotenv").config();
const fs = require('fs');

// const urlFile = 'url.txt'
// const pdata = fs.readFileSync(urlFile, 'utf8');
// const pdata_array = pdata.split("\n");
// const urls = pdata_array.filter(Boolean).map(key => key.trim());
// const randomIndex = Math.floor(Math.random() * urls.length);
// const RPC_URL = urls[randomIndex];
// console.log(RPC_URL);


// 解析私钥文件
privateFile = 'private.txt'
const data = fs.readFileSync(privateFile, 'utf8');
const data_array = data.split("\n");
const keyPairs = [];
data_array.forEach(line => {
    const [index, privateKey, address] = line.trim().split(/[\t ]+/);
    keyPairs.push({ index, privateKey, address });
});
//console.log(keyPairs)

const provider = new Provider({ sequencer: { network: 'mainnet-alpha' } })
//const provider = new RpcProvider({ nodeUrl: RPC_URL })

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomString(min, max) {
    const gasLimit = Math.floor(Math.random() * (max - min + 1)) + min; // 随机生成 min 到 max 的整数
    return gasLimit.toString(); // 返回字符串形式的 gas limit
}

async function mint(index, privateKey, accountAddress) {
    
    const spiritstone_contract = "0x060cf64cf9edfc1b16ec903cee31a2c21680ee02fc778225dacee578c303806a"

    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);
    //let nonce = await account.getNonce()
    //console.log("nonce:", nonce)

    let timestamp = Math.floor(Date.now() / 1000) + 3600;
    console.log(timestamp);

    const calldata1 = stark.compileCalldata({
    })

    console.log(calldata1)
    // while(true){
    //     try{
    //         console.log(`${new Date()}`, "try...")
    //         const suggestedMaxFee = await account.estimateInvokeFee({
    //             contractAddress: spiritstone_contract,
    //             entrypoint: "mint",
    //             calldata: calldata1
    //         });
    //         console.log("gas:", suggestedMaxFee)
    //         await sleep(0.1 * 1000)
    //         break
    //     }
    //     catch(e){
    //         //fs.appendFileSync("stone.log", `❌ ${index} ${account.address}\n`)
    //         console.log("Erorr", e.message)
    //     }
    // }
    try{
        let call = null
        call = await account.execute(
            [
                {
                    contractAddress: spiritstone_contract,
                    entrypoint: 'mint',
                    calldata: calldata1
                },
            ],
                undefined,
            {
                nonce: null
            }
        );
        console.log(index, "🍺 成功!", `https://starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("stone.log", `🍺 ${index} ${account.address} https://starkscan.co/tx/${call.transaction_hash}\n`)
        //deleteLineWithContentSync(privateFile, accountAddress)
        //await sleep(10*1000)
    }
    catch(e){
        //fs.appendFileSync("stone.log", `❌ ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function batchRun(){
    //await sleep(600 * 1000)
    while(true){
        for(let i = 0; i < keyPairs.length; i++){
            const privateKey = keyPairs[i].privateKey;
            const accountAddress = keyPairs[i].address;
            const index = keyPairs[i].index
            try{
                console.log("第", i, "个...")
                //await sleep(30 * 1000)
                await mint(index, privateKey, accountAddress)
                await sleep(0.2 * 1000)
                //await jediswapSwap(index, privateKey, accountAddress)
            }
            catch(e){
                console.log(e.message)
                //fs.appendFileSync("stone.log", `❌ ${index} ${accountAddress}\n`)
            }
        }
    }
}

batchRun()
