require("dotenv").config();
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const password = process.argv[2];
const url = `mongodb+srv://chloe:${password}@cluster0.q6jph.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(url)

  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    min: 8,
    validate: {
      validator: function (v) {
        return /\d{2,3}-\d{6,999}/.test(v);
      },
    },
    required: true,
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
