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

API_URL = "https://api-inference.huggingface.co/models/sarahabraham/Summarization_BART_FineTuned"
headers = {"Authorization": "Bearer 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"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()
	
# Cloudinary URL for the transcript
cloudinary_url = "https://res.cloudinary.com/drf5xu4vy/raw/upload/v1711392635/combinedTranscript/combined_transcripts"

# Fetch transcript content from Cloudinary
response = requests.get(cloudinary_url)
transcript_text = response.text
print(transcript_text)

# # Get the directory where the script is located
# script_dir = os.path.dirname(os.path.realpath(__file__))

# # Path to the transcript file
# transcript_file_path = os.path.join(script_dir,"..", "combined_transcripts.txt")

# print(transcript_file_path)
# # Read the contents of the transcript file
# with open(transcript_file_path, 'r') as file:
#     transcript_text = file.read()

# Add the transcript text to the custom_dialogue variable
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
cloudinary_response = cloudinary.uploader.upload_large(
        pdf,
        resource_type="auto",
        folder="combinedTranscript",
        public_id="meeting_report"
    )

# Print the Cloudinary upload response
print("Cloudinary upload response:", cloudinary_response)
