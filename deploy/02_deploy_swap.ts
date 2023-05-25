import { DeployFunction } from "hardhat-deploy/types";
import { getNamedAccounts, deployments, network, ethers } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { verify } from "../helper-functions";

const deployFunction: DeployFunction = async () => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("Factory", {
    contract: "PoolFactory",
    from: deployer,
    log: true,
    args: [deployer],
  });

  const factory = await ethers.getContract("Factory");

  const wEth = await ethers.getContract("WETH");

  await deploy("Router", {
    contract: "Router",
    from: deployer,
    log: true,
    args: [factory.address, wEth.address],
  });

  const router = await ethers.getContract("Router");

  const busd = await ethers.getContract("BUSD");
  const usdt = await ethers.getContract("USDT");

  const vndt = await ethers.getContract("VNDT");

  await busd.approve(router.address, ethers.constants.MaxUint256);
  await usdt.approve(router.address, ethers.constants.MaxUint256);
  await vndt.approve(router.address, ethers.constants.MaxUint256);

  await router.addLiquidity(
    busd.address,
    vndt.address,
    ethers.utils.parseEther("100000000"),
    ethers.utils.parseEther("2345050000000"),
    0,
    0,
    deployer,
    ethers.constants.MaxUint256
  );

  if (!developmentChains.includes(network.name) && process.env.BSCSCAN_API_KEY) {
    await verify(factory.address, [deployer]);
    await verify(router.address, [factory.address, wEth.address]);
  }
};

export default deployFunction;
deployFunction.tags = [`all`, `factory`, `swap`];
