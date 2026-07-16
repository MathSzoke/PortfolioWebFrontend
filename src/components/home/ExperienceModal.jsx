import { useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Field,
    Input,
    Textarea
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';

const emptyExperience = {
    company: '',
    logo: '',
    role: '',
    period: '',
    location: '',
    description: [],
    techs: [],
    startDate: '',
    sortOrder: 0
};

export default function ExperienceModal({ open, initialData, onClose, onSave }) {
    const { t } = useTranslation();
    const [form, setForm] = useState(emptyExperience);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm({
            ...emptyExperience,
            ...(initialData || {}),
            logo: initialData?.logo || initialData?.logoUrl || '',
            description: initialData?.description || [],
            techs: initialData?.techs || []
        });
    }, [initialData, open]);

    const update = (name, value) => setForm(current => ({ ...current, [name]: value }));

    async function handleSave() {
        setSaving(true);
        try {
            await onSave({
                ...form,
                description: String(form.descriptionText ?? form.description.join('\n'))
                    .split(/\r?\n/)
                    .map(x => x.trim())
                    .filter(Boolean),
                techs: String(form.techsText ?? form.techs.join(', '))
                    .split(',')
                    .map(x => x.trim())
                    .filter(Boolean)
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface style={{ maxWidth: 720 }}>
                <DialogBody>
                    <DialogTitle>
                        {initialData?.company ? t('about.sections.experiences.admin.editTitle') : t('about.sections.experiences.admin.addTitle')}
                    </DialogTitle>
                    <DialogContent style={{ display: 'grid', gap: 12 }}>
                        <Field label={t('about.sections.experiences.admin.company')}>
                            <Input value={form.company} onChange={event => update('company', event.target.value)} />
                        </Field>
                        <Field label={t('about.sections.experiences.admin.logo')}>
                            <Input value={form.logo} onChange={event => update('logo', event.target.value)} />
                        </Field>
                        <Field label={t('about.sections.experiences.admin.role')}>
                            <Input value={form.role} onChange={event => update('role', event.target.value)} />
                        </Field>
                        <Field label={t('about.sections.experiences.admin.period')}>
                            <Input value={form.period} onChange={event => update('period', event.target.value)} />
                        </Field>
                        <Field label={t('about.sections.experiences.admin.location')}>
                            <Input value={form.location} onChange={event => update('location', event.target.value)} />
                        </Field>
                        <Field label={t('about.sections.experiences.admin.startDate')}>
                            <Input value={form.startDate || ''} onChange={event => update('startDate', event.target.value)} placeholder="YYYY-MM-DD" />
                        </Field>
                        <Field label={t('about.sections.experiences.admin.description')}>
                            <Textarea
                                resize="vertical"
                                value={form.descriptionText ?? form.description.join('\n')}
                                onChange={event => update('descriptionText', event.target.value)}
                                style={{ minHeight: 120 }}
                            />
                        </Field>
                        <Field label={t('about.sections.experiences.admin.techs')}>
                            <Input
                                value={form.techsText ?? form.techs.join(', ')}
                                onChange={event => update('techsText', event.target.value)}
                            />
                        </Field>
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" disabled={saving} onClick={onClose}>{t('common.close')}</Button>
                        <Button appearance="primary" disabled={saving} onClick={handleSave}>{t('common.save')}</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
