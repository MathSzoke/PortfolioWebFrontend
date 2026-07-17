import {
    Text,
    Title3,
    Badge,
    makeStyles,
    tokens,
    Button,
    List,
    Card,
    CardHeader,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Field,
    Input,
    Textarea,
    mergeClasses
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { AddRegular, DeleteRegular, DocumentPdfFilled, EditRegular } from '@fluentui/react-icons';
import {
    Carousel,
    CarouselNav,
    CarouselNavButton,
    CarouselNavContainer,
    CarouselSlider,
    CarouselViewport,
    CarouselCard
} from '@fluentui/react-components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { TbBrandCSharp } from 'react-icons/tb';
import {
    SiDotnet,
    SiReact,
    SiPostgresql,
    SiDocker,
    SiPython,
    SiPostman,
    SiDynatrace
} from 'react-icons/si';
import {
    VscVscode,
    VscAzure,
    VscAzureDevops
} from 'react-icons/vsc';
import { DiMsqlServer, DiVisualstudio } from 'react-icons/di';
import { useAuth } from '../../services/auth';
import useApiClient from '../../services/useApiClient';
import { generateCurriculumPdfBlob } from '../../services/curriculumPdf';
import { uploadCurriculumPdfToApi } from '../../services/curriculumUpload';
import { deleteExperience, getExperiences, saveExperience } from '../../services/experiences';
import ExperienceModal from './ExperienceModal';

const useStyles = makeStyles({
    root: {
        display: 'grid',
        gap: '24px'
    },
    section: {
        display: 'grid',
        gap: '8px'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px'
    },
    sectionHeaderText: {
        display: 'grid',
        gap: '6px',
        minWidth: 0
    },
    sectionActions: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        flexWrap: 'wrap',
        flexShrink: 0
    },
    experienceSummary: {
        display: 'grid',
        justifyItems: 'end',
        gap: '2px',
        padding: '6px 10px',
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusMedium,
        background: tokens.colorNeutralBackground2,
        boxShadow: tokens.shadow2
    },
    experienceSummaryLabel: {
        color: tokens.colorNeutralForeground3,
        fontSize: '11px',
        lineHeight: 1
    },
    experienceSummaryValue: {
        fontSize: '13px',
        lineHeight: 1.2
    },
    sub: {
        color: tokens.colorNeutralForeground3,
        whiteSpace: 'pre-line'
    },
    button: {
        width: 'max-content'
    },
    ctaActions: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px'
    },
    dialogContent: {
        display: 'grid',
        gap: '12px'
    },
    fileInput: {
        display: 'none'
    },
    textArea: {
        minHeight: '180px'
    },
    cardAdminActions: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        display: 'flex',
        gap: '4px',
        zIndex: 3
    },
    card: {
        minWidth: '300px',
        maxWidth: '350px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        margin: '0 0.5em',
        position: 'relative',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        boxShadow: tokens.shadow4,
        cursor: 'pointer',
        background: tokens.colorNeutralBackground1,
        '@media (max-width: 768px)': { margin: 0 }
    },
    cardHovered: {
        boxShadow: tokens.shadow8,
        transform: 'scale(1.07)',
        zIndex: 2
    },
    logo: {
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        objectFit: 'contain',
        backgroundColor: tokens.colorNeutralBackground3
    },
    period: {
        fontSize: '12px',
        color: tokens.colorNeutralForeground3
    },
    description: {
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: 'rgba(30,30,30,0.97)',
        color: tokens.colorNeutralForegroundOnBrand,
        borderRadius: tokens.borderRadiusMedium,
        boxShadow: tokens.shadow8,
        opacity: 0,
        maxHeight: 0,
        transform: 'translateY(-10px)',
        transition: 'opacity 0.3s ease, max-height 0.3s ease, transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch'
    },
    descriptionVisible: {
        opacity: 1,
        maxHeight: '20rem',
        padding: '12px',
        transform: 'translateY(0)'
    },
    descriptionTitle: {
        padding: 0,
        marginBottom: '8px',
        flexShrink: 0
    },
    markdownScroll: {
        width: '100%',
        maxHeight: '14rem',
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        paddingRight: '6px'
    },
    markdownContent: {
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        background: 'transparent',
        color: 'inherit',
        fontSize: '13px',
        lineHeight: 1.45,
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
        '& p': {
            margin: '0 0 8px'
        },
        '& h1': {
            fontSize: '18px',
            lineHeight: 1.25,
            margin: '0 0 10px'
        },
        '& h2': {
            fontSize: '16px',
            lineHeight: 1.25,
            margin: '0 0 8px'
        },
        '& h3': {
            fontSize: '14px',
            lineHeight: 1.25,
            margin: '0 0 8px'
        },
        '& ul, & ol': {
            margin: '0 0 8px',
            paddingLeft: '18px'
        },
        '& li': {
            margin: '0 0 6px'
        },
        '& pre': {
            maxWidth: '100%',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap'
        },
        '& code': {
            whiteSpace: 'pre-wrap'
        },
        '& table': {
            display: 'block',
            maxWidth: '100%',
            overflowX: 'auto'
        },
        '& img': {
            maxWidth: '100%',
            height: 'auto'
        },
        '& blockquote': {
            margin: '0 0 8px',
            paddingLeft: '10px'
        }
    },
    techs: {
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        marginTop: '0',
        opacity: 0,
        maxHeight: 0,
        overflow: 'hidden',
        transform: 'translateY(-10px)',
        transition: 'opacity 0.3s ease, max-height 0.3s ease, transform 0.3s ease'
    },
    techsVisible: {
        opacity: 1,
        maxHeight: 200,
        marginTop: '8px',
        transform: 'translateY(0)'
    },
    languagesItem: {
        padding: '0 0 0 30px',
        listStyleType: 'inherit'
    },
    skillsWrap: {
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        padding: '16px 0'
    },
    skillsGradientLeft: {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '80px',
        pointerEvents: 'none',
        background: `linear-gradient(to right, ${tokens.colorNeutralBackground1} 0%, transparent 100%)`,
        zIndex: 1
    },
    skillsGradientRight: {
        content: '""',
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '80px',
        pointerEvents: 'none',
        background: `linear-gradient(to left, ${tokens.colorNeutralBackground1} 0%, transparent 100%)`,
        zIndex: 1
    },
    skillsTrack: {
        display: 'flex',
        alignItems: 'stretch',
        gap: '16px',
        width: 'max-content',
        animationName: 'scrollX',
        animationDuration: '30s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        padding: '8px 0',
        ':hover': { animationPlayState: 'paused' }
    },
    skillCard: {
        minWidth: '160px',
        maxWidth: '180px',
        display: 'grid',
        justifyItems: 'center',
        alignContent: 'center',
        gap: '10px',
        padding: '16px',
        background: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusLarge,
        boxShadow: tokens.shadow4,
        transition: 'transform .2s ease, box-shadow .2s ease'
    },
    skillCardHovered: {
        transform: 'translateY(-4px)',
        boxShadow: tokens.shadow8
    },
    techIcon: {
        fontSize: '3rem',
        lineHeight: 1,
        transition: 'transform 0.3s ease'
    },
    techIconHovered: {
        transform: 'scale(1.1)'
    },
    skillName: {
        fontSize: '14px',
        color: tokens.colorNeutralForeground2,
        whiteSpace: 'nowrap'
    }
});

const techImageMap = {
    'C#': { name: 'C#', Icon: TbBrandCSharp, color: '#68217A' },
    '.NET': { name: '.NET Framework/Core', Icon: SiDotnet, color: '#512BD4', highlight: true },
    'SQL Server': { name: 'SQL Server', Icon: DiMsqlServer, color: '#A91D22' },
    Python: { name: 'Python', Icon: SiPython, color: '#3776AB' },
    React: { name: 'React', Icon: SiReact, color: '#61DAFB', highlight: true },
    PostgreSQL: { name: 'PostgreSQL', Icon: SiPostgresql, color: '#336791' },
    Docker: { name: 'Docker', Icon: SiDocker, color: '#2496ED' },
    Azure: { name: 'Azure', Icon: VscAzure, color: '#0078D4', highlight: true },
    AzureDevops: { name: 'Azure DevOps', Icon: VscAzureDevops, color: '#0078D4' },
    Postman: { name: 'Postman', Icon: SiPostman, color: '#FF6C37' },
    VSCode: { name: 'VSCode', Icon: VscVscode, color: '#007ACC' },
    'Visual Studio': { name: 'Visual Studio', Icon: DiVisualstudio, color: '#5C2D91' },
    Dynatrace: { name: 'Dynatrace', Icon: SiDynatrace, color: '#E6007E' }
};

const getAnnouncement = (index, total) => `Carrossel: slide ${index + 1} de ${total}`;
const defaultCurriculumUrls = {
    'pt-BR': '/assets/cv-pt-BR.pdf',
    'en-US': '/assets/cv-en-US.pdf'
};

const normalizeCurriculumLanguage = language =>
    String(language || '').toLowerCase().startsWith('en') ? 'en-US' : 'pt-BR';
const apiBase = import.meta.env.VITE_PORTFOLIO_API || import.meta.env.VITE_API_BASE_URL || '';

const normalizeCurriculumUrl = url => {
    const value = String(url || '').trim();
    if (!value || (value.includes('res.cloudinary.com') && value.includes('/raw/upload/'))) return '';
    if (value.startsWith('/api/')) return `${apiBase.replace(/\/$/, '')}${value}`;
    return value;
};

const getCalendarMonthDiff = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;

    return Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth());
};

const getDurationMonthsFromPeriod = period => {
    const duration = String(period || '').split('·').pop()?.toLowerCase() || '';
    const years = duration.match(/(\d+)\s*(?:yr|yrs|year|years|ano|anos)/)?.[1];
    const months = duration.match(/(\d+)\s*(?:mo|mos|month|months|m[eê]s|meses)/)?.[1];

    const total = (Number(years || 0) * 12) + Number(months || 0);
    return Number.isFinite(total) ? total : 0;
};

const getExperienceDurationMonths = experience => {
    if (experience?.startDate) {
        const endDate = experience.isPresent ? undefined : experience.endDate;
        return getCalendarMonthDiff(experience.startDate, endDate);
    }

    return getDurationMonthsFromPeriod(experience?.period);
};

const formatExperienceDuration = (months, language) => {
    const totalMonths = Math.max(0, Math.round(months));
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    const isEnglish = normalizeCurriculumLanguage(language) === 'en-US';
    const parts = [];

    if (years) {
        parts.push(isEnglish
            ? `${years} ${years === 1 ? 'yr' : 'yrs'}`
            : `${years} ${years === 1 ? 'ano' : 'anos'}`);
    }

    if (remainingMonths) {
        parts.push(isEnglish
            ? `${remainingMonths} ${remainingMonths === 1 ? 'mo' : 'mos'}`
            : `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`);
    }

    if (!parts.length) return isEnglish ? 'Less than 1 mo' : 'Menos de 1 mês';
    return parts.join(' ');
};

export default function AboutSection() {
    const s = useStyles();
    const { t, i18n } = useTranslation();
    const api = useApiClient();
    const { userInfo } = useAuth();
    const sections = t('about.sections', { returnObjects: true });
    const staticExperiences = t('about.sections.experiences.items', { returnObjects: true }) || [];
    const [managedExperiences, setManagedExperiences] = useState([]);
    const [experienceModalData, setExperienceModalData] = useState(null);
    const [hovered, setHovered] = useState(null);
    const [hoveredSkill, setHoveredSkill] = useState(null);
    const [curriculumUrls, setCurriculumUrls] = useState(defaultCurriculumUrls);
    const [curriculumEditorOpen, setCurriculumEditorOpen] = useState(false);
    const [curriculumLanguage, setCurriculumLanguage] = useState(normalizeCurriculumLanguage(i18n.resolvedLanguage || i18n.language));
    const [curriculumUrlInput, setCurriculumUrlInput] = useState('');
    const [curriculumText, setCurriculumText] = useState('');
    const [curriculumError, setCurriculumError] = useState('');
    const [curriculumSaving, setCurriculumSaving] = useState(false);
    const fileInputRef = useRef(null);

    const currentCurriculumLanguage = normalizeCurriculumLanguage(i18n.resolvedLanguage || i18n.language);
    const currentCurriculumUrl = normalizeCurriculumUrl(curriculumUrls[currentCurriculumLanguage]) || defaultCurriculumUrls[currentCurriculumLanguage];
    const isSuperAdmin = Array.isArray(userInfo?.roles) && userInfo.roles.includes('SuperAdmin');
    const experiences = useMemo(() => {
        const managedCompanies = new Set(managedExperiences.map(x => x.company));
        return [
            ...managedExperiences,
            ...staticExperiences
                .filter(x => !managedCompanies.has(x.company))
                .map((x, index) => ({ ...x, sortOrder: managedExperiences.length + index + 1 }))
        ].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }, [managedExperiences, staticExperiences]);
    const totalExperienceMonths = useMemo(
        () => experiences.reduce((total, experience) => total + getExperienceDurationMonths(experience), 0),
        [experiences]
    );
    const totalExperienceText = formatExperienceDuration(totalExperienceMonths, currentCurriculumLanguage);

    useEffect(() => {
        setCurriculumLanguage(currentCurriculumLanguage);
    }, [currentCurriculumLanguage]);

    useEffect(() => {
        let cancelled = false;

        getExperiences(currentCurriculumLanguage)
            .then(items => {
                if (!cancelled && Array.isArray(items)) setManagedExperiences(items);
            })
            .catch(() => {
                if (!cancelled) setManagedExperiences([]);
            });

        return () => {
            cancelled = true;
        };
    }, [currentCurriculumLanguage]);

    useEffect(() => {
        let cancelled = false;

        api.get(`/api/v1/curriculum?language=${encodeURIComponent(currentCurriculumLanguage)}`, { skipAuth: true })
            .then(data => {
                if (cancelled || !data?.url) return;
                const url = normalizeCurriculumUrl(data.url);
                if (url) {
                    setCurriculumUrls(prev => ({ ...prev, [currentCurriculumLanguage]: url }));
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setCurriculumUrls(prev => ({ ...prev, [currentCurriculumLanguage]: prev[currentCurriculumLanguage] || defaultCurriculumUrls[currentCurriculumLanguage] }));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [api, currentCurriculumLanguage]);

    const openCurriculumEditor = () => {
        const language = currentCurriculumLanguage;
        setCurriculumLanguage(language);
        setCurriculumUrlInput(curriculumUrls[language] || defaultCurriculumUrls[language]);
        setCurriculumText(t('about.sections.cta.curriculumTemplate', { lng: language }));
        setCurriculumError('');
        setCurriculumEditorOpen(true);
    };

    const saveCurriculumUrl = useCallback(async (language, url) => {
        const trimmedUrl = String(url || '').trim();
        if (!/^https?:\/\//i.test(trimmedUrl)) {
            setCurriculumError(t('about.sections.cta.invalidCurriculumUrl', 'Informe uma URL valida para o PDF.'));
            return;
        }

        setCurriculumSaving(true);
        setCurriculumError('');
        try {
            await api.put('/api/v1/curriculum', { language, url: trimmedUrl });
            setCurriculumUrls(prev => ({ ...prev, [language]: trimmedUrl }));
            setCurriculumUrlInput(trimmedUrl);
            setCurriculumEditorOpen(false);
        } catch {
            setCurriculumError(t('about.sections.cta.curriculumSaveError', 'Nao foi possivel salvar o curriculo.'));
        } finally {
            setCurriculumSaving(false);
        }
    }, [api, t]);

    const handleCurriculumUpload = async event => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (file.type && file.type !== 'application/pdf') {
            setCurriculumError(t('about.sections.cta.curriculumPdfOnly', 'Selecione um arquivo PDF.'));
            return;
        }

        setCurriculumSaving(true);
        setCurriculumError('');
        try {
            await uploadCurriculumPdfToApi(api, curriculumLanguage, file);
            const data = await api.get(`/api/v1/curriculum?language=${encodeURIComponent(curriculumLanguage)}`, { skipAuth: true });
            const url = normalizeCurriculumUrl(data?.url);
            if (url) {
                setCurriculumUrls(prev => ({ ...prev, [curriculumLanguage]: url }));
                setCurriculumUrlInput(url);
            }
            setCurriculumEditorOpen(false);
        } catch {
            setCurriculumError(t('about.sections.cta.curriculumUploadError', 'Nao foi possivel subir o PDF.'));
            setCurriculumSaving(false);
        } finally {
            setCurriculumSaving(false);
        }
    };

    const handleGenerateCurriculumPdf = async () => {
        if (!curriculumText.trim()) {
            setCurriculumError(t('about.sections.cta.curriculumTextRequired', 'Informe o conteúdo do currículo.'));
            return;
        }

        setCurriculumSaving(true);
        setCurriculumError('');
        try {
            const pdf = generateCurriculumPdfBlob({
                title: t('about.sections.cta.curriculumGeneratedTitle', { lng: curriculumLanguage }),
                content: curriculumText
            });
            await uploadCurriculumPdfToApi(api, curriculumLanguage, pdf);
            const data = await api.get(`/api/v1/curriculum?language=${encodeURIComponent(curriculumLanguage)}`, { skipAuth: true });
            const url = normalizeCurriculumUrl(data?.url);
            if (url) {
                setCurriculumUrls(prev => ({ ...prev, [curriculumLanguage]: url }));
                setCurriculumUrlInput(url);
            }
            setCurriculumEditorOpen(false);
        } catch {
            setCurriculumError(t('about.sections.cta.curriculumGenerateError', 'Nao foi possivel gerar o PDF.'));
            setCurriculumSaving(false);
        } finally {
            setCurriculumSaving(false);
        }
    };

    const handleSaveExperience = async experience => {
        const saved = await saveExperience(experience, currentCurriculumLanguage);
        setManagedExperiences(prev => {
            const next = prev.filter(x => x.id !== saved.id && x.company !== saved.company);
            return [...next, saved].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        });
        setExperienceModalData(null);
    };

    const handleDeleteExperience = async experience => {
        if (!experience?.id) return;
        await deleteExperience(experience.id);
        setManagedExperiences(prev => prev.filter(x => x.id !== experience.id));
    };

    const extraTools = useMemo(
        () => [
            techImageMap['C#'],
            techImageMap['.NET'],
            techImageMap['SQL Server'],
            techImageMap.React,
            techImageMap.Python,
            techImageMap.PostgreSQL,
            techImageMap.Docker,
            techImageMap.Postman,
            techImageMap.Azure,
            techImageMap.AzureDevops,
            techImageMap.VSCode,
            techImageMap['Visual Studio'],
            techImageMap.Dynatrace
        ].filter(Boolean),
        []
    );

    const marquee = useMemo(() => {
        const full = [...extraTools];
        return [...full, ...full];
    }, [extraTools]);

    function getWorkingTime(startDate) {
        if (!startDate) return '';
        const start = new Date(startDate);
        const now = new Date();

        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();

        if (months < 0) {
            years--;
            months += 12;
        }

        const yearLabel = years === 1 ? '1 ano' : `${years} anos`;
        const monthLabel = months === 1 ? '1 mês' : `${months} meses`;

        if (years === 0) return monthLabel;
        if (months === 0) return yearLabel;

        return `${yearLabel} ${monthLabel}`;
    }

    return (
        <div className={s.root}>
            <Title3>{t('about.title')}</Title3>

            <div className={s.section}>
                <Text weight="semibold">{sections.summary.title}</Text>
                <Text className={s.sub}>{sections.summary.text}</Text>
            </div>

            <div className={s.section}>
                <div className={s.sectionHeader}>
                    <div className={s.sectionHeaderText}>
                        <Text weight="semibold">{sections.experiences.title}</Text>
                        <Text className={s.sub}>{sections.experiences.text}</Text>
                    </div>
                    <div className={s.sectionActions}>
                        <div className={s.experienceSummary}>
                            <Text className={s.experienceSummaryLabel}>
                                {t('about.sections.experiences.totalLabel', 'Total experience')}
                            </Text>
                            <Text weight="semibold" className={s.experienceSummaryValue}>
                                {totalExperienceText}
                            </Text>
                        </div>
                        {isSuperAdmin && (
                            <Button
                                appearance="primary"
                                icon={<AddRegular />}
                                onClick={() => setExperienceModalData({ sortOrder: experiences.length + 1 })}
                            >
                                {t('about.sections.experiences.admin.add')}
                            </Button>
                        )}
                    </div>
                </div>

                <Carousel align="center" whitespace={false} announcement={getAnnouncement} draggable>
                    <CarouselViewport>
                        <CarouselSlider
                            cardFocus
                            aria-label="Use as setas para navegar entre as experiências"
                            style={{ display: 'flex', gap: '16px', padding: '1em' }}
                        >
                            {experiences.map((exp, i) => {
                                const isHovered = hovered === i;
                                return (
                                    <CarouselCard autoSize key={i}>
                                        <Card
                                            className={mergeClasses(s.card, isHovered && s.cardHovered)}
                                            onMouseEnter={() => setHovered(i)}
                                            onMouseLeave={() => setHovered(null)}
                                            tabIndex={0}
                                            aria-label={exp.company}
                                            style={{ position: 'relative' }}
                                        >
                                            {isSuperAdmin && (
                                                <div className={s.cardAdminActions}>
                                                    <Button
                                                        size="small"
                                                        appearance="subtle"
                                                        icon={<EditRegular />}
                                                        aria-label={t('about.sections.experiences.admin.edit')}
                                                        onClick={event => {
                                                            event.stopPropagation();
                                                            setExperienceModalData(exp);
                                                        }}
                                                    />
                                                    {exp.id && (
                                                        <Button
                                                            size="small"
                                                            appearance="subtle"
                                                            icon={<DeleteRegular />}
                                                            aria-label={t('about.sections.experiences.admin.delete')}
                                                            onClick={event => {
                                                                event.stopPropagation();
                                                                handleDeleteExperience(exp);
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            <CardHeader
                                                image={<img src={exp.logo} alt={exp.company} className={s.logo} />}
                                                header={<Text weight="semibold">{exp.role}</Text>}
                                                description={<Text>{exp.company}</Text>}
                                            />
                                            <Text className={s.period}>
                                                {String(exp.period || '').replace('{{timerWorking}}', getWorkingTime(exp.startDate))}
                                            </Text>
                                            <Text className={s.sub}>{exp.location}</Text>

                                            <div className={mergeClasses(s.description, isHovered && s.descriptionVisible)}>
                                                <Text weight="semibold" className={s.descriptionTitle}>
                                                    {t('about.sections.experiences.descriptionTitle', 'Main activities')}
                                                </Text>
                                                <div data-color-mode="dark" className={s.markdownScroll}>
                                                    <MDEditor.Markdown
                                                        source={(exp.description || []).join('\n')}
                                                        className={s.markdownContent}
                                                    />
                                                </div>
                                            </div>

                                            <div className={mergeClasses(s.techs, isHovered && s.techsVisible)}>
                                                {(exp.techs || []).map((tech, idx) => (
                                                    <Badge key={idx} appearance="outline">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </Card>
                                    </CarouselCard>
                                );
                            })}
                        </CarouselSlider>
                    </CarouselViewport>
                    <CarouselNavContainer
                        layout="inline"
                        autoplayTooltip={{ content: 'Autoplay', relationship: 'label' }}
                        nextTooltip={{ content: 'Próximo', relationship: 'label' }}
                        prevTooltip={{ content: 'Anterior', relationship: 'label' }}
                    >
                        <CarouselNav>
                            {index => <CarouselNavButton index={index} aria-label={`Ir para o slide ${index + 1}`} />}
                        </CarouselNav>
                    </CarouselNavContainer>
                </Carousel>
            </div>

            <div className={s.section}>
                <Text weight="semibold">{sections.skills.title}</Text>
                <div className={s.skillsWrap}>
                    <div className={s.skillsGradientLeft} />
                    <div className={s.skillsGradientRight} />
                    <div className={s.skillsTrack}>
                        {marquee.map((item, i) => {
                            const isHov = hoveredSkill === i;
                            const borderStyle = item.highlight ? { borderColor: item.color, boxShadow: `0 0 0 1px ${item.color} inset` } : undefined;
                            const Icon = item.Icon;
                            return (
                                <div
                                    key={`${item.name}-${i}`}
                                    className={mergeClasses(s.skillCard, isHov && s.skillCardHovered)}
                                    style={borderStyle}
                                    onMouseEnter={() => setHoveredSkill(i)}
                                    onMouseLeave={() => setHoveredSkill(null)}
                                >
                                    <Icon className={mergeClasses(s.techIcon, isHov && s.techIconHovered)} style={{ color: item.color }} />
                                    <Text weight="semibold" className={s.skillName}>{item.name}</Text>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className={s.section}>
                <Text weight="semibold">{sections.languages.title}</Text>
                <List className={s.languagesItem}>
                    <li>
                        <Text className={s.sub}>{sections.languages.text.enUs}</Text>
                    </li>
                    <li>
                        <Text className={s.sub}>{sections.languages.text.ptBr}</Text>
                    </li>
                </List>
            </div>

            <div className={s.ctaActions}>
                <Button
                    appearance="primary"
                    icon={<DocumentPdfFilled />}
                    className={s.button}
                    as="a"
                    href={currentCurriculumUrl}
                    target="_blank"
                >
                    {sections.cta.viewCurriculum}
                </Button>
                {isSuperAdmin && (
                    <Button
                        appearance="secondary"
                        icon={<EditRegular />}
                        className={s.button}
                        onClick={openCurriculumEditor}
                    >
                        {sections.cta.editCurriculum}
                    </Button>
                )}
            </div>

            <Dialog open={curriculumEditorOpen} onOpenChange={(_, data) => setCurriculumEditorOpen(data.open)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{sections.cta.editCurriculumTitle}</DialogTitle>
                        <DialogContent className={s.dialogContent}>
                            <Field label={sections.cta.curriculumLanguage}>
                                <select
                                    value={curriculumLanguage}
                                    onChange={event => {
                                        const language = event.target.value;
                                        setCurriculumLanguage(language);
                                        setCurriculumUrlInput(curriculumUrls[language] || defaultCurriculumUrls[language]);
                                        setCurriculumText(t('about.sections.cta.curriculumTemplate', { lng: language }));
                                        setCurriculumError('');
                                    }}
                                >
                                    <option value="pt-BR">Português (BR)</option>
                                    <option value="en-US">English (US)</option>
                                </select>
                            </Field>
                            <Field
                                label={sections.cta.curriculumUrl}
                                validationState={curriculumError ? 'error' : 'none'}
                                validationMessage={curriculumError}
                            >
                                <Input
                                    value={curriculumUrlInput}
                                    onChange={event => setCurriculumUrlInput(event.target.value)}
                                    placeholder="https://..."
                                />
                            </Field>
                            <input
                                ref={fileInputRef}
                                className={s.fileInput}
                                type="file"
                                accept="application/pdf"
                                onChange={handleCurriculumUpload}
                            />
                            <Button
                                appearance="secondary"
                                disabled={curriculumSaving}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {sections.cta.uploadCurriculum}
                            </Button>
                            <Field label={sections.cta.curriculumText}>
                                <Textarea
                                    className={s.textArea}
                                    resize="vertical"
                                    value={curriculumText}
                                    onChange={event => setCurriculumText(event.target.value)}
                                />
                            </Field>
                            <Button
                                appearance="secondary"
                                disabled={curriculumSaving}
                                onClick={handleGenerateCurriculumPdf}
                            >
                                {sections.cta.generateCurriculum}
                            </Button>
                            <Text className={s.sub}>{sections.cta.editorHint}</Text>
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" disabled={curriculumSaving} onClick={() => setCurriculumEditorOpen(false)}>
                                {t('common.close')}
                            </Button>
                            <Button appearance="primary" disabled={curriculumSaving} onClick={() => saveCurriculumUrl(curriculumLanguage, curriculumUrlInput)}>
                                {curriculumSaving ? sections.cta.savingCurriculum : t('common.save')}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            {experienceModalData && (
                <ExperienceModal
                    open={true}
                    initialData={experienceModalData}
                    onClose={() => setExperienceModalData(null)}
                    onSave={handleSaveExperience}
                />
            )}
        </div>
    );
}
