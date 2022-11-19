const main = async () => {
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("cloud");
    await domainContract.deployed();
  
    console.log("Contract deployed to:", domainContract.address);
  
    let txn = await domainContract.register("pluto",  {value: hre.ethers.utils.parseEther('0.01')});
    await txn.wait();
    console.log("Minted domain pluto.cloud");
  
    txn = await domainContract.setRecord("pluto", "https://github.com/Pluto-XI/PolygonENS");
    await txn.wait();
    console.log("Set record for pluto.cloud");
  
    const address = await domainContract.getAddress("pluto");
    console.log("Owner of domain pluto:", address);
  
    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
  }
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };

  runMain();