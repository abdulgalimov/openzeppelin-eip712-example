pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract EIP712Structure is EIP712 {
    constructor() EIP712("test", "1.0") { }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    struct Mail {
        address to;
        string message;
    }

    function verify(
        bytes memory signature,
        address signer,
        Mail memory mail
    ) external view returns(address) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(keccak256("Mail(address to,string message)"), mail.to, keccak256(bytes(mail.message))))
        );
        address recoveredSigner = ECDSA.recover(digest, signature);
        require(recoveredSigner == signer, "signers not equal");
        return recoveredSigner;
    }
}
