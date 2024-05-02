from flask import Flask, request, jsonify, send_file
import subprocess
from summarize import summarize
import requests
import io
from flask_cors import CORS
app = Flask(__name__)
CORS(app) 


@app.route('/summarize')
def run_summarize_script():
    url = summarize()
    return jsonify({'url':url})
if __name__ == '__main__':
    app.run(debug=True)
