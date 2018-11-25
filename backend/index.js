// index.js

////////////////////////////////////////////////////////////////////////
// IMPORTS
const   constant            = require('./helpers/constant'),
        HDWalletProvider    = require('./helpers/hd-wallet-provider'),
        SmartContract       = require('./helpers/smart-contract'),
        express             = require('express'), 
        bodyParser          = require('body-parser'),
        cors                = require('cors'),
        fs                  = require('fs');


// INIT
// =============================================================================
const provider = new HDWalletProvider(constant._MNEMONIC, constant._RPC_URL, constant._MNEMONIC_INDEX);
const smartContract = new SmartContract(provider, provider.getAddress(constant._MNEMONIC_INDEX));



// API
// =============================================================================
var app    = express();    
var router = express.Router();

/**
 *  
    Method: POST
    URL: /relay
    Parameters:
    Body:
        {
            signature: xxxxx,
            message: xxxxx
            data: {      
                proxyAddress,
                fromAddress,
                toAddress,
                value,
                txData,
                rewardAddress,
                rewardAmount,
                nonce
            }
        }
 */
router.get('/', function (req, res, next) {
    console.log("[DEBUG] HTTP GET /", req.body) ;   
    res.json({"message": "hello world"}); 
});

router.post('/relay', async function (req, res, next) {
    console.log("[DEBUG] HTTP POST /relay", req.body) ; 

    // Validation
    // - Check signature 
    //  if(signerRecoverd != req.body.data.fromAddress) res.status(400).send('Bad signature');
    
    // get hash
    const hash = await smartContract.getHash(
        req.body.data.fromAddress, 
        req.body.data.toAddress, 
        req.body.data.value, 
        req.body.data.txData, 
        req.body.data.rewardAddress, 
        req.body.data.rewardAmount);
    console.log("[DEBUG] hash="+hash);

    // Forward the transaction to the proxy
    const tx = await smartContract.forward(
        req.body.signature, 
        req.body.data.fromAddress, 
        req.body.data.toAddress, 
        req.body.data.value, 
        req.body.data.txData, 
        req.body.data.rewardAddress, 
        req.body.data.rewardAmount);
    console.log("[DEBUG] tx="+tx);

    // Build response
    let response = {
        "tx": tx
    }
    res.json(response); 

});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use(constant._API_CONTEXT, router);


// Run
// =============================================================================
console.log('[INFO] Starting metatx-relay-backend');
app.listen(constant._PORT, constant._HOST, () => {
    console.log('[INFO] listening on ' + constant._HOST + ":" + constant._PORT)
})