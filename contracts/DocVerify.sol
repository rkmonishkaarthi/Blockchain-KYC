// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocVerify {
    address public owner;

    struct Student {
        string fullName;
        string dob;
        string gender;
        string physicalAddress; // named physicalAddress to avoid keyword collision
        string phone;
        string email;
        string aadhaar;
        string pan;
        string passport;
        string drivingLicense;
        string voterId;
        string photoUrl; // Store Base64 Photo
    }

    mapping(bytes32 => bool) public documentHashes;
    mapping(bytes32 => Student) public studentDetails;

    constructor() {
        owner = msg.sender;
    }

    // Add document hash + all KYC fields (only owner)
    function addDocumentHash(
        bytes32 hash,
        Student memory student
    ) public {
        require(msg.sender == owner, "Only owner can add");
        documentHashes[hash] = true;
        studentDetails[hash] = student;
    }

    function verifyDocument(bytes32 hash) public view returns (bool) {
        return documentHashes[hash];
    }

    // Return all stored fields in same order as struct
    function getStudentDetails(bytes32 hash) public view returns (
        string memory, string memory, string memory, string memory, string memory,
        string memory, string memory, string memory, string memory, string memory,
        string memory, string memory
    ) {
        require(documentHashes[hash], "Document not found");
        Student memory student = studentDetails[hash];
        return (
            student.fullName,
            student.dob,
            student.gender,
            student.physicalAddress,
            student.phone,
            student.email,
            student.aadhaar,
            student.pan,
            student.passport,
            student.drivingLicense,
            student.voterId,
            student.photoUrl
        );
    }
}
