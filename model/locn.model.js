const mongoose = require("mongoose");
const LocnSchema = mongoose.Schema(
  {
    locn_name: {
      type: String,
      required: true,
    },
    locn_temp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Locn = mongoose.model("location", LocnSchema);
module.exports = Locn;
