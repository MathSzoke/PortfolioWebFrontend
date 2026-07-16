import { useRef } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { ChatLauncherFloatingButton } from '../components/chat/ChatLauncher.jsx';
import HeroSection from '../components/home/HeroSection.jsx';
import AboutSection from '../components/home/AboutSection.jsx';
import ProjectsSection from '../components/home/ProjectsSection.jsx';
import SocialFloatingBar from '../components/home/SocialFloatingBar.jsx';
import HeaderSection from '../components/home/HeaderSection.jsx';

const useStyles = makeStyles({
    page: {
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        /*scrollSnapType: 'y mandatory',*/
    },
    section: {
        scrollSnapAlign: 'start',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        padding: '0 24px',
        margin: '0 10%',
        height: 'calc(100vh - 5em)',
        boxSizing: 'border-box',
        '@media (max-width: 768px)': {
            marginTop: '5em'
        },
    },
    safeBottom: {
        paddingBottom: 'env(safe-area-inset-bottom, 24px)',
        '@media (max-width: 768px)': {
            height: 'calc(25em + 100vh)',
            marginBottom: '10em'
        },
    }
});

const apiBase = import.meta.env.VITE_PORTFOLIO_API || import.meta.env.VITE_API_BASE_URL;

export default function Home() {
    const s = useStyles();
    const projectsRef = useRef(null);

    return (
        <>
            <HeaderSection />
            <SocialFloatingBar />
            <div className={s.page}>
                <section id="hero" className={`${s.section} scroll-section`} style={{ justifyContent: 'center', height: '100vh' }}>
                    <HeroSection onSeeProjects={() => projectsRef.current?.scrollIntoView({ behavior: 'smooth' })} />
                </section>
                <section id="about" className={`${s.section} ${s.safeBottom} scroll-section`}>
                    <AboutSection />
                </section>
                <section id="projects" className={`${s.section} scroll-section`} ref={projectsRef}>
                    <ProjectsSection />
                </section>
                <ChatLauncherFloatingButton apiBase={apiBase} />
            </div>
        </>
    );
}
