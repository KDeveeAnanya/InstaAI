const API_BASE_URL = "http://localhost:5000/api"; // Change to your backend URL if deployed

// Generate Instagram content
export async function generatePosts(topic, postType, numPosts, numSlides, numSeconds) {
  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, postType, numPosts, numSlides, numSeconds }),
    });

    if (!response.ok) throw new Error("Failed to generate posts");
    return await response.json();
  } catch (error) {
    console.error("❌ Error generating posts:", error);
    return [];
  }
}

// Export content as Excel
export async function exportPosts(posts) {
  try {
    const response = await fetch(`${API_BASE_URL}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(posts),
    });

    if (!response.ok) throw new Error("Failed to export posts");

    // Download the Excel file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "generated_posts.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("❌ Error exporting posts:", error);
  }
}
