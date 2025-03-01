const OpenAI = require("openai");
const sharp = require('sharp');
const axios = require('axios');

const system_prompt = `
用户提供base64格式的图片，描述这个图片
"
请使用如下 JSON 格式输出你的回复： 
{
    "text": "文字信息",
    "image": "图片地址",
}
"
注意，请将文字信息放置在 'text' 字段中，将图片以 oss:// 开头的链接形式放在 'image' 字段中，将普通链接放置在 'url' 字段中。
`

// 初始化 OpenAI 客户端
const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_APIKEY, baseURL: "https://api.deepseek.com/v1",
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
        const user_prompt = `用一段话描述图片 ${base64Image}`;
        const completion = await client.chat.completions.create({
            model: "deepseek-chat", // 确保使用支持图片输入的模型
            messages: [{
                role: "system", content: system_prompt
            }, {
                role: "user", content: user_prompt
            }], temperature: 0.3, response_format: {type: "json_object"}
        });
        // 返回生成的描述
        return JSON.parse(completion.choices[0].message.content);
    } catch (err) {
        console.error("Error generating image description:", err);
        throw new Error("Failed to generate image description.");
    }
}

module.exports = {generateImageDescription};