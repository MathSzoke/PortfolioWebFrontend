import { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogActions,
    Button,
    Input,
    Field,
    Badge,
    useToastController,
    Toast,
    ToastTitle
} from '@fluentui/react-components';
import { Dismiss24Regular, CodeFilled, Add24Filled, Checkmark24Regular, DismissCircle24Regular } from '@fluentui/react-icons';
import { FaGithub } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import getApiClient from '../../services/apiClient';
import { uploadToCloudinary } from '../../services/cloudinaryUpload';
import ProjectCard from './ProjectCard';

export default function AddProjectModal({ open, onClose, onSuccess, initialData }) {
    const { t } = useTranslation();
    const { dispatchToast } = useToastController();
    const [form, setForm] = useState({
        name: '',
        summary: '',
        repoName: '',
        projectUrl: '',
        thumbnailUrl: '',
        urlEndpoint: '',
        technologies: []
    });
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});
    const [isDragOver, setIsDragOver] = useState(false);
    const [technologiesList, setTechnologiesList] = useState([]);
    const [addingTech, setAddingTech] = useState(false);
    const [newTech, setNewTech] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || '',
                summary: initialData.summary || '',
                repoName: initialData.repoName || '',
                projectUrl: initialData.projectUrl || '',
                thumbnailUrl: initialData.thumbnailUrl || '',
                urlEndpoint: initialData.urlEndpoint || '',
                technologies: initialData.technologies || []
            });
        } else {
            setForm({
                name: '',
                summary: '',
                repoName: '',
                projectUrl: '',
                thumbnailUrl: '',
                urlEndpoint: '',
                technologies: []
            });
        }
    }, [initialData, open]);

    useEffect(() => {
        async function fetchTechnologies() {
            try {
                const api = getApiClient();
                const resp = await api.get('/api/v1/Technologies');
                setTechnologiesList(resp ?? []);
            } catch {
                setTechnologiesList([]);
            }
        }
        fetchTechnologies();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setTouched(t => ({ ...t, [name]: true }));
    }

    function toggleTech(tech) {
        setForm(f => (f.technologies.includes(tech)
            ? { ...f, technologies: f.technologies.filter(t => t !== tech) }
            : { ...f, technologies: [...f.technologies, tech] }
        ));
    }

    async function confirmAddTech() {
        if (!newTech.trim()) return cancelAddTech();
        try {
            const api = getApiClient();
            const resp = await api.post('/api/v1/Technologies', { name: newTech.trim() });
            setTechnologiesList(prev => [...prev, resp]);
        } catch {
            alert(t('projects.superAdmin.responses.addTechError'));
        } finally {
            setAddingTech(false);
            setNewTech('');
        }
    }

    function cancelAddTech() {
        setAddingTech(false);
        setNewTech('');
    }

    function getValidation(name) {
        const value = form[name];
        const wasTouched = touched[name];
        if (!wasTouched) return { state: undefined, message: '' };

        if (['name', 'summary'].includes(name) && !value) {
            return { state: 'error', message: t('common.requiredField') };
        }

        if (['projectUrl', 'thumbnailUrl'].includes(name) && value) {
            try { new URL(value); } catch { return { state: 'error', message: t('common.invalidUrl') }; }
        }

        return { state: 'success', message: t('common.validField') };
    }

    function validateForm() {
        const errors = [];

        if (!form.name || !form.name.trim()) errors.push(t('projects.superAdmin.placeholders.name') || 'Name');
        if (!form.summary || !form.summary.trim()) errors.push(t('projects.superAdmin.placeholders.summary') || 'Summary');
        if (!form.projectUrl || !form.projectUrl.trim()) errors.push(t('projects.superAdmin.placeholders.liveUrl') || 'Live URL');
        if (!form.thumbnailUrl || !form.thumbnailUrl.trim()) errors.push(t('projects.superAdmin.placeholders.pastThumbUrl') || 'Thumbnail URL');

        if (form.projectUrl && form.projectUrl.trim()) {
            try { new URL(form.projectUrl); } catch { errors.push(t('common.invalidUrl')); }
        }
        if (form.thumbnailUrl && form.thumbnailUrl.trim()) {
            try { new URL(form.thumbnailUrl); } catch { errors.push(t('common.invalidUrl')); }
        }
        setTouched(prev => ({ ...prev, name: true, summary: true, projectUrl: true, thumbnailUrl: true }));

        return errors;
    }

    async function handleSubmit() {
        const errors = validateForm();
        if (errors.length > 0) {
            const message = errors.length === 1 ? errors[0] : `${errors.length} campos inválidos ou em branco: ${errors.join(', ')}`;
            dispatchToast(
                <Toast>
                    <ToastTitle>{message}</ToastTitle>
                </Toast>,
                { intent: 'error' }
            );
            return;
        }

        setLoading(true);
        try {
            const api = getApiClient();
            const payload = {
                name: form.name,
                summary: form.summary,
                repoName: form.repoName || null,
                projectUrl: form.projectUrl || null,
                thumbnailUrl: form.thumbnailUrl || null,
                urlEndpoint: form.urlEndpoint || null,
                technologies: form.technologies,
                sortOrder: 0
            };

            let resp;
            if (initialData?.id) {
                resp = await api.put(`/api/v1/Projects/${initialData.id}`, payload);
            } else {
                resp = await api.post('/api/v1/Projects', payload);
            }

            onSuccess({
                id: resp?.data?.Id ?? initialData?.id ?? null,
                name: form.name,
                summary: form.summary,
                repoName: form.repoName,
                projectUrl: form.projectUrl,
                thumbnailUrl: form.thumbnailUrl,
                technologies: form.technologies
            });

            onClose();
        } catch {
            alert(t('projects.superAdmin.responses.addError'));
        } finally {
            setLoading(false);
        }
    }

    async function handleFileSelect(file) {
        if (!file || !file.type.startsWith('image/')) return;
        try {
            const url = await uploadToCloudinary(file);
            setForm(f => ({ ...f, thumbnailUrl: url }));
        } catch {
            alert('Erro ao fazer upload da imagem.');
        }
    }

    function onDropZoneDragOver(e) { e.preventDefault(); setIsDragOver(true); }
    function onDropZoneDragLeave(e) { e.preventDefault(); setIsDragOver(false); }
    function onDropZoneDrop(e) {
        e.preventDefault();
        setIsDragOver(false);
        const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
        if (file) handleFileSelect(file);
    }

    return (
        <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
            <DialogSurface style={{ maxWidth: '80%' }}>
                <DialogBody>
                    <DialogContent style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1em', minWidth: 900 }}>
                        <div
                            onDragOver={onDropZoneDragOver}
                            onDragLeave={onDropZoneDragLeave}
                            onDrop={onDropZoneDrop}
                            style={{
                                border: isDragOver ? '2px dashed #0F6CBD' : 'none',
                                padding: '1em',
                                borderRadius: 8,
                                transition: '0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <DialogTitle
                                    action={
                                        <DialogTrigger disableButtonEnhancement>
                                            <Button appearance="subtle" aria-label="Fechar" icon={<Dismiss24Regular />} onClick={onClose} />
                                        </DialogTrigger>
                                    }>
                                    {initialData?.id ? t('projects.superAdmin.editTitle') : t('projects.superAdmin.title')}
                                </DialogTitle>
                            </div>

                            <form style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '1em 0' }}>
                                <Field label={t('projects.superAdmin.placeholders.name')} validationState={getValidation('name').state} validationMessage={getValidation('name').message}>
                                    <Input name="name" value={form.name} onChange={handleChange} required />
                                </Field>
                                <Field label={t('projects.superAdmin.placeholders.summary')} validationState={getValidation('summary').state} validationMessage={getValidation('summary').message}>
                                    <Input name="summary" value={form.summary} onChange={handleChange} required />
                                </Field>
                                <Field label={t('projects.superAdmin.placeholders.repoUrl')}>
                                    <Input contentBefore={<FaGithub />} name="repoName" value={form.repoName} onChange={handleChange} />
                                </Field>
                                <Field label={t('projects.superAdmin.placeholders.liveUrl')} validationState={getValidation('projectUrl').state} validationMessage={getValidation('projectUrl').message}>
                                    <Input contentBefore={<CodeFilled />} name="projectUrl" value={form.projectUrl} onChange={handleChange} required />
                                </Field>
                                <Field label={t('projects.superAdmin.placeholders.technologies')}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                        {technologiesList.map(tech => (
                                            <Badge
                                                key={tech.id}
                                                appearance={form.technologies.includes(tech.name) ? 'filled' : 'tint'}
                                                onClick={() => toggleTech(tech.name)}
                                                shape="rounded"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {tech.name}
                                            </Badge>
                                        ))}
                                        {!addingTech ? (
                                            <Button appearance="outline" size="small" icon={<Add24Filled />} onClick={() => setAddingTech(true)}>
                                                {t('common.add')}
                                            </Button>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <Input size="small" required value={newTech} onChange={e => setNewTech(e.target.value)} placeholder={t('projects.superAdmin.labels.newTechnology')} />
                                                <Button appearance="subtle" size="small" icon={<Checkmark24Regular />} onClick={confirmAddTech} />
                                                <Button appearance="subtle" size="small" icon={<DismissCircle24Regular color="red" />} onClick={cancelAddTech} />
                                            </div>
                                        )}
                                    </div>
                                </Field>
                                <Field label={t("projects.superAdmin.labels.urlEndpoint")}>
                                    <Input
                                        name="urlEndpoint"
                                        value={form.urlEndpoint}
                                        onChange={handleChange}
                                        placeholder="https://minha-api.com"
                                    />
                                </Field>
                                <Field label={t('projects.superAdmin.labels.tech')} validationState={getValidation('thumbnailUrl').state} validationMessage={getValidation('thumbnailUrl').message}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                                        <Input style={{ width: '-webkit-fill-available' }} name="thumbnailUrl" value={form.thumbnailUrl} onChange={handleChange} placeholder={t('projects.superAdmin.placeholders.pastThumbUrl')} required />
                                        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
                                        <Button style={{ minWidth: 'max-content' }} onClick={() => fileInputRef.current?.click()}>{t('projects.superAdmin.labels.uploadImage')}</Button>
                                    </div>
                                </Field>
                            </form>

                            <DialogActions>
                                <Button appearance="secondary" onClick={onClose}>{t('common.close')}</Button>
                                <Button appearance="primary" onClick={handleSubmit} disabled={loading}>{t('common.save')}</Button>
                            </DialogActions>
                        </div>

                        <div style={{ alignContent: 'center' }}>
                            <ProjectCard
                                project={{
                                    name: form.name,
                                    summary: form.summary,
                                    technologies: form.technologies,
                                    thumbnailUrl: form.thumbnailUrl,
                                    repoName: form.repoName,
                                    source: form.projectUrl,
                                    rating: 0
                                }}
                            />
                        </div>
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}