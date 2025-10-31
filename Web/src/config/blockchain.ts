import { ethers } from 'ethers';

// Polygon Amoy Testnet Configuration
export const AMOY_RPC_URL = "https://rpc-amoy.polygon.technology/";
export const AMOY_CHAIN_ID = 80002;

// Smart Contract Configuration
// TODO: Deploy your DidRegistry contract and update this address
export const KRITI_CONTRACT_ADDRESS = "0x99b15e2d5fb8f3b06149fbf909db32320c723d89";
export const KRITI_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "did",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "publicKeyHex",
        "type": "string"
      }
    ],
    "name": "registerDid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "did",
        "type": "string"
      }
    ],
    "name": "getPublicKey",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "publicKeys",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "did",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "publicKeyHex",
        "type": "string"
      }
    ],
    "name": "DidRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_credentialId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_studentDID",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_issuerDID",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "_credentialHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "_credentialType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_ipfsHash",
        "type": "string"
      }
    ],
    "name": "issueCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_credentialId",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "_providedHash",
        "type": "bytes32"
      }
    ],
    "name": "verifyCredential",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_credentialId",
        "type": "string"
      }
    ],
    "name": "getCredential",
    "outputs": [
      {
        "internalType": "string",
        "name": "credentialId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "studentDID",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "issuerDID",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "credentialHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "credentialType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "issuedAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "revoked",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "credentialId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "string",
        "name": "studentDID",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "credentialHash",
        "type": "bytes32"
      }
    ],
    "name": "CredentialIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "credentialId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "verifier",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      }
    ],
    "name": "CredentialVerified",
    "type": "event"
  }
];

// Create a read-only provider for blockchain queries
export const blockchainProvider = new ethers.providers.JsonRpcProvider(AMOY_RPC_URL);

// Create a read-only instance of the contract
export const registryContract = new ethers.Contract(
  KRITI_CONTRACT_ADDRESS,
  KRITI_CONTRACT_ABI,
  blockchainProvider
);

/**
 * Fetches the public key for an issuer's DID from the blockchain
 * @param issuerDid - The DID to look up (e.g., "did:kriti:issuer:vtu-demo")
 * @returns The public key hex string, or null if not found
 */
export async function getPublicKeyFromBlockchain(issuerDid: string): Promise<string | null> {
  console.log(`Querying blockchain for public key of: ${issuerDid}`);
  try {
    const publicKeyHex = await registryContract.getPublicKey(issuerDid);

    if (publicKeyHex && publicKeyHex !== "") {
      console.log("Public key found on-chain:", publicKeyHex);
      return publicKeyHex;
    } else {
      console.error("DID not found in blockchain registry:", issuerDid);
      return null;
    }
  } catch (error) {
    console.error("Error querying smart contract:", error);
    return null;
  }
}

/**
 * Verifies a credential signature using the blockchain-stored public key
 * @param issuerDid - The issuer's DID
 * @param data - The original credential data
 * @param signature - The signature to verify
 * @returns Promise<boolean> - Whether the signature is valid
 */
export async function verifyCredentialOnBlockchain(
  issuerDid: string,
  data: string,
  signature: string
): Promise<boolean> {
  try {
    const publicKeyHex = await getPublicKeyFromBlockchain(issuerDid);
    if (!publicKeyHex) {
      console.error("Public key not found for issuer:", issuerDid);
      return false;
    }

    // TODO: Implement signature verification using jsrsasign or similar
    // This is where you'd verify the signature using the public key
    console.log("Verifying signature with public key:", publicKeyHex);
    
    // For now, return true - implement actual verification later
    return true;
  } catch (error) {
    console.error("Error verifying credential:", error);
    return false;
  }
}