from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import inch
from reportlab.lib import enums
from datetime import datetime


def draw_line(canvas, doc):
    canvas.setStrokeColorRGB(0, 0, 0)  # Set line color (black)
    canvas.setLineWidth(1)  # Set line width
    canvas.line(40, 740, 550, 740)  # Draw the line

def gen_report(minutes):
    pdf_filename = "meeting_minutes.pdf"
    
    # Create a SimpleDocTemplate object
    doc = SimpleDocTemplate(pdf_filename, pagesize=A4)
    
    # Set up styles for justified text
    styles = getSampleStyleSheet()
    justified_style = styles['BodyText']
    bullet_style = ParagraphStyle(name='Bullet', parent=styles['BodyText'], leftIndent=20, fontName='Times-Roman', fontSize=12)
    centered_title_style = ParagraphStyle(name='CenteredTitle', parent=styles['Title'],fontName='Times-Roman', fontSize=30, alignment=1)  # alignment=1 is for center

    sentences = minutes.split(". ")

    now = datetime.now()
    date_str = now.strftime("%B %d, %Y")
    day_str = now.strftime("%A")

    paragraphs = []
    for sentence in sentences:
        sentence = sentence.strip()
        if sentence and not (sentence.endswith("a.m.") or sentence.endswith("p.m.")):
            paragraphs.append(Paragraph(f'&bull; {sentence}', bullet_style))


    # Define the content
    content = [
        Spacer(1, -30),  # Reduce space before the title to move it higher
        Paragraph("<b>Meeting Minutes</b>", centered_title_style),
        Spacer(1, 50),  # Add additional space after the title 
        Paragraph(f"<b>{day_str}, {date_str}</b>"), 
    ]
    content.extend(paragraphs)

    # Build the PDF
    doc.build(content, onFirstPage=draw_line)

    print(f"PDF file created successfully.")



