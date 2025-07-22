// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StudentRegistry {
    address public admin;
    
    struct Student {
        string name;
        string rollNo;
        string department;
        string username;
        string password;
        bool isRegistered;
    }

    mapping(address => Student) public students;
    mapping(string => bool) public isUsernameTaken;
    mapping(string => bool) public isRollNoTaken;
    mapping(address => bool) public isStudent;

    event StudentRegistered(address indexed studentAddress, string name, string rollNo, string department);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function registerStudent(
        address studentAddress,
        string memory name,
        string memory rollNo,
        string memory department,
        string memory username,
        string memory password
    ) public onlyAdmin {
        require(!isStudent[studentAddress], "Student already registered");
        require(!isUsernameTaken[username], "Username already taken");
        require(!isRollNoTaken[rollNo], "Roll number already taken");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(rollNo).length > 0, "Roll number cannot be empty");
        require(bytes(department).length > 0, "Department cannot be empty");
        require(bytes(username).length > 0, "Username cannot be empty");
        require(bytes(password).length > 0, "Password cannot be empty");

        students[studentAddress] = Student({
            name: name,
            rollNo: rollNo,
            department: department,
            username: username,
            password: password,
            isRegistered: true
        });

        isStudent[studentAddress] = true;
        isUsernameTaken[username] = true;
        isRollNoTaken[rollNo] = true;

        emit StudentRegistered(studentAddress, name, rollNo, department);
    }

    function getStudent(address studentAddress) public view returns (
        string memory name,
        string memory rollNo,
        string memory department,
        string memory username,
        bool isRegistered
    ) {
        Student memory student = students[studentAddress];
        return (
            student.name,
            student.rollNo,
            student.department,
            student.username,
            student.isRegistered
        );
    }
} 