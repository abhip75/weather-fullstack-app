import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "./NavBar";
import { IoRainyOutline, IoPartlySunnyOutline } from "react-icons/io5";
import { BsCloudSnow } from "react-icons/bs";
import { WiDayCloudyWindy } from "react-icons/wi";
import { FaCloudSun, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
const weatherIcons = {
  sunny: <IoPartlySunnyOutline />,
  cloudy: <WiDayCloudyWindy />,
  rainy: <IoRainyOutline />,
  snowy: <BsCloudSnow />,
  hot: <IoPartlySunnyOutline />
};

const getWeatherIcon = (conditions = "") => {
  return weatherIcons[conditions.toLowerCase()] || <FaCloudSun />;
};

const Home = () => {
  const [weathers, setWeathers] = useState([]);
  const [error, setError] = useState(null);
  const [newWeather, setNewWeather] = useState({ country: "", temperature: "", conditions: "" });
  

  

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/items");
        setWeathers(response.data);
      } catch (err) {
        console.error('Error fetching weather data:', err.message);
        setError(err.message);
      }
    };
    fetchWeatherData();
  }, [weathers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewWeather({ ...newWeather, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newWeather.country || !newWeather.temperature || !newWeather.conditions) {
      setError("All fields are required");
      return;
    }
    try {
      console.log('Submitting new weather data:', newWeather);
      const response = await axios.post("http://localhost:5000/items", newWeather);
      console.log('New weather data added:', response.data);
      setWeathers([...weathers, response.data]);
      setNewWeather({ country: "", temperature: "", conditions: "" });
      document.getElementById('close-modal-button').click();
    } catch (err) {
      console.error('Error adding weather data:', err.message);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try{
      await axios.delete(`http://localhost:5000/items/${id}`);
      setWeathers(weathers.filter(weather => weather.id !== id));
      toast.success("Weather Deleted", {
        position: "bottom-right",
        autoClose: 3000
    });
    }catch{
      console.error('Error deleting weather data:', error);
      setError(error);
    }
  }

 
  return (
    <>
      <NavBar  />
      <div className="container">
        <h3 className="mt-4">Weather Data</h3>

        <div className="mt-4">
          <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
            Add Weather
          </button>
        </div>

        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Add New Weather Data</h5>
                <button type="button" className="btn-close" id="close-modal-button" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="country"
                      name="country"
                      value={newWeather.country}
                      onChange={handleChange}
                      placeholder="Country"
                      required
                    />
                  </div>
                  <div className="form-group mt-2">
                    <input
                      type="number"
                      className="form-control"
                      id="temperature"
                      name="temperature"
                      value={newWeather.temperature}
                      onChange={handleChange}
                      placeholder="Temperature"
                      required
                    />
                  </div>
                  <div className="form-group mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="conditions"
                      name="conditions"
                      value={newWeather.conditions}
                      onChange={handleChange}
                      placeholder="Conditions"
                      required
                    />
                  </div>
                  <div className="modal-footer mt-4">
                    <button type="submit" className="btn btn-primary">Save changes</button>
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          {weathers.map((weather, key) => (
            <div className="col-md-3" key={key}>
              <div className="card mb-4 ">
                <div className="card-body">
                  <h4 className="card-title">
                    {weather.country}
                      <button className="btn btn-danger float-end btn-sm"><FaTrash onClick={()=> handleDelete(weather.id)}/></button>
                  </h4>
                  <p className="card-text"><strong>Temperature:</strong> {weather.temperature} °C</p>
                  <p className="card-text">
                    <strong>Conditions:</strong> {weather.conditions}
                    <span className="weather-icon"> {getWeatherIcon(weather.conditions)}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
