const {Provider, RpcProvider, Account, Contract, json, uint256, ec, stark, hash} = require("starknet")
require("dotenv").config();
const rpcUrl = process.env.RPC_URL;

// 解析私钥文件
const fs = require('fs');
const { setMaxIdleHTTPParsers } = require("http");
const data = fs.readFileSync('private.txt', 'utf8');
const data_array = data.split("\n");
const keyPairs = [];
data_array.forEach(line => {
    const [index, privateKey, address] = line.trim().split(/[\t ]+/);
    keyPairs.push({ index, privateKey, address });
});
console.log(keyPairs)

//const provider = new Provider({ equencer: { network: 'mainnet-alpha' } })
const provider = new RpcProvider({ nodeUrl: rpcUrl })

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function getRandomString(min, max) {
    const gasLimit = Math.floor(Math.random() * (max - min + 1)) + min; // 随机生成 min 到 max 的整数
    return gasLimit.toString(); // 返回字符串形式的 gas limit
}

async function mintTokenLeve0(index, privateKey, accountAddress) {
    const contractAddress = "0x060582df2cd4ad2c988b11fdede5c43f56a432e895df255ccd1af129160044b8";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);
    let nonce = await account.getNonce()
    console.log("nonce:", nonce)
    const calldata1 = stark.compileCalldata({
        to: accountAddress
    })

    //console.log(calldata)
    try{
        let call = null
        call = await account.execute(
            [
                {
                    contractAddress: contractAddress,
                    entrypoint: 'publicMint',
                    calldata: calldata1
                }
            ],
                undefined,
            {
                nonce: null
            }
        );
        console.log(index, "🍺 成功!", `https://starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("verseArt.log", `🍺 ${index} ${account.address} https://starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("verseArt.log", `❌ ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function batchRun(){
    for(let i = 0; i < keyPairs.length; i++){
        const privateKey = keyPairs[i].privateKey;
        const accountAddress = keyPairs[i].address;
        const index = keyPairs[i].index
        try{
            console.log("第", i, "个...")
            await mintTokenLeve0(index, privateKey, accountAddress)
        }
        catch(e){
            console.log(e.message)
        }
    }
}

batchRun()
