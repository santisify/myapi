const OpenAI = require("openai");
const sharp = require('sharp');
const axios = require('axios');

// 初始化 OpenAI 客户端
const client = new OpenAI({
    apiKey: process.env.KIMI_APIKEY,
    baseURL: "https://api.moonshot.cn/v1",
});

/**
 * 生成图片描述
 * @param {string} imgUrl - 图片的 URL
 * @returns {string} - 生成的图片描述
 */
async function generateImageDescription(imgUrl) {
    try {
        // 下载图片
        const response = await axios.get(imgUrl, {responseType: 'arraybuffer'});
        const buffer = Buffer.from(response.data, 'binary');

        // 使用 sharp 将 .webp 图片转换为 JPEG 格式
        const jpegBuffer = await sharp(buffer)
            .jpeg() // 转换为 JPEG 格式
            .toBuffer();

        // 将图片转换为 Base64
        const base64Image = `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;

        // 调用 Kimi API 生成描述
        const completion = await client.chat.completions.create({
            model: "kimi-latest", // 确保使用支持图片输入的模型
            messages: [
                {
                    role: "user",
                    content: [
                        {type: "text", text: "请用一段话描述以下图片"},
                        {type: "image_url", image_url: base64Image}
                    ]
                }
            ],
            temperature: 0.3,
            response_format: {type: "json_object"}
        });
        // return completion.choices[0].message.content;
        // 返回生成的描述
        return JSON.parse(completion.choices[0].message.content);
    } catch (err) {
        console.error("Error generating image description:", err);
        throw new Error("Failed to generate image description.");
    }
}

module.exports = {generateImageDescription};