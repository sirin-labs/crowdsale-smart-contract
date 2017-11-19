//run with DdayDeployer.js <unified contract file>
//e.g: node scripts/crowdsale_deployer.js Unified.sol

//libs
const ABI   = require('ethereumjs-abi');
const SOLC  = require('solc');
const FS    = require("fs");
const Eth   = require('web3-eth');

//compiler related:
const OPTIMIZER_ENABLED = 1;
const CONTRACT_NAME     = "SirinCrowdsale";

//general:
const DAY               = 86400;
const OWNER             ="0x0886fa060da6f1e8aeb01a11bff3df096cf0acd4";

//SirinCrowdsale constructor params:
const startTime       = 1513000800;
const endTime         = startTime + 14*DAY;
const wallet          = "0x00F757ced08EA8591B027e2070E1d8E6c09d709d";
const walletFounder   = "0x00F757ced08EA8591B027e2070E1d8E6c09d709d";
const walletOEM       = "0x0029ff4cfc6824aC4ae662804FF1767C104d6C9d";
const walletBounties  = "0x007876b87F84c946f61b16978c2ec043aAD1B433";
const walletReserve   = "0x00e00ed4828e405e7d41Fa7C8Fa37b1692a85efa";

var SirinCrowdsaleCompiled;
var eth = new Eth(Eth.givenProvider || 'http://127.0.0.1:8545');

processContract(process.argv[2]);
deployContract();

/*
*/
function processContract(contractFilePAth){
    console.log("\nProcessing " + "\n----------\n" + CONTRACT_NAME + " (" + contractFilePAth  + ")");

    var copmiled = SOLC.compile(FS.readFileSync(contractFilePAth, 'utf8'), 1)
    SirinCrowdsaleCompiled = copmiled.contracts[":"+CONTRACT_NAME];
    var bytecode = SirinCrowdsaleCompiled.bytecode
    var abi = SirinCrowdsaleCompiled.interface;
    var ctorParamsEncoded = getCtorParams();

    printToFile(CONTRACT_NAME + "_bin.BIN", bytecode.toString('hex'));
    printToFile(CONTRACT_NAME + "_ctor_params.txt", ctorParamsEncoded.toString('hex'));
    printToFile(CONTRACT_NAME + "_abi.ABI", abi);
    //TODO create md5

    console.log("\nConstructor parameters:" + "\n-----------------------" + "\nstartTime:       " + startTime + "\nendTime:         " + endTime + "\nwallet:          " + wallet + "\nwalletFounder:   " + walletFounder + "\nwalletOEM:       " +walletOEM + "\nwalletBounties:  " +walletBounties + "\nwalletReserve:   " + walletReserve);

}


function deployContract(){
    console.log("\nDeploying " + "\n---------\n" + CONTRACT_NAME + ":\n")
    new eth.Contract(JSON.parse(SirinCrowdsaleCompiled.interface), null, {
        data: '0x' + SirinCrowdsaleCompiled.bytecode
    })
    .deploy({
        arguments: [startTime, endTime, wallet, walletFounder, walletOEM, walletBounties, walletReserve]
    }).send({
        from:       OWNER,
        gas:        4000000,
        gasPrice:   '99990000000'
    })
    .then(function(newContractInstance){
        console.log(newContractInstance.options.address) // instance with the new contract address
        console.log("\ndeployed " + "\n---------\n" + CONTRACT_NAME + ":\n")
    });
}


/*
*/
function printToFile(fileName, input){
    return FS.writeFile(fileName, input, function(err) {
        if(err) {
            return console.log(err);
        }
//        console.log(fileName);
    });
}


/*
*/
function getCtorParams(){
    let parameterTypes = ["uint256","uint256","address","address","address","address","address"];
    let parameterValues = [startTime + "", endTime + "", wallet, walletFounder, walletOEM, walletBounties, walletReserve];
    let ctorParamsEncoded = ABI.rawEncode(parameterTypes, parameterValues);
    return ctorParamsEncoded;
}


