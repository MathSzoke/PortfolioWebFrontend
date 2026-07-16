export async function uploadToCloudinary(file) {
    const cloudName = 'djwjecueo';
    const uploadPreset = 'ml_default';

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(url, {
        method: 'POST',
        body: formData
    });

    if (!res.ok) {
        const error = await res.json();
        console.error('Cloudinary error:', error);
        throw new Error('Upload failed');
    }

    const data = await res.json();
    return data.secure_url;
}
