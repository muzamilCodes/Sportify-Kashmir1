import React, { useState } from "react";
import { toast } from "react-toastify";
import FroalaEditorComponent from "react-froala-wysiwyg";
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import { axiosInstance } from "../../utils/axiosInstance";


const UploadPost = () => {
  // form hooks

  const [postTitle, setPostTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [image, setImage] = useState(null);

  const [loading , setloading] = useState(false)

  const handleImage = (e) => {
    const file = e.target.files[0]; // extraction of file

    const reader = new FileReader(); // intializing  instance of file reader so taht all methods will avilable in the reader

    reader.readAsDataURL(file); // conversion to base 64 url  FroalaEditorComponent ///  image url ka type hai

    reader.onload = () => {
      if (reader.readyState === 2) {
        setImage(reader.result);
      }
    };

    // setImage(e.target.files[0])
  };

  // const formData = {postTitle ,  shortDesc ,  postDesc , image}

  const formData = new FormData();

  formData.append("postTitle", postTitle);
  formData.append("shortDesc", shortDesc);
  formData.append("postDesc", postDesc);
  formData.append("image", image);

  const uploadPost = async (e) => {
    e.preventDefault();
    try {
      // axios call     //localhost:4000/add/post
      setloading(true)
 

      //  i can done front end validation 
      let res   // defining variable 

      if(image !== null){
         res = await axiosInstance.post(`/post/add`,formData );

        if (res.status === 201) {
          setloading(false)
          toast.success(res.data.message);
        } else {
          toast.error("Something Went Wrong!");
        }
      }
      else{
        toast.error("Image is missing")
        setloading(false)
      }
    
    } catch (error) {
       if (error.response) {
              if ([400, 401, 403, 500].includes(error.response.status)) {
                toast.error(error.response.data.message);
              }
            } else {
              toast.error("Network Error!");
            }

      setloading(false)
      console.error(error);
    }
  };

  return (
    <div className="mt-3">
      <form>
        <input
          placeholder="Title"
          type="text"
          value={postTitle}
          className="form-control mb-3"
          onChange={(e) => {
            setPostTitle(e.target.value);
          }}
        />

        <input
          placeholder="Short Description"
          type="text"
          value={shortDesc}
          className="form-control mb-3"
          onChange={(e) => {
            setShortDesc(e.target.value);
            }}
          />

          {/* Froala Editor for Description */}
          <div className="mb-3">
            <FroalaEditorComponent
            tag='textarea'
            model={postDesc}
            onModelChange={setPostDesc}   // 
            config={{
              placeholderText: "Description in 1000 words",
              charCounterMax: 1000,
              heightMin: 150,
            }}
            />
          </div>

          <input
            placeholder="Select Image"
            type="file"
            className="form-control"
            onChange={(e) => {
            handleImage(e);
          }}
        />

        <img src={image} alt="Image-Upload" width={200} />

        <button
          onClick={(e) => {
            uploadPost(e);
          }}
          className="btn btn-outline-success mt-3"
        >
          
          {loading ? "Uploading....." :   " Post Upload"}
        </button>
      </form>
    </div>
  );
};

export default UploadPost;
