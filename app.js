// app.js

// Direcciones de los contratos desplegados en Shasta Testnet
const MINT_TOKEN_ADDRESS = 'TYrp7ANDCjCKY69sHSDkVojPG2M2bPV2Fp';
const DEPOSIT_MANAGER_ADDRESS = 'TPTAdJwrjGnd3QR8XL6AvwxSZrQ5C3ZXgg';
const PAYMENT_PROCESSOR_ADDRESS = 'TPbkwbNQUaVWvC6XGqPMGKtErt6Di3687a';

// ABIs de los contratos
let mintTokenABI, depositManagerABI, paymentProcessorABI;

// Inicializar TronWeb
let tronWebInstance;

// Estado del propietario
let isOwner = false;

document.addEventListener('DOMContentLoaded', () => {
    // Cargar los ABIs de los contratos
    loadContractABIs();

    // Botones de interacción
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('depositButton').addEventListener('click', makeDeposit);
    document.getElementById('withdrawButton').addEventListener('click', withdrawDeposit);
    document.getElementById('registerMerchantButton').addEventListener('click', registerMerchant);
    document.getElementById('unregisterMerchantButton').addEventListener('click', unregisterMerchant);
    document.getElementById('paymentButton').addEventListener('click', makePayment);
});

// Función para cargar los ABIs desde archivos JSON
async function loadContractABIs() {
    try {
        const [mintResponse, depositResponse, paymentResponse] = await Promise.all([
            fetch('./abis/MintToken.json'),
            fetch('./abis/DepositManager.json'),
            fetch('./abis/PaymentProcessor.json')
        ]);

        mintTokenABI = await mintResponse.json();
        depositManagerABI = await depositResponse.json();
        paymentProcessorABI = await paymentResponse.json();
    } catch (error) {
        console.error('Error al cargar los ABIs:', error);
        alert('Error al cargar los ABIs de los contratos.');
    }
}

// Función para conectar la cartera Tron
async function connectWallet() {
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        tronWebInstance = window.tronWeb;
        updateWalletAddress();
        await updateBalance();
        await checkOwner();
        await loadMerchants();
        await loadTransactionHistory();
        await listenForRealTimeEvents();
    } else {
        alert('Por favor, instale TronLink y conéctese a la red Shasta Testnet.');
    }
}

// Actualizar la dirección de la cartera en la interfaz
function updateWalletAddress() {
    const address = tronWebInstance.defaultAddress.base58;
    document.getElementById('walletAddress').innerText = `Dirección: ${address}`;
}

// Obtener y mostrar el saldo de BKT
async function updateBalance() {
    try {
        const contract = await tronWebInstance.contract(mintTokenABI, MINT_TOKEN_ADDRESS);
        const balance = await contract.balanceOf(tronWebInstance.defaultAddress.base58).call();
        const formattedBalance = tronWebInstance.toDecimal(balance) / 1e18;
        document.getElementById('balance').innerText = `Saldo: ${formattedBalance} BKT`;
    } catch (error) {
        console.error('Error al obtener el saldo:', error);
        alert('Error al obtener el saldo.');
    }
}

// Verificar si el usuario conectado es el propietario
async function checkOwner() {
    try {
        const depositManager = await tronWebInstance.contract(depositManagerABI, DEPOSIT_MANAGER_ADDRESS);
        const ownerAddress = await depositManager.owner().call();
        const userAddress = tronWebInstance.defaultAddress.base58;
        isOwner = (ownerAddress === userAddress);
        toggleOwnerSection();
    } catch (error) {
        console.error('Error al verificar el propietario:', error);
    }
}

// Mostrar u ocultar secciones solo para el propietario
function toggleOwnerSection() {
    const merchantSection = document.getElementById('merchantSection');
    if (isOwner) {
        merchantSection.style.display = 'block';
    } else {
        merchantSection.style.display = 'none';
    }
}

// Realizar un depósito
async function makeDeposit() {
    const amountInput = document.getElementById('depositAmount');
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, ingrese un monto válido.');
        return;
    }

    const depositAmount = tronWebInstance.toSun(amount); // Convertir a la unidad correcta

    try {
        const depositManager = await tronWebInstance.contract(depositManagerABI, DEPOSIT_MANAGER_ADDRESS);
        // Aprobar al DepositManager para gastar los tokens
        const approveTx = await approveToken(DEPOSIT_MANAGER_ADDRESS, depositAmount);
        if (approveTx) {
            // Realizar el depósito
            const tx = await depositManager.makeDeposit(depositAmount).send();
            console.log('Depósito realizado:', tx);
            showNotification('Depósito realizado con éxito.', 'success');
            amountInput.value = '';
            await updateBalance();
            await loadTransactionHistory();
        }
    } catch (error) {
        console.error('Error al realizar el depósito:', error);
        showNotification('Error al realizar el depósito.', 'error');
    }
}

// Aprobar el gasto de tokens
async function approveToken(spender, amount) {
    try {
        const mintToken = await tronWebInstance.contract(mintTokenABI, MINT_TOKEN_ADDRESS);
        const tx = await mintToken.approve(spender, amount).send();
        console.log('Aprobación realizada:', tx);
        return true;
    } catch (error) {
        console.error('Error al aprobar tokens:', error);
        showNotification('Error al aprobar tokens.', 'error');
        return false;
    }
}

// Retirar un depósito
async function withdrawDeposit() {
    try {
        const depositManager = await tronWebInstance.contract(depositManagerABI, DEPOSIT_MANAGER_ADDRESS);
        const tx = await depositManager.withdrawDeposit().send();
        console.log('Retiro realizado:', tx);
        showNotification('Retiro realizado con éxito.', 'success');
        await updateBalance();
        await loadTransactionHistory();
    } catch (error) {
        console.error('Error al retirar el depósito:', error);
        showNotification('Error al retirar el depósito.', 'error');
    }
}

// Registrar un comerciante
async function registerMerchant() {
    const merchantInput = document.getElementById('merchantAddress');
    const merchantAddress = merchantInput.value.trim();
    if (!tronWebInstance.isAddress(merchantAddress)) {
        alert('Dirección del comerciante no válida.');
        return;
    }

    try {
        const paymentProcessor = await tronWebInstance.contract(paymentProcessorABI, PAYMENT_PROCESSOR_ADDRESS);
        const tx = await paymentProcessor.registerMerchant(merchantAddress).send();
        console.log('Comerciante registrado:', tx);
        showNotification('Comerciante registrado con éxito.', 'success');
        merchantInput.value = '';
        await loadMerchants();
        await loadTransactionHistory();
    } catch (error) {
        console.error('Error al registrar comerciante:', error);
        showNotification('Error al registrar comerciante.', 'error');
    }
}

// Desregistrar un comerciante
async function unregisterMerchant() {
    const merchantInput = document.getElementById('merchantAddress');
    const merchantAddress = merchantInput.value.trim();
    if (!tronWebInstance.isAddress(merchantAddress)) {
        alert('Dirección del comerciante no válida.');
        return;
    }

    try {
        const paymentProcessor = await tronWebInstance.contract(paymentProcessorABI, PAYMENT_PROCESSOR_ADDRESS);
        const tx = await paymentProcessor.unregisterMerchant(merchantAddress).send();
        console.log('Comerciante desregistrado:', tx);
        showNotification('Comerciante desregistrado con éxito.', 'success');
        merchantInput.value = '';
        await loadMerchants();
        await loadTransactionHistory();
    } catch (error) {
        console.error('Error al desregistrar comerciante:', error);
        showNotification('Error al desregistrar comerciante.', 'error');
    }
}

// Cargar la lista de comerciantes registrados
async function loadMerchants() {
    const merchantListElement = document.getElementById('merchantList');
    merchantListElement.innerHTML = ''; // Limpiar lista actual

    try {
        const paymentProcessor = await tronWebInstance.contract(paymentProcessorABI, PAYMENT_PROCESSOR_ADDRESS);
        const merchants = await paymentProcessor.getRegisteredMerchants().call();

        merchants.forEach((merchant) => {
            const listItem = document.createElement('li');
            listItem.textContent = tronWebInstance.address.fromHex(merchant);
            merchantListElement.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error al cargar la lista de comerciantes:', error);
    }
}

// Realizar un pago a un comerciante
async function makePayment() {
    const merchantAddress = document.getElementById('paymentMerchantAddress').value.trim();
    const amountInput = document.getElementById('paymentAmount');
    const amount = parseFloat(amountInput.value);

    if (!tronWebInstance.isAddress(merchantAddress)) {
        alert('Dirección del comerciante no válida.');
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, ingrese un monto válido.');
        return;
    }

    const paymentAmount = tronWebInstance.toSun(amount); // Convertir a la unidad correcta

    try {
        const paymentProcessor = await tronWebInstance.contract(paymentProcessorABI, PAYMENT_PROCESSOR_ADDRESS);
        // Aprobar al PaymentProcessor para gastar los tokens
        const approveTx = await approveToken(PAYMENT_PROCESSOR_ADDRESS, paymentAmount);
        if (approveTx) {
            // Realizar el pago
            const tx = await paymentProcessor.makePayment(merchantAddress, paymentAmount).send();
            console.log('Pago realizado:', tx);
            showNotification('Pago realizado con éxito.', 'success');
            amountInput.value = '';
            await updateBalance();
            await loadTransactionHistory();
        }
    } catch (error) {
        console.error('Error al realizar el pago:', error);
        showNotification('Error al realizar el pago.', 'error');
    }
}

// Cargar el historial de transacciones
async function loadTransactionHistory() {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = ''; // Limpiar historial actual

    try {
        // Obtener eventos de Transfer para MintToken
        const mintToken = await tronWebInstance.contract(mintTokenABI, MINT_TOKEN_ADDRESS);
        const transferEvents = await mintToken.Transfer().getPastEvents({
            fromBlock: 0,
            toBlock: 'latest'
        });

        transferEvents.forEach(event => {
            const { from, to, value } = event.returnValues;
            const listItem = document.createElement('li');
            listItem.textContent = `Transferencia: ${tronWebInstance.address.fromHex(from)} -> ${tronWebInstance.address.fromHex(to)} | Monto: ${tronWebInstance.toDecimal(value) / 1e18} BKT`;
            transactionList.appendChild(listItem);
        });

        // Obtener eventos de DepositManager (Depósitos y Retiros)
        const depositManager = await tronWebInstance.contract(depositManagerABI, DEPOSIT_MANAGER_ADDRESS);
        const depositMadeEvents = await depositManager.DepositMade().getPastEvents({
            fromBlock: 0,
            toBlock: 'latest'
        });
        const withdrawalMadeEvents = await depositManager.WithdrawalMade().getPastEvents({
            fromBlock: 0,
            toBlock: 'latest'
        });

        depositMadeEvents.forEach(event => {
            const { user, amount } = event.returnValues;
            const listItem = document.createElement('li');
            listItem.textContent = `Depósito: ${tronWebInstance.address.fromHex(user)} | Monto: ${tronWebInstance.toDecimal(amount) / 1e18} BKT`;
            transactionList.appendChild(listItem);
        });

        withdrawalMadeEvents.forEach(event => {
            const { user, amount, interest } = event.returnValues;
            const listItem = document.createElement('li');
            listItem.textContent = `Retiro: ${tronWebInstance.address.fromHex(user)} | Monto: ${tronWebInstance.toDecimal(amount) / 1e18} BKT | Interés: ${tronWebInstance.toDecimal(interest) / 1e18} BKT`;
            transactionList.appendChild(listItem);
        });

        // Obtener eventos de PaymentProcessor (Pagos)
        const paymentProcessor = await tronWebInstance.contract(paymentProcessorABI, PAYMENT_PROCESSOR_ADDRESS);
        const paymentMadeEvents = await paymentProcessor.PaymentMade().getPastEvents({
            fromBlock: 0,
            toBlock: 'latest'
        });

        paymentMadeEvents.forEach(event => {
            const { from, to, amount } = event.returnValues;
            const listItem = document.createElement('li');
            listItem.textContent = `Pago: ${tronWebInstance.address.fromHex(from)} -> ${tronWebInstance.address.fromHex(to)} | Monto: ${tronWebInstance.toDecimal(amount) / 1e18} BKT`;
            transactionList.appendChild(listItem);
        });

    } catch (error) {
        console.error('Error al cargar el historial de transacciones:', error);
    }
}

// Mostrar notificaciones
function showNotification(message, type) {
    const notificationContainer = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerText = message;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000); // Desaparecer después de 5 segundos
}

// Escuchar eventos en tiempo real
async function listenForRealTimeEvents() {
    try {
        const mintToken = await tronWebInstance.contract(mintTokenABI, MINT_TOKEN_ADDRESS);
        const depositManager = await tronWebInstance.contract(depositManagerABI, DEPOSIT_MANAGER_ADDRESS);
        const paymentProcessor = await tronWebInstance.contract(paymentProcessorABI, PAYMENT_PROCESSOR_ADDRESS);
        
        // Escuchar Transfer
        mintToken.Transfer().watch((err, event) => {
            if (err) {
                console.error('Error al escuchar Transfer:', err);
                return;
            }
            const { from, to, value } = event.returnValues;
            const amount = tronWebInstance.toDecimal(value) / 1e18;
            showNotification(`Transferencia de ${amount} BKT de ${tronWebInstance.address.fromHex(from)} a ${tronWebInstance.address.fromHex(to)}`, 'success');
            updateBalance();
            loadTransactionHistory();
        });

        // Escuchar DepositMade
        depositManager.DepositMade().watch((err, event) => {
            if (err) {
                console.error('Error al escuchar DepositMade:', err);
                return;
            }
            const { user, amount } = event.returnValues;
            const formattedAmount = tronWebInstance.toDecimal(amount) / 1e18;
            showNotification(`Nuevo depósito de ${formattedAmount} BKT por ${tronWebInstance.address.fromHex(user)}`, 'success');
            updateBalance();
            loadTransactionHistory();
        });

        // Escuchar WithdrawalMade
        depositManager.WithdrawalMade().watch((err, event) => {
            if (err) {
                console.error('Error al escuchar WithdrawalMade:', err);
                return;
            }
            const { user, amount, interest } = event.returnValues;
            const formattedAmount = tronWebInstance.toDecimal(amount) / 1e18;
            const formattedInterest = tronWebInstance.toDecimal(interest) / 1e18;
            showNotification(`Retiro de ${formattedAmount} BKT con ${formattedInterest} BKT de interés para ${tronWebInstance.address.fromHex(user)}`, 'success');
            updateBalance();
            loadTransactionHistory();
        });

        // Escuchar PaymentMade
        paymentProcessor.PaymentMade().watch((err, event) => {
            if (err) {
                console.error('Error al escuchar PaymentMade:', err);
                return;
            }
            const { from, to, amount } = event.returnValues;
            const formattedAmount = tronWebInstance.toDecimal(amount) / 1e18;
            showNotification(`Pago de ${formattedAmount} BKT de ${tronWebInstance.address.fromHex(from)} a ${tronWebInstance.address.fromHex(to)}`, 'success');
            updateBalance();
            loadTransactionHistory();
        });

    } catch (error) {
        console.error('Error al configurar listeners de eventos:', error);
    }
}
