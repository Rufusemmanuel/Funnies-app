import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying with: ${deployer.address}`)

  const factory = await ethers.getContractFactory("FunniesAirdrop")
  const contract = await factory.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  console.log(`FunniesAirdrop deployed to: ${address}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
