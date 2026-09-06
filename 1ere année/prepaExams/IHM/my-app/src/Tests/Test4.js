import { useEffect, useState } from "react";
const Test4 = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/posts?_limit=10"
        );
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div>
      <h1>Articles</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Test4;
