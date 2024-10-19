const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const load = require('audio-loader');

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const sliceAudio = (audioFilePath, outputDir, startTime, endTime, outputFileName) => {
  return new Promise((resolve, reject) => {
    ffmpeg(audioFilePath)
      .setFfmpegPath(ffmpegPath)
      .seekInput(startTime)
      .duration(endTime - startTime)
      .output(path.join(outputDir, outputFileName))
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
};

const sliceDir = path.join(__dirname, `./resource/slice`);
if (!fs.existsSync(sliceDir)) {
  fs.mkdirSync(sliceDir);
}

const fun = async (audioFilePath, name) => {
  const duration = (await load(audioFilePath)).duration;

  const outputDir = path.join(__dirname, `./resource/slice/${name}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const sliceInterval = 1; // 每 1 秒切一片
  let currentTime = 0;
  let sliceNumber = 1;
  while (currentTime < duration) {
    const outputFileName = `slice_${sliceNumber}.mp3`;
    await sliceAudio(
      audioFilePath,
      outputDir,
      currentTime,
      Math.min(currentTime + sliceInterval, duration),
      outputFileName,
    );
    currentTime += sliceInterval;
    sliceNumber++;
  }

  return sliceNumber;
};

const musicDirPath = path.join(__dirname, './resource/music');
// TODO 修改仓库名称
const NAME = 'music1';

let fileList = [];

// 递归遍历目录函数
const readFiles = async (directory) => {
  const files = fs.readdirSync(directory);

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await readFiles(filePath); // 如果是目录，则递归调用
    } else {
      const fileType = file.substring(file.lastIndexOf('.') + 1);
      const name = path.basename(filePath, path.extname(filePath));
      let duration = 0;
      const sliceUrls=[]

      if (fileType === 'mp3') {
        duration = await fun(filePath, path.basename(filePath, path.extname(filePath)));
        for (let i = 0; i < duration; i++) {
          sliceUrls.push(`https://www.ndzy01.com/${NAME}/slice/${name}/slice_${i}.mp3`);
        }
      }

      fileList.push({
        url: `https://www.ndzy01.com/${NAME}/${path.relative(__dirname + '/resource/', filePath)}`,
        sliceUrls,
        name,
        id: generateUUID(),
        fileType,
      });
    }
  }
};

const fun2 = async () => {
  await readFiles(musicDirPath);

  console.log('------ndzy------', '一共有:', fileList.length, '个音频文件', '------ndzy------');

  fs.writeFileSync(path.join(__dirname, './resource/data.json'), JSON.stringify(fileList, null, 2));
};

fun2();
