var Counter = artifacts.require("./Counter.sol");
var BouncerProxy = artifacts.require("./BouncerProxy.sol");

module.exports = function(deployer) {
  	deployer.deploy(Counter).then(function(){
        return deployer.deploy(BouncerProxy);
	}).then(function(){ 
		// ...
	});
};