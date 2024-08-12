document.addEventListener("DOMContentLoaded", () => {
  getData();
  document.getElementById("post-form").addEventListener("submit", createPost);
});

async function getData() {
  renderLoadingState();
  try {
      const [PostResponse, UserResponse] = await Promise.all([
          fetch("http://localhost:3004/posts"),
          fetch("http://localhost:3004/users")
      ]);

      if (!PostResponse.ok || !UserResponse.ok) {
          throw new Error("Network response was not ok");
      }

      const posts = await PostResponse.json();
      const users = await UserResponse.json();

      const data = posts.map(post => {
          const user = users.find(u => u.id === post.userId.toString());
          return {
              ...post,
              userName: user ? user.name : "Unknown"
          };
      });

      renderData(data);
  } catch (error) {
      renderErrorState();
  }
}

function renderErrorState() {
  const container = document.getElementById("posts-container");
  container.innerHTML = "<p>Failed to load data</p>";
}

function renderLoadingState() {
  const container = document.getElementById("posts-container");
  container.innerHTML = "<p>Loading...</p>";
}

function renderData(data) {
  const container = document.getElementById("posts-container");
  container.innerHTML = "";

  data.sort((a, b) => (b.isUserCreated ? 1 : 0) - (a.isUserCreated ? 1 : 0));

  if (data.length > 0) {
      data.forEach((item) => {
          const div = document.createElement("div");
          div.className = "post-item";

          const title = document.createElement("h2");
          title.textContent = `${item.title} (by ${item.userName})`;

          const body = document.createElement("p");
          body.textContent = item.body;

          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.className = "delete-button"
          deleteButton.addEventListener("click", () => deletePost(item.id));

          div.appendChild(title);
          div.appendChild(body);
          div.appendChild(deleteButton);
          container.appendChild(div);
      });
  }
}

async function createPost(event) {
  event.preventDefault();
  
  const userId = document.getElementById("user-id").value;
  const title = document.getElementById("title").value;
  const body = document.getElementById("body").value;

  try {
      const response = await fetch("http://localhost:3004/posts", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId, title: title, body: body, isUserCreated: true })
      });

      if (!response.ok) {
          throw new Error("Failed to create post");
      }

      getData(); 
  } catch (error) {
      console.error(error);
  }
}

async function deletePost(postId) {
  try {
      const response = await fetch(`http://localhost:3004/posts/${postId}`, {
          method: "DELETE"
      });

      if (!response.ok) {
          throw new Error("Failed to delete post");
      }

      getData(); 
  } catch (error) {
      console.error(error);
  }
}