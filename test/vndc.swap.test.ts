import { deployments, ethers, upgrades } from "hardhat";
import { MockERC20, Router, VNDC } from "../typechain";
import { expect, use } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("vndc swap test", async () => {
  let vndc: VNDC,
    deployer: SignerWithAddress,
    user: SignerWithAddress,
    busd: MockERC20,
    router: Router;
  beforeEach(async () => {
    await deployments.fixture(["all"]);
    vndc = await ethers.getContract("VNDC");
    deployer = (await ethers.getSigners())[0];
    user = (await ethers.getSigners())[1];
    busd = await ethers.getContract("BUSD");
    router = await ethers.getContract("Router");

    await vndc.transfer(user.address, ethers.utils.parseEther("20000"));
    await busd.transfer(user.address, ethers.utils.parseEther("20000"));
  });

  it("swap busd to vndc", async () => {
    const amountIn = ethers.utils.parseEther("2000");

    const tx = await busd.connect(user).approve(router.address, amountIn);

    await tx.wait();

    const deadline = Math.ceil(Date.now() / 1000) + 3600;

    const vndcBefore = await vndc.balanceOf(user.address);

    await router
      .connect(user)
      .swapExactTokensForTokens(
        amountIn,
        "0",
        [busd.address, vndc.address],
        user.address,
        deadline
      );

    const vndcAfter = await vndc.balanceOf(user.address);

    console.log(
      `Trade ${amountIn.div("1000000000000000000")} USD for ${vndcAfter
        .sub(vndcBefore)
        .div("1000000000000000000")}`
    );

    expect(1).equal(1);
  });
});
