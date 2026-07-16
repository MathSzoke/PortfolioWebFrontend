import getApiClient from './apiClient';

export async function getExperiences(language) {
    const api = getApiClient();
    return await api.get(`/api/v1/experiences?language=${encodeURIComponent(language || 'pt-BR')}`, { skipAuth: true });
}

export async function saveExperience(experience, language) {
    const api = getApiClient();
    const payload = {
        sourceLanguage: language || 'pt-BR',
        company: experience.company,
        logoUrl: experience.logo || experience.logoUrl,
        role: experience.role,
        period: experience.period,
        location: experience.location,
        description: Array.isArray(experience.description) ? experience.description : [],
        techs: Array.isArray(experience.techs) ? experience.techs : [],
        startDate: experience.startDate || null,
        sortOrder: experience.sortOrder || 0
    };

    return experience.id
        ? await api.put(`/api/v1/experiences/${experience.id}`, payload)
        : await api.post('/api/v1/experiences', payload);
}

export async function deleteExperience(id) {
    const api = getApiClient();
    await api.delete(`/api/v1/experiences/${id}`);
}
