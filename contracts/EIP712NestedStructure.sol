pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract EIP712NestedStructure is EIP712 {
    constructor() EIP712("test", "1.0") { }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    struct Content {
        string subject;
        string message;
    }

    struct MailWithSubject {
        address to;
        Content content;
    }

    function verify(
        bytes memory signature,
        address signer,
        MailWithSubject memory mail
    ) external view returns(address) {
        bytes32 contentByes = keccak256(
            abi.encode(
                keccak256("Content(string subject,string message)"),
                keccak256(bytes(mail.content.subject)),
                keccak256(bytes(mail.content.message))
            )
        );

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("MailWithSubject(address to,Content content)Content(string subject,string message)"),
                    mail.to,
                    contentByes
                )
            )
        );
        address recoveredSigner = ECDSA.recover(digest, signature);
        require(recoveredSigner == signer, "signers not equal");
        return recoveredSigner;
    }
}
