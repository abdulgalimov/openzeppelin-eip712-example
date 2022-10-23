import { expect } from "chai";
import { ethers } from "hardhat";

import { signTypedMessage, TypedMessage } from "eth-sig-util";
import { default as Wallet } from "ethereumjs-wallet";

const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

describe("EIP712", function () {
  async function deploy() {
    const [owner, mailTo] = await ethers.getSigners();

    const EIP712Example = await ethers.getContractFactory("EIP712Example");
    const eip712 = await EIP712Example.deploy();

    const chainId = (await eip712.getChainId()).toNumber();

    return { eip712, owner, mailTo, chainId };
  }

  const name = "A Name";
  const version = "1";

  it.only("digest", async function () {
    const { mailTo, chainId, eip712 } = await deploy();

    const verifyingContract = eip712.address;
    const message = {
      to: mailTo.address,
      contents: "very interesting",
    };

    const data: TypedMessage<any> = {
      types: {
        EIP712Domain,
        Mail: [
          { name: "to", type: "address" },
          { name: "contents", type: "string" },
        ],
      },
      domain: { name, version, chainId, verifyingContract },
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
    expect(recoveredSigner).to.eq(signer);
  });
});
