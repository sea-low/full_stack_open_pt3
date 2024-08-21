const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
// do NOT include password before git add/commit/push!!!!!
const url = `mongodb+srv://chloe:${password}@cluster0.q6jph.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const addressSchema = new mongoose.Schema({
  name: String,
  telephone: String,
});

const Entry = mongoose.model("addresses", addressSchema);

const address = new Entry({
  name: process.argv[3],
  telephone: process.argv[4],
});

Entry.find({}).then((result) => {
  result.forEach((address) => {
    console.log(address);
  });
  mongoose.connection.close();
});
