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
    mergeClasses
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { DocumentPdfFilled } from '@fluentui/react-icons';
import {
    Carousel,
    CarouselNav,
    CarouselNavButton,
    CarouselNavContainer,
    CarouselSlider,
    CarouselViewport,
    CarouselCard
} from '@fluentui/react-components';
import { useMemo, useState } from 'react';
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

const useStyles = makeStyles({
    root: {
        maxWidth: '1200px',
        display: 'grid',
        gap: '24px'
    },
    section: {
        display: 'grid',
        gap: '8px'
    },
    sub: {
        color: tokens.colorNeutralForeground3,
        whiteSpace: 'pre-line'
    },
    button: {
        width: 'max-content'
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
        overflow: 'hidden',
        background: 'rgba(30,30,30,0.97)',
        color: tokens.colorNeutralForegroundOnBrand,
        borderRadius: tokens.borderRadiusMedium,
        fontSize: '1rem',
        boxShadow: tokens.shadow8,
        opacity: 0,
        maxHeight: 0,
        transform: 'translateY(-10px)',
        transition: 'opacity 0.3s ease, max-height 0.3s ease, transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    descriptionVisible: {
        opacity: 1,
        maxHeight: '10.5rem',
        padding: '12px 0',
        transform: 'translateY(0)'
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

export default function AboutSection() {
    const s = useStyles();
    const { t } = useTranslation();
    const sections = t('about.sections', { returnObjects: true });
    const experiences = t('about.sections.experiences.items', { returnObjects: true }) || [];
    const [hovered, setHovered] = useState(null);
    const [hoveredSkill, setHoveredSkill] = useState(null);

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
                <Text weight="semibold">{sections.experiences.title}</Text>
                <Text className={s.sub}>{sections.experiences.text}</Text>

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
                                            <CardHeader
                                                image={<img src={exp.logo} alt={exp.company} className={s.logo} />}
                                                header={<Text weight="semibold">{exp.role}</Text>}
                                                description={<Text>{exp.company}</Text>}
                                            />
                                            <Text className={s.period}>
                                                {t('about.sections.experiences.items.' + i + '.period', {
                                                    timerWorking: getWorkingTime(exp.startDate)
                                                })}
                                            </Text>
                                            <Text className={s.sub}>{exp.location}</Text>

                                            <div className={mergeClasses(s.description, isHovered && s.descriptionVisible)}>
                                                <Text weight="semibold" style={{ padding: 8, marginBottom: 8 }}>
                                                    {t('about.sections.experiences.descriptionTitle', 'Main activities')}
                                                </Text>
                                                <ul style={{ padding: '0 40px 10px', margin: 0, overflowY: 'auto' }}>
                                                    {(exp.description || []).map((desc, idx) => (
                                                        <li key={idx}>
                                                            <Text size={200}>{desc}</Text>
                                                        </li>
                                                    ))}
                                                </ul>
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

            <Button
                appearance="primary"
                icon={<DocumentPdfFilled />}
                className={s.button}
                as="a"
                href="/assets/cv.pdf"
                target="_blank"
            >
                {sections.cta.viewCurriculum}
            </Button>
        </div>
    );
}
