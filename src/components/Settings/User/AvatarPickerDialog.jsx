import {useEffect, useRef, useState, useMemo} from 'react';
import {
    Avatar,
    Button,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogActions,
    Tab,
    TabList,
    makeStyles,
    tokens
} from '@fluentui/react-components';
import {
    ArrowCircleLeftFilled,
    ArrowCircleRightFilled,
    ContentViewGalleryRegular,
    DesktopRegular,
    AppFolderFilled
} from '@fluentui/react-icons';
import {useTranslation} from 'react-i18next';
import {uploadToCloudinary} from "../../../services/cloudinaryUpload.js";

const useStyles = makeStyles({
    surface: {minWidth: 'unset', maxWidth: 'unset', width: '80%', height: '80%'},
    body: {
        overflowX: 'hidden',
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
        width: '100%',
        flex: '1 1 0',
        minHeight: 0
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
        flex: '1 1 0',
        minHeight: 0,
        overflowY: 'auto'
    },
    tabs: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflowX: 'auto'
    },
    searchBox: {width: 360},
    sectionTitle: {fontWeight: 600, marginTop: tokens.spacingVerticalXXS},
    rail: {position: 'relative', paddingInline: tokens.spacingHorizontalS, overflow: 'hidden'},
    scroller: {
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: '96px',
        gap: tokens.spacingHorizontalS,
        overflowX: 'hidden',
        paddingBlockEnd: tokens.spacingVerticalXS,
        scrollSnapType: 'x mandatory'
    },
    thumbBtn: {
        width: 96,
        height: 96,
        borderRadius: tokens.borderRadiusLarge,
        overflow: 'hidden',
        borderTopWidth: tokens.strokeWidthThick,
        borderRightWidth: tokens.strokeWidthThick,
        borderBottomWidth: tokens.strokeWidthThick,
        borderLeftWidth: tokens.strokeWidthThick,
        borderTopStyle: 'solid',
        borderRightStyle: 'solid',
        borderBottomStyle: 'solid',
        borderLeftStyle: 'solid',
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        padding: 0,
        backgroundColor: tokens.colorTransparentBackground,
        cursor: 'pointer',
        scrollSnapAlign: 'start',
        boxShadow: tokens.shadow2,
        transitionProperty: 'box-shadow',
        transitionDuration: tokens.durationFaster,
        transitionTimingFunction: tokens.curveEasyEase,
        '&:hover': {boxShadow: tokens.shadow4}
    },
    thumbBtnSelected: {
        borderTopColor: tokens.colorBrandStroke1,
        borderRightColor: tokens.colorBrandStroke1,
        borderBottomColor: tokens.colorBrandStroke1,
        borderLeftColor: tokens.colorBrandStroke1
    },
    thumbImg: {width: '100%', height: '100%', objectFit: 'cover', display: 'block'},
    arrows: {
        position: 'absolute',
        insetBlock: 0,
        insetInlineStart: 0,
        insetInlineEnd: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none'
    },
    arrowBtn: {
        pointerEvents: 'auto',
        minWidth: 'max-content',
        borderRadius: '50%',
        color: tokens.colorNeutralForeground1,
        '&:hover': {backgroundColor: tokens.colorNeutralBackground3Hover}
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: tokens.spacingHorizontalS,
        marginTop: 'auto',
        paddingTop: tokens.spacingVerticalM
    },
    uploadGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 260px',
        gap: tokens.spacingHorizontalL,
        alignItems: 'stretch',
        marginTop: '3em',
        '@media (max-width: 720px)': {gridTemplateColumns: '1fr', gap: tokens.spacingVerticalM}
    },
    uploadZone: {
        height: '45vh',
        padding: tokens.spacingVerticalL,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'center',
        cursor: 'pointer',
        color: tokens.colorNeutralForeground4,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderTopStyle: 'dashed',
        borderRightStyle: 'dashed',
        borderBottomStyle: 'dashed',
        borderLeftStyle: 'dashed',
        borderTopColor: tokens.colorBrandStroke1,
        borderRightColor: tokens.colorBrandStroke1,
        borderBottomColor: tokens.colorBrandStroke1,
        borderLeftColor: tokens.colorBrandStroke1,
        borderRadius: tokens.borderRadiusLarge,
        userSelect: 'none',
        position: 'relative',
        backgroundColor: tokens.colorSubtleBackground,
        '&:hover': {backgroundColor: tokens.colorNeutralBackground2Hover},
        '&:focus-visible': {
            outlineStyle: 'solid',
            outlineWidth: tokens.strokeWidthThick,
            outlineColor: tokens.colorBrandStroke1
        }
    },
    uploadZoneDrag: {
        borderTopStyle: 'solid',
        borderRightStyle: 'solid',
        borderBottomStyle: 'solid',
        borderLeftStyle: 'solid',
        backgroundColor: tokens.colorNeutralBackground2
    },
    uploadThumb: {
        width: '100%',
        height: '100%',
        borderRadius: tokens.borderRadiusLarge,
        overflow: 'hidden',
        backgroundColor: tokens.colorNeutralBackground3,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: tokens.shadow4,
        position: 'relative'
    },
    uploadThumbLabel: {
        position: 'absolute',
        insetInlineStart: 0,
        insetInlineEnd: 0,
        insetBlockEnd: 0,
        paddingBlock: '6px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: tokens.colorNeutralForegroundOnBrand,
        fontSize: '12px',
        textAlign: 'center'
    },
    uploadTextTitle: {fontWeight: 600, fontSize: '14px', lineHeight: '20px'},
    uploadInline: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        alignItems: 'center',
        width: '100%',
        maxWidth: 520,
        justifyContent: 'center'
    },
    previewPane: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: tokens.borderRadiusLarge,
        backgroundColor: tokens.colorNeutralBackground2,
        padding: tokens.spacingVerticalL
    },
    previewTitle: {fontWeight: 600},
    previewAvatar: {
        boxShadow: tokens.shadow8,
        borderRadius: '50%',
        padding: 4,
        backgroundColor: tokens.colorNeutralBackground1
    },
    fileName: {fontSize: '12px', color: tokens.colorNeutralForeground3, textAlign: 'center'},
    tabItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    }
});

export default function AvatarPickerDialog({open, onOpenChange, initialUrl, onConfirm, user}) {
    const s = useStyles();
    const {t} = useTranslation();
    const scrollerRef1 = useRef(null);
    const scrollerRef2 = useRef(null);
    const fileRef = useRef(null);
    const prevBlobUrlRef = useRef(null);
    const [tab, setTab] = useState('gallery');
    const [query, setQuery] = useState('');
    const [selectedUrl, setSelectedUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(undefined);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [showArrows1, setShowArrows1] = useState(false);
    const [showArrows2, setShowArrows2] = useState(false);
    const socialPhotos = user?.socialPhotos ?? [];
    const uploadedPhotos = user?.uploadedPhotos ?? [];

    useEffect(() => {
        setTab('gallery');
        setQuery('');
        setSelectedFile(undefined);
        setSelectedUrl('');
        setPreviewUrl('');
        setIsDragOver(false);
    }, [open, initialUrl]);

    useEffect(() => {
        return () => {
            if (prevBlobUrlRef.current) {
                URL.revokeObjectURL(prevBlobUrlRef.current);
                prevBlobUrlRef.current = null;
            }
        };
    }, []);

    function pickUrl(src) {
        setSelectedFile(undefined);
        setSelectedUrl(src);
    }

    function pickFile(f) {
        if (!f) return;
        if (!f.type?.startsWith('image/')) return;
        const url = URL.createObjectURL(f);
        if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
        prevBlobUrlRef.current = url;
        setSelectedFile(f);
        setSelectedUrl(url);
        setPreviewUrl(url);
        if (fileRef.current) fileRef.current.value = '';
    }

    async function confirm() {
        if (selectedFile) {
            const url = await uploadToCloudinary(selectedFile);
            onConfirm({url});
        } else {
            onConfirm({url: selectedUrl || ''});
        }
        onOpenChange(false);
    }

    const avatarChoices = useMemo(
        () => [
            'https://lh3.googleusercontent.com/czD16vEI-6BesOsFBFsUFc072JaP9Y9IvSFBDiIQOXCVFMSVj-wEs8PwxuM1Ql6gk8jIT3wUiGiimiVKz0NUz-97Dw=s256',
            'https://lh3.googleusercontent.com/MpxmptN-zTFBpkqhBSBZ-fyS0X49p_EIsFPUOoB_A1rRgnwvZBvq1ivBuf87Txjp0Vx4ZjZDKBXK35uuHXgVqgpUQ74=s256',
            'https://lh3.googleusercontent.com/NI7kbkUjyXtlA_l47jrrY0nkV16kCE4IG05kThNS9gojGki0XklMgL-xhZjicdR7Rh3vEczxLoyCZjlstUqzXqum4es=s256',
            'https://lh3.googleusercontent.com/SblbUxwhgCquJjxjhMXs3t_k5kJhmoPXiRv2eBRbJ7uBVc-_UHuPVsYKStUQnyDug6NiopqH5p4kjwNjPXNoiBDSsDk=s256',
            'https://lh3.googleusercontent.com/27EufDhEfc2d9q2jl6Yg4eLN6FfiMIZZ97X8b4zXfQLg29IXOu-2TZpPaWGR02gdP0-73lqJBZMh4HRpBhwEKooxIw=s256',
            'https://lh3.googleusercontent.com/vm80xXg5ZUPwXdylBUR-xPTiynMjWYx-ruF3rS_LWPGx_bS8AmcyU50SOHQjnL_mu6tgUXHGFP2LYPTD6odUspAt=s256',
            'https://lh3.googleusercontent.com/STE1wWR_dm844lFedD1Z9AaCrpMNmLWk-Dd57kkePPF32Xk-H0Dx3tnOrL80yTKKqTuaL52I8bGlKC0kjtTXEIaRtQ=s256',
            'https://lh3.googleusercontent.com/TCmt9gTNk7_cqHEmz6i6JQN7T4DSZ3ELnQM21vfyepnKBX74q19KX9npOS-A6z9Jd4kblDd4nU5N8S5PeCFsQwMqZA=s256',
            'https://api.dicebear.com/9.x/bottts/svg?seed=Bitern1',
            'https://api.dicebear.com/9.x/bottts/svg?seed=Bitern2',
            'https://api.dicebear.com/9.x/bottts/svg?seed=Bitern3',
            'https://api.dicebear.com/9.x/bottts/svg?seed=Bitern4'
        ],
        []
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return avatarChoices;
        return avatarChoices.filter(src => src.toLowerCase().includes(q));
    }, [avatarChoices, query]);

    useEffect(() => {
        function checkArrows() {
            const scr1 = scrollerRef1.current;
            const scr2 = scrollerRef2.current;
            setShowArrows1(!!scr1 && scr1.scrollWidth > scr1.clientWidth + 2);
            setShowArrows2(!!scr2 && scr2.scrollWidth > scr2.clientWidth + 2);
        }

        checkArrows();
        window.addEventListener('resize', checkArrows);
        return () => window.removeEventListener('resize', checkArrows);
    }, [filtered.length, open]);

    function onDropZoneDragOver(e) {
        e.preventDefault();
        setIsDragOver(true);
    }

    function onDropZoneDragEnter(e) {
        e.preventDefault();
        setIsDragOver(true);
    }

    function onDropZoneDragLeave(e) {
        e.preventDefault();
        setIsDragOver(false);
    }

    function onDropZoneDrop(e) {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer?.files || []);
        const file = files.find(f => f.type?.startsWith('image/'));
        if (file) pickFile(file);
    }

    return (
        <Dialog open={open} onOpenChange={(_, d) => onOpenChange(!!d.open)}>
            <DialogSurface className={s.surface}>
                <DialogBody className={s.body}>
                    <DialogTitle>{t('settings.account.avatarPicker.title')}</DialogTitle>
                    <div className={s.container}>
                        <div className={s.tabs}>
                            <TabList selectedValue={tab} onTabSelect={(_, data) => setTab(data.value)}>
                                <Tab value="gallery"><span
                                    className={s.tabItem}><ContentViewGalleryRegular/> {t('settings.account.avatarPicker.tabs.gallery')}</span></Tab>
                                <Tab value="social"><span
                                    className={s.tabItem}><AppFolderFilled/> {t('settings.account.avatarPicker.tabs.social')}</span></Tab>
                                <Tab value="upload"><span
                                    className={s.tabItem}><DesktopRegular/> {t('settings.account.avatarPicker.tabs.upload')}</span></Tab>
                            </TabList>
                        </div>
                        <div className={s.content}>
                            {tab === 'gallery' && (
                                <>
                                    <div
                                        className={s.sectionTitle}>{t('settings.account.avatarPicker.sectionMore')}</div>
                                    <div className={s.rail}>
                                        <div ref={scrollerRef1} className={s.scroller}>
                                            {filtered.map(src => (
                                                <button
                                                    key={src}
                                                    type="button"
                                                    className={`${s.thumbBtn} ${!selectedFile && selectedUrl === src ? s.thumbBtnSelected : ''}`}
                                                    onClick={() => pickUrl(src)}
                                                >
                                                    <img className={s.thumbImg} src={src} alt=""/>
                                                </button>
                                            ))}
                                        </div>
                                        <div className={s.arrows} style={{display: showArrows1 ? undefined : 'none'}}>
                                            <Button
                                                className={s.arrowBtn}
                                                onClick={() => scrollerRef1.current?.scrollBy({
                                                    left: -480,
                                                    behavior: 'smooth'
                                                })}
                                                icon={<ArrowCircleLeftFilled/>}
                                            />
                                            <Button
                                                className={s.arrowBtn}
                                                onClick={() => scrollerRef1.current?.scrollBy({
                                                    left: 480,
                                                    behavior: 'smooth'
                                                })}
                                                icon={<ArrowCircleRightFilled/>}
                                            />
                                        </div>
                                    </div>

                                    {uploadedPhotos.length > 0 && (
                                        <>
                                            <div className={s.sectionTitle}>{t('settings.account.avatarPicker.uploadedPhotos')}</div>
                                            <div className={s.rail}>
                                                <div ref={scrollerRef2} className={s.scroller}>
                                                    {uploadedPhotos.map(src => (
                                                        <button
                                                            key={src}
                                                            type="button"
                                                            className={`${s.thumbBtn} ${!selectedFile && selectedUrl === src ? s.thumbBtnSelected : ''}`}
                                                            onClick={() => pickUrl(src)}
                                                        >
                                                            <img className={s.thumbImg} src={src} alt=""/>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className={s.arrows}
                                                     style={{display: showArrows2 ? undefined : 'none'}}>
                                                    <Button
                                                        className={s.arrowBtn}
                                                        onClick={() => scrollerRef2.current?.scrollBy({
                                                            left: -480,
                                                            behavior: 'smooth'
                                                        })}
                                                        icon={<ArrowCircleLeftFilled/>}
                                                    />
                                                    <Button
                                                        className={s.arrowBtn}
                                                        onClick={() => scrollerRef2.current?.scrollBy({
                                                            left: 480,
                                                            behavior: 'smooth'
                                                        })}
                                                        icon={<ArrowCircleRightFilled/>}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                            {tab === 'social' && (
                                <>
                                    <div
                                        className={s.sectionTitle}>{t('settings.account.avatarPicker.sectionSocial')}</div>
                                    {socialPhotos.length === 0 && (
                                        <div>{t('settings.account.avatarPicker.noSocialPhotos')}</div>
                                    )}
                                    <div className={s.scroller}>
                                        {socialPhotos.map(photo => (
                                            <button
                                                key={photo.provider}
                                                type="button"
                                                className={`${s.thumbBtn} ${!selectedFile && selectedUrl === photo.userPhotoUrl ? s.thumbBtnSelected : ''}`}
                                                onClick={() => pickUrl(photo.userPhotoUrl)}
                                            >
                                                <img className={s.thumbImg} src={photo.userPhotoUrl}
                                                     alt={photo.provider}/>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                            {tab === 'upload' && (
                                <div className={s.uploadGrid}>
                                    <div
                                        className={`${s.uploadZone} ${isDragOver ? s.uploadZoneDrag : ''}`}
                                        onDragOver={onDropZoneDragOver}
                                        onDragEnter={onDropZoneDragEnter}
                                        onDragLeave={onDropZoneDragLeave}
                                        onDrop={onDropZoneDrop}
                                        role="button"
                                        aria-label={t('settings.account.avatarPicker.upload.instructions')}
                                        tabIndex={0}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                fileRef.current?.click();
                                            }
                                        }}
                                        onClick={() => fileRef.current?.click()}
                                    >
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/*"
                                            style={{display: 'none'}}
                                            onChange={e => {
                                                const f = e.target.files?.[0];
                                                if (f) pickFile(f);
                                            }}
                                        />
                                        {selectedFile ? (
                                            <div className={s.uploadThumb}
                                                 style={{backgroundImage: `url(${previewUrl})`}} aria-hidden="true">
                                                <div className={s.uploadThumbLabel}>{selectedFile.name}</div>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    className={s.uploadTextTitle}>{t('settings.account.avatarPicker.upload.instructions')}</div>
                                                <div className={s.uploadInline}>
                                                    <Button
                                                        appearance="primary"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            fileRef.current?.click();
                                                        }}
                                                    >
                                                        {t('settings.account.avatarPicker.upload.chooseFile')}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className={s.previewPane} aria-live="polite">
                                        <div
                                            className={s.previewTitle}>{t('settings.account.avatarPicker.preview')}</div>
                                        <div className={s.previewAvatar}>
                                            <Avatar image={{src: selectedFile ? previewUrl : ''}} size={128}
                                                    shape="circular"/>
                                        </div>
                                        {selectedFile?.name ?
                                            <div className={s.fileName}>{selectedFile.name}</div> : null}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={s.footer}>
                            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
                                {t('settings.account.avatarPicker.actions.cancel')}
                            </Button>
                            <DialogActions>
                                <Button appearance="primary" onClick={confirm}>
                                    {t('settings.account.avatarPicker.actions.confirm')}
                                </Button>
                            </DialogActions>
                        </div>
                    </div>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
