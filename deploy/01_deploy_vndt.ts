import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { customDeployProxyWrapper } from "../utils/proxyDeploy";

const deployFunction: DeployFunction = async () => {
  const deployer = (await ethers.getSigners())[0];

  await customDeployProxyWrapper("VNDT", {
    from: deployer,
    proxyOpts: {
      initializer: "initialize()",
    },
  });
};
export default deployFunction;
deployFunction.tags = ["all", "token", "vndc"];
