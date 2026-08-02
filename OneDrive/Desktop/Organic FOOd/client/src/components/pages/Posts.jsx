
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";

const Posts = () => {

  const [posts, setposts] = useState([]);

  // retrive data from database
  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get("/post/getAll");

      if (res.status === 200) {
        setposts(res.data.posts);
      }
    } catch (error) {
      if (error.response) {
        if ([400, 401, 403, 500, 404].includes(error.response.status)) {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error("Network Error!");
      }

      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      <p style={{textAlign :"center" , paddingTop : "20px"}} > {posts.length} posts found! </p>

      <div className="posts_container">
        {posts.map((post) => (
          <div key={post._id} className="single_post" >
         
    
            <img src= {post.postImgUrl} alt="broken" width={400}/>
            <h4> {post.postTitle} </h4>
            <p> {post.shortDesc} </p>

        
            <Link to={`/posts/${post._id}`} className="btn btn-success"> ReadMore ...</Link>
          </div>
        ))}
      </div>
    </>
  );
};

export default Posts;
