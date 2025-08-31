import google.generativeai as genai
from .NLPProcessor import NLPProcessor
from config import Config

config = Config()

class SmartEmailManager:
    """Sistema simplificado de classificação usando Gemini AI + NLP"""

    def __init__(self):
        # Configurar Google Gemini
        api_key = config.GEMINI_API_KEY
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.nlp = NLPProcessor()

        print("🚀 SISTEMA GEMINI INICIALIZADO")
        print("🔤 PROCESSADOR NLP CARREGADO")

    def analyze_email_with_ai(self, email_content):
        """Análise principal com Gemini + fallback NLP"""
        # Tentar usar Gemini primeiro
        try:
            prompt = f"""
            Analise este email e forneça:
            1. Classificação como 'produtivo' (trabalho, negócios, projetos) ou 'improdutivo' (pessoal, social, spam)
            2. Confiança (0.0 a 1.0)
            3. Justificativa clara
            4. Uma resposta sugerida apropriada e profissional para este email

            Email: {email_content[:1000]}

            IMPORTANTE: Sempre sugira uma resposta útil e contextual. 
            A resposta sugerida deve ser SEMPRE em formato de email completo, com saudação, corpo e despedida. 
            Se for produtivo, sugira como responder profissionalmente. Se for improdutivo, sugira uma resposta educada de recusa ou redirecionamento, também em formato de email.

            Formato da resposta: categoria|confiança|justificativa|resposta_sugerida
            """
            
            response = self.model.generate_content(prompt)
            
            parts = response.text.strip().split('|')
            
            if len(parts) >= 4:
                # Processar com NLP para insights extras
                nlp_result = self.nlp.process_text(email_content)
                
                return {
                    'categoria': parts[0].lower().strip(),
                    'confianca': float(parts[1].strip()) if parts[1].replace('.','').isdigit() else 0.8,
                    'justificativa': parts[2].strip(),
                    'resposta_sugerida': parts[3].strip() if parts[3].strip() and parts[3].strip().lower() != 'nenhuma resposta sugerida.' else self._generate_default_response(parts[0].lower().strip(), email_content),
                    'metodo': 'Gemini + NLP',
                    'provider_used': 'gemini',
                    'nlp_insights': {
                        'business_score': nlp_result['business_score'],
                        'personal_score': nlp_result['personal_score']
                    }
                }
            else:
                raise Exception("Resposta Gemini inválida")
                
        except Exception as e:
            # Fallback para NLP puro
            return self._analyze_with_nlp_only(email_content)

    def _analyze_with_nlp_only(self, email_content):
        """Fallback usando apenas NLP"""
        result = self.nlp.classify_simple(email_content)
        nlp_features = self.nlp.process_text(email_content)
        
        return {
            'categoria': result['categoria'],
            'confianca': result['confianca'],
            'justificativa': result['justificativa'],
            'resposta_sugerida': self._generate_default_response(result['categoria'], email_content),
            'metodo': 'NLP-Only (Fallback)',
            'provider_used': 'nlp_only',
            'nlp_insights': {
                'business_score': nlp_features['business_score'],
                'personal_score': nlp_features['personal_score']
            }
        }

    def _generate_default_response(self, categoria, email_content):
        """Gera resposta padrão baseada na categoria"""
        if categoria == 'produtivo':
            if 'urgente' in email_content.lower() or 'problema' in email_content.lower():
                return "Obrigado pelo contato. Vou analisar a situação imediatamente e retorno com uma solução o mais breve possível."
            elif 'reunião' in email_content.lower() or 'meeting' in email_content.lower():
                return "Agradeço o convite. Vou verificar minha agenda e confirmo a participação em breve."
            elif 'proposta' in email_content.lower() or 'projeto' in email_content.lower():
                return "Recebi sua mensagem sobre o projeto. Vou analisar os detalhes e retorno com meu feedback em breve."
            else:
                return "Obrigado por entrar em contato. Recebi sua mensagem e vou analisar as informações para dar o devido retorno."
        else:  # improdutivo
            return "Obrigado pela mensagem. No momento estou focado em questões profissionais, mas agradeço o contato."
