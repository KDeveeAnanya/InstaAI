import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // Use localhost explicitly for dev


const PostGenerator = () => {
  const [topic, setTopic] = useState('');
  const [numPosts, setNumPosts] = useState(1);
  const [postType, setPostType] = useState('Post');
  const [numSlides, setNumSlides] = useState(7);
  const [numSeconds, setNumSeconds] = useState(15);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    console.log("▶️ handleGenerate triggered");

    const payload = {
      topic,
      numPosts,
      postType,
      ...(postType === 'Post' || postType === 'Carousel' || postType === 'Mixed' ? { numSlides } : {}),
      ...(postType === 'Reel' || postType === 'Mixed' ? { numSeconds } : {}),
    };

    console.log("📦 Payload:", payload);

    setIsGenerating(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/generate`, payload);

      // Normalize response data
      const normalized = (response.data || []).map(post => ({
        ...post,
        headlineCopy: Array.isArray(post.headlineCopy)
          ? post.headlineCopy
          : [String(post.headlineCopy || '')],
        hashtags: Array.isArray(post.hashtags)
          ? post.hashtags
          : String(post.hashtags || '').split(/\s+/).filter(Boolean),
        caption: String(post.caption || ''),
      }));

      setGeneratedPosts(normalized);
      console.log("🐛 DEBUG - Normalized Posts:", normalized);
    } catch (error) {
      console.error("❌ Error generating posts:", error);
      alert('Failed to generate posts. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/export`, generatedPosts, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'generated_posts.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export. Please try again.');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-black text-white">
      <h2 className="text-2xl font-bold mb-4">Instagram Content Generator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-3 bg-dark text-white border rounded-xl"
          />
        </div>

        <div>
          <label className="block mb-1">Number of Posts</label>
          <input
            type="number"
            min="1"
            max="31"
            value={numPosts}
            onChange={(e) => setNumPosts(Math.min(31, Math.max(1, Number(e.target.value))))}
            className="w-full p-3 bg-dark text-white border rounded-xl"
          />
        </div>

        <div>
          <label className="block mb-1">Type of Post</label>
          <select
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
            className="w-full p-3 bg-dark text-white border rounded-xl"
          >
            <option value="Post">Post</option>
            <option value="Carousel">Carousel</option>
            <option value="Reel">Reel</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        {(postType === 'Post' || postType === 'Carousel' || postType === 'Mixed') && (
          <div>
            <label className="block mb-1">Number of Slides</label>
            <input
              type="number"
              min="1"
              value={numSlides}
              onChange={(e) => setNumSlides(Math.max(1, Number(e.target.value)))}
              className="w-full p-3 bg-dark text-white border rounded-xl"
            />
          </div>
        )}

        {(postType === 'Reel' || postType === 'Mixed') && (
          <div>
            <label className="block mb-1">Duration (Seconds)</label>
            <input
              type="number"
              min="5"
              value={numSeconds}
              onChange={(e) => setNumSeconds(Math.max(5, Number(e.target.value)))}
              className="w-full p-3 bg-dark text-white border rounded-xl"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || topic.trim() === ''}
        className={`w-full p-3 font-bold rounded-xl transition-all duration-300 mb-4 ${
          isGenerating || topic.trim() === ''
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary-dark'
        }`}
      >
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>

      <button
        onClick={handleExport}
        className="w-full p-3 bg-mintGreen text-white font-bold rounded-xl transition-all duration-300"
        disabled={generatedPosts.length === 0}
      >
        Export to Excel
      </button>

      {generatedPosts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold">Generated Posts</h3>
          <table className="w-full mt-4 text-left">
            <thead>
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Post Type</th>
                <th className="p-3">Headline/Copy</th>
                <th className="p-3">Hashtags</th>
                <th className="p-3">Caption</th>
              </tr>
            </thead>
            <tbody>
              {generatedPosts.map((post, index) => (
                <tr key={index} className="border-t border-gray-700">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{post.postType}</td>
                  <td className="p-3 whitespace-pre-wrap">
                    {Array.isArray(post.headlineCopy)
                      ? post.headlineCopy.map((line, i) => `Slide ${i + 1}: ${line}`).join('\n')
                      : post.headlineCopy || 'N/A'}
                  </td>
                  <td className="p-3">
                    {Array.isArray(post.hashtags)
                      ? post.hashtags.join(' ')
                      : String(post.hashtags || '—')}
                  </td>
                  <td className="p-3">{post.caption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PostGenerator;
