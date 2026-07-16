import {
    Card,
    CardHeader,
    CardPreview,
    CardFooter,
    Text,
    Button,
    Badge,
    RatingDisplay,
    Rating,
    Caption1,
    makeStyles,
    tokens,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    mergeClasses,
    Toaster,
    useToastController,
    useId,
    ToastTitle,
    Toast,
} from '@fluentui/react-components';
import { FaGithub, FaEdit, FaExternalLinkAlt } from 'react-icons/fa';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dismiss24Regular } from '@fluentui/react-icons';
import getApiClient from '../../services/apiClient';

const useStyles = makeStyles({
    caption: {
        color: tokens.colorNeutralForeground3,
    },
    dangerButton: {
        backgroundColor: tokens.colorStatusDangerBackground1,
        color: tokens.colorStatusDangerForeground1
    },
    clickableCard: {
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s',
        '&:hover': {
            transform: 'scale(1.07)'
        }
    },
    card: {
        transition: 'box-shadow 0.2s, transform 0.2s, min-height 0.2s',
        boxShadow: tokens.shadow4,
        cursor: 'default',
    },
    DialogSurface: {
        width: '90vw',
        height: '90vh',
        padding: 0,
        border: `2px solid ${tokens.colorBrandBackground}`,
        maxWidth: '90vw',
        maxHeight: '90vh',
        boxSizing: 'border-box'
    }
});

export default function ProjectCard({ project, superAdmin, userInfo, onClickEditable, onClickDeletable }) {
    const { id, name, summary, technologies = [], thumbnailUrl, repoName, rating, ratingCount, projectUrl, ProjectUrl } = project;
    const liveUrl = projectUrl ?? ProjectUrl ?? project.ProjectUrl;
    const styles = useStyles();
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [currentRating, setCurrentRating] = useState(rating);
    const [currentCount, setCurrentCount] = useState(ratingCount);
    const [editRating, setEditRating] = useState(0);
    const [openPreview, setOpenPreview] = useState(false);
    const { dispatchToast } = useToastController();
    const api = getApiClient();

    async function handleRate(value, e) {
        e?.stopPropagation();
        if (userInfo === null) {
            window.dispatchEvent(new Event('open-login'));
            setIsEditing(false);
            return;
        }

        try {
            const res = await api.post(`/api/v1/Projects/${id}/rate`, { Rating: value });
            const data = res.data ?? res;
            setCurrentRating(data.rating);
            setCurrentCount(data.ratingCount);
        } catch (err) {
            console.error('Erro ao salvar avaliação:', err);
            dispatchToast(
                <Toast>
                    <ToastTitle>{t('projects.responses.rateError')}</ToastTitle>
                </Toast>,
                { intent: 'error' }
            );
        } finally {
            setIsEditing(false);
        }
    }

    function openCardPreview(e) {
        if (e) e.stopPropagation?.();
        if (!liveUrl) return;
        setOpenPreview(true);
    }

    function closePreview(e) {
        e?.stopPropagation();
        setOpenPreview(false);
    }

    return (
        <>
            <Card
                size="small"
                className={mergeClasses(styles.card, styles.clickableCard)}
                onClick={openCardPreview}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openCardPreview(e);
                    }
                }}
                tabIndex={0}
                aria-label={name}
            >
                {thumbnailUrl ? (
                    <CardPreview>
                        <img src={thumbnailUrl} alt={name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                    </CardPreview>
                ) : null}

                <CardHeader
                    header={<Text weight="semibold">{name}</Text>}
                    description={<Caption1 className={styles.caption}>{summary}</Caption1>}
                />

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {technologies.slice(0, 4).map(t => (
                        <Badge size="small" key={t} appearance="outline">{t}</Badge>
                    ))}
                </div>

                <CardFooter style={{ justifyContent: 'space-between' }}>
                    {isEditing ? (
                        <div onClick={(e) => e.stopPropagation()}>
                            <Rating
                                step={0.5}
                                size="large"
                                style={{ alignItems: 'center' }}
                                value={editRating}
                                onChange={(_, data) => {
                                    setEditRating(data.value);
                                    handleRate(data.value, _);
                                }}
                                onMouseLeave={() => setIsEditing(false)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    ) : (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={() => {
                                setEditRating(0);
                                setIsEditing(true);
                            }}
                        >
                            <RatingDisplay
                                value={currentRating}
                                count={currentCount}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    <div style={{ alignSelf: 'end', display: 'flex', gap: '8px' }}>
                        {projectUrl ? (
                            <Button
                                as="a"
                                href={projectUrl}
                                target="_blank"
                                icon={<FaExternalLinkAlt />}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : null}
                        {repoName ? (
                            <Button
                                as="a"
                                href={`https://github.com/MathSzoke/${repoName}`}
                                target="_blank"
                                icon={<FaGithub />}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : null}
                    </div>
                </CardFooter>

                {superAdmin && (
                    <CardFooter style={{ justifyContent: 'space-between' }}>
                        <Button
                            appearance="outline"
                            className={styles.dangerButton}
                            icon={<Dismiss24Regular />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onClickDeletable?.();
                            }}
                        />
                        <Button
                            appearance="primary"
                            icon={<FaEdit />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onClickEditable?.();
                            }}
                        />
                    </CardFooter>
                )}
            </Card>

            <Dialog open={openPreview} modalType="modal" onOpenChange={(_, d) => !d.open && setOpenPreview(false)}>
                <DialogSurface className={styles.DialogSurface}>
                    <DialogContent style={{ margin: 0, height: '100%', borderRadius: 15 }}>
                        <iframe
                            title={`${name} preview`}
                            src={liveUrl}
                            style={{ width: '100%', height: '95%', border: '0' }}
                        />
                        <DialogActions>
                            <Button appearance="secondary" onClick={closePreview}>
                                {t('common.close')}
                            </Button>
                            {liveUrl && (
                                <Button
                                    as="a"
                                    href={liveUrl}
                                    target="_blank"
                                    appearance="primary"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {t('common.openNewTab')}
                                </Button>
                            )}
                        </DialogActions>
                    </DialogContent>
                </DialogSurface>
            </Dialog>
        </>
    );
}
