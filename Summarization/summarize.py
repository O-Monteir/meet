import os
import requests
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph
from cloudinary import uploader

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



pdf_filename = "meeting_report.pdf"
doc = SimpleDocTemplate(pdf_filename, pagesize=A4, title=f"Meeting Report") 

# Set up styles for justified text
styles = getSampleStyleSheet()
justified_style = styles['BodyText']

def draw_title(canvas):
        canvas.setFont("Helvetica-Bold", 16) 
        canvas.drawCentredString(A4[0] / 2, A4[1] - 30, f"Meeting Report")

       
doc.build([
    Paragraph("<b>Meeting Minutes</b>", justified_style),
    Paragraph(output[0]['generated_text'], justified_style)
], onFirstPage=lambda canvas, doc: canvas.drawCentredString(A4[0] / 2, A4[1] - 30, f"Meeting Report"))

print(f"PDF file created successfully.")

# Upload the PDF bytes to Cloudinary
cloudinary.config(
    cloud_name="YOUR_CLOUD_NAME",
    api_key="YOUR_API_KEY",
    api_secret="YOUR_API_SECRET"
)
cloudinary_response = cloudinary.uploader.upload_large(
    pdf_bytes.getvalue(), 
    resource_type="auto", 
    folder="combinedTranscript",  # Specify the folder name in Cloudinary
    public_id="meeting_report.pdf"  # Optionally specify the public ID of the file
)

# Print the Cloudinary response
print("Cloudinary upload response:", cloudinary_response)