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
    
    const hash = await this.props.instances.BouncerProxy.getHash(
      this.props.web3Context.selectedAccount, 
      this.props.instances.Counter.address, 
      0, 
      txdata, 
      "0x0000000000000000000000000000000000000000", 
      0);

    const signature = await this.sign(hash);

    const resp = await axios.post(process.env.REACT_APP_METATX_ENDPOINT + '/relay', {
      'signature': signature,
      'message': hash,
      'data': {      
        'proxyAddress': this.props.instances.BouncerProxy.address,
        'fromAddress': this.props.web3Context.selectedAccount,
        'toAddress': this.props.instances.Counter.address,
        'value': 0,
        'txData': txdata,
        'rewardAddress': '0x0000000000000000000000000000000000000000',
        'rewardAmount': 0,
        'nonce': nonce
      }
    });
    this.props.onTransaction(resp.data.tx);
  }

  sign(data) {
    return new Promise(async (resolve, reject) => {

      await window.web3.currentProvider.sendAsync({ id: 1, method: 'personal_sign', params: [this.props.web3Context.selectedAccount, data] },
        function(err, data) {
          if(err) {
            reject(err);
          }
          resolve(data.result);
        }
      );
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