const BASE_URL = "http://localhost:5000/api"; // Flask backend

export async function generatePosts(payload) {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

export async function exportToExcel(posts) {
  const response = await fetch(`${BASE_URL}/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(posts),
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "generated_posts.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
}
