const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { alldown } = require("rx-dawonload");

module.exports.config = {
    name: "autodl",
    version: "2.2.0",
    credits: "rX | 𝗺𝗼𝗱𝗶𝗳𝘆 𝗯𝘆 𝗯𝗯𝘇",
    hasPermission: 0,
    description: "Auto download any supported link",
    usePrefix: false,
    commandCategory: "utility",
    usages: "",
    cooldowns: 2
};

module.exports.run = async function () {};

// -------------------------
// 🔥 Auto Detect + Auto Download
// -------------------------
module.exports.handleEvent = async function ({ api, event }) {
    try {
        const content = event.body ? event.body.trim() : "";
        if (!content.startsWith("http")) return;

        // Detect Platform
        let site = "Unknown";
        if (content.includes("youtube.com") || content.includes("youtu.be")) site = "YouTube";
        else if (content.includes("tiktok.com")) site = "TikTok";
        else if (content.includes("instagram.com")) site = "Instagram";
        else if (content.includes("facebook.com")) site = "Facebook";

        // Show downloading message
        const msg = await api.sendMessage("⬇️ Downloading...", event.threadID);

        // Download using alldown
        const data = await alldown(content);
        if (!data || !data.url) {
            api.sendMessage("❌ Failed to fetch download link!", event.threadID);
            return;
        }

        const title = data.title || "video";
        const dlUrl = data.url;

        // Download buffer
        const buffer = (await axios.get(dlUrl, { responseType: "arraybuffer" })).data;
        const safeTitle = title.replace(/[^\w\s]/gi, "_");
        const filePath = path.join(__dirname, "cache", `${safeTitle}.mp4`);
        fs.writeFileSync(filePath, buffer);

        // Send video
        api.sendMessage(
            {
                body: `🎀 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗿𝗱 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲!\n📍 Platform: ${site}\n🎬 Title: ${title}`,
                attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => {
                fs.unlinkSync(filePath);
                api.unsendMessage(msg.messageID);
            }
        );

    } catch (e) {
        console.log("autodl error:", e);
        api.sendMessage("❌ Download failed!", event.threadID);
    }
};
