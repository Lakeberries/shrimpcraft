const generateZipFromUrl = async function(url, params, func) {
  // 辅助函数：向zip对象添加一个文件
  async function addFileToZip(zip, fileName, data) {
      if (fileName.endsWith('/')) {
          zip.folder(fileName.slice(0, -1));
      } else {
          if (data.fetch) {
              const response = await fetch(data.fetch);
              const blob = await response.blob();
              zip.file(fileName, blob);
          } else if (data.base64) {
              zip.file(fileName, data.base64, {base64:true});
          } else if (data.raw) {
              zip.file(fileName, data.raw);
          } else {
              zip.file(fileName, '');
          }
      }
  }

  const response = await fetch(url);
  const jsonData = await response.json();
  const zip = new JSZip();

  // 处理 static 字段
  const staticFiles = jsonData.static;
  for (const filename in staticFiles) {
    const fileData = staticFiles[filename];
    await addFileToZip(zip, filename, fileData);
  }

  // 处理 dynamic 字段
  const dynamicFiles = jsonData.dynamic;
  for (const key in dynamicFiles) {
    const dynamicData = dynamicFiles[key];
    let paramValue = params[key];

    if (paramValue !== 'random')	// patch-231002-2: in case `arg=random` is overriden by default value
    if (isNaN(parseInt(paramValue))) {
        paramValue = dynamicData.default;
    }

    if (paramValue === 'random') {
        const items = dynamicData.items;
        let totalWeight = 0;
        for (const item of items) {
          if (!item.weight) {
              item.weight = 100;
          }
          totalWeight += item.weight;
        }

        let randomNum = Math.floor(Math.random() * totalWeight);
        let selectedItem = null;
        for (const item of items) {
          randomNum -= item.weight;
          if (randomNum < 0) {
              selectedItem = item;
              break;
          }
        }

        if (selectedItem) {
          const files = selectedItem.files;
          for (const filename in files) {
              const fileData = files[filename];
              await addFileToZip(zip, filename, fileData);
          }
        }
    } else {
        const itemIndex = parseInt(paramValue);
        const items = dynamicData.items;
        if (items[itemIndex]) {
          const files = items[itemIndex].files;
          for (const filename in files) {
              const fileData = files[filename];
              await addFileToZip(zip, filename, fileData);
          }
        }
    }
  }

  zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:5}}).then(func);
};
