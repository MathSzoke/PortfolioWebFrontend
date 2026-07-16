function readAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result || '');
            resolve(result.includes(',') ? result.split(',').pop() : result);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

export async function uploadCurriculumPdfToApi(api, language, file) {
    const base64Content = await readAsBase64(file);

    await api.post('/api/v1/curriculum/upload', {
        language,
        fileName: file.name || `curriculum-${language}.pdf`,
        contentType: file.type || 'application/pdf',
        base64Content
    });
}
