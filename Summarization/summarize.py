import os
import cloudinary.uploader
import requests
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph
from report import gen_report
from io import BytesIO
import cloudinary
import requests

def summarize():
    API_URL = "https://api-inference.huggingface.co/models/sarahabraham/Summarization_BART_FineTuned"
    headers = {"Authorization": "Bearer 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"}

    def query(payload):
        response = requests.post(API_URL, headers=headers, json=payload)
        return response.json()
        
    # Cloudinary URL for the transcript
    cloudinary_url = "https://res.cloudinary.com/drf5xu4vy/raw/upload/combinedTranscript/combined_transcripts"

    # Fetch transcript content from Cloudinary
    response = requests.get(cloudinary_url)
    transcript_text = response.text
    print(transcript_text)

    custom_dialogue = transcript_text


    output = query(custom_dialogue)
    print("OUTPUT")
    print(output)
    print(output[0]['generated_text'])
    gen_report(output[0]['generated_text'])



    pdf = "./meeting_minutes.pdf"

    cloudinary.config(
            cloud_name="drf5xu4vy",
            api_key="148639383182787",
            api_secret="x28LCvHqziYGwzu6ezoGezgUlUo"
        )
    cloudinary_response = cloudinary.uploader.upload(
            pdf,
            resource_type="auto",
            folder="combinedTranscript",
            public_id="meeting_report")
    
    # Print the Cloudinary upload response
    print("Cloudinary upload response:", cloudinary_response)
    url = cloudinary_response['url']
    return url

   