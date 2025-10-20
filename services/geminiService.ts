import { GoogleGenAI, Modality } from "@google/genai";

// Ensure API_KEY is available in the environment variables
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-image';

const handleApiResponse = (response: any): string => {
   // First, check for a simple text response, which indicates a top-level error or refusal.
  if (response.text) {
    const errorMessage = `Generation failed. The model responded with text: "${response.text.substring(0, 150)}..."`;
    console.error(errorMessage, response);
    throw new Error(errorMessage);
  }

  const candidate = response.candidates?.[0];

  if (!candidate) {
    throw new Error("No candidates were returned from the model. The response may have been empty.");
  }

  // Check for safety blocks, a common reason for no image output.
  if (candidate.finishReason === 'SAFETY') {
      const safetyRating = candidate.safetyRatings?.find(r => r.blocked);
      const message = `Generation was blocked for safety reasons (Category: ${safetyRating?.category || 'Unknown'}). Please try a different image or prompt.`;
      console.error(message, candidate.safetyRatings);
      throw new Error(message);
  }

  if (!candidate.content?.parts?.length) {
      console.error("Invalid response structure from Gemini:", JSON.stringify(response, null, 2));
      throw new Error("Invalid response from model: content or parts are missing.");
  }

  // The model should return a single image part.
  const part = candidate.content.parts[0];

  if (part.inlineData) {
    return part.inlineData.data;
  }

  // If we didn't get an image, the model likely responded with text instead.
  if (part.text) {
      const errorMessage = `The model returned a text explanation instead of an image: "${part.text.substring(0, 200)}..."`;
      console.error(errorMessage);
      throw new Error(errorMessage);
  }

  // Fallback for unexpected response structure.
  console.error("Unexpected response structure from Gemini:", JSON.stringify(response, null, 2));
  throw new Error("Could not extract image data from Gemini response. The format was unexpected.");
}

export const generateThumbnail = async (
  base64Image: string,
  mimeType: string,
  title: string,
  thumbnailText: string,
  textStyle: string,
  negativePrompt: string,
  expression: string,
  extraElements: string,
  clothingStyle: string,
  otherPeople: string,
  subjectPosition: string
): Promise<string> => {
  const prompt = `
    You are a world-class YouTube thumbnail designer, an expert in the viral 'MrBeast' style. Your goal is to create an irresistible, high-click-through-rate (CTR) thumbnail from the user's inputs. The output MUST be a 1280x720 JPEG.

    **CRITICAL RULES:**
    1.  **PRESERVE IDENTITY:** The main subject's facial identity and features MUST be preserved perfectly from the original input image. DO NOT change the person's face into someone else.
    2.  **DEFAULT CHARACTER APPEARANCE:** Unless specified otherwise by the user in the "Other People" or "Clothing Style" prompts, any new human characters you generate MUST be depicted realistically and have ebony skin. This is a creative directive for a consistent and specific aesthetic.

    **ANALYSIS:**
    - The video's theme (for context, NOT for text): "${title || 'Not provided'}"
    - The main subject is in the provided image.
    - The specific text to use on the thumbnail is: "${thumbnailText.toUpperCase()}"
    - The desired text style is: "${textStyle}"
    - The desired expression is: "${expression}"
    - Additional elements to include: "${extraElements || 'None'}"
    - Desired clothing style for the main subject: "${clothingStyle || 'Keep original'}"
    - Other people to add to the scene: "${otherPeople || 'None'}"
    - Desired subject position: "${subjectPosition}"
    - **NEGATIVE PROMPT (Elements to AVOID):** "${negativePrompt || 'None'}"

    **EXECUTION STEPS:**

    1.  **SUBJECT MANIPULATION:**
        *   First, perfectly cut out the main subject from their background.
        *   Analyze the subject's face. While keeping the person's identity, **you MUST alter their facial expression.** If the user chose a specific expression ("${expression}"), create a hyper-exaggerated version of that. If they chose 'Default', find the existing emotion and amplify it by 1000%. Wide eyes, open mouth, intense emotion is key.
        *   **Clothing Modification:** If the user specified a clothing style ("${clothingStyle}"), **you MUST change the subject's clothes** to match that description. If not specified, enhance the existing clothes to be more vibrant.
        *   Add a **thick, vibrant white or light-yellow outer glow/stroke** around the cutout subject to make them pop from the background.
        *   Slightly enlarge the subject so they are the clear focal point.
        *   **For Split-screen only:** If the position is 'Split-screen', you will need two versions of the subject: the original one and the fully modified one.

    2.  **BACKGROUND & SCENE CREATION:**
        *   Create a new 1280x720 background.
        *   The background MUST be **thematically related to the video title ("${title}") and the extra elements ("${extraElements}").**
        *   It should be dynamic and eye-catching: think dramatic explosions, showers of money, hyper-saturated landscapes, or vibrant patterns.
        *   If the user requested extra elements like "${extraElements}", seamlessly integrate them into the background scene.
        *   **Adding Other People:** If requested ("${otherPeople}"), add them to the scene as part of the background/midground, not distracting from the main subject. Remember the default appearance rule for any new people.
        *   **For Split-screen only:** The background should also be split. Left side is 'before' (normal), right side is 'after' (chaotic, exciting).

    3.  **COMPOSITION:**
        *   **Positioning is CRITICAL.** You MUST follow: "${subjectPosition}".
        *   **'Center'**: Place the modified subject in the middle.
        *   **'Left' / 'Right'**: Place the modified subject on the specified side.
        *   **'Split-screen'**: Vertical divide. Original subject on the left over 'before' background. Fully modified subject on the right over 'after' background.

    4.  **TEXT PLACEMENT:**
        *   Add ONLY the text: "${thumbnailText.toUpperCase()}"
        *   **You MUST apply the following style based on the user's choice: "${textStyle}".**
        *   **If 'MrBeast':** Use an ultra-bold, condensed sans-serif font (like Impact). The text must be solid white, with a **very thick black outline** and a distinct black drop shadow. It should be slightly rotated for a dynamic feel.
        *   **If 'Neon':** The text should look like a glowing neon sign. Use a bright, saturated color (like electric blue or hot pink), with a noticeable outer glow (bloom effect). The font should be a rounded sans-serif.
        *   **If 'Fiery':** The text must appear to be made of fire. Use vibrant oranges, reds, and yellows. Add embers and heat distortion effects around it. The font should be aggressive and bold.
        *   **If 'Cinematic':** Use a wider, more elegant sans-serif font (like Bebas Neue). The text should have a subtle gradient (e.g., light gray to white) and a soft, dark outer glow for readability. It should be perfectly horizontal.
        *   **If '3D Gold':** Render the text with a realistic, reflective gold material. It must have 3D depth (extrusion) and be lit by a dramatic light source to create highlights and shadows.

    5.  **FINAL MASTERING:**
        *   **Dramatically boost the saturation, contrast, and sharpness of the ENTIRE image.** The final result should look hyper-vivid, almost unreal.
        *   Ensure nothing from the negative prompt ("${negativePrompt}") is present.

    Output ONLY the final 1280x720 JPEG image.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{
        inlineData: { data: base64Image, mimeType: mimeType }
      }, {
        text: prompt
      }],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  return handleApiResponse(response);
};

export const modifyThumbnail = async (
  originalSubjectBase64: string,
  originalMimeType: string,
  thumbnailToModifyBase64: string,
  modificationRequest: string
): Promise<string> => {
    const prompt = `
    You are a world-class YouTube thumbnail editor. Your task is to modify an existing thumbnail based on a user's request. The output MUST be a 1280x720 JPEG.

    **CRITICAL RULE: The main subject's facial identity and features MUST be preserved perfectly. You are given two images: [Image 1] is the original, unmodified subject for face reference. [Image 2] is the thumbnail you need to edit. DO NOT change the person's face from [Image 1].**

    **USER'S MODIFICATION REQUEST:** "${modificationRequest}"

    **EXECUTION STEPS:**

    1.  **Analyze the Request:** Understand what the user wants to change in [Image 2]. This could be the background, text, colors, or adding/removing elements.
    2.  **Analyze the Images:** Use [Image 1] ONLY as a reference to maintain the exact face of the person. Perform all your edits on [Image 2].
    3.  **Execute Modifications:** Apply the user's requested changes to [Image 2]. For example, if they say "change the background to a volcano", replace the background of [Image 2] with a volcano while keeping the edited subject.
    4.  **Preserve the Style:** Maintain the hyper-saturated, high-contrast, 'MrBeast' aesthetic.
    5.  **Final Mastering:** After applying the changes, ensure the entire image is sharp, vibrant, and eye-catching.

    Output ONLY the final, modified 1280x720 JPEG image.
    `;

    const originalSubjectPart = {
      inlineData: { data: originalSubjectBase64, mimeType: originalMimeType }
    };
    const thumbnailToModifyPart = {
      inlineData: { data: thumbnailToModifyBase64, mimeType: 'image/jpeg' }
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [textPart, originalSubjectPart, thumbnailToModifyPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    return handleApiResponse(response);
}