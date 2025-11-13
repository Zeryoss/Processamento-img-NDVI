from flask import Flask, request, jsonify, send_from_directory
from processamento import analisar_ndvi
import os
import json
from datetime import datetime
import uuid

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
HISTORICO_FILE = 'analises.json'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def carregar_historico():
    """Carrega o histórico de análises"""
    if os.path.exists(HISTORICO_FILE):
        with open(HISTORICO_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def salvar_historico(historico):
    """Salva o histórico de análises"""
    with open(HISTORICO_FILE, 'w', encoding='utf-8') as f:
        json.dump(historico, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    # Carrega o HTML da pasta static
    return send_from_directory('static', 'index.html')

@app.route('/analisar', methods=['POST'])
def upload_imagem():
    if 'imagem' not in request.files:
        return jsonify({'erro': 'Nenhuma imagem enviada'})

    arquivo = request.files['imagem']
    caminho = os.path.join(UPLOAD_FOLDER, arquivo.filename)
    arquivo.save(caminho)

    # 🔹 Aqui você chama o código de processamento
    resultado = analisar_ndvi(caminho)

    # Salvar no histórico
    if 'erro' not in resultado:
        historico = carregar_historico()
        registro = {
            'id': str(uuid.uuid4().hex),
            'original_filename': arquivo.filename,
            'saved_filename': os.path.basename(caminho),
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'resultado': resultado
        }
        historico.append(registro)
        salvar_historico(historico)

    return jsonify(resultado)

@app.route('/historico', methods=['GET'])
def obter_historico():
    """Retorna o histórico de análises"""
    historico = carregar_historico()
    return jsonify(historico)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
