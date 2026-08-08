import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with the key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const extractTimetableFromImage = async (base64Image, mimeType) => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  try {
    // Use the recommended model for general text/vision tasks
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are an expert data extraction AI. I am providing you with an image of a student's college weekly timetable.
      Your job is to extract the schedule and format it EXACTLY as a JSON object, where the keys are the days of the week (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday) and the values are arrays of strings representing the subject names in chronological order.
      
      Rules:
      1. ONLY output valid JSON. Do not include markdown formatting like \`\`\`json or \`\`\`.
      2. Ignore times, professor names, or room numbers. ONLY extract the subject/course name.
      3. If a day has no classes, do not include it as a key, or set its value to an empty array.
      4. If a class spans multiple slots, only list it once for that continuous block.
      
      Example output format:
      {
        "Monday": ["Engineering Science", "C Programming Lab"],
        "Tuesday": ["Mathematics", "Communication Skills"]
      }
    `;

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    let text = response.text();
    console.log("Raw AI Output:", text); // Helpful for debugging what Gemini actually returned
    
    // Clean up the text in case the LLM included markdown blocks despite instructions
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error in AI Agent:", error);
    // Return the actual error message so we can diagnose if it's an API key issue, network issue, or parsing issue
    throw new Error(`AI Agent Error: ${error.message}`);
  }
};
