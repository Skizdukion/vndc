import { DeployProxyOptions } from "@openzeppelin/hardhat-upgrades/dist/utils";
import { Signer } from "ethers";
import { deployments, ethers, upgrades } from "hardhat";

interface CustomProxyOptions {
  instanceName?: string;
  contructorArgs?: unknown[];
  proxyOpts?: DeployProxyOptions;
  from?: Signer | string;
}

export const customDeployProxyWrapper = async (artifactsName: string, opts: CustomProxyOptions) => {
  opts.instanceName = opts.instanceName ?? artifactsName;

  const oldInstacte = await deployments.getOrNull(opts.instanceName);

  if (oldInstacte) {
    console.log(`${opts.instanceName.toUpperCase()}_ADDRESS=${oldInstacte.address}`);

    return;
  }

  const contractFactory = await ethers.getContractFactory(artifactsName, opts.from);

  const proxyInstance = await upgrades.deployProxy(
    contractFactory,
    opts.contructorArgs,
    opts.proxyOpts
  );

  const extendsArtifacts = await deployments.getExtendedArtifact(artifactsName);

  let proxyDeployments = {
    address: proxyInstance.address,
    ...extendsArtifacts,
  };

  await deployments.save(opts.instanceName, proxyDeployments);

  // console.log(
  //   `Contract ${opts.instanceName} proxy deployed at ${proxyInstance.address}`
  // );
  console.log(`${opts.instanceName.toUpperCase()}_ADDRESS=${proxyInstance.address}`);
};
