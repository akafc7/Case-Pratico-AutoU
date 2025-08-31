# 🤖 EmailClassifier AI - Sistema Inteligente de Classificação de Emails

## 📋 Visão Geral
Sistema web moderno que utiliza **Google Gemini AI** para classificação automática de emails e geração de respostas inteligentes, com fallback robusto usando NLP (NLTK). Desenvolvido com Flask, Tailwind CSS e JavaScript vanilla para máxima performance e responsividade.

## ⚡ Funcionalidades Principais

### 🎯 Classificação Automática com IA
- **Produtivo**: Emails de trabalho, projetos e negócios
- **Improdutivo**: Emails pessoais, spam ou irrelevantes  
- **Engine**: Google Gemini 2.0 Flash + NLTK NLP
- **Confiança**: Score de precisão em tempo real

### 🤖 Geração de Respostas Inteligentes
- **Respostas contextuais**: Análise do conteúdo para gerar respostas apropriadas
- **Diferentes cenários**: Urgência, reuniões, projetos, propostas
- **Fallback inteligente**: Sistema NLP quando Gemini não está disponível
- **Edição inline**: Permite editar respostas diretamente na interface

### 📁 Input Flexível
- **Texto direto**: Cole o email na interface
- **Upload de arquivos**: Suporte para .txt e .pdf
- **Drag & Drop**: Arraste arquivos diretamente
- **Contador de caracteres**: Feedback visual em tempo real

### 📊 Analytics & Estatísticas
- **Contador persistente**: Total de emails processados
- **Tempo de processamento**: Medição precisa em tempo real
- **Animações visuais**: Feedback imediato das operações
- **Histórico**: Dados salvos no localStorage

## 🛠️ Stack Tecnológica

### Backend
- **Framework**: Flask 2.3.3
- **IA Engine**: Google Generative AI (Gemini 2.0 Flash)
- **NLP Fallback**: NLTK 3.8+ (português)
- **Processamento**: PyPDF2 para PDFs, Unidecode para normalização
- **Segurança**: Werkzeug para uploads seguros

### Frontend
- **Styling**: Tailwind CSS (via CDN)
- **JavaScript**: ES6+ Vanilla (sem frameworks)
- **Responsividade**: Mobile-first design
- **UI/UX**: Font Awesome icons, Inter font
- **Temas**: Dark/Light mode com persistência

### Dependências (requirements.txt)
```bash
# IA & NLP
google-generativeai>=0.3.0
nltk>=3.8.0

# Web Framework  
Flask==2.3.3
Werkzeug==2.3.7

# Utilitários
requests>=2.31.0
python-dotenv>=1.0.0
PyPDF2==3.0.1
unidecode>=1.3.0

# Científicos
numpy>=1.24.0
scikit-learn>=1.3.0
```

## 🏗️ Estrutura do Projeto

```
Case-Pratico/
├── app.py                      # Flask app principal
├── config.py                   # Configurações da aplicação
├── requirements.txt            # Dependências Python
├── .env                       # Variáveis de ambiente (API keys)
├── templates/
│   └── index.html             # Interface principal (Tailwind CSS)
├── static/
│   ├── js/
│   │   └── main.js           # JavaScript frontend
│   ├── favicon.svg           # Favicon da aplicação
│   └── uploads/              # Upload temporário de arquivos
├── models/
│   ├── __init__.py
│   ├── Classifier.py         # Google Gemini AI + NLP fallback
│   ├── NLPProcessor.py       # Processamento NLP (NLTK)
│   └── EmailManager.py       # Gerenciamento de arquivos
└── examples/
    ├── email_produtivo.txt   # Exemplo de email produtivo
    └── email_improdutivo.txt # Exemplo de email improdutivo
```

## 🚀 Como Executar

### 1. **Pré-requisitos**
```bash
# Python 3.8+
python --version

# Git (para clonar)
git --version
```

### 2. **Clone o Repositório**
```bash
git clone https://github.com/usuario/Case-Pratico-AutoU.git
cd Case-Pratico-AutoU
```

### 3. **Configuração do Ambiente**
```bash
# Crie um ambiente virtual (recomendado)
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 4. **Instale as Dependências**
```bash
pip install -r requirements.txt
```

### 5. **Configure a API do Google Gemini**
```bash
# Crie um arquivo .env na raiz do projeto
touch .env

# Adicione sua chave da API do Google Gemini
# Obtenha em: https://makersuite.google.com/app/apikey
echo "GEMINI_API_KEY=sua-chave-aqui" > .env
```

### 6. **Execute a Aplicação**
```bash
python app.py
```

### 7. **Acesse o Sistema**
```
🌐 URL: http://localhost:5000
🔧 Debug: Ativado por padrão
📱 Interface: Totalmente responsiva
```

## 🔗 API Endpoints

### **GET /** 
**Página Principal**
- **Descrição**: Renderiza a interface principal
- **Response**: HTML template
- **Exemplo**: `http://localhost:5000/`

### **POST /analyze**
**Análise de Email**
- **Descrição**: Processa email e retorna classificação + resposta sugerida
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
  ```json
  {
    "email_text": "string (opcional)" // Texto direto do email
    // OU
    "file": "file (opcional)"          // Arquivo .txt ou .pdf
  }
  ```
- **Response Success** (200):
  ```json
  {
    "success": true,
    "classificacao": "produtivo|improdutivo",
    "confianca": 0.85,
    "metodo": "Gemini + NLP",
    "resposta_sugerida": "Texto da resposta gerada pela IA",
    "justificativa": "Explicação do resultado",
    "nlp_insights": {
      "business_score": 3,
      "personal_score": 0
    },
    "provider_used": "gemini"
  }
  ```
- **Response Error** (400/500):
  ```json
  {
    "success": false,
    "error": "Mensagem de erro"
  }
  ```

### **GET /health**
**Health Check**
- **Descrição**: Verifica status do sistema Gemini + NLP
- **Response**: 
  ```json
  {
    "status": "healthy|degraded|error",
    "provider": "Gemini AI|NLP Only|None",
    "nlp_available": true,
    "message": "Status description"
  }
  ```

## 🎨 Interface e Recursos

### **Design System**
- **Cores primárias**: Blue (#2563eb), Green (#10b981), Orange (#f59e0b)
- **Typography**: Inter font family
- **Grid system**: CSS Grid + Flexbox responsivo
- **Dark mode**: Toggle persistente com localStorage

### **Recursos Visuais**
- **Toast notifications**: Feedback visual das operações
- **Loading states**: Spinner durante processamento
- **Animações**: Smooth transitions e hover effects  
- **Responsividade**: Mobile, tablet e desktop otimizados

### **Funcionalidades UX**
- **Drag & drop**: Upload intuitivo de arquivos
- **Edição inline**: Modificar respostas diretamente
- **Contador de caracteres**: Feedback visual no textarea
- **Contador de emails**: Estatísticas persistentes
- **Reset options**: Limpeza de dados quando necessário

## 🧠 Como Funciona a IA

### **Fluxo Principal**
1. **Input**: Email via texto ou arquivo
2. **Pré-processamento**: Limpeza e normalização do texto
3. **Análise Gemini**: Classificação e geração de resposta via API
4. **Fallback NLP**: Se Gemini falhar, usa NLTK para classificar
5. **Resposta contextual**: Baseada no tipo e conteúdo do email
6. **Output**: Classificação + resposta + insights

### **Tipos de Resposta por Contexto**
- **Urgente/Problema**: "Vou analisar imediatamente e retorno com solução..."
- **Reunião/Meeting**: "Vou verificar agenda e confirmo participação..."
- **Projeto/Proposta**: "Vou analisar os detalhes e retorno com feedback..."
- **Genérico**: "Obrigado por entrar em contato. Recebi sua mensagem..."
- **Improdutivo**: "No momento estou focado em questões profissionais..."

## 🚨 Troubleshooting

### **Problemas Comuns**
```bash
# Erro de API Key
Error: GEMINI_API_KEY não encontrada
# Solução: Configure a chave no arquivo .env

# Erro de dependências NLTK
NLTK data not found
# Solução: Os recursos são baixados automaticamente na primeira execução

# Erro de upload
File not allowed
# Solução: Apenas arquivos .txt e .pdf são suportados
```

### **Logs de Debug**
```bash
# Ativar logs detalhados
export FLASK_DEBUG=1
python app.py

# Ver logs da IA
# Os logs aparecem no terminal durante execução
```

## 📊 Performance

- **Tempo médio de análise**: ~2-3 segundos
- **Suporte a arquivos**: até 10MB
- **Concurrent users**: Suporte básico (single thread)
- **Gemini API**: Rate limits conforme Google Cloud

## 🔐 Segurança

- **Upload seguro**: Validação de tipos de arquivo
- **API keys**: Armazenadas em variáveis de ambiente
- **Sanitização**: Inputs limpos antes do processamento
- **HTTPS ready**: Configurável para produção

## 📝 Exemplos de Uso

### **Email Produtivo**
```
Assunto: Problema crítico no sistema de pagamentos

Olá,

Identificamos um problema crítico no sistema de pagamentos que está 
afetando as transações dos clientes. Precisamos de uma solução urgente.

Por favor, analise e retorne o mais breve possível.

Obrigado.
```

**Resultado**: `Produtivo (85% confiança) + Resposta contextual de urgência`

### **Email Improdutivo**
```
Oi pessoal!

Alguém quer ir ao cinema hoje? Tem um filme novo que quero muito assistir!

Respondam quando puderem :)
```

**Resultado**: `Improdutivo (92% confiança) + Resposta educada de recusa`

## 🎯 Autor
- Fernando Cavanellas
**Sistema desenvolvido para demonstração de competências em:**
- Integração com APIs de IA modernas (Google Gemini)
- Desenvolvimento web full-stack (Flask + JavaScript)
- Processamento de linguagem natural (NLP)
- Interface responsiva e moderna (Tailwind CSS)
- Arquitetura robusta com fallbacks inteligentes
