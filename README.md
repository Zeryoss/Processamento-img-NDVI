#  APS I.A. Filter

##  Sobre o Projeto

**APS I.A. Filter** é uma aplicação web para **análise de imagens de satélite TIFF (NDVI)** com objetivo de identificar e classificar áreas de:

-  **Água** - Corpos hídricos
-  **Solo Exposto** - Áreas desmatadas e sem vegetação
-  **Vegetação Moderada** - Cobertura vegetal parcial
-  **Vegetação Densa** - Floresta e áreas densamente vegetadas

A aplicação processa imagens TIFF, aplica análise NDVI (Normalized Difference Vegetation Index) e exibe:
-  **Percentuais de cobertura** de cada categoria
-  **Mapa colorido** classificando cada pixel da imagem
-  **Histórico** de todas as análises realizadas

##  Arquitetura

### Frontend
- **HTML5** - Estrutura semântica e acessível
- **CSS3** - Design responsivo com suporte a tema claro/escuro
- **JavaScript Vanilla** - Sem dependências externas

### Backend
- **Python 3.13** - Runtime
- **Flask** - Servidor web e API REST
- **Rasterio** - Leitura de imagens GeoTIFF
- **NumPy** - Processamento numérico
- **Matplotlib** - Geração de mapas coloridos

##  Quick Start

### Pré-requisitos
- Python 3.8+
- Navegador moderno (Chrome, Firefox, Edge, Safari)

### Instalação e Execução

1. **Clone o repositório:**
   `ash
   git clone https://github.com/Attashiie/APS_I.A_FILTER.git
   cd APS_I.A_FILTER
   `

2. **Crie um ambiente virtual (opcional mas recomendado):**
   `ash
   # Windows PowerShell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   
   # Linux/Mac
   python3 -m venv .venv
   source .venv/bin/activate
   `

3. **Instale as dependências:**
   `ash
   pip install -r requirements.txt
   `

4. **Inicie o servidor:**
   `ash
   python app.py
   `

5. **Acesse a aplicação:**
   Abra seu navegador em: **http://127.0.0.1:5000**

##  Estrutura do Projeto

\\\
APS_I.A_FILTER/
 app.py                    # API Flask com endpoints
 processamento.py          # Análise NDVI e geração de mapas
 requirements.txt          # Dependências Python
 analises.json             # Histórico de análises
 static/
    index.html           # Frontend principal
    css/
       style.css        # Estilos consolidados
       theme.js         # Gerenciador de tema
    js/
       app.js           # Lógica da aplicação
    images/              # Ícones e imagens
    pages/               # Páginas adicionais
 uploads/                 # Imagens TIFF enviadas
 README.md               # Este arquivo
\\\

##  API Endpoints

### \GET /\
Retorna a página principal da aplicação.

### \POST /analisar\
Processa uma imagem TIFF e retorna análise.

### \GET /historico\
Retorna o histórico de todas as análises realizadas.

##  Recursos

-  **Interface Responsiva** - Funciona em desktop, tablet e mobile
-  **Tema Claro/Escuro** - Alternância de tema com persistência
-  **Upload de TIFF** - Suporte a imagens GeoTIFF com NDVI
-  **Visualização Colorida** - Mapa de cores classificado
-  **Análise Estatística** - Percentuais e gráficos
-  **Histórico Persistente** - Todas as análises em JSON
-  **Acessibilidade** - ARIA labels e navegação por teclado
-  **Zero Dependências Frontend** - Apenas Vanilla JS

##  Como Usar

1. **Selecione uma imagem TIFF:** Clique em "Selecionar Imagem"
2. **Analise:** Clique em "Analisar Imagem"
3. **Visualize resultados:** Veja a imagem colorida e percentuais

##  Atualizações Recentes

### v2.0 (Nov 2025)
-  Histórico funcional com persistência
-  Endpoint \/historico\
-  Interface responsiva (grid 2 colunas)
-  Imagem colorida processada
-  Tema claro/escuro
-  Areas de imagem e resultados com mesma altura (sem scroll)

##  Como Contribuir

1. Fork o repositório
2. Crie uma branch: \git checkout -b feature/minha-feature\
3. Commit: \git commit -m "feat: Descrição"\
4. Push: \git push origin feature/minha-feature\
5. Abra um Pull Request

##  Licença

MIT License - veja [LICENSE](LICENSE)

---

##  Créditos e Desenvolvedores

### Equipe Principal
- **Vitor Canuto Braga** (@Attashiie) - Desenvolvimento Full Stack
- **Vinicius Cordeiro de Almeida** (@Zeryoss) - Desenvolvimento Backend
- **Carlos Henrique** (@Carlosh007) - Desenvolvimento Frontend
- **Ronaldo** (@Ronaldozx) - Desenvolvimento Frontend

### Contribuidores
- Comunidade GitHub

### Tecnologias
- Flask, Rasterio, NumPy, Matplotlib, Font Awesome

### Instituição
- Projeto desenvolvido como **APS (Atividade Prática Supervisionada)**

---

**Versão:** 1.0  
**Data:** 12 de Novembro de 2025  
**Status:**  Concluido
