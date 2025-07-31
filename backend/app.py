from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import os
import io
import re
from dotenv import load_dotenv
from groq import Groq
import random

# ------------------ SETUP ------------------ #
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your_groq_api_key_here")
client = Groq(api_key=GROQ_API_KEY)


# ------------------ HELPERS ------------------ #
def call_groq(prompt: str, temperature: float = 0.7, max_tokens: int = 400) -> str:
    """Send prompt to Groq and get generated text."""
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system",
                 "content": "You are an expert Instagram content creator. Generate catchy, structured content."},
                {"role": "user", "content": prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"❌ Groq API Error: {e}")
        return "Caption: Something went wrong.\nHashtags: #SocialMedia"


def generate_hashtags(topic: str) -> str:
    """Generate up to 15 SEO-friendly hashtags based on topic."""
    base = topic.lower().strip()
    words = re.findall(r'\w+', base)

    # Convert words into hashtags
    hashtags = [f"#{word}" for word in words if len(word) > 2]

    # Add strong SEO-friendly fallbacks
    seo_boosters = [
        "#ProductivityTips", "#WorkSmart", "#ContentCreation", "#TechHacks",
        "#DigitalCreator", "#InstaGrowth", "#LaptopGoals", "#RemoteWorkLife",
        "#SocialMediaStrategy", "#CreatorCommunity", "#TimeManagement",
        "#ReelTips", "#DailyWorkflow", "#TechTools", "#OnlineSuccess"
    ]

    combined = hashtags + seo_boosters
    unique_tags = list(dict.fromkeys(combined))  # Remove duplicates, preserve order

    return " ".join(unique_tags[:15])


def parse_groq_output(content: str, topic: str) -> dict:
    """Extract headline, hashtags, and caption from Groq response."""
    caption_match = re.search(r"\*\*Caption:\*\*\s*(.*?)(?:\n|$)", content, re.DOTALL)
    hashtags_match = re.search(r"\*\*Hashtags:\*\*\s*(.*?)(?:\n|$)", content, re.DOTALL)

    caption_text = caption_match.group(1).strip() if caption_match else "Here's a catchy caption!"
    hashtags_text = hashtags_match.group(1).strip() if hashtags_match else generate_hashtags(topic)
    hashtags_text = " ".join(hashtags_text.split()[:15])  # Ensure max 15 hashtags

    headline_copy = re.sub(r"\*\*Caption:\*\*.*", "", content, flags=re.DOTALL)
    headline_copy = re.sub(r"\*\*Hashtags:\*\*.*", "", headline_copy, flags=re.DOTALL).strip()

    return {
        "headlineCopy": headline_copy,
        "hashtags": hashtags_text,
        "caption": caption_text
    }


def generate_single_post(topic: str, post_type: str, num_slides: int = 1, num_seconds: int = 15) -> dict:
    """Generate content for a single Instagram post using Groq."""
    if post_type == "Carousel":
        prompt = (
            f"Create an Instagram Carousel Post about '{topic}' with {num_slides} slides.\n"
            "For each slide, write:\nSlide X:\nText: (catchy, short)\n\n"
            "Finally add:\n**Caption:** (engaging caption)\n**Hashtags:** (SEO-optimized hashtags)"
        )
    elif post_type == "Reel":
        prompt = (
            f"Create an Instagram Reel script about '{topic}' lasting {num_seconds} seconds.\n"
            "Format like:\n0s–5s: Hook\n5s–10s: Main Point 1\n10s–15s: Main Point 2\n\n"
            "Finally add:\n**Caption:** ...\n**Hashtags:** ..."
        )
    else:
        prompt = (
            f"Create a SINGLE Instagram Post about '{topic}'.\n"
            "Include:\nHeadline: (6-8 words)\nBody: (catchy 2-3 lines)\n\n"
            "Finally add:\n**Caption:** ...\n**Hashtags:** ..."
        )

    content = call_groq(prompt)
    parsed_data = parse_groq_output(content, topic)

    return {
        "postType": post_type,
        "headlineCopy": parsed_data["headlineCopy"],
        "hashtags": parsed_data["hashtags"],
        "caption": parsed_data["caption"]
    }


# ------------------ ROUTES ------------------ #
@app.route("/api/generate", methods=["POST"])
def generate_batch():
    data = request.json
    topic = data.get("topic", "")
    selected_type = data.get("postType", "Post")
    num_posts = min(int(data.get("numPosts", 1)), 30)
    num_slides = int(data.get("numSlides", 1))
    num_seconds = int(data.get("numSeconds", 15))

    print(f"[INFO] Generating {num_posts} '{selected_type}' posts on '{topic}'")

    def get_post_type():
        if selected_type == "Mixed":
            return random.choice(["Post", "Carousel", "Reel"])
        return selected_type

    posts = [
        generate_single_post(topic, get_post_type(), num_slides, num_seconds)
        for _ in range(num_posts)
    ]
    return jsonify(posts)


@app.route("/api/export", methods=["POST"])
def export_to_excel():
    """Export generated posts to an Excel file."""
    posts = request.json
    output = io.BytesIO()

    df = pd.DataFrame([
        {
            "Post Number": idx + 1,
            "Post Type": post.get("postType", "Post"),
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


# ------------------ MAIN ------------------ #
if __name__ == "__main__":
    app.run(debug=True)
