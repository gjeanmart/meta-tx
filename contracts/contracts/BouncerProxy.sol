pragma solidity ^0.4.24;

contract BouncerProxy {

  string constant name = "metatx";
  string constant version = "1";
  uint256 constant chainId = 17;
  address constant verifyingContract = 0x1c56346cd2a2bf3202f771f50d3d14a367b48070;
  bytes32 constant salt = 0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558;
  
  string private constant EIP712_DOMAIN  = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
  string private constant METATX_TYPE = "MetaTransaction(address proxy,address from,address to,uint256 value,bytes data,address rewardToken,uint256 rewardAmount,uint nonce)";
  
  bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(abi.encodePacked(EIP712_DOMAIN));
  bytes32 private constant METATX_TYPEHASH = keccak256(abi.encodePacked(METATX_TYPE));
  bytes32 private constant DOMAIN_SEPARATOR = keccak256(abi.encode(
      EIP712_DOMAIN_TYPEHASH,
      keccak256(name),
      keccak256(version),
      chainId,
      verifyingContract,
      salt
  ));
  
  struct MetaTransaction {
      address proxy; 
      address from; 
      address to; 
      uint256 value; 
      bytes data; 
      address rewardToken; 
      uint256 rewardAmount; 
      uint256 nonce;
  }

  function hashMetaTransaction(MetaTransaction memory metatx) private pure returns (bytes32){
      return keccak256(abi.encodePacked(
          "\x19\x01",
          DOMAIN_SEPARATOR,
          keccak256(abi.encode(
              METATX_TYPEHASH,
              metatx.proxy,
              metatx.from,
              metatx.to,
              metatx.value,
              keccak256(metatx.data),
              metatx.rewardToken,
              metatx.rewardAmount,
              metatx.nonce
          ))
      ));
  }
  ///////////////////////////////////

  mapping(address => uint) public nonce;
  mapping(address => bool) public whitelist;

  constructor() public {
     whitelist[msg.sender] = true;
  }

  
  function updateWhitelist(address _account, bool _value) public returns(bool) {
   require(whitelist[msg.sender],"BouncerProxy::updateWhitelist Account Not Whitelisted");
   whitelist[_account] = _value;
   UpdateWhitelist(_account,_value);
   return true;
  }
  event UpdateWhitelist(address _account, bool _value);


  function () public payable { emit Received(msg.sender, msg.value); }
  event Received (address indexed sender, uint value);


  function getNonce(address signer) public view returns(uint){
    return nonce[signer];
  }

  function forward(bytes signature, address signer, address destination, uint value, bytes data, address rewardToken, uint rewardAmount) public {

      // Encode the message
      MetaTransaction memory metatx = MetaTransaction({
          proxy: address(this),
          from: signer,
          to: destination,
          value: value,
          data: data,
          rewardToken: rewardToken,
          rewardAmount: rewardAmount,
          nonce: nonce[signer]
      });
      bytes32 _hash = hashMetaTransaction(metatx);

      // Increase the nonce to stop replay attack
      nonce[signer]++;

      //this makes sure signer signed correctly AND signer is a valid bouncer
      address recovered = recover(_hash, signature);
      require(recovered == signer);

      //make sure the signer pays in whatever token (or ether) the sender and signer agreed to
      // or skip this if the sender is incentivized in other ways and there is no need for a token
      if(rewardAmount>0){
        //Address 0 mean reward with ETH
        if(rewardToken==address(0)){
          //REWARD ETHER
          require(msg.sender.call.value(rewardAmount).gas(36000)());
        }else{
          //REWARD TOKEN
          require((StandardToken(rewardToken)).transfer(msg.sender,rewardAmount));
        }
      }



      //execute the transaction with all the given parameters
      require(executeCall(destination, value, data));
      emit Forwarded(signature, recovered, destination, value, data, rewardToken, rewardAmount, _hash);
  }
  event Forwarded (bytes signature, address signer, address destination, uint value, bytes data,address rewardToken, uint rewardAmount,bytes32 _hash);

  function executeCall(address to, uint256 value, bytes data) internal returns (bool success) {
    assembly {
       success := call(gas, to, value, add(data, 0x20), mload(data), 0, 0)
    }
  }

  function recover(bytes32 _hash, bytes _signature) internal view returns (address){
    bytes32 r;
    bytes32 s;
    uint8 v;
    // Check the signature length
    if (_signature.length != 65) {
      return 0x0000000000000000000000000000000000000001;
    }
    // Divide the signature in r, s and v variables
    // ecrecover takes the signature parameters, and the only way to get them
    // currently is to use assembly.
    // solium-disable-next-line security/no-inline-assembly
    assembly {
      r := mload(add(_signature, 32))
      s := mload(add(_signature, 64))
      v := byte(0, mload(add(_signature, 96)))
    }
    // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
    if (v < 27) {
      v += 27;
    }
    // If the version is correct return the signer address
    if (v != 27 && v != 28) {
      return 0x0000000000000000000000000000000000000002;
    } else {
      // solium-disable-next-line arg-overflow
      return ecrecover(_hash, v, r, s);
    }
  }
}

contract StandardToken {
  function transfer(address _to,uint256 _value) public returns (bool) { }
}
