import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [topic, setTopic] = useState("");
  const [postType, setPostType] = useState("Post");
  const [numPosts, setNumPosts] = useState(1);
  const [numSlides, setNumSlides] = useState(1);
  const [numSeconds, setNumSeconds] = useState(15);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  // -------------------- Generate Posts -------------------- //
  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic!");
      return;
    }
    setLoading(true);

    try {
      const { data } = await axios.post("http://127.0.0.1:5000/api/generate", {
        topic,
        postType,
        numPosts,
        numSlides,
        numSeconds,
      });
      setPosts(data);
    } catch (error) {
      console.error("Error generating posts:", error);
      alert("Failed to generate posts!");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Export to Excel -------------------- //
  const handleExport = async () => {
    if (!posts.length) {
      alert("No posts to export!");
      return;
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/export",
        posts,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "generated_posts.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Failed to export Excel!");
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Instagram Post Generator</h1>

      {/* -------------------- Form Section -------------------- */}
      <div className="form-section">
        <label>Topic</label>
        <input
          type="text"
          placeholder="Enter topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <label>Post Type</label>
        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
        >
          <option value="Post">Post</option>
          <option value="Carousel">Carousel</option>
          <option value="Reel">Reel</option>
          <option value="Mixed">Mixed</option>
        </select>

        {postType === "Carousel" && (
          <>
            <label>Number of Slides</label>
            <input
              type="number"
              min="1"
              max="10"
              value={numSlides}
              onChange={(e) => setNumSlides(e.target.value)}
            />
          </>
        )}

        {postType === "Reel" && (
          <>
            <label>Duration (seconds)</label>
            <input
              type="number"
              min="5"
              max="60"
              value={numSeconds}
              onChange={(e) => setNumSeconds(e.target.value)}
            />
          </>
        )}

        <label>Number of Posts</label>
        <input
          type="number"
          min="1"
          max="30"
          value={numPosts}
          onChange={(e) => setNumPosts(e.target.value)}
        />

        <div className="buttons">
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Posts"}
          </button>
          <button onClick={handleExport} disabled={!posts.length}>
            Export to Excel
          </button>
        </div>
      </div>

      {/* -------------------- Results Section -------------------- */}
      <div className="results-section">
        <h2>Generated Posts</h2>

        {loading && <div className="spinner"></div>}

        {!loading && posts.length > 0 && (
          <table className="posts-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Headline & Copy</th>
                <th>Hashtags</th>
                <th>Caption</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="post-type">{post.postType}</td>
                  <td>{post.headlineCopy}</td>
                  <td>{post.hashtags}</td>
                  <td>{post.caption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
