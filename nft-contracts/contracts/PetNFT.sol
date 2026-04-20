// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PetNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    struct Pet {
        string name;
        string species;
        uint256 level;
        uint256 experience;
    }
    
    mapping(uint256 => Pet) public pets;
    
    constructor() ERC721("AI Pet Universe", "AIPET") Ownable(msg.sender) {}
    
    function mintPet(
        address to,
        string memory name,
        string memory species
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        pets[tokenId] = Pet({
            name: name,
            species: species,
            level: 1,
            experience: 0
        });
        
        return tokenId;
    }
    
    function getPet(uint256 tokenId) public view returns (Pet memory) {
        return pets[tokenId];
    }
    
    function updatePetExperience(uint256 tokenId, uint256 experience) public onlyOwner {
        pets[tokenId].experience += experience;
        
        if (pets[tokenId].experience >= pets[tokenId].level * 1000) {
            pets[tokenId].level += 1;
        }
    }
}