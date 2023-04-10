import { DeployFunction } from "hardhat-deploy/types";
import { getNamedAccounts, deployments, network, ethers } from "hardhat";

const deployFunction: DeployFunction = async () => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId: number | undefined = network.config.chainId;

  // If we are on a local development network, we need to deploy mocks!
  if (chainId === 31337) {
    log(`Local network detected! Deploying mocks...`);

    await deploy("WETH", {
      contract: "WETH9",
      from: deployer,
      log: true,
    });

    await deploy("BUSD", {
      contract: "MockERC20",
      from: deployer,
      log: true,
      args: ["BUSD", "BUSD", ethers.constants.MaxUint256],
    });

    await deploy("USDT", {
      contract: "MockERC20",
      from: deployer,
      log: true,
      args: ["USDT", "USDT", ethers.constants.MaxUint256],
    });

    log(`Mocks Deployed!`);
  }
};

export default deployFunction;
deployFunction.tags = [`all`, `mocks`, `main`];
