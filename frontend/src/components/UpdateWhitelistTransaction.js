import React, { Component } from 'react';

class UpdateWhitelistTransaction extends Component {

  constructor (props){
    super(props);
    this.state = {};
    this.updateWhitelist = this.updateWhitelist.bind(this);
  }

  async updateWhitelist() {
    const tx = await this.props.instances.BouncerProxy.updateWhitelist(this.props.web3Context.selectedAccount, true, {from: this.props.web3Context.selectedAccount});
    this.props.onTransaction(tx);
  }

  render() {
      return (
        <div>
        <button onClick={this.updateWhitelist}>
          Whitelist me!!!
        </button>
      </div>
      );
  }
}

export default UpdateWhitelistTransaction;