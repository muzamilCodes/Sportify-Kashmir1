
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";

const SinglePost = () => {
  const [post, setPost] = useState({});

  const { postId } = useParams();

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(`/post/${postId}`);

        if (res.status === 200) {
          setPost(res.data.post);
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
    })();
    
  }, [postId]);

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-6">
          <img src={post.postImgUrl} width={500} alt="broken" />
        </div>

        <div className="col-6">
          <h2> {post.postTitle} </h2>

          <p dangerouslySetInnerHTML={{ __html: post.postDesc }} />
        </div>
      </div>
    </div>
  );
};

export default SinglePost;
