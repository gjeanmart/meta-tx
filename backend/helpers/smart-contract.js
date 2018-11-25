"use strict";

(async () => {

    const   constant        = require('./constant'),
            contract        = require("truffle-contract"),
            Client          = new require('node-rest-client').Client,
            Web3            = require('web3');

    function SmartContract(provider, address) {
        this.client = new Client();
        this.provider = provider;
        this.address = address;
        console.log("addres: " + address)
    }

    SmartContract.prototype.getContractInstance = async function( smartContract) {
        
        return new Promise( (resolve, reject) => {
            let that = this;
            this.client.get(constant._TRUFFLE_ENDPOINT_PROTOCOL+"://"+constant._TRUFFLE_ENDPOINT_HOST+":"+constant._TRUFFLE_ENDPOINT_PORT 
                            + constant._TRUFFLE_ENDPOINT_PATH + "/" 
                            + smartContract + "/all", async function (data, response) {

                var c = contract(data);
                c.setProvider(that.provider);

                const result = await c.deployed();
                resolve(result);
            });
        });
    }

    //function forward(bytes sig, address signer, address destination, uint value, bytes data, address rewardToken, uint rewardAmount)
    SmartContract.prototype.forward = async function(signature, signer, destination, value, data, rewardToken, rewardAmount) {

        return new Promise(async (resolve, reject) => {

            const instance = await this.getContractInstance(constant._PROXY_CONTRACT);

            instance.forward(
                    signature,
                    signer,
                    destination,
                    value,
                    data,
                    rewardToken,
                    rewardAmount,
                    { from: this.address, gasPrice: constant._GAS_PRICE }

            ).then(function(tx) {
                resolve(tx.receipt.transactionHash);
            }, function(error) {
                console.log(error);
                reject(error);
            });
        });
    };

    //function getHash(address signer, address destination, uint value, bytes data, address rewardToken, uint rewardAmount) public view returns(bytes32){
    SmartContract.prototype.getHash = async function(signer, destination, value, data, rewardToken, rewardAmount) {

        return new Promise(async (resolve, reject) => {

            const instance = await this.getContractInstance(constant._PROXY_CONTRACT);

            instance.getHash(
                    signer,
                    destination,
                    value,
                    data,
                    rewardToken,
                    rewardAmount
            ).then(function(result) {
                resolve(result);
            }, function(error) {
                console.log(error);
                reject(error);
            });
        });
    };

    // mapping(address => uint) public nonce
    SmartContract.prototype.getNonce = async function(signer) {

        return new Promise(async (resolve, reject) => {

            const instance = await this.getContractInstance(constant._PROXY_CONTRACT);

            instance.getNonce(signer).then(function(result) {
                console.log("result: ", result);
                resolve(result);
            }, function(error) {
                console.log(error);
                reject(error);
            });
        });
    };

    module.exports = SmartContract;

})();
