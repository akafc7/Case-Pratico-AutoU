import nltk
import re
import logging
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NLPProcessor:
    """Processador NLP simplificado para classificação de emails"""
    
    def __init__(self):
        # Download básico do NLTK
        self._download_nltk()
        
        # Stopwords essenciais
        try:
            self.stopwords = set(stopwords.words('portuguese'))
            self.stopwords.update(['att', 'obrigado', 'prezado', 'favor', 'aguardo'])
        except:
            self.stopwords = set()
        
        # Palavras-chave essenciais
        self.business_words = {
            'projeto', 'reunião', 'contrato', 'cliente', 'vendas', 'produto', 
            'relatório', 'sistema', 'suporte', 'análise', 'proposta'
        }
        
        self.personal_words = {
            'aniversário', 'festa', 'família', 'pessoal', 'amigo', 'férias'
        }

    def _download_nltk(self):
        """Download mínimo do NLTK"""
        resources = ['punkt', 'punkt_tab', 'stopwords', 'wordnet', 'averaged_perceptron_tagger', 
                    'maxent_ne_chunker', 'words', 'omw-1.4']
        
        for resource in resources:
            try:
                nltk.data.find(f'tokenizers/{resource}')
            except LookupError:
                logger.info(f"Baixando recurso NLTK: {resource}")
                nltk.download(resource, quiet=True)

    def process_text(self, text):
        """Processa texto e extrai características básicas"""
        # Limpar texto
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenizar
        words = word_tokenize(text)
        words = [word for word in words if word not in self.stopwords and len(word) > 2]
        
        # Identificar palavras-chave
        business_matches = [word for word in words if word in self.business_words]
        personal_matches = [word for word in words if word in self.personal_words]
        
        return {
            'business_keywords': business_matches,
            'personal_keywords': personal_matches,
            'business_score': len(business_matches),
            'personal_score': len(personal_matches)
        }

    def classify_simple(self, text):
        """Classificação simples baseada em palavras-chave"""
        features = self.process_text(text)
        
        business_score = features['business_score']
        personal_score = features['personal_score']
        
        if business_score > personal_score:
            return {
                'categoria': 'produtivo',
                'confianca': min(0.7 + (business_score * 0.1), 0.9),
                'justificativa': f'Encontradas {business_score} palavras de negócio'
            }
        else:
            return {
                'categoria': 'improdutivo', 
                'confianca': 0.7,
                'justificativa': 'Comunicação pessoal ou social'
            }
