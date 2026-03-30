export const compressImage = (file: File, maxWidth = 1080, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Check size (approximate base64 size to bytes)
        const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
        if (sizeInBytes > 900000) { // If still > 900KB, compress more
          resolve(canvas.toDataURL('image/jpeg', quality - 0.2));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const uploadImageToImgBB = async (base64String: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY || 'b955c3c6d6d521682362cebff37b3209';
  
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const base64Data = base64String.split(',')[1];
  
  const formData = new FormData();
  formData.append('image', base64Data);
  
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload image to ImgBB');
  }
  
  const data = await response.json();
  return data.data.url;
};
