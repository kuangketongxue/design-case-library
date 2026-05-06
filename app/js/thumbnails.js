// thumbnails.js — Canvas 缩略图生成
const Thumbnails = {
  MAX_WIDTH: 300,
  QUALITY: 0.7,

  async generate(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > this.MAX_WIDTH) {
          h = Math.round(h * this.MAX_WIDTH / w);
          w = this.MAX_WIDTH;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve({
          thumbnail: canvas.toDataURL('image/jpeg', this.QUALITY),
          width: img.width,
          height: img.height
        });
      };
      img.onerror = () => resolve({ thumbnail: null, width: 0, height: 0 });
      img.src = dataUrl;
    });
  }
};
