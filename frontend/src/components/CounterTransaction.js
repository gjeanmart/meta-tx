import React, { Component } from 'react';

class CounterTransaction extends Component {

  constructor (props){
    super(props);
    this.state = {};
    this.increment = this.increment.bind(this);
  }

  async increment() {
    const tx = await this.props.instances.Counter.increment({from: this.props.web3Context.selectedAccount});
    this.props.onTransaction(tx);
  }

  render() {
      return (
        <div>
        <button onClick={this.increment}>
          increment via direct transaction
        </button>
      </div>
      );
  }
}

export default CounterTransaction;