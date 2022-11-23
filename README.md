# Ethereum Domain Name Service
This is a project I created to learn a bit more about how domain naming systems work and how to work on a Layer 2 solution for Ethereum. This project
was deployed on the Polygon Mumbai testnet. I definitely found this project to be super exciting. This readme is here to document what I learned during the process and the big takeaways I got out of it. Thank you to the buildspace community!

I learned a ton about how a Domain Name System actually works. It's pretty wild and a lot simpler than I initially thought as well. This project replicates features found in 2 Types of DNS servers. A TLD nameserver, and an authoritative nameserver. One is our top level domain that holds all of our registered domains(our domains mapping variable), and our authoritative nameserver(our records variable).

The live project is hosted here: https://lighthearted-clafoutis-e22c64.netlify.app/

The Cloud Name Service, or CNS is located on the Mumbai testnet here: https://mumbai.polygonscan.com/address/0x009613959Ba81ED6A1e6B5fde97f1De9d01ae8e6

## Local Environment
To set our our local dev environment we used Hardhat. It's a really cool tool and allows us to spin up blockchains on our local machine. We just used
npm to install everything and use npx hardhat to run everything.

## Setting up domains, resolvers, and records
Name services will help direct people to resources on the internet. Ex: You type in google.com to get to Google, people use the name of the service to get where they want. This is what we're replicating on the blockchain, so our smart contract needs a function that people can hit to register their domain and a place to store their names.

I used a mapping variable to maintain the state of the contract. It just holds a string mapped to an address. So "domainName" => "address".
This domain data is stored on chain and allows us to register a domain on our contract. I also had uploaded my private wallet key to github due to a failed .gitignore on a public repo 🥲. That was quite a panicky learning experience.

Mappings are the backbone of this project, they're pretty much just a dictionary/hash table. Each mapping has a key associated with a value, which we use as our resolver. This associates our domain name with its record. 

From here, we used functions to manipulate our mappings.
One mapping will store the actual domain names associated with the ethereum address that owns it. This is our domains mapping.

The next mapping is our records mapping, this has our domain name in the key and the value it is pointing to is our record.

We have a third mapping as well to make it easy to see which domains have been registered so far. This is our names mapping, it just points our names to a tokenID.

## ERC721
We modified our smart contract to extend the ERC721 NFT standard. This allows us to mint a token with each domain registered. This are hosted on chain as an SVG. If you're interested in seeing how to put the ERC721 standard together into an NFT, please see my other project. You pretty much just set the metadata of a token to a uri and increment the contracts token count. The metadata/uri and tokenId is what makes the NFT unique.

## React Front-End
This was a super fun part. I felt like the front-end of this application really taught me a lot and solidified a lot of the content I was learning. I learned about the useState hook and state variables. As well as how to trigger animations and modals with boolean state values. I really learned how webapps boil down to html/css/js. It was wild for sure seeing it all fit together.