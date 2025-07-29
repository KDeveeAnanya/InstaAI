import React, { useState, useEffect } from "react";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const InstagramContentGenerator = () => {
  const [topic, setTopic] = useState("");
  const [numPosts, setNumPosts] = useState(1);
  const [postType, setPostType] = useState("Post");
  const [numSlides, setNumSlides] = useState(1);
  const [numSeconds, setNumSeconds] = useState(15);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (postType === "Post") setNumSlides(1);
    if (postType === "Carousel") setNumSlides(7);
    if (postType === "Reel") {
      setNumSlides(1);
      setNumSeconds(15);
    }
  }, [postType]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, numPosts, postType, numSlides, numSeconds }),
      });
      const data = await response.json();
      setGeneratedPosts(data);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedPosts),
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "generated_posts.xlsx";
      link.click();
    } catch (err) {
      console.error("Error exporting data:", err);
    }
  };

  const handleClear = () => {
    setTopic("");
    setNumPosts(1);
    setPostType("Post");
    setNumSlides(1);
    setNumSeconds(15);
    setGeneratedPosts([]);
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className={`${darkMode ? "bg-black text-white" : "bg-gray-100 text-black"} min-h-screen p-8`}>
      <div className="max-w-6xl mx-auto border border-gray-300 p-8 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center flex-1">Instagram Content Generator</h1>
          <button
            className="ml-4 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition"
            onClick={toggleTheme}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Form Section */}
        <div className="grid gap-6 mb-10">
          <div>
            <label className="block mb-1">Topic</label>
            <input
              type="text"
              className={`w-full p-3 rounded-xl border ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300"}`}
              placeholder="e.g. Digital Marketing"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1">Number of Posts</label>
            <input
              type="number"
              min={1}
              max={5}
              className={`w-full p-3 rounded-xl border ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300"}`}
              value={numPosts}
              onChange={(e) => setNumPosts(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block mb-1">Type of Post</label>
            <select
              className={`w-full p-3 rounded-xl border ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300"}`}
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
            >
              <option>Post</option>
              <option>Carousel</option>
              <option>Reel</option>
            </select>
          </div>

          {postType === "Carousel" && (
            <div>
              <label className="block mb-1">Number of Slides</label>
              <input
                type="number"
                min={1}
                max={15}
                className={`w-full p-3 rounded-xl border ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                value={numSlides}
                onChange={(e) => setNumSlides(Number(e.target.value))}
              />
            </div>
          )}

          {postType === "Reel" && (
            <div>
              <label className="block mb-1">Duration (Seconds)</label>
              <input
                type="number"
                min={5}
                max={90}
                className={`w-full p-3 rounded-xl border ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                value={numSeconds}
                onChange={(e) => setNumSeconds(Number(e.target.value))}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-4">
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl transition-all"
              onClick={handleGenerate}
            >
              {loading ? "Generating..." : "Generate"}
            </button>

            <button
              className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-2xl transition-all"
              onClick={handleExport}
              disabled={generatedPosts.length === 0}
            >
              Convert to Excel Sheet
            </button>

            <button
              className="flex-1 bg-gray-500 hover:bg-gray-400 text-white font-bold py-3 rounded-2xl transition-all"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Generated Posts */}
        {generatedPosts.length > 0 && (
          <div className="mt-10 overflow-x-auto">
            <h2 className="text-2xl font-semibold mb-4">Generated Posts</h2>
            <table className={`min-w-full text-left border ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
              <thead>
                <tr className={darkMode ? "bg-gray-800" : "bg-gray-200"}>
                  <th className="p-3 border">#</th>
                  <th className="p-3 border">Type</th>
                  <th className="p-3 border">Headline & Copy</th>
                  <th className="p-3 border">Hashtags</th>
                  <th className="p-3 border">Caption</th>
                </tr>
              </thead>
              <tbody>
                {generatedPosts.map((post, index) => (
                  <tr
                    key={index}
                    className={`${darkMode ? (index % 2 === 0 ? "bg-gray-900" : "bg-black") : (index % 2 === 0 ? "bg-gray-50" : "bg-white")}`}
                  >
                    <td className="p-3 border">{index + 1}</td>
                    <td className="p-3 border capitalize">{post.postType}</td>
                    <td className="p-3 border whitespace-pre-line">{post.headlineCopy || "—"}</td>
                    <td className="p-3 border">{post.hashtags || "—"}</td>
                    <td className="p-3 border whitespace-pre-line">{post.caption || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramContentGenerator;
