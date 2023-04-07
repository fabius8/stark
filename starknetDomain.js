const {Provider, RpcProvider, Account, Contract, json, uint256, ec, stark, hash} = require("starknet")
require("dotenv").config();
const rpcUrl = process.env.RPC_URL;

// 解析私钥文件
const fs = require('fs');
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

function getRandomString(min, max) {
    const gasLimit = Math.floor(Math.random() * (max - min + 1)) + min; // 随机生成 min 到 max 的整数
    return gasLimit.toString(); // 返回字符串形式的 gas limit
}
async function setDomain(index, privateKey, accountAddress) {
    const braavos_addr = "0x03448896d4a0df143f98c9eeccc7e279bf3c2008bda2ad2759f5b20ed263585f";
    const domain_addr = "0x06ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678"
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);
    let nonce = await account.getNonce()
    console.log("nonce:", nonce)
    let number = getRandomString(100000, 200000)
    const calldata1 = stark.compileCalldata({
        name: number
    })
    const calldata2 = stark.compileCalldata({
        array: [number, "0xce31cfe97"]
    })
    //console.log(calldata)
    try{
        let call = null
        call = await account.execute(
            [
                {
                    contractAddress: braavos_addr,
                    entrypoint: 'claim_name',
                    calldata: calldata1
                },
                {
                    contractAddress: domain_addr,
                    entrypoint: 'set_address_to_domain',
                    calldata: calldata2
                }
            ],
                undefined,
            {
                nonce: null
            }
        );
        console.log(index, "🍺 成功!", `https://starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("domain.log", `🍺 ${index} ${account.address} https://starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("domain.log", `❌ ${index} ${account.address}\n`)
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
            await setDomain(index, privateKey, accountAddress)
        }
        catch(e){
            console.log(e.message)
            fs.appendFileSync("domain.log", `❌ ${index} ${accountAddress}\n`)
        }
    }
}

batchRun()
