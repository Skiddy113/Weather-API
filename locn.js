const Locn = require("./model/locn.model.js");
const axios = require("axios");
const express = require("express");
const router = express.Router();

// Basic start page info
router.get(`/`, (req, res) => {
  res.send("Users & Location Temperature");
});

// Route to get all locations (with or without search query)
router.get("/weather/locn", async (req, res) => {
  try {
    const query = req.query.q;
    let locn;
    if (query) {
      locn = await Locn.find({
        $or: [
          { locn_name: { $regex: query, $options: "i" } },
          { locn_temp: { $regex: query, $options: "i" } },
        ],
      });
    } else {
      locn = await Locn.find({});
    }
    res.status(200).json(locn);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Route to get a specific location by ID
router.get("/weather/locn/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const locn = await Locn.findById(id);
    res.status(200).json(locn);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// // Route to add a new locn in location
// router.post("/weather/locn", async (req, res) => {
//   try {
//     const existingLocn = await Locn.findOne({ locn_name: req.body.locn_name });
//     if (!existingLocn) {
//       const locn = await Locn.create(req.body);
//       return res.status(200).json(locn);
//     }
//     return res.status(400).send("Location already exists.");
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.message });
//   }
// });

//weather app data access & storing in db location using axios
router.post("/weather/resource", async (req, res) => {
  try {
    // Extract the location query from the request body
    const { location } = req.body;
    // Check if the location query is provided
    if (!location) {
      return res.status(400).json({ error: "Location query is required" });
    }
    // Make the request to the weather API with the provided location query
    const response = await axios.get(
      `http://api.weatherapi.com/v1/current.json?key=8b59c756a5a4430ea61171734242804&q=${encodeURIComponent(
        location
      )}`
    );
    // Extract relevant data from the API response
    const apiData = response.data;
    const processedData = {
      locn_name: apiData.location.name,
      locn_temp: apiData.current.temp_c,
    };
    //process data to get required details and store it in db
    const newData = new Locn(processedData);
    await newData.save();
    res.json(newData);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
});

// Route to update a location
router.patch("/weather/locn/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const locn = await Locn.findByIdAndUpdate(id, {
      locn_name: req.body.locn_name,
      locn_temp: req.body.locn_temp,
    });
    if (!locn) {
      console.log(error);
      return res.status(404).json({ message: "Location not found" });
    }
    const updatedLocn = await Locn.findById(id);
    res.status(200).json(updatedLocn);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Route to delete an location
router.delete("/weather/locn/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(404).json({ message: "Location id not found" });
    const locn = await Locn.findByIdAndDelete(id);
    if (!locn) return res.status(404).json({ message: "Location not found" });
    res.status(200).json({ message: "Location deleted", locn });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
