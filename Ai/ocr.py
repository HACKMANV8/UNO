import os
import json
from pathlib import Path
from typing import Literal
from pydantic import BaseModel
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Please add it in your .env file.")

genai.configure(api_key=API_KEY)

FILE_PATH = r"C:\Users\DHRUVA\Desktop\Necessary\coding\StuDoc_98778_208098.jpg" 
MODEL_NAME = "gemini-2.5-flash"

class ExtractedDocumentData(BaseModel):
    document_type: Literal[
        "10th/SSC Marks Card",
        "12th/PUC/HSC Marks Card",
        "University Marksheet (Degree/Diploma)",
        "Internship/Experience Certificate",
        "Other Academic Document"
    ]
    full_name: str
    institution_name: str
    degree_or_course: str
    registration_number: str
    completion_year: str
    total_marks_or_grade: float
    marks_format: str

def extract_document_details():
    file_path = Path(FILE_PATH)
    if not file_path.exists():
        raise FileNotFoundError(f"File not found at: {FILE_PATH}")

    image = Image.open(file_path)

    prompt_text = (
        "Analyze this academic document or marks card and extract all relevant details "
        "following the schema strictly as JSON. Detect fields like name, roll number, "
        "year, total marks, and marks format accurately."
    )

    print(f"Sending {file_path.name} to Gemini ({MODEL_NAME})...")

    try:
        model = genai.GenerativeModel(model_name=MODEL_NAME)

        response = model.generate_content(
            [prompt_text, image],
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=ExtractedDocumentData,
            ),
        )
        
        extracted_data = json.loads(response.text)

        print("\nDocument Extraction Complete:")
        print("-" * 45)
        for key, value in extracted_data.items():
            print(f"{key.replace('_', ' ').title():25}: {value}")

        output_file = file_path.stem + "_extracted.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(extracted_data, f, indent=4, ensure_ascii=False)
        print(f"\nData saved to: {output_file}")

    except json.JSONDecodeError:
        print("Could not parse JSON. Try improving image clarity or use a better scan.")
    except Exception as e:
        print(f"Runtime Error: {e}")


if __name__ == "__main__":
    extract_document_details()
