import { deployments, ethers } from "hardhat";
import { VNDC } from "../typechain";
import { expect, use } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const INIT_SUPPLY = BigInt("20000000000000000000000000000000");

describe("vndc unit test", async () => {
  let vndc: VNDC, deployer: SignerWithAddress, user: SignerWithAddress;
  beforeEach(async () => {
    await deployments.fixture(["vndc"]);
    vndc = await ethers.getContract("VNDC");
    deployer = (await ethers.getSigners())[0];
    user = (await ethers.getSigners())[1];
  });

  it("init success", async () => {
    const currentSupply = await vndc.totalSupply();
    expect(currentSupply.toString()).equal(INIT_SUPPLY.toString());

    const deployerBalance = await vndc.balanceOf(deployer.address);
    expect(deployerBalance.toString()).equal(INIT_SUPPLY.toString());

    expect(await vndc.name()).equal("VNDC");
    expect(await vndc.symbol()).equal("VNDC");
    expect(await vndc.decimals()).equal(18);
  });

  context("Onwership", () => {
    context("VNDC:pause", () => {
      it("Success", async () => {
        await vndc.pause();
      });
      it("Failed", async () => {
        await expect(vndc.connect(user).pause()).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );

        await vndc.transferOwnership(user.address);

        await vndc.connect(user).pause();

        await expect(vndc.pause()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
    context("VNDC:unpause", () => {
      beforeEach(async () => {
        await vndc.pause();
      });

      it("Success", async () => {
        await vndc.unpause();
      });
      it("Failed", async () => {
        await expect(vndc.connect(user).unpause()).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );

        await vndc.transferOwnership(user.address);

        await vndc.connect(user).unpause();

        await expect(vndc.pause()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
    context("VNDC:issue", () => {
      it("Success", async () => {
        await vndc.issue(1000);
      });
      it("Failed", async () => {
        await expect(vndc.connect(user).issue(1000)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );

        await vndc.transferOwnership(user.address);

        await vndc.connect(user).issue(1000);

        await expect(vndc.issue(1000)).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
    context("VNDC:burn", () => {
      it("Success", async () => {
        await vndc.burn(1000);
      });
      it("Failed", async () => {
        await expect(vndc.connect(user).burn(1000)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );

        await vndc.transferOwnership(user.address);

        await vndc.connect(user).issue(1000);
        await vndc.connect(user).burn(1000);

        await expect(vndc.issue(1000)).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  context("Pausable", () => {
    beforeEach(async () => {
      await vndc.pause();
    });
    context("VNDC:transfer", () => {
      it("Success", async () => {
        await vndc.unpause();

        await vndc.transfer(user.address, 1000);
      });
      it("Failed", async () => {
        await expect(vndc.transfer(user.address, 1000)).to.be.revertedWith(
          "ERC20Pausable: token transfer while paused"
        );
      });
    });
    context("VNDC:issue", () => {
      it("Success", async () => {
        await vndc.unpause();

        await vndc.issue(1000);
      });
      it("Failed", async () => {
        await expect(vndc.issue(1000)).to.be.revertedWith("Pausable: paused");
      });
    });
    context("VNDC:burn", () => {
      it("Success", async () => {
        await vndc.unpause();

        await vndc.burn(1000);
      });
      it("Failed", async () => {
        await expect(vndc.burn(1000)).to.be.revertedWith("Pausable: paused");
      });
    });
  });

  context("VNDC:issue", async () => {
    it("Success", async () => {
      const issueAmount = 1000;
      const txIssue = await vndc.issue(issueAmount);

      const txIssueReceipt = await txIssue.wait();

      const txEvents = txIssueReceipt.events?.filter((x: any) => {
        return x.event == "Issue";
      });
      expect(txEvents?.length).to.equal(1);
      const event = txEvents![0];
      expect(event.args?.length).to.equal(1);
      expect(event.args?.amount).to.equal(issueAmount);
    });
    it("Fail:overflow", async () => {
      await expect(vndc.issue(ethers.constants.MaxUint256)).to.be.revertedWith(
        "Arithmetic operation underflowed or overflowed outside of an unchecked block"
      );
    });
  });
  context("VNDC:burn", async () => {
    it("Success", async () => {
      const burnAmount = 1000;
      const txIssue = await vndc.burn(burnAmount);

      const txIssueReceipt = await txIssue.wait();

      const txEvents = txIssueReceipt.events?.filter((x: any) => {
        return x.event == "Burn";
      });
      expect(txEvents?.length).to.equal(1);
      const event = txEvents![0];
      expect(event.args?.length).to.equal(1);
      expect(event.args?.amount).to.equal(burnAmount);
    });
    it("Fail:notEnoughBalance", async () => {
      await expect(vndc.burn(INIT_SUPPLY + BigInt(1))).to.be.revertedWith(
        "ERC20: burn amount exceeds balance"
      );
    });
  });
});
