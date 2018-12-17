import React, { Component } from 'react';

import axios from 'axios';

class CounterMetaTransaction extends Component {

  constructor (props){
    super(props);
    this.state = {};
    this.increment = this.increment.bind(this);
    this.sign = this.sign.bind(this);
  }

  async increment() {

    const req = this.props.instances.Counter.increment.request();
    const txdata = req.params[0].data;
    
    const nonce = await this.props.instances.BouncerProxy.getNonce(this.props.web3Context.selectedAccount);

    const domain = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
    ];

    const metatx = [
        { name: "proxy", type: "address" },
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
        { name: "rewardToken", type: "address" },
        { name: "rewardAmount", type: "uint256" },
        { name: "nonce", type: "uint" }
    ];

    const domainData = {
        name: "metatx",
        version: "1",
        chainId: parseInt(window.web3.version.network, 10),
        verifyingContract: "0x1c56346cd2a2bf3202f771f50d3d14a367b48070",
        salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
    };

    const message = {
        proxy: this.props.instances.BouncerProxy.address,
        from: this.props.web3Context.selectedAccount,
        to: this.props.instances.Counter.address,
        value: 0,
        data: txdata,
        rewardToken: "0x0000000000000000000000000000000000000000",
        rewardAmount: 0,
        nonce: parseInt(nonce, 10)
    }

    const data = JSON.stringify({
        types: {
            EIP712Domain: domain,
            MetaTransaction: metatx
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message
    });

    const signature = await this.sign(data);

    const resp = await axios.post(process.env.REACT_APP_METATX_ENDPOINT + '/relay', {
      'signature': signature,
      'message': message
    });
    this.props.onTransaction(resp.data.tx);
  }

  sign(data) {
    return new Promise(async (resolve, reject) => {

      window.web3.currentProvider.sendAsync({
        method: "eth_signTypedData_v3",
        params: [this.props.web3Context.selectedAccount, data],
        from: this.props.web3Context.selectedAccount
      }, function(err, data) {
        if (err) {
         reject(err);
        }
        resolve(data.result);

      });
    });
  }

  render() {
      return (
        <div>
        <button onClick={this.increment}>
          increment via meta transaction
        </button>
      </div>
      );
  }
}

export default CounterMetaTransaction;