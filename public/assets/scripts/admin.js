document.addEventListener('DOMContentLoaded', function() {
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
                    erroElement.style.display = 'none';
                } else {
                    select.innerHTML = '<option value="">Nenhuma categoria encontrada</option>';
                    erroElement.textContent = 'Adicione categorias no db.json';
                    erroElement.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Erro ao carregar categorias:', error);
                const erroElement = document.getElementById('categoria-erro');
                erroElement.textContent = 'Erro ao carregar categorias. Verifique o console.';
                erroElement.style.display = 'block';
            });
    }

    // Lista todas as receitas
    function listarReceitas() {
        fetch(API_URL)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao carregar receitas');
                return response.json();
            })
            .then(receitas => {
                listaReceitas.innerHTML = '';
                
                if (receitas.length === 0) {
                    listaReceitas.innerHTML = '<p class="sem-receitas">Nenhuma receita cadastrada.</p>';
                    return;
                }
                
                receitas.forEach(receita => {
                    const card = document.createElement('div');
                    card.className = 'receita-card';
                    card.innerHTML = `
                        <div class="card-content">
                            <h3>${receita.titulo}</h3>
                            <p>${receita.descricao.substring(0, 100)}...</p>
                            <div class="card-actions">
                                <button onclick="editarReceita(${receita.id})" class="btn">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                            </div>
                        </div>
                    `;
                    listaReceitas.appendChild(card);
                });
            })
            .catch(error => {
                console.error('Erro:', error);
                listaReceitas.innerHTML = `
                    <div class="error-message">
                        <p>Não foi possível carregar as receitas.</p>
                        <p>${error.message}</p>
                    </div>
                `;
            });
    }

    // Editar receita existente
    window.editarReceita = function(id) {
        fetch(`${API_URL}/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Receita não encontrada');
                return response.json();
            })
            .then(receita => {
                // Preenche o formulário
                document.getElementById('receita-id').value = receita.id;
                document.getElementById('titulo').value = receita.titulo;
                document.getElementById('descricao').value = receita.descricao;
                document.getElementById('conteudo').value = receita.conteudo;
                document.getElementById('imagem').value = receita.imagem;
                
                // Define a categoria no select
                const select = document.getElementById('categoria');
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].value === receita.categoria) {
                        select.selectedIndex = i;
                        break;
                    }
                }
                
                // Mostra o botão de excluir
                btnExcluir.style.display = 'inline-flex';
                btnExcluir.onclick = () => excluirReceita(id);
                
                // Rola até o formulário
                document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Erro ao editar receita:', error);
                alert(`Erro ao carregar receita: ${error.message}`);
            });
    }

    // Excluir receita
    function excluirReceita(id) {
        if (confirm('Tem certeza que deseja excluir esta receita permanentemente?')) {
            fetch(`${API_URL}/${id}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) throw new Error('Erro ao excluir receita');
                    return response.json();
                })
                .then(() => {
                    alert('Receita excluída com sucesso!');
                    form.reset();
                    btnExcluir.style.display = 'none';
                    listarReceitas();
                })
                .catch(error => {
                    console.error('Erro ao excluir:', error);
                    alert(`Erro ao excluir receita: ${error.message}`);
                });
        }
    }

    // Salvar receita (CREATE ou UPDATE)
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('receita-id').value;
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        const receita = {
            titulo: document.getElementById('titulo').value,
            descricao: document.getElementById('descricao').value,
            conteudo: document.getElementById('conteudo').value,
            categoria: document.getElementById('categoria').value,
            imagem: document.getElementById('imagem').value || 'assets/img/default.jpg',
            autor: "Administrador",
            data: new Date().toISOString().split('T')[0]
        };

        // Validação simples
        if (!receita.categoria) {
            alert('Selecione uma categoria!');
            return;
        }

        // Mostra loading
        const btnSalvar = form.querySelector('.btn-salvar');
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
        btnExcluir.style.display = 'none';
    });

    // Botão atualizar
    btnAtualizar.addEventListener('click', function(e) {
        e.preventDefault();
        listarReceitas();
        carregarCategorias();
    });

    // Inicialização
    carregarCategorias();
    listarReceitas();
});