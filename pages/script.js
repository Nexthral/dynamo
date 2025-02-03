document.addEventListener("DOMContentLoaded", async () => {
    document.body.style.pointerEvents = "none"; // Bloqueia interações até carregar tudo

    window.onload = async () => {
        document.body.style.pointerEvents = "auto"; // Libera cliques após carregamento

        const userId = sessionStorage.getItem("loggedInUserId");
        if (!userId) return;

        try {
            const response = await fetch(`/database/${userId}.json`);
            if (!response.ok) throw new Error("Arquivo JSON não encontrado");

            const userData = await response.json();

            // Atualiza saudações
            updateGreeting();
            document.querySelector(".username").textContent = userData.nome;

            // Atualiza saldos e armazena valores originais
            setCurrencyValue(".currency-value", `R$ ${formatCurrency(userData.saldo)}`);
            setCurrencyValue(".currency-value", `US$ ${formatCurrency(userData.saldo / 6)}`, 1);

            // Se o usuário tem BrigthCoins, exibe e armazena
            if (userData.BrigthCoins !== undefined) {
                setCurrencyValue(".currency-value", `BC$ ${formatCurrency(userData.BrigthCoins)}`, 2, true);
            }

            // Adiciona eventos nos botões
            setupEventListeners(userData.BrigthCoins !== undefined);
        } catch (error) {
            console.error("Erro ao carregar os dados do usuário:", error);
        }
    };
});

// Função para definir a saudação conforme o horário
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = "Bom dia,";
    if (hour >= 12 && hour < 18) greeting = "Boa tarde,";
    else if (hour >= 18) greeting = "Boa noite,";
    
    document.querySelector(".greeting").textContent = greeting;
}

// Função para formatar valores com 2 casas decimais
function formatCurrency(value) {
    return parseFloat(value).toFixed(2).replace(".", ",");
}

// Função para definir e armazenar os valores originais das moedas
function setCurrencyValue(selector, value, index = 0, isBrigthCoin = false) {
    const elements = document.querySelectorAll(selector);
    if (elements[index]) {
        elements[index].dataset.value = value; // Armazena o valor original
        elements[index].textContent = value;
    } else if (isBrigthCoin) {
        // Se BrigthCoins não existir no HTML, cria o elemento
        const newElement = document.createElement("span");
        newElement.classList.add("currency-value");
        newElement.dataset.value = value;
        newElement.textContent = value;

        // Adiciona no local correto (ajuste conforme a estrutura do HTML)
        document.querySelector(".currencies").appendChild(newElement);
    }
}

// Função para adicionar eventos de clique nos botões
function setupEventListeners(hasBrigthCoins) {
    // Botão de censura de saldo
    const viewToggle = document.querySelector('img[alt="View"]');
    if (viewToggle) {
        let isHidden = false;
        viewToggle.addEventListener("click", () => {
            const currencyElements = document.querySelectorAll(".currency-value");
            isHidden = !isHidden;

            currencyElements.forEach((el, index) => {
                if (index === 2 && !hasBrigthCoins) return; // Se não tem BrigthCoins, ignora o terceiro item
                el.textContent = isHidden ? "***" : el.dataset.value;
            });

            viewToggle.src = isHidden ? "/img/hide2.png" : "/img/view2.png";
        });
    }

    // Redirecionamento de páginas ao clicar nas DIVs
    addRedirectEvent('.statement-title', 'extracts.html'); // Extratos

    addRedirectEvent('.transfer-option:nth-child(1)', 'payment.html'); // Transfer Now
    addRedirectEvent('.transfer-option:nth-child(3)', 'helpPayment.html'); // Payment Help
    addRedirectEvent('.transfer-option:nth-child(5)', 'receive.html'); // Receive Payment

    addRedirectEvent('.action-box:nth-child(1)', 'pay.html'); // Pay
    addRedirectEvent('.action-box:nth-child(2)', 'user.html'); // Database
    addRedirectEvent('.action-box:nth-child(3)', 'info.html'); // Information
    addRedirectEvent('.action-box:nth-child(4)', 'more.html'); // More

    // Botão de ajuda
    const helpButton = document.querySelector('img[alt="Help"]');
    if (helpButton) {
        helpButton.addEventListener("click", () => {
            window.location.href = "help.html";
        });
    }

    // Botão de perfil do usuário
    const userButton = document.querySelector('img[alt="Face"]');
    if (userButton) {
        userButton.addEventListener("click", () => {
            window.location.href = "user.html";
        });
    }

    // Evento para verificar transferência ao clicar no botão "Send"
    const sendButton = document.querySelector('.send-button img[alt="Send"]');
    if (sendButton) {
        sendButton.addEventListener("click", async () => {
            const input = document.querySelector(".transfer-input-group input");
            const transferId = input.value.trim();

            if (!transferId) return; // Se estiver vazio, não faz nada

            try {
                const response = await fetch(`/database/${transferId}.json`);
                if (!response.ok) return; // Se não existir, não faz nada

                sessionStorage.setItem("transferId", transferId); // Armazena temporariamente
                window.location.href = "transfer.html"; // Redireciona
            } catch (error) {
                console.error("Erro ao verificar transferência:", error);
            }
        });
    }
}

// Função para adicionar eventos de clique nos elementos de navegação
function addRedirectEvent(selector, url) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.cursor = "pointer";
        element.addEventListener("click", () => {
            window.location.href = url;
        });
    }
}