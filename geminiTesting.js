const { GoogleGenerativeAI } = import("@google/generative-ai");

const genAI = GoogleGenerativeAI("AIzaSyDMxb7QU1OXDvhnn0GSI2OgbnhaGnc_hTQ");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Explain how AI works";

const result = await model.generateContent(prompt);
console.log(result.response.text());
