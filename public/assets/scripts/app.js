document.addEventListener('DOMContentLoaded', function() {
    // URL base da API JSONServer
    const API_URL = 'http://localhost:3000/receitas';
 
    
    // FUNÇÃO: Monta os cards na home (index.html)
    const cardsContainer = document.getElementById('cards-container');
    if (cardsContainer) {
        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar receitas');
                }
                return response.json();
            })
            .then(dados => {
                dados.forEach(item => {
                    // Cria link para a página de detalhes
                    const cardLink = document.createElement('a');
                    cardLink.href = `detalhes.html?id=${item.id}`;
                    cardLink.className = "card-link";

                    const card = document.createElement('div');
                    card.className = "card";

                    // Corrige o caminho da imagem para relativo
                    const imagemPath = item.imagem.startsWith('assets/') ? item.imagem : `assets/${item.imagem}`;
                    
                    card.innerHTML = `
                        <img src="${imagemPath}" alt="${item.titulo}" class="card-img">
                        <div class="card-body">
                            <h2 class="card-title">${item.titulo}</h2>
                            <p class="card-description">${item.descricao}</p>
                        </div>
                    `;

                    cardLink.appendChild(card);
                    cardsContainer.appendChild(cardLink);
                });
            })
            .catch(error => {
                console.error('Erro:', error);
                cardsContainer.innerHTML = `
                    <p class="error-message">
                        Não foi possível carregar as receitas. 
                        <br>Erro: ${error.message}
                        <br>Verifique: ${API_URL}
                    </p>`;
            });
    }

    // FUNÇÃO: Exibe os detalhes da receita (detalhes.html)
    const detalhesContainer = document.getElementById('detalhes-receita');
    if (detalhesContainer) {
        // Função para obter o ID da URL
        function getQueryParam(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        }

        const receitaId = getQueryParam('id');
        console.log('ID recebido:', receitaId); // Debug
        
        if (receitaId) {
            // Método 1: Busca direta por ID 
            fetch(`${API_URL}/${receitaId}`)
                .then(response => {
                    if (!response.ok) {
                        // Se falhar, tenta o Método 2 como fallback
                        console.warn('Falha no método direto, tentando alternativa...');
                        return fetch(API_URL)
                            .then(res => res.json())
                            .then(receitas => {
                                const receita = receitas.find(r => r.id == receitaId);
                                return receita || Promise.reject('Receita não encontrada');
                            });
                    }
                    return response.json();
                })
                .then(receita => {
                    console.log('Receita encontrada:', receita); // Debug
                    
                    // Corrige o caminho da imagem para relativo
                    const imagemPath = receita.imagem.startsWith('assets/') ? receita.imagem : `assets/${receita.imagem}`;
                    
                    detalhesContainer.innerHTML = `
                        <h1>${receita.titulo}</h1>
                        <img src="${imagemPath}" alt="${receita.titulo}" class="detalhe-img">
                        <p><strong>Categoria:</strong> ${receita.categoria}</p>
                        <p><strong>Autor:</strong> ${receita.autor}</p>
                        <p><strong>Data:</strong> ${receita.data}</p>
                        <div class="receita-conteudo">
                            <p>${receita.conteudo}</p>
                        </div>
                        <a href="index.html" class="btn-voltar">← Voltar</a>
                    `;
                })
                .catch(error => {
                    console.error('Erro completo:', error);
                    detalhesContainer.innerHTML = `
                        <div class="error-message">
                            <h2>Erro ao carregar receita</h2>
                            <p>${error.message || 'Receita não encontrada'}</p>
                            <p>ID pesquisado: ${receitaId}</p>
                            <p>Endpoint: ${API_URL}/${receitaId}</p>
                            <a href="index.html" class="btn-voltar">← Voltar para home</a>
                        </div>
                    `;
                });
        } else {
            detalhesContainer.innerHTML = `
                <div class="error-message">
                    <h2>ID não especificado</h2>
                    <p>Nenhum ID de receita foi fornecido na URL.</p>
                    <p>Exemplo correto: detalhes.html?id=1</p>
                    <a href="index.html" class="btn-voltar">← Voltar para home</a>
                </div>
            `;
        }
    }
});