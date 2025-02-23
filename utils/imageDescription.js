const OpenAI = require("openai");
const {Image} = require('canvas'); // 使用 canvas 的 Image 对象
const axios = require('axios');

// 初始化 OpenAI 客户端
const client = new OpenAI({
    apiKey: "sk-CJaY1KHK8iRL7XJfOhdchfAdW0hfejGsygEKa6YsHf6KcGx7", // 替换为你的 Kimi API Key
    baseURL: "https://api.moonshot.cn/v1",
});

/**
 * 生成图片描述
 * @param {string} imgUrl - 图片的 URL
 * @returns {string} - 生成的图片描述
 */
async function generateImageDescription(imgUrl) {
    try {
        // 加载图片
        const img = new Image();
        img.src = imgUrl;

        // 等待图片加载完成
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        // 将图片转换为 Base64
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const base64Image = canvas.toDataURL('image/jpeg');

        // 调用 Kimi API 生成描述
        const completion = await client.chat.completions.create({
            model: "moonshot-v1-8k",
            messages: [
                {
                    role: "system",
                    content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。"
                },
                {
                    role: "user",
                    content: [
                        {type: "text", text: "请描述以下图片的内容："},
                        {type: "image_url", image_url: base64Image}
                    ]
                }
            ],
            temperature: 0.3,
        });

        // 返回生成的描述
        return completion.choices[0].message.content;
    } catch (err) {
        console.error("Error generating image description:", err);
        throw new Error("Failed to generate image description.");
    }
}
