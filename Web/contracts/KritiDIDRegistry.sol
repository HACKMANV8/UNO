// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract KritiDIDRegistry {
    // Events
    event DIDCreated(string indexed did, address indexed issuer, uint256 timestamp);
    event CredentialIssued(string indexed credentialId, string indexed did, address indexed issuer, bytes32 credentialHash);
    event CredentialVerified(string indexed credentialId, address indexed verifier, bool isValid);
    event IssuerAuthorized(address indexed issuer, string institutionName, bool authorized);

    // Structs
    struct DIDDocument {
        string did;
        address issuer;
        string institutionName;
        uint256 createdAt;
        bool active;
    }

    struct Credential {
        string credentialId;
        string studentDID;
        string issuerDID;
        bytes32 credentialHash;
        string credentialType;
        uint256 issuedAt;
        bool revoked;
        string ipfsHash; // For storing detailed credential data
    }

    struct AuthorizedIssuer {
        address issuerAddress;
        string institutionName;
        string[] allowedCredentialTypes;
        bool authorized;
        uint256 authorizedAt;
    }

    // State variables
    mapping(string => DIDDocument) public didDocuments;
    mapping(address => bool) public authorizedIssuers;
    mapping(string => Credential) public credentials;
    mapping(address => AuthorizedIssuer) public issuerDetails;
    
    address public admin;
    uint256 public totalDIDs;
    uint256 public totalCredentials;

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Only authorized issuers can perform this action");
        _;
    }

    modifier validDID(string memory _did) {
        bytes memory didBytes = bytes(_did);
        require(didBytes.length > 0, "DID cannot be empty");
        require(bytes(didDocuments[_did].did).length > 0, "DID does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
        totalDIDs = 0;
        totalCredentials = 0;
    }

    // Admin functions
    function authorizeIssuer(
        address _issuer,
        string memory _institutionName,
        string[] memory _allowedCredentialTypes
    ) public onlyAdmin {
        require(_issuer != address(0), "Invalid issuer address");
        require(bytes(_institutionName).length > 0, "Institution name cannot be empty");

        authorizedIssuers[_issuer] = true;
        issuerDetails[_issuer] = AuthorizedIssuer({
            issuerAddress: _issuer,
            institutionName: _institutionName,
            allowedCredentialTypes: _allowedCredentialTypes,
            authorized: true,
            authorizedAt: block.timestamp
        });

        emit IssuerAuthorized(_issuer, _institutionName, true);
    }

    function revokeIssuer(address _issuer) public onlyAdmin {
        require(authorizedIssuers[_issuer], "Issuer is not authorized");
        
        authorizedIssuers[_issuer] = false;
        issuerDetails[_issuer].authorized = false;

        emit IssuerAuthorized(_issuer, issuerDetails[_issuer].institutionName, false);
    }

    // DID Management
    function createDID(string memory _did, string memory _institutionName) public onlyAuthorizedIssuer {
        require(bytes(_did).length > 0, "DID cannot be empty");
        require(bytes(didDocuments[_did].did).length == 0, "DID already exists");

        didDocuments[_did] = DIDDocument({
            did: _did,
            issuer: msg.sender,
            institutionName: _institutionName,
            createdAt: block.timestamp,
            active: true
        });

        totalDIDs++;
        emit DIDCreated(_did, msg.sender, block.timestamp);
    }

    function deactivateDID(string memory _did) public validDID(_did) {
        require(
            didDocuments[_did].issuer == msg.sender || msg.sender == admin,
            "Only DID issuer or admin can deactivate"
        );
        
        didDocuments[_did].active = false;
    }

    // Credential Management
    function issueCredential(
        string memory _credentialId,
        string memory _studentDID,
        string memory _issuerDID,
        bytes32 _credentialHash,
        string memory _credentialType,
        string memory _ipfsHash
    ) public onlyAuthorizedIssuer validDID(_issuerDID) {
        require(bytes(_credentialId).length > 0, "Credential ID cannot be empty");
        require(bytes(credentials[_credentialId].credentialId).length == 0, "Credential already exists");
        require(_credentialHash != bytes32(0), "Invalid credential hash");
        require(didDocuments[_issuerDID].issuer == msg.sender, "Issuer DID mismatch");
        require(didDocuments[_issuerDID].active, "Issuer DID is not active");

        // Verify issuer is allowed to issue this credential type
        bool typeAllowed = false;
        string[] memory allowedTypes = issuerDetails[msg.sender].allowedCredentialTypes;
        for (uint i = 0; i < allowedTypes.length; i++) {
            if (keccak256(abi.encodePacked(allowedTypes[i])) == keccak256(abi.encodePacked(_credentialType))) {
                typeAllowed = true;
                break;
            }
        }
        require(typeAllowed, "Issuer not authorized for this credential type");

        credentials[_credentialId] = Credential({
            credentialId: _credentialId,
            studentDID: _studentDID,
            issuerDID: _issuerDID,
            credentialHash: _credentialHash,
            credentialType: _credentialType,
            issuedAt: block.timestamp,
            revoked: false,
            ipfsHash: _ipfsHash
        });

        totalCredentials++;
        emit CredentialIssued(_credentialId, _studentDID, msg.sender, _credentialHash);
    }

    function revokeCredential(string memory _credentialId) public {
        require(bytes(credentials[_credentialId].credentialId).length > 0, "Credential does not exist");
        
        string memory issuerDID = credentials[_credentialId].issuerDID;
        require(
            didDocuments[issuerDID].issuer == msg.sender || msg.sender == admin,
            "Only credential issuer or admin can revoke"
        );

        credentials[_credentialId].revoked = true;
    }

    // Verification functions
    function verifyCredential(
        string memory _credentialId,
        bytes32 _providedHash
    ) public returns (bool) {
        require(bytes(credentials[_credentialId].credentialId).length > 0, "Credential does not exist");
        
        Credential memory credential = credentials[_credentialId];
        bool isValid = !credential.revoked && 
                      credential.credentialHash == _providedHash &&
                      didDocuments[credential.issuerDID].active;

        emit CredentialVerified(_credentialId, msg.sender, isValid);
        return isValid;
    }

    function verifyCredentialHash(
        string memory _credentialId,
        string memory _credentialData
    ) public view returns (bool) {
        require(bytes(credentials[_credentialId].credentialId).length > 0, "Credential does not exist");
        
        Credential memory credential = credentials[_credentialId];
        bytes32 computedHash = keccak256(abi.encodePacked(_credentialData));
        
        return !credential.revoked && 
               credential.credentialHash == computedHash &&
               didDocuments[credential.issuerDID].active;
    }

    // View functions
    function getDID(string memory _did) public view returns (
        string memory did,
        address issuer,
        string memory institutionName,
        uint256 createdAt,
        bool active
    ) {
        DIDDocument memory didDoc = didDocuments[_did];
        return (
            didDoc.did,
            didDoc.issuer,
            didDoc.institutionName,
            didDoc.createdAt,
            didDoc.active
        );
    }

    function getCredential(string memory _credentialId) public view returns (
        string memory credentialId,
        string memory studentDID,
        string memory issuerDID,
        bytes32 credentialHash,
        string memory credentialType,
        uint256 issuedAt,
        bool revoked,
        string memory ipfsHash
    ) {
        Credential memory cred = credentials[_credentialId];
        return (
            cred.credentialId,
            cred.studentDID,
            cred.issuerDID,
            cred.credentialHash,
            cred.credentialType,
            cred.issuedAt,
            cred.revoked,
            cred.ipfsHash
        );
    }

    function getIssuerDetails(address _issuer) public view returns (
        address issuerAddress,
        string memory institutionName,
        string[] memory allowedCredentialTypes,
        bool authorized,
        uint256 authorizedAt
    ) {
        AuthorizedIssuer memory issuer = issuerDetails[_issuer];
        return (
            issuer.issuerAddress,
            issuer.institutionName,
            issuer.allowedCredentialTypes,
            issuer.authorized,
            issuer.authorizedAt
        );
    }

    function isIssuerAuthorized(address _issuer) public view returns (bool) {
        return authorizedIssuers[_issuer];
    }

    function getTotalStats() public view returns (uint256 dids, uint256 creds) {
        return (totalDIDs, totalCredentials);
    }

    // Batch operations for efficiency
    function batchCreateDIDs(
        string[] memory _dids,
        string memory _institutionName
    ) public onlyAuthorizedIssuer {
        for (uint i = 0; i < _dids.length; i++) {
            if (bytes(didDocuments[_dids[i]].did).length == 0) {
                didDocuments[_dids[i]] = DIDDocument({
                    did: _dids[i],
                    issuer: msg.sender,
                    institutionName: _institutionName,
                    createdAt: block.timestamp,
                    active: true
                });
                totalDIDs++;
                emit DIDCreated(_dids[i], msg.sender, block.timestamp);
            }
        }
    }

    // Emergency functions
    function emergencyPause() public onlyAdmin {
        // Emergency pause functionality can be implemented here
        // For now, just emit an event
        // emit EmergencyPause(block.timestamp);
    }

    function updateAdmin(address _newAdmin) public onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        admin = _newAdmin;
    }
}