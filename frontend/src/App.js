import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import contract from 'truffle-contract';
import CounterCall from './components/CounterCall';
import CounterTransaction from './components/CounterTransaction';
import CounterMetaTransaction from './components/CounterMetaTransaction';
import PropTypes from 'prop-types';

class App extends Component {

  constructor (props, context){
    super(props);
    this.state = {web3Context: context.web3};
    this.refresh = this.refresh.bind(this);
    this.getContractInstance = this.getContractInstance.bind(this);
  }

  async componentDidMount() {
     let Counter = await this.getContractInstance('Counter');
     let BouncerProxy = await this.getContractInstance('BouncerProxy');

    this.setState({
      'instances': {
        'Counter': Counter,
        'BouncerProxy': BouncerProxy
      }
    });

    this.interval = setInterval(() => this.refresh(), 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async getContractInstance(contractName) {
    // Get Truffle Artefact
    const resp = await axios.get(process.env.REACT_APP_TRUFFLE_ENDPOINT+'/'+contractName+'/all');
 
    // Initialize Truffle contract
    let c = contract(resp.data)
    c.setProvider(window.web3.currentProvider);

    // Get contract deployed instance
    return await c.deployed();
  }

  refresh () {
    setTimeout(
        function() {
            this.refs.CounterCall.getCounter();
        }
        .bind(this),
        1000
    );
  }

  render() {
    // Wait for the contract instance
    if (this.state.instances === undefined) {
      return null;
    }

    return (
      <div className='App'>
        <CounterCall {...this.state}  ref='CounterCall' />
        <CounterTransaction {...this.state} onTransaction={this.refresh}/>
        <CounterMetaTransaction {...this.state} onTransaction={this.refresh}/>
      </div>
    );
  }
}

App.contextTypes = {
  web3: PropTypes.object
};

export default App;
