import type { UUID } from 'crypto';

export type ProjectVm = {
    id: UUID;
    name: string;
    summary: string;
    technologies: string[];
    thumbnailUrl?: string | null;
    repoName?: string | null;
    projectUrl?: string | null;
    rating?: number;
    ratingCount?: number;
};

type FetchOpts = { signal?: AbortSignal };

function getApiBase(): string | undefined {
    const env = import.meta.env as Record<string, string | undefined>;
    return env.VITE_PORTFOLIO_API ?? env.VITE_API_BASE_URL;
}

async function getProjectsFromApi(opts?: FetchOpts): Promise<ProjectVm[]> {
    const api = getApiBase();
    if (!api) return [];
    const res = await fetch(`${api}/api/v1/Projects`, { signal: opts?.signal });

    if (!res.ok) return [];
    const data = await res.json() as any[];
    return data.projectListItems.map<ProjectVm>(p => ({
        id: p.id,
        name: p.name,
        summary: p.summary,
        technologies: p.technologies ?? [],
        thumbnailUrl: p.thumbnailUrl ?? null,
        repoName: p.repoName ?? null,
        projectUrl: p.projectUrl ?? null,
        rating: p.rating ?? 0,
        ratingCount: p.ratingCount ?? 0,
    }));
}

async function getExternalProjects(opts?: FetchOpts): Promise<ProjectVm[]> {
    const base = import.meta.env.BASE_URL ?? '/';
    const url = new URL('external-projects.json', base).toString();
    const res = await fetch(url, { signal: opts?.signal });
    if (!res.ok) return [];
    const data = await res.json() as any[];
    return data.projectListItems.map<ProjectVm>(p => ({
        id: p.id,
        name: p.name,
        summary: p.summary,
        technologies: p.technologies ?? [],
        thumbnailUrl: p.thumbnailUrl ?? null,
        repoName: p.repoName ?? null,
        projectUrl: p.projectUrl ?? null,
        rating: p.rating ?? 0,
        ratingCount: p.ratingCount ?? 0,
    }));
}

function mergeAndDedupe(apiProjects: ProjectVm[], externalProjects: ProjectVm[]): ProjectVm[] {
    const map = new Map<string, ProjectVm>();
    for (const p of externalProjects) map.set(p.id, p);
    for (const p of apiProjects) map.set(p.id, p);
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

let _cache: { when: number; data: ProjectVm[] } | null = null;
const CACHE_MS = 30_000;

export async function getAggregatedProjects(opts?: FetchOpts): Promise<ProjectVm[]> {
    const now = Date.now();
    if (_cache && now - _cache.when < CACHE_MS) return _cache.data;

    const [fromApi, fromExternal] = await Promise.allSettled([
        getProjectsFromApi(opts),
        getExternalProjects(opts),
    ]);

    const apiList = fromApi.status === 'fulfilled' ? fromApi.value : [];
    const extList = fromExternal.status === 'fulfilled' ? fromExternal.value : [];

    const merged = mergeAndDedupe(apiList, extList);
    _cache = { when: now, data: merged };
    return merged;
}

export type ReorderItem = { id: UUID; sortOrder: number };

export async function reorderProjects(items: ReorderItem[], opts?: FetchOpts): Promise<void> {
    const api = getApiBase();
    if (!api) throw new Error('API base URL não configurada');
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Usuário não autenticado');

    const res = await fetch(`${api}/api/v1/Projects/reorder`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items }),
        signal: opts?.signal,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
    }

    _cache = null;
}
