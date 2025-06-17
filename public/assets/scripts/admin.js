// public/assets/scripts/admin.js

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // ** Lógica de verificação de administrador adicionada aqui **
    if (!currentUser || !currentUser.isAdmin) {
        alert('Acesso negado. Você precisa ser um administrador para acessar esta página.');
        window.location.href = 'index.html'; // Redireciona para a página inicial
        return; // Sai da função para não executar o restante do script
    }
    // ** Fim da lógica de verificação de administrador **

    const API_URL = 'http://localhost:3000/receitas';
    const CATEGORIAS_URL = 'http://localhost:3000/categorias';
    const form = document.getElementById('form-receita');
    const listaReceitas = document.getElementById('lista-receitas');
    const btnExcluir = document.getElementById('btn-excluir');
    const btnLimpar = document.getElementById('btn-limpar');
    const btnAtualizar = document.getElementById('btn-atualizar');

    // Carrega categorias no select
    function carregarCategorias() {
        fetch(CATEGORIAS_URL)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao carregar categorias');
                return response.json();
            })
            .then(categorias => {
                const select = document.getElementById('categoria');
                const erroElement = document.getElementById('categoria-erro');
                
                // Limpa opções existentes (exceto a primeira)
                while (select.options.length > 1) {
                    select.remove(1);
                }
                
                // Adiciona novas opções
                if (categorias.length > 0) {
                    categorias.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.nome;
                        option.textContent = cat.nome;
                        select.appendChild(option);
                    });
                    erroElement.style.display = 'none'; // Esconde a mensagem de erro se houver categorias
                } else {
                    erroElement.style.display = 'block'; // Mostra a mensagem de erro se não houver categorias
                }
            })
            .catch(error => {
                console.error('Erro ao carregar categorias:', error);
                document.getElementById('categoria-erro').textContent = `Erro: ${error.message}. Por favor, verifique o JSON Server e o arquivo db.json.`;
                document.getElementById('categoria-erro').style.display = 'block';
            });
    }

    // Função para listar receitas
    async function listarReceitas() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            const receitas = await response.json();
            
            listaReceitas.innerHTML = ''; // Limpa a lista existente

            if (receitas.length === 0) {
                listaReceitas.innerHTML = '<p>Nenhuma receita cadastrada ainda.</p>';
                return;
            }

            receitas.forEach(receita => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <h3>${receita.titulo}</h3>
                    <p><strong>Ingredientes:</strong> ${receita.ingredientes}</p>
                    <p><strong>Modo de Preparo:</strong> ${receita.modoPreparo}</p>
                    ${receita.imagem ? `<img src="${receita.imagem}" alt="${receita.titulo}" width="100">` : ''}
                    <p><strong>Categoria:</strong> ${receita.categoria || 'N/A'}</p>
                    <button class="editar" data-id="${receita.id}">Editar</button>
                    <button class="excluir" data-id="${receita.id}">Excluir</button>
                `;
                listaReceitas.appendChild(li);
            });
        } catch (error) {
            console.error('Erro ao listar receitas:', error);
            listaReceitas.innerHTML = `<p style="color: red;">Erro ao carregar receitas: ${error.message}</p>`;
        }
    }

    // Event listener para o formulário de cadastro/edição
    receitaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const id = document.getElementById('receita-id').value;
        const titulo = document.getElementById('titulo').value;
        const ingredientes = document.getElementById('ingredientes').value;
        const modoPreparo = document.getElementById('modoPreparo').value;
        const imagem = document.getElementById('imagem').value;
        const categoria = document.getElementById('categoria').value;

        const receita = { titulo, ingredientes, modoPreparo, imagem, categoria };
        let url = API_URL;
        let metodo = 'POST';

        if (id) {
            url = `${API_URL}/${id}`;
            metodo = 'PUT';
        }

        const btnSalvar = form.querySelector('button[type="submit"]');
        const originalText = btnSalvar.innerHTML;
        btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        btnSalvar.disabled = true;

        fetch(url, {
            method: metodo,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(receita)
        })
        .then(response => {
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            return response.json();
        })
        .then(() => {
            alert(`Receita ${id ? 'atualizada' : 'cadastrada'} com sucesso!`);
            form.reset();
            btnExcluir.style.display = 'none';
            listarReceitas();
        })
        .catch(error => {
            console.error('Erro ao salvar:', error);
            alert(`Erro ao salvar receita: ${error.message}`);
        })
        .finally(() => {
            btnSalvar.innerHTML = originalText;
            btnSalvar.disabled = false;
        });
    });

    // Botão limpar
    btnLimpar.addEventListener('click', function() {
        form.reset();
        document.getElementById('receita-id').value = ''; // Garante que o ID oculto seja limpo
        btnExcluir.style.display = 'none';
    });

    // Event delegation para editar e excluir
    listaReceitas.addEventListener('click', async function(e) {
        if (e.target.classList.contains('editar')) {
            const id = e.target.dataset.id;
            try {
                const response = await fetch(`${API_URL}/${id}`);
                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                const receita = await response.json();
                
                document.getElementById('receita-id').value = receita.id;
                document.getElementById('titulo').value = receita.titulo;
                document.getElementById('ingredientes').value = receita.ingredientes;
                document.getElementById('modoPreparo').value = receita.modoPreparo;
                document.getElementById('imagem').value = receita.imagem || ''; // Preenche o campo de imagem, se existir
                document.getElementById('categoria').value = receita.categoria || ''; // Preenche a categoria
                btnExcluir.style.display = 'inline-block'; // Mostra o botão de excluir
            } catch (error) {
                console.error('Erro ao buscar receita para edição:', error);
                alert(`Erro ao carregar receita para edição: ${error.message}`);
            }
        } else if (e.target.classList.contains('excluir')) {
            const id = e.target.dataset.id;
            if (confirm('Tem certeza que deseja excluir esta receita?')) {
                try {
                    const response = await fetch(`${API_URL}/${id}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                    alert('Receita excluída com sucesso!');
                    form.reset();
                    document.getElementById('receita-id').value = '';
                    btnExcluir.style.display = 'none';
                    listarReceitas();
                } catch (error) {
                    console.error('Erro ao excluir receita:', error);
                    alert(`Erro ao excluir receita: ${error.message}`);
                }
            }
        }
    });

    // Botão atualizar (se for para recarregar a lista manualmente)
    btnAtualizar.addEventListener('click', function(e) {
        e.preventDefault();
        listarReceitas();
    });

    // Carrega receitas e categorias ao iniciar
    carregarCategorias();
    listarReceitas();
});