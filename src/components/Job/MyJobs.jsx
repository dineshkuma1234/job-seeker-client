import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { Context } from "../../main";
import { useNavigate } from "react-router-dom";

const MyJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMode, setEditingMode] = useState(null);
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/jobs/myJobs", { withCredentials: true });
        setMyJobs(data.myJobs);
      } catch (error) {
        const message = error.response?.data?.message || "Error fetching jobs";
        toast.error(message);
        setMyJobs([]);
      } finally {
        setLoading(false); 
      }
    };

    if (isAuthorized && user?.role === "Employer") {
      fetchJobs();
    } else if (!isAuthorized) {
      setLoading(false); 
    } else {
      navigateTo("/");
    }
  }, [isAuthorized, user, navigateTo]);

  if (loading) {
    return <p>Loading...</p>; 
  }

  const handleEnableEdit = (jobId) => setEditingMode(jobId);
  const handleDisableEdit = () => setEditingMode(null);

  const handleUpdateJob = async (jobId) => {
    const updatedJob = myJobs.find((job) => job._id === jobId);
    try {
      const { data } = await axios.put(`http://localhost:4000/api/jobs/update/${jobId}`, updatedJob, { withCredentials: true });
      toast.success(data.message);
      setEditingMode(null);
    } catch (error) {
      const message = error.response?.data?.message || "Error updating job";
      toast.error(message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const { data } = await axios.delete(`http://localhost:4000/api/jobs/delete/${jobId}`, { withCredentials: true });
      toast.success(data.message);
      setMyJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
    } catch (error) {
      const message = error.response?.data?.message || "Error deleting job";
      toast.error(message);
    }
  };

  const handleInputChange = (jobId, field, value) => {
    setMyJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === jobId ? { ...job, [field]: value } : job
      )
    );
  };

  const renderJobCard = (element) => (
    <div className="card" key={element._id}>
      <div className="content">
        <div className="short_fields">
          {["title", "country", "city"].map((field) => (
            <div key={field}>
              <span>{`${field.charAt(0).toUpperCase() + field.slice(1)}:`}</span>
              <input
                type="text"
                disabled={editingMode !== element._id}
                value={element[field] || ''}
                onChange={(e) => handleInputChange(element._id, field, e.target.value)}
              />
            </div>
          ))}
          <div>
            <span>Category:</span>
            <select
              value={element.category || ''}
              onChange={(e) => handleInputChange(element._id, "category", e.target.value)}
              disabled={editingMode !== element._id}
            >
              <option value="">Select Category</option>
              <option value="Graphics & Design">Graphics & Design</option>
              <option value="Mobile App Development">Mobile App Development</option>
              <option value="Frontend Web Development">Frontend Web Development</option>
              <option value="MERN Stack Development">MERN Stack Development</option>
              <option value="Account & Finance">Account & Finance</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Video Animation">Video Animation</option>
              <option value="MEAN Stack Development">MEAN Stack Development</option>
              <option value="MEVN Stack Development">MEVN Stack Development</option>
              <option value="Data Entry Operator">Data Entry Operator</option>
            </select>
          </div>
          <div>
            <span>Salary:</span>
            {element.fixedSalary ? (
              <input
                type="number"
                disabled={editingMode !== element._id}
                value={element.fixedSalary || ''}
                onChange={(e) => handleInputChange(element._id, "fixedSalary", e.target.value)}
              />
            ) : (
              <div>
                <input
                  type="number"
                  disabled={editingMode !== element._id}
                  value={element.salaryFrom || ''}
                  onChange={(e) => handleInputChange(element._id, "salaryFrom", e.target.value)}
                />
                <input
                  type="number"
                  disabled={editingMode !== element._id}
                  value={element.salaryTo || ''}
                  onChange={(e) => handleInputChange(element._id, "salaryTo", e.target.value)}
                />
              </div>
            )}
          </div>
          <div>
            <span>Expired:</span>
            <select
               value={element.expired}
               onChange={(e) =>
                 handleInputChange(
                   element._id,
                   "expired",
                   e.target.value
                 )
               }
               disabled={editingMode !== element._id}
            >
              <option value={true}>TRUE</option>
              <option value={false}>FALSE</option>
            </select>
          </div>
        </div>
        <div className="long_field">
          <div>
            <span>Description:</span>
            <textarea
              rows={5}
              value={element.description || ''}
              disabled={editingMode !== element._id}
              onChange={(e) => handleInputChange(element._id, "description", e.target.value)}
            />
          </div>
          <div>
            <span>Location:</span>
            <textarea
              value={element.location || ''}
              rows={5}
              disabled={editingMode !== element._id}
              onChange={(e) => handleInputChange(element._id, "location", e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="button_wrapper">
        <div className="edit_btn_wrapper">
          {editingMode === element._id ? (
            <>
              <button
                onClick={() => handleUpdateJob(element._id)}
                className="check_btn"
              >
                <FaCheck />
              </button>
              <button
                onClick={handleDisableEdit}
                className="cross_btn"
              >
                <RxCross2 />
              </button>
            </>
          ) : (
            <button
              onClick={() => handleEnableEdit(element._id)}
              className="edit_btn"
            >
              Edit
            </button>
          )}
        </div>
        <button
          onClick={() => handleDeleteJob(element._id)}
          className="delete_btn"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="myJobs page">
      <div className="container">
        <h1>Your Posted Jobs</h1>
        {myJobs.length > 0 ? (
          <div className="banner">
            {myJobs.map(renderJobCard)}
          </div>
        ) : (
          <p>You've not posted any jobs or maybe you deleted all of your jobs!</p>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
