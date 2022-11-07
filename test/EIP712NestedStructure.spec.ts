import { expect } from "chai";
import { ethers } from "hardhat";
import {
  signTypedData,
  SignTypedDataVersion,
  TypedMessage,
} from "@metamask/eth-sig-util";
import { default as Wallet } from "ethereumjs-wallet";

import {
  EIP712NestedStructure,
  EIP712NestedStructure__factory,
} from "../typechain-types";

describe("EIP712NestedStructure", function () {
  it("verify", async function () {
    const [account] = await ethers.getSigners();

    const factory: EIP712NestedStructure__factory =
      await ethers.getContractFactory("EIP712NestedStructure");
    const eip712 = await factory.deploy();

    const chainId = (await eip712.getChainId()).toNumber();

    const verifyingContract = eip712.address;
    const mail: EIP712NestedStructure.MailWithSubjectStruct = {
      to: account.address,
      content: {
        subject: "test subj",
        message: "mail message",
      },
    };

    const data: TypedMessage<any> = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Content: [
          { name: "subject", type: "string" },
          { name: "message", type: "string" },
        ],
        Mail: [
          { name: "to", type: "address" },
          { name: "content", type: "Content" },
        ],
      },
      domain: {
        name: "test",
        version: "1.0",
        chainId,
        verifyingContract,
      },
      primaryType: "Mail",
      message: mail,
    };

    const wallet = Wallet.generate();
    const signature = signTypedData({
      privateKey: wallet.getPrivateKey(),
      data,
      version: SignTypedDataVersion.V4,
    });

    const signer = wallet.getAddressString();

    const recoveredSigner = await eip712.verify(signature, signer, mail);

    expect(recoveredSigner.toLowerCase()).to.eq(signer.toLowerCase());
  });
});
