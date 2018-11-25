import React, { Component } from 'react';

import Loading from './Loading';

class CounterCall extends Component {

  	constructor (props){
    	super(props);
    	this.state = {};
    	this.getCounter = this.getCounter.bind(this);
  	}

  	async componentDidMount() {
  		await this.getCounter();
  	}

  	async getCounter() {
      this.setState({loading: true});
    	const counter = await this.props.instances.Counter.getCounter();
    	this.setState({loading: false, counter: counter.toNumber()});
  	}

    render() {
        return (
        	<div>
	      		{this.state.loading ? (
	        		<Loading />
	      		) : (
	        		<div>Counter = {this.state.counter}</div>
	      		)}
	      </div>
        );
    }
}

export default CounterCall;