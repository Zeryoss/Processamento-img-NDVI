(function(){
    'use strict';

    // Theme Control
    const themeSwitch = document.getElementById('theme-switch');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeSwitch.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeSwitch.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Form Elements
    const inputArquivo = document.getElementById('Selecao-arquivo');
    const botaoAnalisar = document.getElementById('botao-analisar');
    const areaResultado = document.getElementById('area-resultado');
    const imagemProcessada = document.getElementById('imagem-processada');
    const imagemPlaceholder = document.querySelector('.image-placeholder');
    const uploadForm = document.getElementById('upload-form');

    // Utility
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    function setAnalyzingState(isAnalyzing){
        if (botaoAnalisar) {
            botaoAnalisar.disabled = isAnalyzing;
            botaoAnalisar.setAttribute('aria-disabled', String(isAnalyzing));
        }
    }

    if (inputArquivo) {
        inputArquivo.addEventListener('change', function(){
            const file = this.files && this.files[0];
            if (file) {
                if (botaoAnalisar) botaoAnalisar.disabled = false;
                if (areaResultado) {
                    // Resetar área de resultado mas mantê-la visível
                    areaResultado.innerHTML = `
                        <h3><i class="fas fa-chart-pie" aria-hidden="true"></i> <span>Resultados</span></h3>
                        <div class="results-placeholder">
                            <i class="fas fa-arrow-right"></i>
                            <p>Clique em "Analisar Imagem" para processar</p>
                        </div>
                    `;
                }
            } else {
                if (botaoAnalisar) botaoAnalisar.disabled = true;
            }
        });
    }

    if (uploadForm) {
        // prevent default form submission and allow Enter key to work properly
        uploadForm.addEventListener('submit', (e) => e.preventDefault());
    }

    if (botaoAnalisar) {
        botaoAnalisar.addEventListener('click', async function() {
            const file = inputArquivo && inputArquivo.files && inputArquivo.files[0];
            if (!file) {
                alert('Por favor, selecione um arquivo TIFF antes de analisar.');
                return;
            }

            // show loading state
            if (areaResultado) {
                areaResultado.innerHTML = `
                    <h3><i class="fas fa-chart-pie" aria-hidden="true"></i> <span>Resultados</span></h3>
                    <div class="progress-wrapper">
                        <div class="analysis-status">
                            <p class="loading"><i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Analisando imagem...</p>
                            <div class="progress-bar" aria-hidden="true"><div class="progress" style="width:0%"></div></div>
                        </div>
                    </div>
                `;
            }

            setAnalyzingState(true);

            const progressEl = areaResultado && areaResultado.querySelector('.progress');
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 90) { clearInterval(interval); }
                else { width += 0.6; if (progressEl) progressEl.style.width = width + '%'; }
            }, 40);

            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 120000); // 2min

                const formData = new FormData();
                formData.append('imagem', file);

                const resp = await fetch('/analisar', { method: 'POST', body: formData, signal: controller.signal });
                clearTimeout(timeout);

                if (!resp.ok) {
                    throw new Error(`Servidor respondeu com status ${resp.status}`);
                }

                const data = await resp.json();

                // small delay to make progress feel smooth
                await sleep(300);

                // Adaptar: backend retorna resultado direto ou envelopado em data.resultado
                const res = data.resultado || data;

                if (res.erro) {
                    if (areaResultado) areaResultado.innerHTML = `<h3>Erro na Análise</h3><p class="erro">${res.erro}</p>`;
                } else if (res.agua !== undefined) {
                    // Exibir imagem colorida processada
                    if (imagemProcessada && res.imagem) {
                        imagemProcessada.src = `data:image/png;base64,${res.imagem}`;
                        imagemProcessada.style.display = 'block';
                        if (imagemPlaceholder) imagemPlaceholder.style.display = 'none';
                    }

                    if (areaResultado) {
                        areaResultado.innerHTML = `
                            <h3><i class="fas fa-chart-pie" aria-hidden="true"></i> <span>Resultados</span></h3>
                            <div class="results-grid">
                                <div class="result-item">
                                    <i class="fas fa-water" aria-hidden="true"></i>
                                    <div class="result-info">
                                        <span class="result-label">Água</span>
                                        <span class="result-value" style="color: var(--color-agua);">${res.agua}%</span>
                                    </div>
                                    <div class="result-bar" style="background: var(--color-agua); width: ${res.agua}%"></div>
                                </div>
                                <div class="result-item">
                                    <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                                    <div class="result-info">
                                        <span class="result-label">Solo Exposto</span>
                                        <span class="result-value" style="color: var(--color-solo);">${res.desmatado}%</span>
                                    </div>
                                    <div class="result-bar" style="background: var(--color-solo); width: ${res.desmatado}%"></div>
                                </div>
                                <div class="result-item">
                                    <i class="fas fa-seedling" aria-hidden="true"></i>
                                    <div class="result-info">
                                        <span class="result-label">Vegetação Moderada</span>
                                        <span class="result-value" style="color: var(--color-moderada);">${res.vegetacaoM}%</span>
                                    </div>
                                    <div class="result-bar" style="background: var(--color-moderada); width: ${res.vegetacaoM}%"></div>
                                </div>
                                <div class="result-item">
                                    <i class="fas fa-tree" aria-hidden="true"></i>
                                    <div class="result-info">
                                        <span class="result-label">Vegetação Densa</span>
                                        <span class="result-value" style="color: var(--color-densa);">${res.vegetacaoD}%</span>
                                    </div>
                                    <div class="result-bar" style="background: var(--color-densa); width: ${res.vegetacaoD}%"></div>
                                </div>
                            </div>
                        `;
                    }
                    // Carrega histórico se disponível
                    if (typeof carregarHistorico === 'function') {
                        try {
                            await carregarHistorico();
                        } catch (e) {
                            console.warn('Histórico não disponível:', e);
                        }
                    }
                } else {
                    if (areaResultado) areaResultado.innerHTML = `<h3>Erro</h3><p class="erro">Resposta inesperada do servidor</p>`;
                }
            } catch (error) {
                console.error('Erro na análise:', error);
                if (areaResultado) areaResultado.innerHTML = `<h3>Erro</h3><p class="erro">Falha ao conectar com o servidor ou processar a imagem. Verifique o console.</p>`;
            } finally {
                clearInterval(interval);
                if (progressEl) progressEl.style.width = '100%';
                setAnalyzingState(false);
            }
        });
    }

    // Histórico
    async function carregarHistorico(){
        try {
            const resp = await fetch('/historico');
            if (!resp.ok) {
                console.warn('Endpoint /historico não disponível - histórico desabilitado');
                return;
            }
            const dados = await resp.json();

            const totalEl = document.getElementById('total-analises');
            const mediaDesmatEl = document.getElementById('media-desmatamento');
            const mediaVegEl = document.getElementById('media-vegetacao');
            const listaEl = document.getElementById('analises-anteriores');

            if (!dados || dados.length === 0) {
                if (totalEl) totalEl.textContent = '0';
                if (mediaDesmatEl) mediaDesmatEl.textContent = '0%';
                if (mediaVegEl) mediaVegEl.textContent = '0%';
                if (listaEl) {
                    listaEl.setAttribute('data-count', '0');
                    listaEl.innerHTML = `<div class="no-data"><i class="fas fa-inbox"></i><p>Nenhuma análise realizada ainda.</p></div>`;
                }
                return;
            }

            if (totalEl) totalEl.textContent = String(dados.length);

            let somaDesm = 0, somaVeg = 0;
            // Pegar apenas os 5 itens mais recentes
            const recentData = dados.slice(-5).reverse();
            const itens = recentData.map(r => {
                const res = r.resultado || {};
                if (res.desmatado !== undefined) somaDesm += Number(res.desmatado) || 0;
                if (res.vegetacaoD !== undefined) somaVeg += Number(res.vegetacaoD) || 0;
                
                return `
                    <div class="result-item">
                        <i class="fas fa-file-alt"></i>
                        <div class="result-info">
                            <div class="file-info">
                                <strong>${r.original_filename}</strong>
                                <span class="date">${new Date(r.timestamp).toLocaleString()}</span>
                            </div>
                            <div class="mini-stats">
                                <span><i class="fas fa-water"></i> ${res.agua ?? '-'}%</span>
                                <span><i class="fas fa-exclamation-triangle"></i> ${res.desmatado ?? '-'}%</span>
                                <span><i class="fas fa-tree"></i> ${res.vegetacaoD ?? '-'}%</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            const numAnalises = dados.length;
            if (mediaDesmatEl) mediaDesmatEl.textContent = (numAnalises ? (somaDesm / numAnalises).toFixed(2) + '%' : '0%');
            if (mediaVegEl) mediaVegEl.textContent = (numAnalises ? (somaVeg / numAnalises).toFixed(2) + '%' : '0%');

            if (listaEl) {
                listaEl.setAttribute('data-count', String(Math.min(5, dados.length)));
                listaEl.innerHTML = `
                    <h3>Histórico de Análises</h3>
                    <div class="results-grid">
                        ${itens.join('')}
                    </div>
                `;
            }

        } catch (err) {
            console.warn('Histórico não disponível (endpoint /historico não existe):', err.message);
        }
    }

    const menuToggle = document.getElementById("menu-toggle");
    const menuLinks = document.querySelectorAll(".menu-button");

    document.addEventListener("click", (e) => {
        const menu = document.querySelector(".menu-container");
        if (!menu.contains(e.target)) {
            menuToggle.checked = false; // fecha ao clicar fora
        }
    });

    menuLinks.forEach(link => {
        link.addEventListener("click", () => {
            menuToggle.checked = false; // fecha ao clicar em uma opção
        });
    });

    // load historico on start
    window.addEventListener('load', () => carregarHistorico());

})();
