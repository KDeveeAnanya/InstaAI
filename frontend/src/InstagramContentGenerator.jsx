import React, { useState, useEffect } from 'react';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const InstagramContentGenerator = () => {
  const [topic, setTopic] = useState('');
  const [numPosts, setNumPosts] = useState(1);
  const [postType, setPostType] = useState('Post');
  const [numSlides, setNumSlides] = useState(1);
  const [numSeconds, setNumSeconds] = useState(15);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postType === 'Post') {
      setNumSlides(1);
    } else if (postType === 'Carousel') {
      setNumSlides(7);
    } else if (postType === 'Reel') {
      setNumSlides(1);
      setNumSeconds(15);
    }
  }, [postType]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic.');
      return;
    }

    setLoading(true);
    const payload = { topic, numPosts, postType, numSlides, numSeconds };

    try {
      const response = await fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setGeneratedPosts(data);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    fetch(`${BASE_URL}/api/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generatedPosts),
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'generated_posts.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        console.error('Error exporting data:', err);
      });
  };

  const handleClear = () => {
    setTopic('');
    setNumPosts(1);
    setPostType('Post');
    setNumSlides(1);
    setNumSeconds(15);
    setGeneratedPosts([]);
  };

  return (
    <div className="max-w-6xl mx-auto bg-black border border-gray-800 p-8 rounded-2xl shadow-lg text-white">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">Instagram Content Generator</h1>

      <div className="grid gap-6 mb-10">
        <div>
          <label className="block text-white mb-1">Topic</label>
          <input
            type="text"
            className="w-full p-3 bg-dark border border-gray-700 rounded-xl text-white"
            placeholder="e.g. Digital Marketing"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-white mb-1">Number of Posts</label>
          <input
            type="number"
            min={1}
            max={5}
            className="w-full p-3 bg-dark border border-gray-700 rounded-xl text-white"
            value={numPosts}
            onChange={(e) => setNumPosts(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-white mb-1">Type of Post</label>
          <select
            className="w-full p-3 bg-dark border border-gray-700 rounded-xl text-white"
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
          >
            <option>Post</option>
            <option>Carousel</option>
            <option>Reel</option>
          </select>
        </div>

        {(postType === 'Carousel') && (
          <div>
            <label className="block text-white mb-1">Number of Slides</label>
            <input
              type="number"
              min={1}
              max={15}
              className="w-full p-3 bg-dark border border-gray-700 rounded-xl text-white"
              value={numSlides}
              onChange={(e) => setNumSlides(Number(e.target.value))}
            />
          </div>
        )}

        {(postType === 'Reel') && (
          <div>
            <label className="block text-white mb-1">Duration (Seconds)</label>
            <input
              type="number"
              min={5}
              max={90}
              className="w-full p-3 bg-dark border border-gray-700 rounded-xl text-white"
              value={numSeconds}
              onChange={(e) => setNumSeconds(Number(e.target.value))}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-4">
          <button
            className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-all duration-300"
            onClick={handleGenerate}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Generating...
              </div>
            ) : (
              'Generate'
            )}
          </button>

          <button
            className="flex-1 bg-mintGreen hover:bg-green-500 text-black font-bold py-3 rounded-2xl transition-all duration-300"
            onClick={handleExport}
            disabled={generatedPosts.length === 0}
          >
            Convert to Excel Sheet
          </button>

          <button
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-2xl transition-all duration-300"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>

      {generatedPosts.length > 0 && (
        <div className="mt-10 overflow-x-auto">
          <h2 className="text-2xl font-semibold text-primary mb-4">Generated Posts</h2>
          <table className="min-w-full text-left border border-gray-700">
            <thead>
              <tr className="bg-dark text-coolGrey">
                <th className="p-3 border border-gray-700">#</th>
                <th className="p-3 border border-gray-700">Type</th>
                <th className="p-3 border border-gray-700">Headline & Copy</th>
                <th className="p-3 border border-gray-700">Hashtags</th>
                <th className="p-3 border border-gray-700">Caption</th>
              </tr>
            </thead>
            <tbody>
              {generatedPosts.map((post, index) => (
                <tr
                  key={index}
                  className={`text-white ${index % 2 === 0 ? 'bg-gray-900' : 'bg-black'}`}
                >
                  <td className="p-3 border border-gray-700">{index + 1}</td>
                  <td className="p-3 border border-gray-700 capitalize">{post.postType}</td>
                  <td className="p-3 border border-gray-700 whitespace-pre-line">{post.headlineCopy || '—'}</td>
                  <td className="p-3 border border-gray-700">{post.hashtags || '—'}</td>
                  <td className="p-3 border border-gray-700 whitespace-pre-line">{post.caption || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InstagramContentGenerator;
