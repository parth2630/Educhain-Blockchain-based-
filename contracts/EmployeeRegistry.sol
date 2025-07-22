// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EmployeeRegistry {
    struct Employee {
        string name;
        string department;
        string username;
        string password;
        bool exists;
    }

    address public admin;
    mapping(address => Employee) public employees;
    mapping(string => bool) public usernames;

    event EmployeeAdded(address indexed employeeAddress, string name, string department);
    event EmployeeRemoved(address indexed employeeAddress);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addEmployee(
        address _employeeAddress,
        string memory _name,
        string memory _department,
        string memory _username,
        string memory _password
    ) external onlyAdmin {
        require(!employees[_employeeAddress].exists, "Employee already exists");
        require(!usernames[_username], "Username already taken");

        employees[_employeeAddress] = Employee({
            name: _name,
            department: _department,
            username: _username,
            password: _password,
            exists: true
        });

        usernames[_username] = true;
        emit EmployeeAdded(_employeeAddress, _name, _department);
    }

    function removeEmployee(address _employeeAddress) external onlyAdmin {
        require(employees[_employeeAddress].exists, "Employee does not exist");
        
        string memory username = employees[_employeeAddress].username;
        delete usernames[username];
        delete employees[_employeeAddress];
        
        emit EmployeeRemoved(_employeeAddress);
    }

    function getEmployee(address _employeeAddress) external view returns (
        string memory name,
        string memory department,
        string memory username,
        bool exists
    ) {
        Employee memory employee = employees[_employeeAddress];
        return (
            employee.name,
            employee.department,
            employee.username,
            employee.exists
        );
    }

    function verifyEmployee(address _employeeAddress, string memory _password) external view returns (bool) {
        Employee memory employee = employees[_employeeAddress];
        return employee.exists && 
               keccak256(abi.encodePacked(employee.password)) == keccak256(abi.encodePacked(_password));
    }
} 