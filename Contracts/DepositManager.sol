// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MintToken.sol";

/// @title PaymentProcessor - Facilita pagos entre usuarios y comerciantes utilizando DUSD
contract PaymentProcessor {
    MintToken public token;
    address public owner;

    // Eventos para seguimiento de pagos
    event PaymentMade(address indexed from, address indexed to, uint256 amount);
    event MerchantRegistered(address indexed merchant);
    event MerchantUnregistered(address indexed merchant);

    // Mapeo para gestionar comerciantes registrados
    mapping(address => bool) private _merchants;

    // Modificador para funciones que solo el propietario puede ejecutar
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede ejecutar esta funcion");
        _;
    }

    // Modificador para verificar si una direccion es un comerciante registrado
    modifier onlyRegisteredMerchant(address merchant) {
        require(_merchants[merchant], "Direccion no es un comerciante registrado");
        _;
    }

    // Constructor que asigna el token y establece el propietario
    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Direccion del token no valida");
        token = MintToken(tokenAddress);
        owner = msg.sender;
    }

    // Función para registrar un nuevo comerciante (solo el propietario)
    function registerMerchant(address merchant) external onlyOwner {
        require(merchant != address(0), "Direccion del comerciante no valida");
        require(!_merchants[merchant], "El comerciante ya esta registrado");
        _merchants[merchant] = true;
        emit MerchantRegistered(merchant);
    }

    // Función para desregistrar un comerciante (solo el propietario)
    function unregisterMerchant(address merchant) external onlyOwner {
        require(_merchants[merchant], "El comerciante no esta registrado");
        _merchants[merchant] = false;
        emit MerchantUnregistered(merchant);
    }

    // Función para realizar un pago a un comerciante registrado
    function makePayment(address merchant, uint256 amount) external onlyRegisteredMerchant(merchant) {
        require(merchant != address(0), "Direccion del comerciante no valida");
        require(amount > 0, "El monto debe ser mayor a cero");
        require(token.transferFrom(msg.sender, merchant, amount), "Pago fallido");
        emit PaymentMade(msg.sender, merchant, amount);
    }

    // Función para verificar si una direccion es un comerciante registrado
    function isMerchant(address merchant) external view returns (bool) {
        return _merchants[merchant];
    }
}

