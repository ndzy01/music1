const fs = require('fs');
const path = require('path');

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

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

            fileList.push({
                url: `https://www.ndzy01.com/${NAME}/${path.relative(__dirname + '/resource/', filePath)}`,
                name,
                id: generateUUID(),
                fileType,
            });
        }
    }
};

const run = async () => {
    await readFiles(musicDirPath);

    console.log('------ndzy------', '一共有:', fileList.length, '个音频文件', '------ndzy------');

    fs.writeFileSync(path.join(__dirname, './resource/data.json'), JSON.stringify(fileList, null, 2));
};

run().then()
