    // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title BancoToken (BKT) - Token ERC20 personalizado para Banco Comercial de El Salvador
contract MintToken {
    string public name = "Davivienda";
    string public symbol = "DUSD";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // Eventos estándar ERC20
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // Modificador para restringir funciones solo al propietario
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute this function");
        _;
    }
    
    // Constructor que asigna el suministro inicial al propietario
    constructor(uint256 initialSupply) {
        owner = msg.sender;
        _mint(owner, initialSupply * (10 ** uint256(decimals)));
    }
    
    // Función para obtener el saldo de una cuenta
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    // Función para transferir tokens a otra dirección
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    // Función para aprobar el gasto de tokens por parte de otra dirección
    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    // Función para transferir tokens desde una dirección aprobada
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "Insufficient allowance");
        _approve(from, msg.sender, currentAllowance - amount);
        _transfer(from, to, amount);
        return true;
    }
    
    // Función para incrementar la aprobación de gasto
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender] + addedValue);
        return true;
    }
    
    // Función para decrementar la aprobación de gasto
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {
        uint256 currentAllowance = _allowances[msg.sender][spender];
        require(currentAllowance >= subtractedValue, "Decreased allowance below zero");
        _approve(msg.sender, spender, currentAllowance - subtractedValue);
        return true;
    }
    
    // Función para acuñar nuevos tokens (solo el propietario puede ejecutar)
    function mint(address to, uint256 amount) external onlyOwner returns (bool) {
        _mint(to, amount);
        return true;
    }
    
    // Función para quemar tokens de la cuenta del llamador
    function burn(uint256 amount) external returns (bool) {
        _burn(msg.sender, amount);
        return true;
    }
    
    // Función interna para transferir tokens
    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= amount, "Insufficient balance");

        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }
    
    // Función interna para aprobar el gasto de tokens
    function _approve(address owner_, address spender, uint256 amount) internal {
        require(owner_ != address(0), "Approve from zero address");
        require(spender != address(0), "Approve to zero address");

        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }
    
    // Función interna para acuñar tokens
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "Mint to zero address");

        totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }
    
    // Función interna para quemar tokens
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "Burn from zero address");
        require(_balances[account] >= amount, "Insufficient balance to burn");

        _balances[account] -= amount;
        totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }
}
