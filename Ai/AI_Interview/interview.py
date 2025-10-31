import os
import cv2
import time
import speech_recognition as sr
import google.generativeai as genai
from PyPDF2 import PdfReader
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in .env")

genai.configure(api_key=API_KEY)

MODEL_NAME = "gemini-2.0-flash"
TRANSCRIPT_DIR = "transcripts"
VIDEO_DIR = "recordings"

os.makedirs(TRANSCRIPT_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

def extract_text_from_resume(pdf_path):
    """Extract plain text from a resume PDF."""
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Resume not found at: {pdf_path}")
    text = ""
    with open(pdf_path, "rb") as f:
        reader = PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text.strip()

def ask_gemini(prompt):
    """Send prompt to Gemini model."""
    model = genai.GenerativeModel(model_name=MODEL_NAME)
    response = model.generate_content(prompt)
    return response.text.strip()

def record_audio():
    """Capture voice from the mic and transcribe it."""
    recognizer = sr.Recognizer()
    mic = sr.Microphone()

    print("\nSpeak your answer (press Ctrl+C to skip)...")
    with mic as source:
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        print("Transcribing...")
        text = recognizer.recognize_google(audio)
        print(f"You said: {text}")
        return text
    except sr.UnknownValueError:
        print("Could not understand your voice.")
        return ""
    except sr.RequestError:
        print("Speech recognition error.")
        return ""

def start_webcam_recording(filename="recordings/interview_video.avi"):
    """Start webcam recording."""
    cap = cv2.VideoCapture(0)
    fourcc = cv2.VideoWriter_fourcc(*"XVID")
    out = cv2.VideoWriter(filename, fourcc, 20.0, (640, 480))

    print("\nWebcam recording started. Press 'q' to stop manually.\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Cannot access webcam.")
            break

        out.write(frame)
        cv2.imshow("Mock Interview Recording (Press Q to Stop)", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            print("Webcam recording stopped manually.")
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    print("Video saved successfully.")


def run_mock_interview(resume_path):
    print("\nStarting Gemini Mock Interview with Webcam...\n")

    resume_text = extract_text_from_resume(resume_path)
    analysis_prompt = (
        "Analyze the following resume and extract key information:\n"
        "1. Candidate name\n"
        "2. Skills or programming languages\n"
        "3. Strongest technical areas\n"
        "Then generate the first interview question based on their strongest skill.\n\n"
        f"Resume:\n{resume_text}"
    )

    first_question = ask_gemini(analysis_prompt)
    print(f"\nGemini (Interviewer): {first_question}\n")

    from threading import Thread
    video_thread = Thread(target=start_webcam_recording)
    video_thread.start()

    with open(os.path.join(TRANSCRIPT_DIR, "answers.txt"), "w") as f:
        f.write("AI Mock Interview Transcript\n\n")

    current_question = first_question

    while True:
        user_answer = record_audio()
        if not user_answer:
            print("No input detected. Ending interview.")
            break

        with open(os.path.join(TRANSCRIPT_DIR, "answers.txt"), "a") as f:
            f.write(f"Q: {current_question}\nA: {user_answer}\n\n")

        followup_prompt = (
            "You are an experienced technical interviewer. Based on the candidate's last answer, "
            "ask the next relevant question related to their mentioned skills or experience. "
            "If the interview should end, respond only with 'End Interview'.\n\n"
            f"Candidate's answer: {user_answer}"
        )

        next_question = ask_gemini(followup_prompt)
        if "end interview" in next_question.lower():
            print("\nGemini: The mock interview is complete. Great job!\n")
            break

        print(f"\nGemini (Interviewer): {next_question}\n")
        current_question = next_question

    video_thread.join()
    print("Transcript and video saved.")
if __name__ == "__main__":
    try:
        RESUME_PATH = "resume.pdf"  
        run_mock_interview(RESUME_PATH)
    except KeyboardInterrupt:
        print("\nInterview terminated by user.")
    except Exception as e:
        print(f"\nError: {e}")
