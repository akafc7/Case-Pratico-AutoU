from flask import Flask, render_template, request, jsonify
import os
from werkzeug.utils import secure_filename
from models.Classifier import SmartEmailManager
from models.EmailManager import EmailWithAttachmentProcessor
from config import Config
import logging

app = Flask(__name__)
app.config.from_object(Config)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar classificador IA moderno
classifier = SmartEmailManager()

# Configuração
config = Config()

# Inicializar leitor de arquivos PDF e TXT
email_manager = EmailWithAttachmentProcessor()

ALLOWED_EXTENSIONS = {'txt', 'pdf'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/health')
def health_check():
    """Verificação de saúde do sistema Gemini"""
    try:
        # Testar se o Gemini está funcionando
        test_result = classifier.analyze_email_with_ai("Teste de conectividade")
        
        if test_result.get('provider_used') == 'gemini':
            return jsonify({
                'status': 'healthy',
                'provider': 'Gemini AI',
                'nlp_available': True,
                'message': 'Sistema Gemini AI + NLP funcionando'
            })
        else:
            return jsonify({
                'status': 'degraded', 
                'provider': 'NLP Only',
                'nlp_available': True,
                'message': 'Modo NLP ativo (Gemini indisponível)'
            })
            
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return jsonify({
            'status': 'error',
            'provider': 'None',
            'nlp_available': False,
            'error': str(e),
            'message': 'Sistema offline'
        }), 503

@app.route('/analyze', methods=['POST'])
def analyze():
    """Endpoint novo para análise com Gemini"""
    try:
        email_text = ""
        
        # Verificar texto direto
        if 'email_text' in request.form and request.form['email_text'].strip():
            email_text = request.form['email_text']
        
        # Verificar arquivo
        elif 'file' in request.files:
            file = request.files['file']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(config.UPLOAD_FOLDER, filename)
                file.save(file_path)
                
                # Extrair texto
                if filename.lower().endswith('.pdf'):
                    email_text = email_manager.extract_text_from_pdf(file_path)
                elif filename.lower().endswith('.txt'):
                    email_text = email_manager.extract_text_from_txt(file_path)

                # Limpar arquivo
                try:
                    os.remove(file_path)
                except:
                    pass
        
        if not email_text.strip():
            return jsonify({
                'success': False,
                'error': 'Nenhum texto fornecido para análise.'
            })
        
        # ANÁLISE COM GEMINI AI
        result = classifier.analyze_email_with_ai(email_text)
        
        logger.info(f"Gemini Analysis: {result['categoria']} "
                   f"({result['confianca']:.2f}, {result['metodo']})")
        
        return jsonify({
            'success': True,
            'classificacao': result['categoria'],
            'confianca': result['confianca'],
            'metodo': result['metodo'],
            'resposta_sugerida': result['resposta_sugerida'],
            'justificativa': result.get('justificativa', ''),
            'nlp_insights': result.get('nlp_insights', {}),
            'nlp_features': result.get('nlp_features', {}),
            'preprocessing_stats': result.get('preprocessing_stats', {}),
            'provider_used': result.get('provider_used', 'unknown'),
            'gemini_powered': True,
            'nlp_enhanced': True
        })
        
    except Exception as e:
        logger.error(f"Erro análise Gemini: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Erro na análise: {str(e)}'
        })

# Endpoint de compatibilidade
@app.route('/classify', methods=['POST']) 
def classify_email_compat():
    """Endpoint de compatibilidade - redireciona para /analyze"""
    return analyze()

if __name__ == '__main__':
    # Criar pasta de uploads
    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)

    print("🤖 Sistema de Classificação - Gemini + NLP")
    print("🌐 Acesse: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
