document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');

    const API_URL = 'http://localhost:3000'; // Altere se seu JSON Server estiver em outra porta

    // Função para mostrar mensagens de erro/sucesso
    function showMessage(element, message, isError = true) {
        let p = element.querySelector('.message');
        if (!p) {
            p = document.createElement('p');
            p.classList.add('message');
            element.appendChild(p);
        }
        p.textContent = message;
        p.style.color = isError ? 'red' : 'green';
    }

    // Lógica para alternar entre login e cadastro
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
    });

    // Lógica de Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/usuarios?username=${username}&password=${password}`);
            const users = await response.json();

            if (users.length > 0) {
                const user = users[0];
                localStorage.setItem('currentUser', JSON.stringify(user)); // Armazena as informações do usuário
                showMessage(loginForm, 'Login bem-sucedido!', false);
                // Redireciona para a página inicial ou painel de acordo com o isAdmin
                if (user.isAdmin) {
                    window.location.href = 'admin.html'; // Redireciona para o painel de admin
                } else {
                    window.location.href = 'index.html'; // Redireciona para a página principal
                }
            } else {
                showMessage(loginForm, 'Usuário ou senha inválidos.');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            showMessage(loginForm, 'Erro ao tentar fazer login. Tente novamente mais tarde.');
        }
    });

    // Lógica de Cadastro
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        try {
            // Verifica se o usuário já existe
            const checkUserResponse = await fetch(`${API_URL}/usuarios?username=${username}`);
            const existingUsers = await checkUserResponse.json();

            if (existingUsers.length > 0) {
                showMessage(registerForm, 'Usuário já existe. Por favor, escolha outro nome de usuário.');
                return;
            }

            // Cadastra o novo usuário
            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, isAdmin: false }) // Novos usuários não são admin por padrão
            });

            if (response.ok) {
                showMessage(registerForm, 'Cadastro realizado com sucesso! Agora você pode fazer login.', false);
                // Opcional: redirecionar para a página de login após o cadastro
                setTimeout(() => {
                    registerSection.style.display = 'none';
                    loginSection.style.display = 'block';
                    document.getElementById('login-username').value = username; // Preenche o campo de usuário
                }, 2000);
            } else {
                showMessage(registerForm, 'Erro ao cadastrar. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            showMessage(registerForm, 'Erro ao tentar cadastrar. Tente novamente mais tarde.');
        }
    });
});