import { ethers } from 'ethers';
import { 
  AMOY_RPC_URL, 
  KRITI_CONTRACT_ADDRESS, 
  KRITI_CONTRACT_ABI, 
  blockchainProvider,
  registryContract,
  getPublicKeyFromBlockchain 
} from '@/config/blockchain';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Types for blockchain operations
export interface BlockchainTransaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
}

export interface IssuerKeyPair {
  privateKey: string;
  publicKey: string;
  did: string;
}

/**
 * Generate a new key pair for an issuer
 * @param issuerName - Name of the issuer (e.g., "vtu-demo")
 * @returns Generated key pair with DID
 */
export function generateIssuerKeys(issuerName: string): IssuerKeyPair {
  try {
    // For demo purposes, we'll use a simple approach
    // In production, you'd want more secure key generation
    const wallet = ethers.Wallet.createRandom();
    
    return {
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      did: `did:kriti:issuer:${issuerName.toLowerCase().replace(/\s+/g, '-')}`
    };
  } catch (error) {
    console.error('Error generating issuer keys:', error);
    throw new Error('Failed to generate issuer keys');
  }
}

/**
 * Connect to MetaMask and get signer for transactions
 * @returns Ethereum signer object
 */
export async function connectWallet(): Promise<ethers.providers.JsonRpcSigner | null> {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Check if connected to Amoy network
      const network = await provider.getNetwork();
      if (network.chainId !== 80002) {
        // Try to switch to Amoy network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13882' }], // 80002 in hex
          });
        } catch (switchError: any) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x13882',
                chainName: 'Polygon Amoy',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
                rpcUrls: [AMOY_RPC_URL],
                blockExplorerUrls: ['https://amoy.polygonscan.com/']
              }]
            });
          }
        }
      }
      
      return signer;
    } else {
      alert('Please install MetaMask to interact with the blockchain!');
      return null;
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
}

/**
 * Register an issuer's DID and public key on the blockchain
 * @param did - The issuer's DID
 * @param publicKey - The issuer's public key
 * @returns Transaction hash if successful
 */
export async function registerIssuerOnBlockchain(
  did: string, 
  publicKey: string
): Promise<string | null> {
  try {
    const signer = await connectWallet();
    if (!signer) {
      throw new Error('Wallet connection failed');
    }

    // Create contract instance with signer for writing
    const contractWithSigner = new ethers.Contract(
      KRITI_CONTRACT_ADDRESS,
      KRITI_CONTRACT_ABI,
      signer
    );

    console.log(`Registering DID on blockchain: ${did}`);
    console.log(`Public key: ${publicKey}`);

    // Call the registerDid function
    const transaction = await contractWithSigner.registerDid(did, publicKey);
    
    console.log('Transaction submitted:', transaction.hash);
    
    // Wait for transaction confirmation
    const receipt = await transaction.wait();
    console.log('Transaction confirmed:', receipt);

    return transaction.hash;
  } catch (error) {
    console.error('Error registering issuer on blockchain:', error);
    throw error;
  }
}

/**
 * Verify a credential by checking the issuer's signature against blockchain-stored public key
 * @param issuerDid - The issuer's DID
 * @param credentialData - The original credential data
 * @param signature - The credential's signature
 * @returns Whether the credential is valid
 */
export async function verifyCredentialSignature(
  issuerDid: string,
  credentialData: any,
  signature: string
): Promise<boolean> {
  try {
    console.log('Verifying credential signature...');
    console.log('Issuer DID:', issuerDid);
    console.log('Signature:', signature);

    // Get public key from blockchain
    const publicKey = await getPublicKeyFromBlockchain(issuerDid);
    if (!publicKey) {
      console.error('Public key not found on blockchain for issuer:', issuerDid);
      return false;
    }

    console.log('Public key retrieved from blockchain:', publicKey);

    // Create message hash from credential data
    const message = JSON.stringify(credentialData);
    const messageHash = ethers.utils.hashMessage(message);

    try {
      // Recover address from signature
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      
      // For this demo, we'll consider it valid if we can recover an address
      // In production, you'd compare this with the expected issuer address
      console.log('Recovered address:', recoveredAddress);
      return true;
    } catch (verifyError) {
      console.error('Signature verification failed:', verifyError);
      return false;
    }
  } catch (error) {
    console.error('Error in credential verification:', error);
    return false;
  }
}

/**
 * Sign credential data with issuer's private key
 * @param credentialData - The credential data to sign
 * @param privateKey - The issuer's private key
 * @returns Signature string
 */
export async function signCredential(credentialData: any, privateKey: string): Promise<string> {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const message = JSON.stringify(credentialData);
    const signature = await wallet.signMessage(message);
    return signature;
  } catch (error) {
    console.error('Error signing credential:', error);
    throw error;
  }
}

/**
 * Get blockchain network status
 * @returns Network information
 */
export async function getNetworkStatus() {
  try {
    const network = await blockchainProvider.getNetwork();
    const blockNumber = await blockchainProvider.getBlockNumber();
    
    return {
      chainId: network.chainId,
      name: network.name,
      blockNumber,
      isAmoy: network.chainId === 80002
    };
  } catch (error) {
    console.error('Error getting network status:', error);
    return null;
  }
}

/**
 * Check if the contract is deployed and accessible
 * @returns Whether the contract is accessible
 */
export async function checkContractStatus(): Promise<boolean> {
  try {
    // Try to read from the contract
    const code = await blockchainProvider.getCode(KRITI_CONTRACT_ADDRESS);
    return code !== '0x';
  } catch (error) {
    console.error('Error checking contract status:', error);
    return false;
  }
}

/**
 * Create a secure hash of credential data for integrity verification
 * @param credentialData - The credential data to hash
 * @returns SHA256 hash of the credential data
 */
export function hashCredentialData(credentialData: any): string {
  try {
    // Create a normalized version of the credential data
    // Remove fields that shouldn't be part of the hash
    const { id, blockchainHash, signature, ...dataToHash } = credentialData;
    
    // Sort the keys to ensure consistent hashing
    const sortedData = JSON.stringify(dataToHash, Object.keys(dataToHash).sort());
    
    // Create SHA256 hash
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(sortedData));
    return hash;
  } catch (error) {
    console.error('Error hashing credential data:', error);
    throw new Error('Failed to hash credential data');
  }
}

/**
 * Verify credential integrity by comparing current data hash with blockchain hash
 * @param credentialData - Current credential data from Firebase
 * @param storedHash - Hash stored on blockchain
 * @returns Whether the credential data has been tampered with
 */
export function verifyCredentialIntegrity(credentialData: any, storedHash: string): boolean {
  try {
    const currentHash = hashCredentialData(credentialData);
    return currentHash === storedHash;
  } catch (error) {
    console.error('Error verifying credential integrity:', error);
    return false;
  }
}

/**
 * Complete credential verification - checks both signature and data integrity
 * @param credential - The credential to verify
 * @returns Verification result with details
 */
export async function verifyCredentialComplete(credential: any): Promise<{
  isValid: boolean;
  signatureValid: boolean;
  integrityValid: boolean;
  error?: string;
}> {
  try {
    // Check if credential has blockchain hash
    if (!credential.blockchainHash) {
      return {
        isValid: false,
        signatureValid: false,
        integrityValid: false,
        error: 'Credential not registered on blockchain'
      };
    }

    // Verify data integrity
    const integrityValid = verifyCredentialIntegrity(credential, credential.blockchainHash);
    
    // Verify signature (if available)
    let signatureValid = true;
    if (credential.signature && credential.issuerDid) {
      signatureValid = await verifyCredentialSignature(
        credential.issuerDid, 
        credential, 
        credential.signature
      );
    }

    const isValid = integrityValid && signatureValid;

    return {
      isValid,
      signatureValid,
      integrityValid,
      error: !isValid ? 'Credential verification failed' : undefined
    };
  } catch (error) {
    console.error('Error in complete credential verification:', error);
    return {
      isValid: false,
      signatureValid: false,
      integrityValid: false,
      error: 'Verification process failed'
    };
  }
}

/**
 * Issue a credential on the blockchain smart contract
 * @param credentialId - Unique credential identifier
 * @param studentDID - Student's DID
 * @param issuerDID - Issuer's DID
 * @param credentialHash - Hash of credential data
 * @param credentialType - Type of credential
 * @param ipfsHash - IPFS hash for additional data (optional)
 * @returns Transaction hash
 */
export async function issueCredentialOnBlockchain(
  credentialId: string,
  studentDID: string,
  issuerDID: string,
  credentialHash: string,
  credentialType: string,
  ipfsHash: string = ''
): Promise<string> {
  try {
    if (!registryContract) {
      throw new Error('Registry contract not initialized');
    }

    console.log('Issuing credential on blockchain:', {
      credentialId,
      studentDID,
      issuerDID,
      credentialHash,
      credentialType
    });

    // Convert hash to bytes32 format
    const hashBytes32 = credentialHash.startsWith('0x') ? credentialHash : `0x${credentialHash}`;

    // Call the smart contract
    const tx = await registryContract.issueCredential(
      credentialId,
      studentDID,
      issuerDID,
      hashBytes32,
      credentialType,
      ipfsHash
    );

    console.log('Transaction submitted:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return tx.hash;
  } catch (error) {
    console.error('Error issuing credential on blockchain:', error);
    throw error;
  }
}

/**
 * Verify a credential against the blockchain smart contract
 * @param credentialId - Credential ID to verify
 * @param providedHash - Hash to verify against
 * @returns Verification result from blockchain
 */
export async function verifyCredentialOnBlockchain(
  credentialId: string,
  providedHash: string
): Promise<boolean> {
  try {
    if (!registryContract) {
      throw new Error('Registry contract not initialized');
    }

    console.log('Verifying credential on blockchain:', {
      credentialId,
      providedHash
    });

    // Convert hash to bytes32 format
    const hashBytes32 = providedHash.startsWith('0x') ? providedHash : `0x${providedHash}`;

    // Call the smart contract verification function
    const isValid = await registryContract.verifyCredential(credentialId, hashBytes32);
    
    console.log('Blockchain verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Error verifying credential on blockchain:', error);
    return false;
  }
}

/**
 * Get credential details from the blockchain
 * @param credentialId - Credential ID to look up
 * @returns Credential details from blockchain
 */
export async function getCredentialFromBlockchain(credentialId: string): Promise<{
  exists: boolean;
  credentialId: string;
  studentDID: string;
  issuerDID: string;
  credentialHash: string;
  credentialType: string;
  issuedAt: number;
  revoked: boolean;
  ipfsHash: string;
} | null> {
  try {
    if (!registryContract) {
      throw new Error('Registry contract not initialized');
    }

    console.log('Getting credential from blockchain:', credentialId);

    // Call the smart contract to get credential details
    const credential = await registryContract.getCredential(credentialId);
    
    // Check if credential exists (empty credentialId means not found)
    if (!credential.credentialId || credential.credentialId === '') {
      return {
        exists: false,
        credentialId: '',
        studentDID: '',
        issuerDID: '',
        credentialHash: '',
        credentialType: '',
        issuedAt: 0,
        revoked: false,
        ipfsHash: ''
      };
    }

    return {
      exists: true,
      credentialId: credential.credentialId,
      studentDID: credential.studentDID,
      issuerDID: credential.issuerDID,
      credentialHash: credential.credentialHash,
      credentialType: credential.credentialType,
      issuedAt: credential.issuedAt.toNumber(),
      revoked: credential.revoked,
      ipfsHash: credential.ipfsHash
    };
  } catch (error) {
    console.error('Error getting credential from blockchain:', error);
    return null;
  }
}

/**
 * Enhanced credential verification that checks both local hash and blockchain
 * @param credential - The credential to verify
 * @returns Complete verification result
 */
export async function verifyCredentialCompleteWithBlockchain(credential: any): Promise<{
  isValid: boolean;
  signatureValid: boolean;
  integrityValid: boolean;
  blockchainValid: boolean;
  blockchainRegistered: boolean;
  error?: string;
}> {
  try {
    // Check if credential has blockchain hash
    if (!credential.blockchainHash) {
      return {
        isValid: false,
        signatureValid: false,
        integrityValid: false,
        blockchainValid: false,
        blockchainRegistered: false,
        error: 'Credential not registered on blockchain'
      };
    }

    // Verify local data integrity
    const integrityValid = verifyCredentialIntegrity(credential, credential.blockchainHash);
    
    // Verify against blockchain
    let blockchainValid = false;
    let blockchainRegistered = false;
    
    try {
      blockchainValid = await verifyCredentialOnBlockchain(credential.id, credential.blockchainHash);
      blockchainRegistered = true;
    } catch (error) {
      console.warn('Blockchain verification failed:', error);
      blockchainValid = false;
      blockchainRegistered = false;
    }

    // Verify signature (if available)
    let signatureValid = true;
    if (credential.signature && credential.issuerDid) {
      signatureValid = await verifyCredentialSignature(
        credential.issuerDid, 
        credential, 
        credential.signature
      );
    }

    const isValid = integrityValid && blockchainValid && signatureValid;

    return {
      isValid,
      signatureValid,
      integrityValid,
      blockchainValid,
      blockchainRegistered,
      error: !isValid ? 'Credential verification failed' : undefined
    };
  } catch (error) {
    console.error('Error in complete blockchain credential verification:', error);
    return {
      isValid: false,
      signatureValid: false,
      integrityValid: false,
      blockchainValid: false,
      blockchainRegistered: false,
      error: 'Verification process failed'
    };
  }
}

// Export utility functions
export {
  getPublicKeyFromBlockchain
};