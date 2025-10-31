// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DidRegistry
 * @dev A VERY basic demo registry mapping a DID string to a public key string.
 *
 * !!! WARNING: NO ACCESS CONTROL !!!
 * Anyone can call registerDid() and overwrite anyone else's key.
 * This is insecure and for DEMONSTRATION purposes ONLY.
 * 
 * In production, you would add:
 * - Access control (only authorized institutions)
 * - Multi-signature requirements
 * - Governance mechanisms
 * - Upgrade patterns
 */
contract DidRegistry {
    // Mapping from the DID string (e.g., "did:kriti:issuer:vtu-demo") 
    // to the public key string (e.g., "04ab...").
    mapping(string => string) public publicKeys;
    
    // Track registered DIDs for enumeration
    string[] public registeredDids;
    mapping(string => bool) public didExists;
    
    // Events for transparency
    event DidRegistered(string indexed did, string publicKeyHex, address registeredBy);
    event DidUpdated(string indexed did, string newPublicKeyHex, address updatedBy);

    /**
     * @dev Registers or updates the public key for a given DID.
     * PUBLICLY CALLABLE - NO SECURITY.
     */
    function registerDid(string memory did, string memory publicKeyHex) public {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(bytes(publicKeyHex).length > 0, "Public key cannot be empty");
        
        bool isNewDid = !didExists[did];
        
        publicKeys[did] = publicKeyHex;
        
        if (isNewDid) {
            registeredDids.push(did);
            didExists[did] = true;
            emit DidRegistered(did, publicKeyHex, msg.sender);
        } else {
            emit DidUpdated(did, publicKeyHex, msg.sender);
        }
    }

    /**
     * @dev Retrieves the registered public key for a DID.
     */
    function getPublicKey(string memory did) public view returns (string memory) {
        return publicKeys[did];
    }
    
    /**
     * @dev Check if a DID is registered
     */
    function isDidRegistered(string memory did) public view returns (bool) {
        return didExists[did];
    }
    
    /**
     * @dev Get total number of registered DIDs
     */
    function getTotalDids() public view returns (uint256) {
        return registeredDids.length;
    }
    
    /**
     * @dev Get DID at specific index (for enumeration)
     */
    function getDidAtIndex(uint256 index) public view returns (string memory) {
        require(index < registeredDids.length, "Index out of bounds");
        return registeredDids[index];
    }
    
    /**
     * @dev Get all registered DIDs (gas-expensive, use carefully)
     */
    function getAllDids() public view returns (string[] memory) {
        return registeredDids;
    }
}