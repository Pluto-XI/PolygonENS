# Ethereum Domain Name Service
This is a project I created to learn a bit more about how domain naming systems work and how to work on a Layer 2 solution for Ethereum. This project
was deployed on the Polygon Mumbai testnet. I definitely found this project to be super exciting. This readme is here to document what I learned during the process and the big takeaways I got out of it. Thank you to the buildspace community!

The Cloud Name Service, or CNS is located on the Mumbai testnet here: https://mumbai.polygonscan.com/address/0x7FB383937344C03cb1Cf456795446C786209eBC5

## Local Environment
To set our our local dev environment we used Hardhat. It's a really cool tool and allows us to spin up blockchains on our local machine. We just used
npm to install everything and use npx hardhat to run everything.

## Setting up domains, resolvers, and records
Name services will help direct people to resources on the internet. Ex: You type in google.com to get to Google, people use the name of the service to get where they want. This is what we're replicating on the blockchain, so our smart contract needs a function that people can hit to register their domain and a place to store their names.

I used a mapping variable to maintain the state of the contract. It just holds a string mapped to an address. So "domainName" => "address".
This domain data is stored on chain and allows us to register a domain on our contract. I also had uploaded my private wallet key to github due to a failed .gitignore on a public repo 🥲. That was quite a panicky learning experience.