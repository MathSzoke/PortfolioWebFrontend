import { useEffect, useMemo, useState } from 'react';
import {
    Spinner,
    makeStyles,
    Toaster,
    useToastController,
    useId,
    ToastTitle,
    Toast,
    Title3,
    Button,
    CarouselCard,
    tokens,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogContent,
    DialogActions,
    DialogTitle
} from '@fluentui/react-components';
import ProjectCard from '../projects/ProjectCard.jsx';
import { getAggregatedProjects, reorderProjects } from '../../services/projects.js';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../services/auth.tsx';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableItem from './SortableItem.jsx';
import AddProjectModal from '../projects/AddProjectModal.jsx';
import { AddRegular, EditRegular, DeleteRegular } from '@fluentui/react-icons';
import { ProjectsCarousel } from '../projects/ProjectsCarousel.jsx';
import getApiClient from '../../services/apiClient';

const useStyles = makeStyles({
    root: { maxWidth: 1200 },
    actions: { display: 'flex', justifyContent: 'flex-end', marginTop: '1em' },
    card: {
        margin: '0 8px',
        flex: '0 0 280px',
        boxShadow: tokens.shadow8,
        borderRadius: tokens.borderRadiusMedium,
        height: '100%'
    },
    cardActions: { display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }
});

export default function ProjectsSection() {
    const s = useStyles();
    const { t } = useTranslation();
    const { userInfo } = useAuth();
    const superAdmin = Array.isArray(userInfo?.roles) && userInfo.roles.includes('SuperAdmin');
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [modalData, setModalData] = useState(null);
    const [deleteProjectId, setDeleteProjectId] = useState(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    const { dispatchToast } = useToastController();
    const toasterId = useId("toaster");

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const apiData = await getAggregatedProjects();
                if (alive && Array.isArray(apiData)) setProjects(apiData);
            } catch {
                dispatchToast(
                    <Toast>
                        <ToastTitle>{t('projects.superAdmin.responses.loadError')}</ToastTitle>
                    </Toast>,
                    { intent: 'error' }
                );
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [dispatchToast, t]);

    const items = useMemo(() => projects.filter(p => p?.id).map(p => p.id), [projects]);

    async function handleDragEnd(event) {
        if (!superAdmin) return;
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newList = arrayMove(projects, oldIndex, newIndex);
        setProjects(newList);

        const ordered = newList.map((p, idx) => ({ id: p.id, sortOrder: idx + 1 }));
        try {
            await reorderProjects(ordered);
            dispatchToast(
                <Toast>
                    <ToastTitle>{t('projects.superAdmin.responses.reorderSaved')}</ToastTitle>
                </Toast>,
                { intent: 'success' }
            );
        } catch {
            dispatchToast(
                <Toast>
                    <ToastTitle>{t('projects.superAdmin.responses.reorderFailed')}</ToastTitle>
                </Toast>,
                { intent: 'error' }
            );
        }
    }

    async function handleDelete() {
        if (!deleteProjectId) return;
        try {
            const api = getApiClient();
            await api.delete(`/api/v1/Projects/${deleteProjectId}`);
            setProjects(prev => prev.filter(p => p.id !== deleteProjectId));
            dispatchToast(
                <Toast>
                    <ToastTitle>{t('projects.superAdmin.responses.deleted')}</ToastTitle>
                </Toast>,
                { intent: 'success' }
            );
        } catch (err) {
            console.error(err);
            dispatchToast(
                <Toast>
                    <ToastTitle>{t('projects.superAdmin.responses.deleteFailed')}</ToastTitle>
                </Toast>,
                { intent: 'error' }
            );
        } finally {
            setDeleteProjectId(null);
        }
    }

    return (
        <>
            <div className={s.root}>
                <Title3>{t('projects.title')}</Title3>

                {superAdmin && (
                    <div className={s.actions}>
                        <Button appearance="primary" onClick={() => setModalData(true)} icon={<AddRegular />}>
                            {t('projects.superAdmin.actions.addProject')}
                        </Button>
                    </div>
                )}

                {loading ? (
                    <div style={{ padding: 32 }}>
                        <Spinner label={t('projects.loading')} />
                    </div>
                ) : superAdmin ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <ProjectsCarousel>
                            <SortableContext items={items} strategy={horizontalListSortingStrategy}>
                                {projects.map((p, index) => (
                                    <SortableItem key={p.id} id={p.id}>
                                        <CarouselCard className={s.card} aria-label={`Projeto ${index + 1} de ${projects.length}, ${p.name}`}>
                                            <ProjectCard project={p} superAdmin={superAdmin} userInfo={userInfo} onClickEditable={() => setModalData(p)} onClickDeletable={() => setDeleteProjectId(p.id)} />
                                        </CarouselCard>
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </ProjectsCarousel>
                    </DndContext>
                ) : (
                    <ProjectsCarousel>
                        {projects.map((p, index) => (
                            <CarouselCard key={p.id} className={s.card} aria-label={`Projeto ${index + 1} de ${projects.length}, ${p.name}`}>
                                <ProjectCard project={p} superAdmin={superAdmin} userInfo={userInfo} />
                            </CarouselCard>
                        ))}
                    </ProjectsCarousel>
                )}
                <Toaster />
            </div>

            {superAdmin && modalData !== null && (
                <AddProjectModal
                    open={true}
                    onClose={() => setModalData(null)}
                    onSuccess={(resp) => {
                        if (modalData === true) {
                            dispatchToast(
                                <Toast>
                                    <ToastTitle>{t('projects.superAdmin.responses.added')}</ToastTitle>
                                </Toast>,
                                { intent: 'success' }
                            );
                            setProjects([...projects, { ...resp }]);
                        } else {
                            dispatchToast(
                                <Toast>
                                    <ToastTitle>{t('projects.superAdmin.responses.updated')}</ToastTitle>
                                </Toast>,
                                { intent: 'success' }
                            );
                            setProjects(prev => prev.map(p => p.id === resp.id ? { ...p, ...resp } : p));
                        }
                    }}
                    initialData={modalData === true ? null : modalData}
                />
            )}

            <Dialog open={!!deleteProjectId} onOpenChange={(_, d) => !d.open && setDeleteProjectId(null)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{t('projects.superAdmin.dialogs.confirmationDelete.title')}</DialogTitle>
                        <DialogContent>{t('projects.superAdmin.dialogs.confirmationDelete.message')}</DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setDeleteProjectId(null)}>
                                {t('common.close')}
                            </Button>
                            <Button appearance="primary" onClick={handleDelete}>
                                {t('projects.superAdmin.dialogs.confirmationDelete.confirm')}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <Toaster toasterId={toasterId} />
        </>
    );
}
