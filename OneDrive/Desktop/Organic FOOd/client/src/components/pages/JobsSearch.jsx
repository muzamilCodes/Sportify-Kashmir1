import React, { useState } from "react";
import axios from "axios";

const JobsSearch = () => {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);

  const handleSearch = async () => {
    try {
      const options = {
        method: "GET",
        url: "https://jsearch.p.rapidapi.com/search",
        params: {
          query: search,
          page: "1",
          num_pages: "1",
          country: "IN",
          date_posted: "all",
        },
        headers: {
          "x-rapidapi-key":
            "79bd850338msh2791f9644fac656p197751jsnac6970a86c03",
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
        },
      };
      if (search !== "") {
        const response = await axios.request(options);
     
        if (response.status === 200) {
          setJobs(response.data.data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-center align-items-center mt-4">
        <input
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          placeholder="search for latest jobs in india "
          className="form-control "
          value={search}
        />

        <button
          onClick={handleSearch}
          className="btn  btn-outline-success ms-2"
        >
          Search
        </button>
      </div>

      {jobs.length > 0 ? (
        jobs.map((job) => (
          <div className="mt-5">
            <h3> {job.job_title} </h3>

            <p className="m-0"> Company : {job.employer_name} </p>
            <p className="m-0"> Location : {job.job_location}       <span className="text-muted ms-3" > {job.job_is_remote  ? "Remote" : "In Office "} </span> </p>

              <p> Salary : {job.job_salary ?  job.job_salary : "negotiable"} </p>  

            <h4 className="mt-3"> Job Description  </h4>
            <p className="text-muted">  {job.job_description}</p>

            <button className="btn btn-outline-success">    {job.is_direct ? "Apply" :  "Go To Employer's Webite"} </button>
           
          </div>
        ))
      ) : (
        <div
          style={{ minHeight: "90vh" }}
          className="d-flex justify-content-center align-items-center"
        >
        
          No Jobs Found!
        </div>
      )}
    </div>
  );
};

export default JobsSearch;
