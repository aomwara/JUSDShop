var Shop = artifacts.require("Shop");
var JUSDToken = artifacts.require("JUSDToken");

module.exports = function(deployer, networks, accounts) {
  deployer
  	.deploy(JUSDToken)
  	.then(async () => {
  		const tokenContract = await JUSDToken.deployed();
  		return deployer.deploy(Shop, tokenContract.address);
  	})
};