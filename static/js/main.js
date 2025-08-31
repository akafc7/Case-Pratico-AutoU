// Estado da aplicação
let currentResponse = '';
let processedCount = 0;

// Elementos DOM
const form = document.getElementById('classificationForm');
const emailTextArea = document.getElementById('email_text');
const fileInput = document.getElementById('file');
const submitBtn = document.getElementById('submitBtn');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    setupFormSubmission();
    setupFileUpload();
    setupTabSwitching();
    setupThemeToggle();
    setupCharacterCount();
    loadProcessedCount();
    switchTab('text');
});

// Sistema de Tabs
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });
}

function switchTab(tabName) {
    // Atualizar botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-white', 'dark:bg-gray-800', 'text-primary', 'shadow-sm');
        btn.classList.add('text-gray-600', 'dark:text-gray-400');
    });
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    activeBtn.classList.add('active', 'bg-white', 'dark:bg-gray-800', 'text-primary', 'shadow-sm');
    activeBtn.classList.remove('text-gray-600', 'dark:text-gray-400');
    
    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
}

// Upload de Arquivos
function setupFileUpload() {
    const fileDropZone = document.getElementById('fileDropZone');
    
    // Click para abrir seletor de arquivo
    fileDropZone?.addEventListener('click', () => fileInput.click());
    
    // Drag & Drop events
    fileDropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileDropZone.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
        fileDropZone.classList.remove('border-gray-300', 'dark:border-gray-600');
    });
    
    fileDropZone?.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileDropZone.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
        fileDropZone.classList.add('border-gray-300', 'dark:border-gray-600');
    });
    
    fileDropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Resetar aparência
        fileDropZone.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
        fileDropZone.classList.add('border-gray-300', 'dark:border-gray-600');
        
        // Obter arquivos
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            
            // Validar tipo de arquivo
            if (isValidFileType(file)) {
                // Atualizar o input file
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
                
                // Atualizar interface
                handleFileSelection(file);
                showToast('Arquivo carregado com sucesso!', 'success');
            } else {
                showToast('Tipo de arquivo inválido! Apenas arquivos .txt e .pdf são permitidos.', 'error');
            }
        }
    });
    
    // Mudança no input file
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Validar tipo de arquivo
            if (isValidFileType(file)) {
                handleFileSelection(file);
                showToast('Arquivo carregado com sucesso!', 'success');
            } else {
                // Limpar seleção de arquivo inválido
                fileInput.value = '';
                showToast('Tipo de arquivo inválido! Apenas arquivos .txt e .pdf são permitidos.', 'error');
            }
        }
    });
    
    // Botão para remover arquivo
    const removeFileBtn = document.getElementById('removeFile');
    removeFileBtn?.addEventListener('click', () => {
        removeSelectedFile();
    });
}

// Função para validar tipo de arquivo
function isValidFileType(file) {
    // Tipos MIME permitidos
    const allowedMimeTypes = ['text/plain', 'application/pdf'];
    
    // Extensões permitidas (como fallback)
    const allowedExtensions = ['.txt', '.pdf'];
    
    // Obter nome e extensão do arquivo
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

    // Verificar tipo MIME primeiro
    if (allowedMimeTypes.includes(file.type)) {
        console.log('Arquivo válido por MIME type');
        return true;
    }
    
    // Se o tipo MIME não for reconhecido, verificar extensão
    if (allowedExtensions.includes(fileExtension)) {
        console.log('Arquivo válido por extensão');
        return true;
    }
    return false;
}

function handleFileSelection(file) {
    document.querySelector('.file-name').textContent = file.name;
    document.getElementById('fileDropZone').classList.add('hidden');
    document.getElementById('fileInfo').classList.remove('hidden');
}

function removeSelectedFile() {
    fileInput.value = '';
    document.getElementById('fileDropZone').classList.remove('hidden');
    document.getElementById('fileInfo').classList.add('hidden');
    showToast('Arquivo removido', 'success');
}

// Submissão do Formulário
function setupFormSubmission() {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleFormSubmission();
    });
}

async function handleFormSubmission() {
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    
    // Validar dados
    if (activeTab === 'text' && !emailTextArea.value.trim()) {
        showToast('Digite um texto para análise', 'error');
        return;
    }
    
    if (activeTab === 'file' && !fileInput.files.length) {
        showToast('Selecione um arquivo para análise', 'error');
        return;
    }
    
    setLoadingState(true);
    hideAllSections();
    
    // Marcar tempo de início
    const startTime = Date.now();
    
    try {
        const formData = new FormData();
        
        if (activeTab === 'text') {
            formData.append('email_text', emailTextArea.value);
        } else {
            formData.append('file', fileInput.files[0]);
        }
        
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        // Calcular tempo de processamento
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
        updateProcessingTime(processingTime);
        
        if (result.success) {
            displayResults(result);
            incrementProcessedCount();
            showToast(`Análise concluída em ${processingTime}s!`, 'success');
        } else {
            showError(result.error || 'Erro na análise');
        }
        
    } catch (error) {
        showError('Erro de conexão');
    } finally {
        setLoadingState(false);
    }
}

// Estados de Loading
function setLoadingState(loading) {
    const btnText = submitBtn.querySelector('span');
    const btnLoader = submitBtn.querySelector('.animate-spin');
    
    submitBtn.disabled = loading;
    
    if (loading) {
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

// Exibição de Resultados
function displayResults(result) {
    // Atualizar classificação
    const classificationBadge = document.getElementById('classificationBadge');
    classificationBadge.textContent = result.classificacao.toUpperCase();
    
    // Remover classes antigas e adicionar novas baseadas na classificação
    classificationBadge.className = result.classificacao === 'produtivo' 
        ? 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 border'
        : 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 border';
    
    // Atualizar confiança
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceValue = document.getElementById('confidenceValue');
    const confidencePercent = Math.round(result.confianca * 100);
    
    setTimeout(() => {
        confidenceFill.style.width = `${confidencePercent}%`;
        confidenceValue.textContent = `${confidencePercent}%`;
    }, 300);
    
    // Atualizar análise - versão simples
    updateAnalysisDetails(result.nlp_insights);
    
    // Atualizar resposta sugerida
    currentResponse = result.resposta_sugerida;
    document.getElementById('responseText').textContent = currentResponse;
    
    // Mostrar seção de resultados
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Análise Detalhada Simplificada
function updateAnalysisDetails(nlpInsights) {
    const analysisText = document.getElementById('analysisText');
    
    if (!nlpInsights) {
        analysisText.innerHTML = '<p class="text-gray-600 dark:text-gray-400">Análise realizada com sucesso</p>';
        return;
    }
    
    let html = '<div class="space-y-2">';
    
    if (nlpInsights.business_score !== undefined) {
        html += `<p class="text-sm text-gray-700 dark:text-gray-300"><span class="font-medium">Palavras de negócio:</span> ${nlpInsights.business_score}</p>`;
        html += `<p class="text-sm text-gray-700 dark:text-gray-300"><span class="font-medium">Palavras pessoais:</span> ${nlpInsights.personal_score || 0}</p>`;
    }
    
    html += '</div>';
    analysisText.innerHTML = html;
}

// Exibição de Erros
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    errorSection.classList.remove('hidden');
    errorSection.scrollIntoView({ behavior: 'smooth' });
}

function hideAllSections() {
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

// Ações de Resposta
function copyResponse() {
    if (!currentResponse) return;
    
    navigator.clipboard.writeText(currentResponse).then(() => {
        showToast('Resposta copiada!', 'success');
    });
}

function editResponse() {
    const responseTextDiv = document.getElementById('responseText');
    
    if (responseTextDiv.contentEditable === 'true') {
        // Finalizar edição
        responseTextDiv.contentEditable = 'false';
        responseTextDiv.classList.remove('border-2', 'border-blue-500');
        currentResponse = responseTextDiv.textContent;
        showToast('Edição salva!', 'success');
        
        // Atualizar ícone do botão
        const editBtn = document.querySelector('button[onclick="editResponse()"]');
        editBtn.innerHTML = '<i class="fas fa-edit"></i><span class="hidden sm:inline">Editar</span><span class="sm:hidden">Edit</span>';
    } else {
        // Iniciar edição
        responseTextDiv.contentEditable = 'true';
        responseTextDiv.classList.add('border-2', 'border-blue-500');
        responseTextDiv.focus();
        showToast('Modo edição ativado', 'success');
        
        // Atualizar ícone do botão
        const editBtn = document.querySelector('button[onclick="editResponse()"]');
        editBtn.innerHTML = '<i class="fas fa-save"></i><span class="hidden sm:inline">Salvar</span><span class="sm:hidden">Save</span>';
    }
}

function newAnalysis() {
    emailTextArea.value = '';
    fileInput.value = '';
    
    // Resetar área de arquivo
    const fileDropZone = document.getElementById('fileDropZone');
    const fileInfo = document.getElementById('fileInfo');
    
    if (fileDropZone && fileInfo) {
        fileDropZone.classList.remove('hidden');
        fileInfo.classList.add('hidden');
    }
    
    hideAllSections();
    switchTab('text');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Sistema de Notificações
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    if (!toast || !toastMessage) return;
    
    // Resetar classes
    toast.className = 'fixed top-20 right-2 md:right-5 px-4 md:px-6 py-3 md:py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out max-w-sm';
    
    // Configurar cor e ícone baseado no tipo
    if (type === 'error') {
        toast.classList.add('bg-red-500', 'dark:bg-red-600', 'text-white');
        if (toastIcon) {
            toastIcon.className = 'fas fa-exclamation-circle mr-2 md:mr-3 text-sm md:text-base';
        }
    } else if (type === 'warning') {
        toast.classList.add('bg-yellow-500', 'dark:bg-yellow-600', 'text-white');
        if (toastIcon) {
            toastIcon.className = 'fas fa-exclamation-triangle mr-2 md:mr-3 text-sm md:text-base';
        }
    } else {
        toast.classList.add('bg-green-500', 'dark:bg-green-600', 'text-white');
        if (toastIcon) {
            toastIcon.className = 'fas fa-check-circle mr-2 md:mr-3 text-sm md:text-base';
        }
    }
    
    // Configurar mensagem
    toastMessage.textContent = message;
    toastMessage.className = 'text-sm md:text-base font-medium';
    
    // Mostrar toast
    toast.classList.remove('translate-x-full', 'opacity-0');
    toast.classList.add('translate-x-0', 'opacity-100');
    
    // Esconder após 3 segundos
    setTimeout(() => {
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-full', 'opacity-0');
    }, 3000);
}

// Sistema de Temas Dark/Light
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Recuperar tema salvo ou usar padrão
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    // Event listener para toggle
    themeToggle?.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

function applyTheme(theme) {
    const themeIcon = document.querySelector('.theme-toggle-icon');
    const html = document.documentElement;
    
    if (theme === 'dark') {
        html.classList.add('dark');
        if (themeIcon) {
            themeIcon.className = 'theme-toggle-icon fas fa-sun';
        }
    } else {
        html.classList.remove('dark');
        if (themeIcon) {
            themeIcon.className = 'theme-toggle-icon fas fa-moon';
        }
    }
}

// Sistema de Contador de Emails Processados
function loadProcessedCount() {
    const saved = localStorage.getItem('processedEmailsCount');
    processedCount = saved ? parseInt(saved) : 0;
    updateProcessedCountDisplay();
}

function incrementProcessedCount() {
    processedCount++;
    localStorage.setItem('processedEmailsCount', processedCount.toString());
    updateProcessedCountDisplay();
}

function updateProcessedCountDisplay() {
    const countElement = document.getElementById('processed-count');
    if (countElement) {
        // Animação de incremento
        countElement.style.transform = 'scale(1.2)';
        countElement.style.color = '#10b981';
        
        setTimeout(() => {
            countElement.textContent = processedCount.toLocaleString('pt-BR');
        }, 100);
        
        setTimeout(() => {
            countElement.style.transform = 'scale(1)';
            countElement.style.color = '';
        }, 300);
    }
}

function resetProcessedCount() {
    processedCount = 0;
    localStorage.removeItem('processedEmailsCount');
    updateProcessedCountDisplay();
    showToast('Contador resetado!', 'success');
}

// Sistema de Tempo de Processamento
function updateProcessingTime(seconds) {
    const timeElement = document.getElementById('processing-time');
    
    if (timeElement) {
        // Animação de atualização
        timeElement.style.transform = 'scale(1.1)';
        timeElement.style.color = '#2563eb';
        
        setTimeout(() => {
            timeElement.textContent = `~${seconds}s`;
        }, 100);
        
        setTimeout(() => {
            timeElement.style.transform = 'scale(1)';
            timeElement.style.color = '';
        }, 300);
    }
}

// Sistema de Contador de Caracteres
function setupCharacterCount() {
    const charCountElement = document.getElementById('char-count');
    const charWarning = document.getElementById('char-warning');
    const charError = document.getElementById('char-error');
    const maxChars = 1000;
    const warningThreshold = 800;

    if (emailTextArea && charCountElement) {
        const updateCharCount = () => {
            const count = emailTextArea.value.length;
            charCountElement.textContent = count.toLocaleString('pt-BR');
            
            charWarning.classList.add('hidden');
            charError.classList.add('hidden');

            charCountElement.classList.remove('text-red-500', 'text-amber-500', 'text-green-500');
            emailTextArea.classList.remove('border-red-500', 'border-amber-500');
            
            if (count > maxChars) {
                charError.classList.remove('hidden');
                charCountElement.classList.add('text-red-500');
                emailTextArea.classList.add('border-red-500');
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else if (count > warningThreshold) {
                charWarning.classList.remove('hidden');
                charCountElement.classList.add('text-amber-500');
                emailTextArea.classList.add('border-amber-500');
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else if (count > 500) {
                charCountElement.classList.add('text-green-500');
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        };
        
        emailTextArea.addEventListener('input', updateCharCount);
        emailTextArea.addEventListener('paste', () => setTimeout(updateCharCount, 10));
        updateCharCount();
    }
}
