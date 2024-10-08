// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Pausable - Permite pausar y reanudar funciones críticas
contract Pausable {
    address public owner;
    bool private _paused;

    // Eventos para seguimiento de estado
    event Paused(address account);
    event Unpaused(address account);

    // Modificador para restringir funciones solo al propietario
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede ejecutar esta funcion");
        _;
    }

    // Modificador para permitir solo cuando no está pausado
    modifier whenNotPaused() {
        require(!_paused, "Las operaciones estan pausadas");
        _;
    }

    // Modificador para permitir solo cuando está pausado
    modifier whenPaused() {
        require(_paused, "Las operaciones no estan pausadas");
        _;
    }

    // Constructor que establece el propietario y el estado inicial
    constructor() {
        owner = msg.sender;
        _paused = false;
    }

    /// @notice Pausa las operaciones críticas
    function pause() external onlyOwner whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    /// @notice Reanuda las operaciones críticas
    function unpause() external onlyOwner whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }

    /// @notice Verifica si el contrato está pausado
    /// @return bool True si está pausado, de lo contrario false
    function paused() external view returns (bool) {
        return _paused;
    }
}
