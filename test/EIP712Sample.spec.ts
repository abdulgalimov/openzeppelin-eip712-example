import { expect } from "chai";
import { ethers } from "hardhat";
import {
  signTypedData,
  SignTypedDataVersion,
  TypedMessage,
} from "@metamask/eth-sig-util";
import { default as Wallet } from "ethereumjs-wallet";

import { EIP712Sample__factory } from "../typechain-types";

describe("EIP712Sample", function () {
  it("verify", async function () {
    const [account] = await ethers.getSigners();

    const factory: EIP712Sample__factory = await ethers.getContractFactory(
      "EIP712Sample"
    );
    const eip712 = await factory.deploy();

    const chainId = (await eip712.getChainId()).toNumber();

    const verifyingContract = eip712.address;
    const message = {
      to: account.address,
      contents: "mail message",
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
    const signature = signTypedData({
      privateKey: wallet.getPrivateKey(),
      data,
      version: SignTypedDataVersion.V4,
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
