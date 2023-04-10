// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract VNDC is
  Initializable,
  ERC20Upgradeable,
  ERC20PausableUpgradeable,
  OwnableUpgradeable
{  
  function initialize() public initializer {
    __ERC20_init("VNDC", "VNDC");
    __Ownable_init();
    __ERC20Pausable_init();
    _mint(_msgSender(), 20_000_000_000_000 * 10 ** 18);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override(ERC20PausableUpgradeable, ERC20Upgradeable) {
    super._beforeTokenTransfer(from, to, amount);
  }

  function pause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }

  function issue(uint amount) public whenNotPaused onlyOwner {
    _mint(_msgSender(), amount);
    emit Issue(amount);
  }

  function burn(uint256 amount) public whenNotPaused onlyOwner {
    _burn(_msgSender(), amount);
    emit Burn(amount);
  }

  // Called when new token are issued
  event Issue(uint amount);

  // Called when tokens are Burned
  event Burn(uint amount);
}
