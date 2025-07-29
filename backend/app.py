from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import pandas as pd
import os
import requests
import re
import traceback
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# Load Hugging Face API Token from environment variable
HF_TOKEN = os.getenv("HF_TOKEN", "your_huggingface_token_here")
HF_MODEL = "tiiuae/falcon-7b-instruct"
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

headers = {
    "Authorization": f"Bearer {HF_TOKEN}"
}

def call_huggingface(prompt, timeout=60):
    try:
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json={"inputs": prompt},
            timeout=timeout
        )
        response.raise_for_status()
        return response.json()[0]['generated_text']
    except Exception as e:
        print("❌ HuggingFace API Error:", e)
        return "**Caption:** Something went wrong.\n**Hashtags:** #error"

def generate_hashtags(topic):
    words = topic.lower().split()
    fallback = [f"#{word}" for word in words] + ["#InstaGood", "#ExplorePage", "#ContentCreator"]
    return " ".join(fallback[:15])

def generate_single_post(topic, post_type, num_slides, num_seconds):
    try:
        if post_type == "Carousel":
            prompt = f"""
Create an Instagram Carousel Post about "{topic}" with {num_slides} slides.
Each slide:
- Headline: 6-8 words
- Text: 10-20 words

Format:
**Slide 1:**
Headline: ...
Text: ...

**Caption:** ...
**Hashtags:** ...
"""
        elif post_type == "Reel":
            prompt = f"""
Create an Instagram Reel script about "{topic}" lasting {num_seconds} seconds.
Use timestamps every 5 seconds.

Format:
0s–5s: Hook
5s–10s: Main Point 1
10s–15s: Main Point 2

**Caption:** ...
**Hashtags:** ...
"""
        else:  # Post
            prompt = f"""
Create a SINGLE Instagram Post about "{topic}".
Include:
- Headline: 6-8 words
- Text: Short, catchy (10-20 words)

**Caption:** ...
**Hashtags:** ...
"""

        content = call_huggingface(prompt)

        caption = re.search(r"\*\*Caption:\*\*\s*(.*?)(?:\*\*|$)", content, re.DOTALL)
        hashtags = re.search(r"\*\*Hashtags:\*\*\s*(.*?)(?:\*\*|$)", content, re.DOTALL)

        caption_text = caption.group(1).strip() if caption else "Here's a great caption! 🚀"
        hashtags_text = hashtags.group(1).strip() if hashtags else generate_hashtags(topic)

        headline_copy = re.sub(r"\*\*Caption:\*\*.*", "", content, flags=re.DOTALL)
        headline_copy = re.sub(r"\*\*Hashtags:\*\*.*", "", headline_copy, flags=re.DOTALL).strip()

        return {
            "postType": post_type,
            "headlineCopy": headline_copy,
            "hashtags": hashtags_text,
            "caption": caption_text
        }

    except Exception as e:
        print(f"❌ Generation error: {e}")
        traceback.print_exc()
        return {
            "postType": post_type,
            "headlineCopy": "Failed to generate.",
            "hashtags": "#error",
            "caption": "Something went wrong."
        }

@app.route("/api/generate", methods=["POST"])
def generate_batch():
    data = request.json
    topic = data.get("topic", "")
    post_type = data.get("postType", "Post")
    requested_posts = int(data.get("numPosts", 1))
    num_posts = min(requested_posts, 5)
    num_slides = int(data.get("numSlides", 1))
    num_seconds = int(data.get("numSeconds", 15))

    print(f"[INFO] Generating {num_posts} '{post_type}' posts on '{topic}'")

    posts = [generate_single_post(topic, post_type, num_slides, num_seconds) for _ in range(num_posts)]
    return jsonify(posts)

@app.route("/api/export", methods=["POST"])
def export_to_excel():
    posts = request.json
    output = io.BytesIO()

    df = pd.DataFrame([
        {
            "Post Number": idx + 1,
            "Content Type": post.get("postType", "post"),
            "Headline & Copy": post.get("headlineCopy", ""),
            "Hashtags": post.get("hashtags", ""),
            "Caption": post.get("caption", "")
        }
        for idx, post in enumerate(posts)
    ])

    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="Instagram Posts")

    output.seek(0)
    return send_file(output, download_name="generated_posts.xlsx", as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
