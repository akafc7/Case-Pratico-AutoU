import PyPDF2
from models.Classifier import SmartEmailManager


class EmailWithAttachmentProcessor(SmartEmailManager):
    """Processador que lida com anexos de email"""

    def extract_text_from_pdf(self, pdf_path):
        """Extrai texto de arquivos PDF"""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            raise Exception(f"Erro ao extrair texto do PDF: {str(e)}")

    def extract_text_from_txt(self, txt_path):
        """Lê arquivos de texto"""
        try:
            with open(txt_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            raise Exception(f"Erro ao ler arquivo texto: {str(e)}")

    def process_email_with_attachments(self, email_content, attachment_paths):
        """Processa email com anexos"""
        attachment_texts = []

        for path in attachment_paths:
            if path.endswith('.pdf'):
                text = self.extract_text_from_pdf(path)
            elif path.endswith('.txt'):
                text = self.extract_text_from_txt(path)
            else:
                text = f"[Arquivo {path} não processado]"

            attachment_texts.append(text)

        # Combina todos os textos
        all_attachments = "\n\n".join(attachment_texts)

        return self.process_email(email_content, all_attachments)
