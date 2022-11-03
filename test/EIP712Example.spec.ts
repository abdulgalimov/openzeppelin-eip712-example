import { expect } from "chai";
import { ethers } from "hardhat";

import { signTypedMessage, TypedMessage } from "eth-sig-util";
import { default as Wallet } from "ethereumjs-wallet";

describe("EIP712", function () {
  it.only("digest", async function () {
    const [mailTo] = await ethers.getSigners();

    const EIP712Example = await ethers.getContractFactory("EIP712Example");
    const eip712 = await EIP712Example.deploy();

    const chainId = (await eip712.getChainId()).toNumber();

    const verifyingContract = eip712.address;
    const message = {
      to: mailTo.address,
      contents: "very interesting",
    };

    const data: TypedMessage<any> = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Mail: [
          { name: "to", type: "address" },
          { name: "contents", type: "string" },
        ],
      },
      domain: {
        name: "test",
        version: "1.0",
        chainId,
        verifyingContract,
      },
      primaryType: "Mail",
      message,
    };

    const wallet = Wallet.generate();
    const signature = signTypedMessage(wallet.getPrivateKey(), {
      data,
    });

    const signer = wallet.getAddressString();

    const recoveredSigner = await eip712.verify(
      signature,
      signer,
      message.to,
      message.contents
    );
    expect(recoveredSigner.toLowerCase()).to.eq(signer.toLowerCase());
  });
});
