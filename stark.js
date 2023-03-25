const {Provider, Account, Contract, json, uint256, ec, stark} = require("starknet")
require("dotenv").config();
const fs = require('fs');
const { BN } = require('bignumber.js');


const provider = new Provider({ sequencer: { network: 'mainnet-alpha' } })
const privateKey = process.env.ACCOUNT_PRIVKEY;
const accountAddress = process.env.ACCOUNT_ADDRESS;

const starkKeyPair = ec.getKeyPair(privateKey);
const starknetPublicKey = ec.getStarkKey(starkKeyPair);
const addrETH = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const compiledContract = json.parse(fs.readFileSync("./eth.json").toString("ascii"));
const ethContract = new Contract(compiledContract, addrETH, provider);
// read abi of Test contract
const account = new Account(provider, accountAddress, starkKeyPair);

async function transfer() {
    console.log(await account.address)
    ethContract.connect(account);
    const balance = await ethContract.balanceOf(account.address);
    console.log(account.address, " has a balance of :", uint256.uint256ToBN(balance.balance)/10**18);
    
    const calldata = stark.compileCalldata({
        recipient: accountAddress,
        amount: {
            type: 'struct',
            low: '2',   // 1 wei
            high: '0',
        }
    })
    console.log(calldata)
    const call = await account.execute({
        contractAddress: addrETH,
        entrypoint: 'transfer',
        calldata: calldata
    },
    undefined,
    {
        nonce: await account.getNonce()
    })
    console.log("transfer...", call)
    await provider.waitForTransaction(call.transaction_hash)
    console.log("发送成功!", `https://starkscan.co/tx/${call.transaction_hash}`)
}

async function starknetID_mint() {
    const addrStarknetID = "0x05dbdedc203e92749e2e746e2d40a768d966bd243df04a6b712e222bc040a9af";
    const compiledContract = json.parse(fs.readFileSync("./starknetID.json").toString("ascii"));
    const starknetIDContract = new Contract(compiledContract, addrStarknetID, provider);
    console.log(await account.address)
    ethContract.connect(account);
    const balance = await ethContract.balanceOf(account.address);
    console.log(account.address, " has a balance of :", uint256.uint256ToBN(balance.balance)/10**18);
    
    const calldata = stark.compileCalldata({
        starknet_id: "0x75bcd15",
    })
    console.log(calldata)
    const call = await account.execute({
        contractAddress: addrStarknetID,
        entrypoint: 'mint',
        calldata: calldata
    },
    undefined,
    {
        nonce: await account.getNonce()
    })
    console.log("mint...", call)
    await provider.waitForTransaction(call.transaction_hash)
    console.log("发送成功!", `https://starkscan.co/tx/${call.transaction_hash}`)
}

starknetID_mint()

