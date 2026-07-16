import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const authStyles = makeStyles({
    socialButton: {
        width: '100%',
        justifyContent: 'center'
    },
    keepOnContainer: {
        display: 'flex',
        alignItems: 'center',
        ...shorthands.gap('6px')
    },
    infoIcon: {
        color: tokens.colorNeutralForeground3
    },
    footerLinks: {
        display: 'flex',
        flexDirection: 'column',
        width: 'fit-content'
    },
    link: {
        color: tokens.colorBrandForegroundLink,
        textDecorationLine: 'none'
    },
    stack:{
        display: 'flex',
        gap: '10px',
        flexDirection: 'column',
    },
    or: {
        marginTop: '2em'
    },
    buttonLogin: {
        float: 'right',
    },
    loginFields: {
        paddingBottom: '2em'
    }
});
