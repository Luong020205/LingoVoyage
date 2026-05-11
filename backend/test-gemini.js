const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyCm7YPImnLg74ISH7f8mXZKfcMieXy1i9M");

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash" });
  try {
    const result = await model.generateContent("Xin chào, bạn là ai?");
    console.log("gemini-3.1-flash SUCCESS:", result.response.text());
  } catch (e) {
    console.log("gemini-3.1-flash FAIL:", e.message);
  }
}
run();
