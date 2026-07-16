import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Badge,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Field,
    Input,
    Label,
    Text,
    Textarea,
    Tooltip
} from '@fluentui/react-components';
import { AddRegular, CheckmarkRegular, DismissRegular, InfoRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import getApiClient from '../../services/apiClient';
import { uploadToCloudinary } from '../../services/cloudinaryUpload';
import MarkdownText from './MarkdownText';

const emptyExperience = {
    company: '',
    logo: '',
    role: '',
    period: '',
    location: '',
    description: [],
    techs: [],
    startDate: '',
    endDate: '',
    isPresent: false,
    sortOrder: 0
};

const monthNames = {
    'pt-BR': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    'en-US': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

function toDate(value, precision) {
    if (!value) return null;
    return new Date(precision === 'month' ? `${value}-01T00:00:00` : `${value}T00:00:00`);
}

function formatDate(value, precision, language) {
    const date = toDate(value, precision);
    if (!date || Number.isNaN(date.getTime())) return '';
    const months = monthNames[language] || monthNames['pt-BR'];
    return precision === 'month'
        ? `${months[date.getMonth()]} ${date.getFullYear()}`
        : `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function durationLabel(startValue, endValue, precision, language) {
    const start = toDate(startValue, precision);
    const end = endValue ? toDate(endValue, precision) : new Date();
    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';

    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (precision === 'day' && end.getDate() < start.getDate()) months -= 1;
    months = Math.max(0, months);
    const years = Math.floor(months / 12);
    const restMonths = months % 12;

    if (language === 'en-US') {
        if (years && restMonths) return `${years} ${years === 1 ? 'yr' : 'yrs'} ${restMonths} ${restMonths === 1 ? 'mo' : 'mos'}`;
        if (years) return `${years} ${years === 1 ? 'yr' : 'yrs'}`;
        return `${Math.max(1, restMonths)} ${restMonths === 1 ? 'mo' : 'mos'}`;
    }

    if (years && restMonths) return `${years} ${years === 1 ? 'ano' : 'anos'} ${restMonths} ${restMonths === 1 ? 'mes' : 'meses'}`;
    if (years) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    return `${Math.max(1, restMonths)} ${restMonths === 1 ? 'mes' : 'meses'}`;
}

function buildPeriod({ startDate, endDate, isPresent, datePrecision }, language) {
    if (!startDate) return '';
    const start = formatDate(startDate, datePrecision, language);
    const end = isPresent
        ? (language === 'en-US' ? 'Present' : 'Atual')
        : formatDate(endDate, datePrecision, language);
    if (!end) return start;
    const duration = isPresent ? '{{timerWorking}}' : durationLabel(startDate, endDate, datePrecision, language);
    return `${start} - ${end}${duration ? ` · ${duration}` : ''}`;
}

export default function ExperienceModal({ open, initialData, onClose, onSave }) {
    const { t, i18n } = useTranslation();
    const language = String(i18n.resolvedLanguage || i18n.language || 'pt-BR').startsWith('en') ? 'en-US' : 'pt-BR';
    const [form, setForm] = useState(emptyExperience);
    const [saving, setSaving] = useState(false);
    const [technologies, setTechnologies] = useState([]);
    const [addingTech, setAddingTech] = useState(false);
    const [newTech, setNewTech] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [datePrecision, setDatePrecision] = useState('month');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const data = initialData || {};
        setForm({
            ...emptyExperience,
            ...data,
            logo: data.logo || data.logoUrl || '',
            description: data.description || [],
            techs: data.techs || [],
            endDate: data.endDate || '',
            isPresent: Boolean(data.isPresent || String(data.period || '').includes('{{timerWorking}}'))
        });
        setDatePrecision(String(data.startDate || '').length > 7 ? 'day' : 'month');
        setShowPreview(false);
    }, [initialData, open]);

    useEffect(() => {
        const api = getApiClient();
        api.get('/api/v1/Technologies')
            .then(items => setTechnologies(Array.isArray(items) ? items : []))
            .catch(() => setTechnologies([]));
    }, []);

    const descriptionText = form.descriptionText ?? form.description.join('\n');
    const period = useMemo(() => buildPeriod({ ...form, datePrecision }, language), [form, datePrecision, language]);
    const update = (name, value) => setForm(current => ({ ...current, [name]: value }));

    function toggleTech(name) {
        setForm(current => ({
            ...current,
            techs: current.techs.includes(name)
                ? current.techs.filter(x => x !== name)
                : [...current.techs, name]
        }));
    }

    async function confirmAddTech() {
        if (!newTech.trim()) return;
        const api = getApiClient();
        try {
            const created = await api.post('/api/v1/Technologies', { name: newTech.trim() });
            setTechnologies(current => [...current, created]);
            toggleTech(created.name);
        } finally {
            setNewTech('');
            setAddingTech(false);
        }
    }

    async function handleLogoUpload(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const url = await uploadToCloudinary(file);
        update('logo', url);
    }

    async function handleSave() {
        setSaving(true);
        try {
            await onSave({
                ...form,
                period,
                description: descriptionText
                    .split(/\r?\n/)
                    .map(x => x.trim())
                    .filter(Boolean),
                startDate: form.startDate || null,
                endDate: form.isPresent ? null : form.endDate || null,
                isPresent: form.isPresent
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface style={{ maxWidth: 760 }}>
                <DialogBody>
                    <DialogTitle>
                        {initialData?.company ? t('about.sections.experiences.admin.editTitle') : t('about.sections.experiences.admin.addTitle')}
                    </DialogTitle>
                    <DialogContent style={{ display: 'grid', gap: 12 }}>
                        <Field label={t('about.sections.experiences.admin.company')}>
                            <Input value={form.company} onChange={event => update('company', event.target.value)} />
                        </Field>
                        <Field label={t('about.sections.experiences.admin.logo')}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Input value={form.logo} onChange={event => update('logo', event.target.value)} placeholder="https://..." />
                                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={event => handleLogoUpload(event.target.files?.[0])} />
                                <Button onClick={() => fileInputRef.current?.click()}>
                                    {t('about.sections.experiences.admin.uploadLogo')}
                                </Button>
                            </div>
                        </Field>
                        <Field label={t('about.sections.experiences.admin.role')}>
                            <Input value={form.role} onChange={event => update('role', event.target.value)} />
                        </Field>
                        <Field label={t('about.sections.experiences.admin.location')}>
                            <Input value={form.location} onChange={event => update('location', event.target.value)} />
                        </Field>

                        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 12, alignItems: 'end' }}>
                            <Field label={t('about.sections.experiences.admin.datePrecision')}>
                                <select value={datePrecision} onChange={event => setDatePrecision(event.target.value)}>
                                    <option value="month">{t('about.sections.experiences.admin.monthYear')}</option>
                                    <option value="day">{t('about.sections.experiences.admin.dayMonthYear')}</option>
                                </select>
                            </Field>
                            <Field label={t('about.sections.experiences.admin.startDate')}>
                                <Input type={datePrecision === 'month' ? 'month' : 'date'} value={form.startDate || ''} onChange={event => update('startDate', event.target.value)} />
                            </Field>
                            <Field label={t('about.sections.experiences.admin.endDate')}>
                                <Input
                                    type={datePrecision === 'month' ? 'month' : 'date'}
                                    disabled={form.isPresent}
                                    value={form.endDate || ''}
                                    onChange={event => update('endDate', event.target.value)}
                                />
                            </Field>
                        </div>
                        <Checkbox
                            checked={form.isPresent}
                            onChange={(_, data) => update('isPresent', Boolean(data.checked))}
                            label={t('about.sections.experiences.admin.isPresent')}
                        />
                        <div>
                            <Label>
                                {t('about.sections.experiences.admin.period')}
                                <Tooltip content={t('about.sections.experiences.admin.periodHelp')} relationship="description">
                                    <Button appearance="transparent" size="small" icon={<InfoRegular />} />
                                </Tooltip>
                            </Label>
                            <Input value={period} readOnly />
                        </div>

                        <Field label={t('about.sections.experiences.admin.description')}>
                            <div style={{ display: 'grid', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button appearance="subtle" onClick={() => setShowPreview(value => !value)}>
                                        {showPreview ? t('about.sections.experiences.admin.editMarkdown') : t('about.sections.experiences.admin.previewMarkdown')}
                                    </Button>
                                </div>
                                {showPreview ? (
                                    <div style={{ minHeight: 120, padding: 12, border: '1px solid #555', borderRadius: 4 }}>
                                        {descriptionText.split(/\r?\n/).map((line, index) => (
                                            <div key={index}><MarkdownText>{line}</MarkdownText></div>
                                        ))}
                                    </div>
                                ) : (
                                    <Textarea
                                        resize="vertical"
                                        value={descriptionText}
                                        onChange={event => update('descriptionText', event.target.value)}
                                        style={{ minHeight: 120 }}
                                    />
                                )}
                            </div>
                        </Field>
                        <Field label={t('about.sections.experiences.admin.techs')}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                {technologies.map(tech => (
                                    <Badge
                                        key={tech.id || tech.name}
                                        appearance={form.techs.includes(tech.name) ? 'filled' : 'tint'}
                                        onClick={() => toggleTech(tech.name)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {tech.name}
                                    </Badge>
                                ))}
                                {!addingTech ? (
                                    <Button size="small" appearance="outline" icon={<AddRegular />} onClick={() => setAddingTech(true)}>
                                        {t('common.add')}
                                    </Button>
                                ) : (
                                    <>
                                        <Input size="small" value={newTech} onChange={event => setNewTech(event.target.value)} />
                                        <Button size="small" appearance="subtle" icon={<CheckmarkRegular />} onClick={confirmAddTech} />
                                        <Button size="small" appearance="subtle" icon={<DismissRegular />} onClick={() => setAddingTech(false)} />
                                    </>
                                )}
                            </div>
                        </Field>
                        <Text size={200}>{t('about.sections.experiences.admin.translationHint')}</Text>
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
