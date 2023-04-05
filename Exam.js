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
// const provider = new RpcProvider({ nodeUrl: rpcUrl })
const provider = new RpcProvider({ nodeUrl: "" })
const addrETH = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const ethCompiledContract = json.parse(fs.readFileSync("./abi/eth.json").toString("ascii"));
const ethContract = new Contract(ethCompiledContract, addrETH, provider);

// 工具函数
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function Ex01(index, privateKey, accountAddress) {
    const addrExID = "0x029e2801df18d7333da856467c79aa3eb305724db57f386e3456f85d66cbd58b";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);
    //const compiledContract = json.parse(fs.readFileSync("./abi/starknetID.json").toString("ascii"));
    //const starknetIDContract = new Contract(compiledContract, addrStarknetID, provider);
    ethContract.connect(account);
    const balance = await ethContract.balanceOf(account.address);
    console.log(index, account.address, " has a balance of :", uint256.uint256ToBN(balance.balance)/10**18);
        
    const calldata = stark.compileCalldata({})
    //console.log(calldata)
    try{
        const call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'claim_points',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        console.log("wait...", call)
        //await provider.waitForTransaction(call.transaction_hash)
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex01 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function Ex02(index, privateKey, accountAddress) {
    const addrExID = "0x18ef3fa8b5938a0059fa35ee6a04e314281a3e64724fe094c80e3720931f83f";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);  
    const calldata = stark.compileCalldata({
        secret: 31020
    })
    //console.log(calldata)
    try{
        const call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'claim_points',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        console.log("wait...", call)
        //await provider.waitForTransaction(call.transaction_hash)
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex02 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function Ex03(index, privateKey, accountAddress) {
    const addrExID = "0x79275e734d50d7122ef37bb939220a44d0b1ad5d8e92be9cdb043d85ec85e24";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);
    let nonce = await account.getNonce()
    console.log(nonce)
    const calldata = stark.compileCalldata({
    })
    //console.log(calldata)
    try{
        let call = null
        call = await account.execute(
            [
                {
                    contractAddress: addrExID,
                    entrypoint: 'increment_counter',
                    calldata: calldata
                },
                {
                    contractAddress: addrExID,
                    entrypoint: 'increment_counter',
                    calldata: calldata
                },
                {
                    contractAddress: addrExID,
                    entrypoint: 'increment_counter',
                    calldata: calldata
                },
                {
                    contractAddress: addrExID,
                    entrypoint: 'increment_counter',
                    calldata: calldata
                },
                {
                    contractAddress: addrExID,
                    entrypoint: 'decrement_counter',
                    calldata: calldata
                },
                {
                    contractAddress: addrExID,
                    entrypoint: 'claim_points',
                    calldata: calldata
                }
            ],
                undefined,
            {
                nonce: null
            }
        );
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex03 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ EX03 ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function Ex04(index, privateKey, accountAddress) {
    const addrExID = "0x2cca27cae57e70721d0869327cee5cb58098af4c74c7d046ce69485cd061df1";
    const { abi: Abi } = await provider.getClassAt(addrExID);
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);  
    const Ex04Contract = new Contract(Abi, addrExID, provider);
    Ex04Contract.connect(account);
    let slot = await Ex04Contract.user_slots(account.address);
    console.log("slot:", slot.toString())
    let value = await Ex04Contract.values_mapped(slot.toString());
    console.log("value:", value)

    let calldata = stark.compileCalldata({
    })
    //console.log(calldata)
    try{
        let call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'assign_user_slot',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        console.log("wait...", call.transaction_hash)
        await sleep(600 * 1000)
        let slot = await Ex04Contract.user_slots(account.address);
        console.log("slot:", slot.toString())
        let value = await Ex04Contract.values_mapped(slot.toString());
        console.log("value:", value)
        value = value - 32
        console.log("value:", value)
        calldata = stark.compileCalldata({
            value
        })
        call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'claim_points',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        //await provider.waitForTransaction(call.transaction_hash)
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex04 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ Ex04 ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function Ex05(index, privateKey, accountAddress) {
    const addrExID = "0x399a3fdd57cad7ed2193bdbb00d84553cd449abbdfb62ccd4119eae96f827ad";
    const { abi: Abi } = await provider.getClassAt(addrExID);
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);  
    const myContract = new Contract(Abi, addrExID, provider);
    myContract.connect(account);
    let value = await myContract.user_values(account.address);
    console.log("value:", value.toString())

    let calldata = stark.compileCalldata({
    })
    try{
        let call = await account.execute(
            [
                {
                    contractAddress: addrExID,
                    entrypoint: 'assign_user_slot',
                    calldata: calldata
                },
                {
                    contractAddress: addrExID,
                    entrypoint: 'copy_secret_value_to_readable_mapping',
                    calldata: calldata
                }
            ],
            undefined,
            {
                nonce: null
            }
        )
        console.log("wait...", call.transaction_hash)
        await sleep(600 * 1000)
        let value = await myContract.user_values(account.address);
        value = value.toString()
        console.log("value:", value)
        calldata = stark.compileCalldata({
            value
        })
        call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'claim_points',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        //await provider.waitForTransaction(call.transaction_hash)
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex05 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ Ex05 ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function Ex06(index, privateKey, accountAddress) {
    const addrExID = "0x718ece7af4fb1d9c82f78b7a356910d8c2a8d47d4ac357db27e2c34c2424582";
    const { abi: Abi } = await provider.getClassAt(addrExID);
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);  
    const myContract = new Contract(Abi, addrExID, provider);
    myContract.connect(account);
    let value = await myContract.user_values(account.address);
    console.log("value:", value.toString())

    let calldata = stark.compileCalldata({
    })
    let calldata2 = stark.compileCalldata({
        digital: 0
    })
    try{
        let call = await account.execute(
            [
                {
                    contractAddress: addrExID,
                    entrypoint: 'assign_user_slot',
                    calldata: calldata
                },
                {
                    contractAddress: addrExID,
                    entrypoint: 'external_handler_for_internal_function',
                    calldata: calldata2
                }
            ],
            undefined,
            {
                nonce: null
            }
        )
        console.log("wait...", call.transaction_hash)
        await sleep(600 * 1000)
        let value = await myContract.user_values(account.address);
        value = value.toString()
        console.log("value:", value)
        calldata = stark.compileCalldata({
            value
        })
        call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'claim_points',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        //await provider.waitForTransaction(call.transaction_hash)
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex06 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ Ex06 ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function Ex07(index, privateKey, accountAddress) {
    const addrExID = "0x3a1ad1cde69c9e7b87d70d2ea910522640063ccfb4875c3e33665f6f41d354a";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);

    try{
        let valueA = 60
        let valueB = 0
        let calldata = stark.compileCalldata({
            valueA,
            valueB
        })
        call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'claim_points',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        //await provider.waitForTransaction(call.transaction_hash)
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex07 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ Ex07 ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function Ex08(index, privateKey, accountAddress) {
    const addrExID = "0x15fa754c386aed6f0472674559b75358cde49db8b2aba8da31697c62001146c";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);  

    try{
        let calldata = stark.compileCalldata({
            address: accountAddress,
            //array_len: 10,
            array: [10,10,10,10,10,10,10,10,10,10,10]
        })
        console.log(calldata)
        call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'set_user_values',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        console.log("wait...", call.transaction_hash)
        await sleep(600 * 1000)
        calldata = stark.compileCalldata({
        })
        console.log(calldata)
        call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'claim_points',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        //await provider.waitForTransaction(call.transaction_hash)
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex08 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ Ex08 ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function Ex09(index, privateKey, accountAddress) {
    const addrExID = "0x2b9fcc1cfcb1ddf4663c8e7ac48fc87f84c91a8c2b99414c646900bf7ef5549";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);  

    try{
        let calldata = stark.compileCalldata({
            //valueA: 4,
            valueB: [33,13,4,1]
        })
        console.log(calldata)
        call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'claim_points',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        //await provider.waitForTransaction(call.transaction_hash)
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex09 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ Ex09 ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function Ex10(index, privateKey, accountAddress) {
    const addrExID = "0x8415762f4b0b0f44e42ac1d103ac93c3ea94450a15bb65b99bbcc816a9388";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);
    const ex10ExID = "0x70e27636818c69fb3e17451bd077c971524cb2a5a38e79b2d8a09034b7e1a9c"
    const { abi: Abi } = await provider.getClassAt(ex10ExID);
    const myContract = new Contract(Abi, ex10ExID, provider);
    myContract.connect(account);
    let value = await myContract.secret_value();
    value = value.toString()
    console.log("value:", value)

    try{
        let calldata = stark.compileCalldata({
            valueA: value,
            valueB: value
        })
        call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'claim_points',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        //await provider.waitForTransaction(call.transaction_hash)
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex10 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ Ex10 ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function Ex11(index, privateKey, accountAddress) {
    const addrExID = "0xab5577b9be8948d89dbdba63370a3de92e72a23c4cacaea38b3a74eec3a872";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);
    const { abi: Abi } = await provider.getClassAt(addrExID);
    const myContract = new Contract(Abi, addrExID, provider);
    myContract.connect(account);
    let value = await myContract.secret_value();
    console.log("value:", value.toString())
    value = value - 42096
    value = value.toString()
    console.log("value:", value)

    try{
        let calldata = stark.compileCalldata({
            valueA: value,
            valueB: value
        })
        call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'claim_points',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        //await provider.waitForTransaction(call.transaction_hash)
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex11 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ Ex11 ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}


async function Ex12(index, privateKey, accountAddress) {
    const addrExID = "0x24d15e02ddaa19d7ecd77204d35ed9bfff00a0cabc62eb3da5ba7680e44baf9s";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const account = new Account(provider, accountAddress, starkKeyPair);

    try{
        let calldata = stark.compileCalldata({
        })
        call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'assign_user_slot',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        console.log(calldata)

        calldata = stark.compileCalldata({
        })
        call = await account.execute({
            contractAddress: addrExID,
            entrypoint: 'claim_points',
            calldata: calldata
        },
        undefined,
        {
            nonce: null
        })
        //await provider.waitForTransaction(call.transaction_hash)
        console.log(index, "🍺 claim成功!", `https://testnet.starkscan.co/tx/${call.transaction_hash}`)
        fs.appendFileSync("Exam.log", `🍺 Ex11 ${index} ${account.address} https://testnet.starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        fs.appendFileSync("Exam.log", `❌ Ex11 ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}

async function batchRun(){
    for(let i = 0; i < keyPairs.length; i++){
        //let sleep_time = getRandomInt(1, 120)
        //console.log(new Date(), "等", sleep_time, "秒")
        //await sleep(sleep_time * 1000)
        const privateKey = keyPairs[i].privateKey;
        const accountAddress = keyPairs[i].address;
        const index = keyPairs[i].index

        try{
            console.log("第", i, "个...")
            await Ex01(index, privateKey, accountAddress)
            await sleep(600*1000)
            await Ex02(index, privateKey, accountAddress)
            await sleep(600*1000)
            await Ex03(index, privateKey, accountAddress)
            await sleep(600*1000)
            await Ex04(index, privateKey, accountAddress)
            await sleep(600*1000)
            await Ex05(index, privateKey, accountAddress)
            await sleep(600*1000)
            await Ex06(index, privateKey, accountAddress)
            await sleep(600*1000)
            await Ex07(index, privateKey, accountAddress)
            await sleep(600*1000)
            await Ex08(index, privateKey, accountAddress)
            await sleep(600*1000)
            await Ex09(index, privateKey, accountAddress)
            await sleep(600*1000)
            await Ex10(index, privateKey, accountAddress)
            //await sleep(600*1000)
            //await Ex11(index, privateKey, accountAddress)
            //await sleep(600*1000)
            //await Ex12(index, privateKey, accountAddress)
        }
        catch(e){
            console.log(e.message)
            fs.appendFileSync("Exam.log", `❌ ${index} ${accountAddress}\n`)
        }
    }
}

batchRun()

