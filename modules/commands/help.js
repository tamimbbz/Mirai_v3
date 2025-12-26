const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "help",
  version: "4.3.0",
  hasPermssion: 0,
  credits: "rX",
  usePrefix: true,
  description: "Paged help menu 2 pages + random GIF attached both pages, auto unsend 15s",
  commandCategory: "system",
  usages: "[command name | page number]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const commandDir = __dirname;
    const files = fs.readdirSync(commandDir).filter(f => f.endsWith(".js"));

    let commands = [];
    for (let file of files) {
      try {
        const cmd = require(path.join(commandDir, file));
        if (!cmd.config) continue;
        commands.push({
          name: cmd.config.name || file.replace(".js", ""),
          category: cmd.config.commandCategory || "Other",
          description: cmd.config.description || "No description available.",
          author: cmd.config.credits || "Unknown",
          version: cmd.config.version || "N/A",
          usages: cmd.config.usages || "No usage info",
          cooldowns: cmd.config.cooldowns || "N/A",
        });
      } catch {}
    }

    // ---------- Command detail ----------
    if (args[0] && isNaN(args[0])) {
      const find = args[0].toLowerCase();
      const cmd = commands.find(c => c.name.toLowerCase() === find);
      if (!cmd)
        return api.sendMessage(`❌ Command "${find}" not found.`, event.threadID, event.messageID);

      let msg = `╭──❏ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗗𝗘𝗧𝗔𝗜𝗟 ❏──╮\n`;
      msg += `│ ✧ Name: ${cmd.name}\n`;
      msg += `│ ✧ Category: ${cmd.category}\n`;
      msg += `│ ✧ Version: ${cmd.version}\n`;
      msg += `│ ✧ Author: ${cmd.author}\n`;
      msg += `│ ✧ Cooldowns: ${cmd.cooldowns}s\n`;
      msg += `╰─────────────────────⭓\n`;
      msg += `📘 Description: ${cmd.description}\n`;
      msg += `📗 Usage: ${global.config.PREFIX}${cmd.name} ${cmd.usages}`;

      return api.sendMessage(msg, event.threadID, (err, info) => {
        if (!err) setTimeout(() => api.unsendMessage(info.messageID), 15000);
      }, event.messageID);
    }

    // ---------- Pagination ----------
    const page = parseInt(args[0]) || 1;
    const commandsPerPage = Math.ceil(commands.length / 2);
    const start = (page - 1) * commandsPerPage;
    const end = start + commandsPerPage;
    const pageCommands = commands.slice(start, end);

    // Group by category
    const categories = {};
    for (let cmd of pageCommands) {
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push(cmd.name);
    }

    let msg = `╭──❏ 𝐀𝐮𝐭𝐨 𝐃𝐞𝐭𝐞𝐜𝐭 𝐇𝐞𝐥𝐩 - Page ${page} ❏──╮\n`;
    msg += `│ ✧ Total Commands: ${commands.length}\n`;
    msg += `│ ✧ Prefix: ${global.config.PREFIX}\n`;
    msg += `╰─────────────────────⭓\n\n`;

    // Category Listing
    for (let [cat, cmds] of Object.entries(categories)) {
      msg += `╭─‣ 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆 : ${cat}\n`;
      for (let i = 0; i < cmds.length; i += 2) {
        const row = [`「${cmds[i]}」`];
        if (cmds[i + 1]) row.push(`✘ 「${cmds[i + 1]}」`);
        msg += `├‣ ${row.join(" ")}\n`;
      }
      msg += `╰────────────◊\n\n`;
    }

    msg += `⭔ Type ${global.config.PREFIX}help [command] to see details\n`;
    msg += `╭─[⋆˚তোমাগো × লাং🎀⋆˚]\n`;
    msg += `╰‣ 𝐀𝐝𝐦𝐢𝐧 : Tamim Bbz\n`;
    msg += `╰‣ 𝐑𝐢𝐩𝐨𝐫𝐭 : /callad (yourmsg)\n`;
    msg += `╰‣ 𝐓𝐲𝐩𝐞 /help2 𝐭𝐨 𝐬𝐞𝐞 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞\n`;
    // Attach random GIF for both pages
    let attachment = null;
    const cache = path.join(__dirname, "noprefix");
    if (fs.existsSync(cache)) {
      const names = ["abdullah1", "abdullah2", "abdullah3"];
      const exts = [".gif", ".mp4", ".webp", ".png", ".jpg"];
      let found = [];

      fs.readdirSync(cache).forEach(file => {
        const lower = file.toLowerCase();
        if (names.some(n => lower.startsWith(n))) {
          if (exts.includes(path.extname(lower)))
            found.push(path.join(cache, file));
        }
      });

      if (found.length > 0) {
        const pick = found[Math.floor(Math.random() * found.length)];
        attachment = fs.createReadStream(pick);
      }
    }

    api.sendMessage({ body: msg, attachment: attachment }, event.threadID, (err, info) => {
      if (!err) setTimeout(() => { try { api.unsendMessage(info.messageID); } catch {} }, 15000);
    }, event.messageID);

  } catch (err) {
    api.sendMessage("❌ Error: " + err.message, event.threadID, event.messageID);
  }
};
