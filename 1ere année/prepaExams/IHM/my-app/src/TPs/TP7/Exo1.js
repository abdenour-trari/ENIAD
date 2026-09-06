import { useState, useEffect } from "react";

import "./CSS/App.css";

const App = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(
          "https://jsonplaceholder.typicode.com/posts?_limit=10"
        );
        const data = await res.json();
        setPosts(data);
      } catch (err) {}
    };

    fetchPost();
  }, []);
  return (
    <div className="posts-container">
      {posts.map((post) => {
        return (
          <div className="post-card" key={post.id}>
            <h2 className="post-title">{post.title}</h2>
            <p className="post-body">{post.body}</p>
            <div className="button">
              <div className="delete-btn">Delete</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default App;
