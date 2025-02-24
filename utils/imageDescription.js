const OpenAI = require("openai");
const sharp = require('sharp');
const axios = require('axios');

const system_prompt = `
你是月之暗面（Kimi）的智能客服，你负责回答用户提出的各种问题。请参考文档内容回复用户的问题，在一次回复中可以同时包含文字、图片、链接。
"
" 
请使用如下 JSON 格式输出你的回复：
 
{
    "text": "文字信息",
    "image": "图片地址",
    "url": "链接地址"
}
"
注意，请将文字信息放置在 'text' 字段中，将图片以 oss:// 开头的链接形式放在 'image' 字段中，将普通链接放置在 'url' 字段中。
`

// 初始化 OpenAI 客户端
const client = new OpenAI({
    apiKey: process.env.KIMI_APIKEY, baseURL: "https://api.moonshot.cn/v1",
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
            messages: [{
                role: "system",
                content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。"
            }, {
                role: "system", content: system_prompt
            }, {
                role: "user", content: [{
                    type: "text", text: "请用一段话描述以下图片"
                }, {
                    type: "image_url", image_url: base64Image
                }]
            }], temperature: 0.3, response_format: {type: "json_object"}
        });
        // 返回生成的描述
        return JSON.parse(completion.choices[0].message.content).text;
    } catch (err) {
        console.error("Error generating image description:", err);
        throw new Error("Failed to generate image description.");
    }
}

module.exports = {generateImageDescription};